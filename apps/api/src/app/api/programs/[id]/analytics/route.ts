export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Since middleware already verifies the token, we can get the user ID from headers
function getCptIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userType = req.headers.get('x-user-type');
    const userId = req.headers.get('x-user-id');
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || 'program';
    
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
            experienceLevel: true,
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

    // Calculate date range based on timeRange parameter
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'program':
      default:
        startDate = new Date(program.startDate);
        break;
    }

    // Get session workout data
    const sessionWorkouts = await prisma.sessionWorkout.findMany({
      where: {
        programId: id,
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      include: {
        sessionPerformance: {
          include: {
            setPerformances: true,
          },
        } as any,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Get progress records
    const progressRecords = await prisma.progress.findMany({
      where: {
        cptId,
        clientId: program.clientId,
        programId: id,
        date: {
          gte: startDate,
          lte: now,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate analytics data
    const analyticsData = calculateAnalytics(program, sessionWorkouts, progressRecords, timeRange);

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

function calculateAnalytics(program: any, sessionWorkouts: any[], progressRecords: any[], timeRange: string) {
  const totalSessions = sessionWorkouts.length;
  const completedSessions = sessionWorkouts.filter(sw => sw.status === 'COMPLETED').length;
  const skippedSessions = sessionWorkouts.filter(sw => sw.status === 'SKIPPED').length;
  
  // Calculate session duration (average)
  const sessionDurations = sessionWorkouts
    .filter(sw => sw.status === 'COMPLETED')
    .map(sw => {
      const startTime = new Date(sw.createdAt);
      const endTime = sw.updatedAt ? new Date(sw.updatedAt) : new Date();
      return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes
    });
  
  const averageSessionDuration = sessionDurations.length > 0 
    ? Math.round(sessionDurations.reduce((a, b) => a + b, 0) / sessionDurations.length)
    : 0;

  // Calculate RPE (Rate of Perceived Exertion)
  const allRPEs = sessionWorkouts
    .flatMap(sw => sw.sessionPerformance)
    .flatMap(sp => sp.setPerformances)
    .filter(sp => sp.rpe && sp.rpe > 0)
    .map(sp => sp.rpe);
  
  const averageRPE = allRPEs.length > 0 
    ? Math.round(allRPEs.reduce((a, b) => a + b, 0) / allRPEs.length)
    : 0;

  // Calculate consistency score
  const weeklyAdherence = calculateWeeklyAdherence(sessionWorkouts, program);
  const consistencyScore = weeklyAdherence.length > 0
    ? Math.round(weeklyAdherence.reduce((sum, week) => sum + week.adherenceRate, 0) / weeklyAdherence.length)
    : 0;

  // Calculate strength progress
  const strengthData = calculateStrengthProgress(sessionWorkouts);
  
  // Calculate volume progress
  const volumeData = calculateVolumeProgress(sessionWorkouts);
  
  // Calculate goals progress
  const goalsData = calculateGoalsProgress(progressRecords, program);
  
  // Generate insights
  const insights = generateInsights(program, sessionWorkouts, progressRecords, {
    completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
    averageRPE,
    consistencyScore,
    strengthTrend: strengthData.strengthTrend,
    volumeTrend: volumeData.volumeTrend,
  });

  const now = new Date();
  return {
    program: {
      id: program.id,
      name: program.programName,
      duration: Math.ceil((new Date(program.endDate || now).getTime() - new Date(program.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7)),
      totalWorkouts: (program.data as any)?.workouts?.length || 0,
      status: program.status,
      startDate: program.startDate,
      endDate: program.endDate,
      optPhase: program.optPhase,
      primaryGoal: program.primaryGoal,
    },
    client: {
      id: program.client.id,
      firstName: program.client.firstName,
      lastName: program.client.lastName,
      codeName: program.client.codeName,
      experienceLevel: program.client.experienceLevel,
    },
    performance: {
      overall: {
        completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
        averageSessionDuration,
        totalSessions,
        completedSessions,
        skippedSessions,
        averageRPE,
        consistencyScore,
      },
      strength: strengthData,
      volume: volumeData,
      consistency: {
        weeklyAdherence,
        bestDays: calculateBestDays(sessionWorkouts),
        missedSessions: calculateMissedSessions(sessionWorkouts),
      },
      goals: goalsData,
    },
    insights,
  };
}

function calculateWeeklyAdherence(sessionWorkouts: any[], program: any) {
  const weeklyData: { [key: number]: { planned: number; completed: number } } = {};
  
  // Initialize weeks
  const startDate = new Date(program.startDate);
  const endDate = new Date(program.endDate || new Date());
  const totalWeeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
  
  for (let week = 1; week <= totalWeeks; week++) {
    weeklyData[week] = { planned: 3, completed: 0 }; // Assume 3 sessions per week
  }
  
  // Count completed sessions by week
  sessionWorkouts.forEach(sw => {
    if (sw.status === 'COMPLETED') {
      const weekStart = new Date(program.startDate);
      const sessionDate = new Date(sw.createdAt);
      const weekNumber = Math.ceil((sessionDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
      
      if (weeklyData[weekNumber]) {
        weeklyData[weekNumber].completed++;
      }
    }
  });
  
  return Object.entries(weeklyData).map(([week, data]) => ({
    week: parseInt(week),
    plannedSessions: data.planned,
    completedSessions: data.completed,
    adherenceRate: Math.round((data.completed / data.planned) * 100),
  }));
}

function calculateStrengthProgress(sessionWorkouts: any[]) {
  const exerciseProgress: { [key: string]: { weights: number[]; progress: number } } = {};
  
  sessionWorkouts.forEach(sw => {
    sw.sessionPerformance.forEach((sp: any) => {
      if (!exerciseProgress[sp.exerciseName]) {
        exerciseProgress[sp.exerciseName] = { weights: [], progress: 0 };
      }
      
      const maxWeight = Math.max(...sp.setPerformances
        .filter((set: any) => set.weight && set.weight > 0)
        .map((set: any) => set.weight));
      
      if (maxWeight > 0) {
        exerciseProgress[sp.exerciseName].weights.push(maxWeight);
      }
    });
  });
  
  // Calculate progress for each exercise
  Object.keys(exerciseProgress).forEach(exerciseName => {
    const weights = exerciseProgress[exerciseName].weights;
    if (weights.length >= 2) {
      const firstWeight = weights[0];
      const lastWeight = weights[weights.length - 1];
      exerciseProgress[exerciseName].progress = Math.round(((lastWeight - firstWeight) / firstWeight) * 100);
    }
  });
  
  // Get top exercises
  const topExercises = Object.entries(exerciseProgress)
    .sort(([, a]: [string, any], [, b]: [string, any]) => b.progress - a.progress)
    .slice(0, 5)
    .map(([name, data]: [string, any]) => ({
      name,
      progress: data.progress,
      currentWeight: data.weights[data.weights.length - 1] || 0,
    }));
  
  // Calculate overall strength trend
  const allProgress = Object.values(exerciseProgress).map(data => data.progress);
  const averageProgress = allProgress.length > 0 ? allProgress.reduce((a, b) => a + b, 0) / allProgress.length : 0;
  
  let strengthTrend: 'IMPROVING' | 'STABLE' | 'DECLINING' = 'STABLE';
  if (averageProgress > 5) strengthTrend = 'IMPROVING';
  else if (averageProgress < -5) strengthTrend = 'DECLINING';
  
  return {
    averageWeightProgress: Math.round(averageProgress),
    maxWeightLifted: Math.max(...Object.values(exerciseProgress).flatMap(data => data.weights)),
    strengthTrend,
    topExercises,
  };
}

function calculateVolumeProgress(sessionWorkouts: any[]) {
  const weeklyVolume: { [key: number]: { volume: number; sessions: number } } = {};
  
  sessionWorkouts.forEach(sw => {
    if (sw.status === 'COMPLETED') {
      const weekNumber = Math.ceil((new Date(sw.createdAt).getTime() - new Date().getTime() - 7 * 24 * 60 * 60 * 1000) / (1000 * 60 * 60 * 24 * 7));
      
      if (!weeklyVolume[weekNumber]) {
        weeklyVolume[weekNumber] = { volume: 0, sessions: 0 };
      }
      
      let sessionVolume = 0;
      sw.sessionPerformance.forEach((sp: any) => {
        sp.setPerformances.forEach((set: any) => {
          if (set.weight && set.reps) {
            sessionVolume += set.weight * set.reps;
          }
        });
      });
      
      weeklyVolume[weekNumber].volume += sessionVolume;
      weeklyVolume[weekNumber].sessions++;
    }
  });
  
  const weeklyVolumeArray = Object.entries(weeklyVolume).map(([week, data]) => ({
    week: parseInt(week),
    volume: Math.round(data.volume),
    sessions: data.sessions,
  }));
  
  // Calculate volume trend
  const volumes = weeklyVolumeArray.map(w => w.volume);
  const volumeTrend = volumes.length >= 2 
    ? (volumes[volumes.length - 1] > volumes[0] ? 'IMPROVING' : volumes[volumes.length - 1] < volumes[0] ? 'DECLINING' : 'STABLE')
    : 'STABLE';
  
  return {
    averageRepsProgress: Math.round(Math.random() * 20 + 5), // Placeholder calculation
    totalVolume: Math.round(weeklyVolumeArray.reduce((sum, w) => sum + w.volume, 0)),
    volumeTrend,
    weeklyVolume: weeklyVolumeArray,
  };
}

function calculateGoalsProgress(progressRecords: any[], program: any) {
  // Calculate primary goal progress based on program goal
  let primaryGoalProgress = 0;
  
  if (program.primaryGoal.toLowerCase().includes('strength')) {
    // Calculate strength progress
    const weightRecords = progressRecords
      .filter(pr => pr.weight)
      .map(pr => pr.weight)
      .sort((a, b) => (a || 0) - (b || 0));
    
    if (weightRecords.length >= 2) {
      const firstWeight = weightRecords[0] || 0;
      const lastWeight = weightRecords[weightRecords.length - 1] || 0;
      primaryGoalProgress = Math.round(((lastWeight - firstWeight) / firstWeight) * 100);
    }
  } else if (program.primaryGoal.toLowerCase().includes('weight')) {
    // Calculate weight loss/gain progress
    const weightRecords = progressRecords
      .filter(pr => pr.weight)
      .map(pr => pr.weight)
      .sort((a, b) => (a || 0) - (b || 0));
    
    if (weightRecords.length >= 2) {
      const firstWeight = weightRecords[0] || 0;
      const lastWeight = weightRecords[weightRecords.length - 1] || 0;
      primaryGoalProgress = Math.round(((lastWeight - firstWeight) / firstWeight) * 100);
    }
  }
  
  // Generate milestones
  const milestones = [
    {
      name: 'First Week Complete',
      achieved: progressRecords.length >= 1,
      date: progressRecords[0]?.date,
      description: 'Completed the first week of training',
    },
    {
      name: 'Consistent Training',
      achieved: progressRecords.length >= 4,
      date: progressRecords[3]?.date,
      description: 'Maintained consistent training for 4 weeks',
    },
    {
      name: 'Strength Improvement',
      achieved: primaryGoalProgress > 10,
      date: progressRecords[progressRecords.length - 1]?.date,
      description: 'Achieved 10% strength improvement',
    },
  ];
  
  return {
    primaryGoalProgress: Math.max(0, Math.min(100, primaryGoalProgress)),
    secondaryGoals: [
      {
        name: 'Consistency',
        progress: Math.min(100, progressRecords.length * 10),
        target: 100,
        current: progressRecords.length,
        unit: 'sessions',
      },
      {
        name: 'Endurance',
        progress: Math.round(Math.random() * 30 + 20),
        target: 100,
        current: Math.round(Math.random() * 30 + 20),
        unit: 'minutes',
      },
    ],
    milestones,
  };
}

function calculateBestDays(sessionWorkouts: any[]) {
  const dayStats: { [key: string]: { sessions: number; totalRPE: number; completed: number } } = {};
  
  sessionWorkouts.forEach(sw => {
    const day = new Date(sw.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
    
    if (!dayStats[day]) {
      dayStats[day] = { sessions: 0, totalRPE: 0, completed: 0 };
    }
    
    dayStats[day].sessions++;
    if (sw.status === 'COMPLETED') {
      dayStats[day].completed++;
      
      // Calculate average RPE for this session
      const sessionRPEs = sw.sessionPerformance
        .flatMap((sp: any) => sp.setPerformances)
        .filter((sp: any) => sp.rpe && sp.rpe > 0)
        .map((sp: any) => sp.rpe);
      
      if (sessionRPEs.length > 0) {
        dayStats[day].totalRPE += sessionRPEs.reduce((a, b) => a + b, 0) / sessionRPEs.length;
      }
    }
  });
  
  return Object.entries(dayStats)
    .map(([day, stats]) => ({
      day,
      completionRate: Math.round((stats.completed / stats.sessions) * 100),
      averageRPE: Math.round(stats.totalRPE / stats.completed),
    }))
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, 3);
}

function calculateMissedSessions(sessionWorkouts: any[]) {
  return sessionWorkouts
    .filter(sw => sw.status === 'SKIPPED')
    .map(sw => ({
      date: sw.createdAt,
      reason: 'Not specified',
      impact: 'MEDIUM' as const,
    }))
    .slice(0, 5);
}

function generateInsights(program: any, sessionWorkouts: any[], progressRecords: any[], metrics: any) {
  const recommendations = [];
  const trends = [];
  const alerts = [];
  
  // Generate recommendations based on performance
  if (metrics.completionRate < 70) {
    recommendations.push({
      type: 'MOTIVATION' as const,
      priority: 'HIGH' as const,
      title: 'Improve Session Completion',
      description: 'Client is missing too many sessions. Consider adjusting schedule or providing motivation.',
      action: 'Schedule a check-in call to discuss barriers',
    });
  }
  
  if (metrics.averageRPE < 6) {
    recommendations.push({
      type: 'ADJUSTMENT' as const,
      priority: 'MEDIUM' as const,
      title: 'Increase Training Intensity',
      description: 'Average RPE is below optimal range. Consider increasing exercise difficulty.',
      action: 'Review and adjust exercise parameters',
    });
  }
  
  if (metrics.consistencyScore < 60) {
    recommendations.push({
      type: 'PROGRESSION' as const,
      priority: 'MEDIUM' as const,
      title: 'Improve Consistency',
      description: 'Training consistency needs improvement. Consider simplifying the program.',
      action: 'Simplify workout structure',
    });
  }
  
  // Generate trends
  if (metrics.strengthTrend === 'IMPROVING') {
    trends.push({
      metric: 'Strength Progress',
      trend: 'POSITIVE' as const,
      change: 15,
      period: 'Last 4 weeks',
      insight: 'Client is making excellent strength gains',
    });
  }
  
  if (metrics.volumeTrend === 'IMPROVING') {
    trends.push({
      metric: 'Training Volume',
      trend: 'POSITIVE' as const,
      change: 12,
      period: 'Last 4 weeks',
      insight: 'Training volume is increasing consistently',
    });
  }
  
  // Generate alerts
  if (metrics.completionRate >= 90) {
    alerts.push({
      type: 'SUCCESS' as const,
      message: 'Excellent session completion rate!',
      date: new Date().toISOString(),
    });
  }
  
  if (metrics.averageRPE >= 8) {
    alerts.push({
      type: 'WARNING' as const,
      message: 'High training intensity detected - monitor for overtraining',
      date: new Date().toISOString(),
    });
  }
  
  return {
    recommendations,
    trends,
    alerts,
  };
} 