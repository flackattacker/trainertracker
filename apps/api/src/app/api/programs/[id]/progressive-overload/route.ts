import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Since middleware already verifies the token, we can get the user ID from headers
function getCptIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

interface ProgressionEntry {
  date: string;
  weight: number;
  reps: number;
  sets: number;
  rpe: number;
  notes?: string;
}

interface ProgressionRecommendation {
  type: 'WEIGHT' | 'REPS' | 'SETS' | 'VOLUME' | 'INTENSITY';
  currentValue: number;
  recommendedValue: number;
  increase: number;
  percentage: number;
  reason: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  nextSessionDate: string;
}

interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  currentWeight: number;
  currentReps: number;
  currentSets: number;
  lastSessionDate: string;
  progressionHistory: ProgressionEntry[];
  recommendedProgression: ProgressionRecommendation;
}

interface PhaseGuidelines {
  sets: { min: number; max: number };
  reps: { min: number; max: number };
  intensity: { min: number; max: number };
  tempo: string;
  restTime: { min: number; max: number };
  rpe: { min: number; max: number };
  progressionRules: {
    weightIncrease: number;
    repIncrease: number;
    volumeIncrease: number;
    frequency: string;
  };
}

const OPT_PHASE_GUIDELINES: Record<string, PhaseGuidelines> = {
  STABILIZATION_ENDURANCE: {
    sets: { min: 1, max: 3 },
    reps: { min: 12, max: 20 },
    intensity: { min: 50, max: 70 },
    tempo: '4-2-2',
    restTime: { min: 0, max: 90 },
    rpe: { min: 4, max: 6 },
    progressionRules: {
      weightIncrease: 0,
      repIncrease: 2,
      volumeIncrease: 10,
      frequency: 'weekly'
    }
  },
  STRENGTH_ENDURANCE: {
    sets: { min: 2, max: 4 },
    reps: { min: 8, max: 12 },
    intensity: { min: 70, max: 80 },
    tempo: '3-1-2',
    restTime: { min: 60, max: 120 },
    rpe: { min: 6, max: 8 },
    progressionRules: {
      weightIncrease: 5,
      repIncrease: 1,
      volumeIncrease: 5,
      frequency: 'weekly'
    }
  },
  MUSCULAR_DEVELOPMENT: {
    sets: { min: 3, max: 5 },
    reps: { min: 6, max: 12 },
    intensity: { min: 75, max: 85 },
    tempo: '2-1-2',
    restTime: { min: 90, max: 180 },
    rpe: { min: 7, max: 9 },
    progressionRules: {
      weightIncrease: 2.5,
      repIncrease: 0,
      volumeIncrease: 5,
      frequency: 'bi-weekly'
    }
  },
  MAXIMAL_STRENGTH: {
    sets: { min: 2, max: 6 },
    reps: { min: 1, max: 5 },
    intensity: { min: 85, max: 100 },
    tempo: '2-1-1',
    restTime: { min: 180, max: 300 },
    rpe: { min: 8, max: 10 },
    progressionRules: {
      weightIncrease: 2.5,
      repIncrease: 0,
      volumeIncrease: 0,
      frequency: 'bi-weekly'
    }
  },
  POWER: {
    sets: { min: 2, max: 4 },
    reps: { min: 1, max: 5 },
    intensity: { min: 30, max: 45 },
    tempo: '1-0-1',
    restTime: { min: 180, max: 300 },
    rpe: { min: 7, max: 9 },
    progressionRules: {
      weightIncrease: 2.5,
      repIncrease: 0,
      volumeIncrease: 3,
      frequency: 'weekly'
    }
  }
};

function calculateProgressionRecommendation(
  exercise: any,
  currentPhase: string,
  progressionHistory: ProgressionEntry[]
): ProgressionRecommendation {
  const guidelines = OPT_PHASE_GUIDELINES[currentPhase] ?? OPT_PHASE_GUIDELINES.STABILIZATION_ENDURANCE;
  
  if (progressionHistory.length < 2) {
    return {
      type: 'WEIGHT',
      currentValue: exercise.currentWeight || 0,
      recommendedValue: exercise.currentWeight || 0,
      increase: 0,
      percentage: 0,
      reason: 'Insufficient data for progression recommendation',
      confidence: 'LOW',
      nextSessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }

  const recentSessions = progressionHistory.slice(-3);
  const avgRPE = recentSessions.reduce((sum, session) => sum + session.rpe, 0) / recentSessions.length;
  const weightStable = recentSessions.every(session => session.weight === exercise.currentWeight);
  const repStable = recentSessions.every(session => session.reps === exercise.currentReps);

  // Determine progression type based on phase and performance
  if (currentPhase === 'STABILIZATION_ENDURANCE') {
    if (avgRPE <= 5 && repStable) {
      return {
        type: 'REPS',
        currentValue: exercise.currentReps || 0,
        recommendedValue: Math.min((exercise.currentReps || 0) + guidelines.progressionRules.repIncrease, guidelines.reps.max),
        increase: guidelines.progressionRules.repIncrease,
        percentage: (guidelines.progressionRules.repIncrease / (exercise.currentReps || 1)) * 100,
        reason: 'Low RPE indicates capacity for increased reps',
        confidence: 'HIGH',
        nextSessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
    }
  } else if (currentPhase === 'STRENGTH_ENDURANCE' || currentPhase === 'MUSCULAR_DEVELOPMENT') {
    if (avgRPE >= 7 && weightStable && repStable) {
      return {
        type: 'WEIGHT',
        currentValue: exercise.currentWeight || 0,
        recommendedValue: (exercise.currentWeight || 0) + guidelines.progressionRules.weightIncrease,
        increase: guidelines.progressionRules.weightIncrease,
        percentage: (guidelines.progressionRules.weightIncrease / (exercise.currentWeight || 1)) * 100,
        reason: 'High RPE and consistent performance indicate readiness for weight increase',
        confidence: 'HIGH',
        nextSessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
    }
  }

  return {
    type: 'VOLUME',
    currentValue: exercise.currentSets || 0,
    recommendedValue: Math.min((exercise.currentSets || 0) + 1, guidelines.sets.max),
    increase: 1,
    percentage: (1 / (exercise.currentSets || 1)) * 100,
    reason: 'Maintain current weight/reps, increase volume',
    confidence: 'MEDIUM',
    nextSessionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cptId = getCptIdFromRequest(req);
    if (!cptId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: programId } = await params;
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Get the program
    const program = await prisma.program.findUnique({
      where: { id: programId, cptId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Get program data
    const programData = program.data as any;
    const currentPhase = program.optPhase;
    const workouts = programData?.workouts || [];

    // Get session performance data
    const sessionPerformances = await prisma.sessionPerformance.findMany({
      where: {
        sessionWorkout: {
          programId: programId
        }
      },
      include: {
        sessionWorkout: {
          include: {
            session: true
          }
        }
      },
      orderBy: {
        sessionWorkout: {
          session: {
            startTime: 'desc'
          }
        }
      }
    });

    // Group performance data by exercise
    const exercisePerformanceMap = new Map<string, any>();
    
    sessionPerformances.forEach(performance => {
      const exerciseId = performance.exerciseId;
      if (!exercisePerformanceMap.has(exerciseId)) {
        exercisePerformanceMap.set(exerciseId, {
          exerciseId,
          exerciseName: performance.exerciseName,
          performances: []
        });
      }
      
      const exercise = exercisePerformanceMap.get(exerciseId);
      exercise.performances.push({
        date: performance.sessionWorkout.session.startTime.toISOString().split('T')[0],
        weight: performance.actualWeight || performance.plannedWeight || 0,
        reps: performance.actualReps || performance.plannedReps || 0,
        sets: performance.actualSets || performance.plannedSets || 0,
        rpe: performance.actualRpe || performance.plannedRpe || 7
      });
    });

    // Calculate progression for each exercise
    const exerciseProgress: ExerciseProgress[] = [];

    for (const [exerciseId, exerciseData] of exercisePerformanceMap) {
      const performances = exerciseData.performances;
      if (performances.length === 0) continue;

      // Get current performance (most recent)
      const currentPerformance = performances[0];
      
      // Create progression history
      const progressionHistory: ProgressionEntry[] = performances.map((perf: any) => ({
        date: perf.date,
        weight: perf.weight,
        reps: perf.reps,
        sets: perf.sets,
        rpe: perf.rpe
      }));

      // Calculate recommendation
      const recommendedProgression = calculateProgressionRecommendation(
        currentPerformance,
        currentPhase,
        progressionHistory
      );

      exerciseProgress.push({
        exerciseId,
        exerciseName: exerciseData.exerciseName,
        currentWeight: currentPerformance.weight,
        currentReps: currentPerformance.reps,
        currentSets: currentPerformance.sets,
        lastSessionDate: currentPerformance.date,
        progressionHistory,
        recommendedProgression
      });
    }

    return NextResponse.json({
      programId,
      clientId,
      currentPhase,
      exerciseProgress,
      phaseGuidelines: OPT_PHASE_GUIDELINES[currentPhase] || OPT_PHASE_GUIDELINES.STABILIZATION_ENDURANCE
    });

  } catch (error) {
    console.error('Error fetching progressive overload data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progressive overload data' },
      { status: 500 }
    );
  }
} 