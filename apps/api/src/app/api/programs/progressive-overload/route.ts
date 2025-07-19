export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Since middleware already verifies the token, we can get the user ID from headers
function getCptIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

// POST /api/programs/progressive-overload - Calculate progressive overload for a program
export async function POST(request: NextRequest) {
  try {
    const cptId = getCptIdFromRequest(request);
    if (!cptId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      programId,
      exerciseId,
      currentWeight,
      currentReps,
      currentSets,
      targetReps,
      progressionType = 'LINEAR',
      experienceLevel = 'BEGINNER',
      weekNumber = 1
    } = body;

    // Validate required fields
    if (!exerciseId || !currentWeight || !currentReps || !currentSets) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get exercise details
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId }
    });

    if (!exercise) {
      return NextResponse.json(
        { error: 'Exercise not found' },
        { status: 404 }
      );
    }

    // Calculate progressive overload based on type and experience level
    const progression = calculateProgressiveOverload({
      currentWeight,
      currentReps,
      currentSets,
      targetReps,
      progressionType,
      experienceLevel,
      weekNumber,
      exerciseDifficulty: exercise.difficulty
    });

    // Get historical performance data if programId is provided
    let historicalData = null;
    if (programId) {
      historicalData = await getHistoricalPerformance(programId, exerciseId);
    }

    return NextResponse.json({
      progression,
      historicalData,
      recommendations: generateRecommendations(progression, exercise, experienceLevel)
    });
  } catch (error) {
    console.error('Error calculating progressive overload:', error);
    return NextResponse.json(
      { error: 'Failed to calculate progressive overload' },
      { status: 500 }
    );
  }
}

interface ProgressionParams {
  currentWeight: number;
  currentReps: number;
  currentSets: number;
  targetReps: number;
  progressionType: string;
  experienceLevel: string;
  weekNumber: number;
  exerciseDifficulty: string;
}

interface ProgressionResult {
  nextWeek: {
    weight: number;
    reps: number;
    sets: number;
    rpe?: number;
  };
  fourWeekPlan: Array<{
    week: number;
    weight: number;
    reps: number;
    sets: number;
    rpe?: number;
    notes: string;
  }>;
  deloadWeek?: {
    weight: number;
    reps: number;
    sets: number;
    rpe?: number;
  };
}

function calculateProgressiveOverload(params: ProgressionParams): ProgressionResult {
  const {
    currentWeight,
    currentReps,
    currentSets,
    targetReps,
    progressionType,
    experienceLevel,
    weekNumber,
    exerciseDifficulty
  } = params;

  // Base progression rates by experience level
  const progressionRates = {
    BEGINNER: {
      weightIncrease: 0.05, // 5% per week
      repIncrease: 1,
      setIncrease: 0.5,
      deloadFrequency: 4 // Every 4 weeks
    },
    INTERMEDIATE: {
      weightIncrease: 0.025, // 2.5% per week
      repIncrease: 0.5,
      setIncrease: 0.25,
      deloadFrequency: 6 // Every 6 weeks
    },
    ADVANCED: {
      weightIncrease: 0.01, // 1% per week
      repIncrease: 0.25,
      setIncrease: 0.1,
      deloadFrequency: 8 // Every 8 weeks
    }
  };

  const rates = progressionRates[experienceLevel as keyof typeof progressionRates] || progressionRates.INTERMEDIATE;

  // Adjust rates based on exercise difficulty
  const difficultyMultiplier = {
    BEGINNER: 1.2,
    INTERMEDIATE: 1.0,
    ADVANCED: 0.8
  }[exerciseDifficulty] || 1.0;

  // Calculate next week's progression
  let nextWeight = currentWeight;
  let nextReps = currentReps;
  let nextSets = currentSets;

  switch (progressionType) {
    case 'LINEAR':
      // Linear progression: increase weight, maintain reps
      if (currentReps >= targetReps) {
        nextWeight = currentWeight * (1 + rates.weightIncrease * difficultyMultiplier);
        nextReps = Math.max(targetReps - 2, 6); // Reset reps, maintain minimum
      } else {
        nextReps = Math.min(currentReps + rates.repIncrease, targetReps);
      }
      break;

    case 'DOUBLE_PROGRESSION':
      // Double progression: increase reps first, then weight
      if (currentReps >= targetReps) {
        nextWeight = currentWeight * (1 + rates.weightIncrease * difficultyMultiplier);
        nextReps = Math.max(targetReps - 3, 6);
      } else {
        nextReps = Math.min(currentReps + rates.repIncrease, targetReps);
      }
      break;

    case 'PERCENTAGE_BASED':
      // Percentage-based progression
      const percentageIncrease = rates.weightIncrease * difficultyMultiplier;
      nextWeight = currentWeight * (1 + percentageIncrease);
      if (currentReps >= targetReps) {
        nextReps = Math.max(targetReps - 2, 6);
      }
      break;

    case 'RPE_BASED':
      // RPE-based progression (Rate of Perceived Exertion)
      nextWeight = currentWeight;
      nextReps = currentReps;
      // RPE will be calculated separately
      break;

    default:
      // Default to linear progression
      if (currentReps >= targetReps) {
        nextWeight = currentWeight * (1 + rates.weightIncrease * difficultyMultiplier);
        nextReps = Math.max(targetReps - 2, 6);
      } else {
        nextReps = Math.min(currentReps + rates.repIncrease, targetReps);
      }
  }

  // Round weight to nearest 2.5 lbs or 1 kg
  nextWeight = Math.round(nextWeight / 2.5) * 2.5;

  // Generate 4-week plan
  const fourWeekPlan = [];
  let weekWeight = nextWeight;
  let weekReps = nextReps;
  let weekSets = nextSets;

  for (let week = 1; week <= 4; week++) {
    const isDeloadWeek = (weekNumber + week) % rates.deloadFrequency === 0;
    
    if (isDeloadWeek) {
      weekWeight = weekWeight * 0.9; // 10% reduction for deload
      weekReps = Math.min(weekReps + 2, targetReps + 2);
      weekSets = Math.max(weekSets - 1, 2);
    } else {
      // Normal progression
      if (weekReps >= targetReps) {
        weekWeight = weekWeight * (1 + rates.weightIncrease * difficultyMultiplier);
        weekReps = Math.max(targetReps - 2, 6);
      } else {
        weekReps = Math.min(weekReps + rates.repIncrease, targetReps);
      }
    }

    weekWeight = Math.round(weekWeight / 2.5) * 2.5;

    fourWeekPlan.push({
      week: weekNumber + week,
      weight: weekWeight,
      reps: Math.round(weekReps),
      sets: Math.round(weekSets),
      rpe: isDeloadWeek ? 6 : 8,
      notes: isDeloadWeek ? 'Deload week - focus on form and recovery' : 'Progressive overload week'
    });
  }

  // Calculate deload week if needed
  let deloadWeek: ProgressionResult['deloadWeek'] = undefined;
  if ((weekNumber + 1) % rates.deloadFrequency === 0) {
    deloadWeek = {
      weight: nextWeight * 0.9,
      reps: Math.min(nextReps + 2, targetReps + 2),
      sets: Math.max(nextSets - 1, 2),
      rpe: 6
    };
  }

  return {
    nextWeek: {
      weight: nextWeight,
      reps: Math.round(nextReps),
      sets: Math.round(nextSets),
      rpe: 8
    },
    fourWeekPlan,
    deloadWeek
  };
}

async function getHistoricalPerformance(programId: string, exerciseId: string) {
  try {
    // Get session performance data for this exercise in the program
    const performances = await prisma.sessionPerformance.findMany({
      where: {
        sessionWorkout: {
          programId: programId
        },
        exerciseId: exerciseId
      },
      include: {
        setPerformances: {
          orderBy: { setNumber: 'asc' }
        },
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
      },
      take: 5 // Last 5 sessions
    });

    if (performances.length === 0) {
      return null;
    }

    // Calculate trends
    const trends = performances.map(perf => {
      const totalWeight = perf.setPerformances.reduce((sum: number, set: any) => sum + (set.weight || 0), 0);
      const totalReps = perf.setPerformances.reduce((sum: number, set: any) => sum + (set.reps || 0), 0);
      const avgWeight = totalWeight / perf.setPerformances.length;
      const avgReps = totalReps / perf.setPerformances.length;

      return {
        date: perf.sessionWorkout.session.startTime,
        avgWeight,
        avgReps,
        sets: perf.setPerformances.length,
        rpe: perf.actualRpe
      };
    });

    return {
      recentPerformances: trends,
      improvementRate: calculateImprovementRate(trends),
      consistencyScore: calculateConsistencyScore(trends)
    };
  } catch (error) {
    console.error('Error fetching historical performance:', error);
    return null;
  }
}

function calculateImprovementRate(trends: any[]): number {
  if (trends.length < 2) return 0;

  const recent = trends[0];
  const previous = trends[trends.length - 1];
  
  const weightImprovement = (recent.avgWeight - previous.avgWeight) / previous.avgWeight;
  const repImprovement = (recent.avgReps - previous.avgReps) / previous.avgReps;
  
  return (weightImprovement + repImprovement) / 2;
}

function calculateConsistencyScore(trends: any[]): number {
  if (trends.length < 3) return 0;

  // Calculate variance in performance
  const weights = trends.map(t => t.avgWeight);
  const mean = weights.reduce((sum, w) => sum + w, 0) / weights.length;
  const variance = weights.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / weights.length;
  
  // Convert to consistency score (0-100)
  const coefficientOfVariation = Math.sqrt(variance) / mean;
  return Math.max(0, 100 - (coefficientOfVariation * 100));
}

function generateRecommendations(progression: ProgressionResult, exercise: any, experienceLevel: string): string[] {
  const recommendations = [];

  // Exercise-specific recommendations
  if (exercise.difficulty === 'ADVANCED' && experienceLevel === 'BEGINNER') {
    recommendations.push('Consider starting with a simpler variation of this exercise');
  }

  if (exercise.muscleGroups.includes('Lower Back') || exercise.muscleGroups.includes('Core')) {
    recommendations.push('Focus on proper form and core engagement');
  }

  // Progression-specific recommendations
  if (progression.nextWeek.weight > progression.nextWeek.weight * 1.1) {
    recommendations.push('Large weight increase detected - consider smaller increments for better adaptation');
  }

  if (progression.deloadWeek) {
    recommendations.push('Deload week approaching - plan for active recovery and form work');
  }

  // General recommendations based on experience level
  if (experienceLevel === 'BEGINNER') {
    recommendations.push('Focus on mastering form before increasing weight');
    recommendations.push('Aim for 2-3 sessions per week for optimal adaptation');
  } else if (experienceLevel === 'INTERMEDIATE') {
    recommendations.push('Consider implementing periodization for continued progress');
    recommendations.push('Monitor recovery and adjust volume as needed');
  } else {
    recommendations.push('Fine-tune technique and consider advanced training methods');
    recommendations.push('Implement strategic deloads to prevent overtraining');
  }

  return recommendations;
} 