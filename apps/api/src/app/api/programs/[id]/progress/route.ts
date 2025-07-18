export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Since middleware already verifies the token, we can get the user ID from headers
function getCptIdFromRequest(req: NextRequest): string | null {
  const userType = req.headers.get('x-user-type');
  const userId = req.headers.get('x-user-id');
  
  if (!userId) return null;
  
  // If it's a client token, we need to get the cptId from the client record
  if (userType === 'client') {
    return null; // We'll get the cptId from the client record
  }
  
  // If it's a trainer token, the userId is the cptId
  return userId;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userType = req.headers.get('x-user-type');
    const userId = req.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 });
    }

    // Get the program with client details
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            codeName: true,
            cptId: true,
          },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // For client tokens, ensure the program belongs to this client
    if (userType === 'client') {
      if (program.clientId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } else {
      // For trainer tokens, ensure the program belongs to a client of this CPT
      if (program.client.cptId !== userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Get the cptId for database queries
    const cptId = userType === 'client' ? program.client.cptId : userId;

    // Get program workouts from the data field
    const programData = program.data as any;
    const workouts = programData?.workouts || [];
    const totalWorkouts = workouts.length;

    // Fetch actual session workout data from Progress table
    const progressRecords = await prisma.progress.findMany({
      where: {
        cptId,
        clientId: program.clientId,
        programId: id
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Filter for records that contain workout data
    const sessionWorkouts = progressRecords.filter(record => {
      const data = record.data as any;
      return data && data.workoutId;
    });

    // Calculate real progress metrics
    const completedSessions = sessionWorkouts.length;
    const totalSessions = totalWorkouts; // Assuming one session per workout
    const completionPercentage = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    // Calculate performance trends from actual session data
    let totalExercises = 0;
    let completedExercises = 0;
    let totalWeightProgress = 0;
    let totalRepProgress = 0;
    let sessionCount = 0;

    sessionWorkouts.forEach(session => {
      const data = session.data as any;
      if (data && data.exercisePerformances) {
        totalExercises += data.totalExercises || 0;
        completedExercises += data.completedExercises || 0;
        
        // Calculate weight and rep progress from exercise performances
        data.exercisePerformances.forEach((exercise: any) => {
          if (exercise.sets) {
            exercise.sets.forEach((set: any) => {
              if (set.weight > 0) {
                totalWeightProgress += set.weight;
                sessionCount++;
              }
              if (set.reps > 0) {
                totalRepProgress += set.reps;
              }
            });
          }
        });
      }
    });

    const averageWeightProgress = sessionCount > 0 ? Math.round(totalWeightProgress / sessionCount) : 0;
    const averageRepProgress = sessionCount > 0 ? Math.round(totalRepProgress / sessionCount) : 0;

    // Determine trends (simplified logic)
    const strengthTrend = averageWeightProgress > 0 ? 'IMPROVING' : 'STABLE';
    const volumeTrend = averageRepProgress > 0 ? 'IMPROVING' : 'STABLE';

    const performanceData = {
      totalSessions,
      completedSessions,
      totalExercises,
      completedExercises,
      averageWeightProgress,
      averageRepProgress,
      strengthTrend,
      volumeTrend,
    };

    // Calculate weekly progress with actual session data
    const weeklyProgress = [];
    const weeks = Math.ceil(totalWorkouts / 3); // Assuming 3 workouts per week

    for (let week = 1; week <= weeks; week++) {
      const weekStart = (week - 1) * 3;
      const weekEnd = Math.min(weekStart + 3, totalWorkouts);
      const weekWorkouts = workouts.slice(weekStart, weekEnd);

      // Find sessions for this week's workouts
      const weekSessions = sessionWorkouts.filter(session => {
        const data = session.data as any;
        if (!data || !data.workoutId) return false;
        
        // Check if this session's workout is in this week's workout range
        const workoutIndex = workouts.findIndex((w: any) => w.id === data.workoutId);
        return workoutIndex >= weekStart && workoutIndex < weekEnd;
      });

      const completedWorkouts = weekSessions.length;
      const weekCompletionPercentage = weekWorkouts.length > 0 ? Math.round((completedWorkouts / weekWorkouts.length) * 100) : 0;

      // Calculate week performance
      let weekTotalExercises = 0;
      let weekCompletedExercises = 0;

      weekSessions.forEach(session => {
        const data = session.data as any;
        if (data && data.exercisePerformances) {
          weekTotalExercises += data.totalExercises || 0;
          weekCompletedExercises += data.completedExercises || 0;
        }
      });

      weeklyProgress.push({
        week,
        plannedWorkouts: weekWorkouts.length,
        completedWorkouts,
        completionPercentage: weekCompletionPercentage,
        sessions: weekSessions.map(session => {
          const data = session.data as any;
          return {
            id: session.id,
            workoutId: data?.workoutId || '',
            workoutName: workouts.find((w: any) => w.id === data?.workoutId)?.name || 'Unknown Workout',
            status: data?.completed ? 'COMPLETED' : 'IN_PROGRESS',
            sessionDate: session.date.toISOString(),
            sessionStatus: data?.completed ? 'COMPLETED' : 'IN_PROGRESS',
            performance: data?.exercisePerformances || [],
          };
        }),
        performance: {
          totalExercises: weekTotalExercises,
          completedExercises: weekCompletedExercises,
          averageWeightProgress: 0, // Could calculate from actual data
          averageRepProgress: 0, // Could calculate from actual data
          difficultyTrend: 'STABLE',
          formQualityTrend: 'STABLE',
        },
      });
    }

    // Determine if program needs adjustment based on actual data
    const adjustmentTriggers = {
      needsAdjustment: false,
      reasons: [] as string[],
      priority: 'LOW' as 'LOW' | 'MEDIUM' | 'HIGH',
    };

    if (completedSessions === 0) {
      adjustmentTriggers.needsAdjustment = true;
      adjustmentTriggers.reasons.push('No sessions recorded yet');
      adjustmentTriggers.priority = 'MEDIUM';
    } else if (completionPercentage < 50) {
      adjustmentTriggers.needsAdjustment = true;
      adjustmentTriggers.reasons.push('Low completion rate');
      adjustmentTriggers.priority = 'HIGH';
    } else if (completionPercentage < 75) {
      adjustmentTriggers.needsAdjustment = true;
      adjustmentTriggers.reasons.push('Moderate completion rate');
      adjustmentTriggers.priority = 'MEDIUM';
    }

    const progressData = {
      program: {
        id: program.id,
        name: program.programName,
        duration: programData?.duration || 0,
        totalWorkouts,
        status: (program as any).status || 'ACTIVE',
        startDate: program.startDate.toISOString(),
        endDate: program.endDate?.toISOString() || null,
      },
      client: {
        id: program.client.id,
        firstName: program.client.firstName,
        lastName: program.client.lastName,
        codeName: program.client.codeName,
      },
      overallProgress: {
        completionPercentage,
        completedWorkouts: completedSessions,
        totalWorkouts,
        performance: performanceData,
      },
      weeklyProgress,
      adjustmentTriggers,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(progressData);
  } catch (error) {
    console.error('Error fetching program progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program progress' },
      { status: 500 }
    );
  }
} 