import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../../lib/prisma';

// GET /api/sessions/[id]/workouts/[workoutId]/performance - Get all performance data for a workout
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; workoutId: string }> }
) {
  try {
    const { id, workoutId } = await params;
    
    const performances = await prisma.sessionPerformance.findMany({
      where: {
        sessionWorkout: {
          sessionId: id,
          workoutId
        }
      },
      include: {
        setPerformances: {
          orderBy: { setNumber: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(performances);
  } catch (error) {
    console.error('Error fetching session performances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session performances' },
      { status: 500 }
    );
  }
}

// POST /api/sessions/[id]/workouts/[workoutId]/performance - Create performance data for exercises
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; workoutId: string }> }
) {
  try {
    const { id, workoutId } = await params;
    const body = await request.json();
    
    const { performances } = body; // Array of performance data

    if (!performances || !Array.isArray(performances)) {
      return NextResponse.json(
        { error: 'Missing required field: performances array' },
        { status: 400 }
      );
    }

    // Get the session workout
    const sessionWorkout = await prisma.sessionWorkout.findUnique({
      where: {
        sessionId_workoutId: {
          sessionId: id,
          workoutId
        }
      }
    });

    if (!sessionWorkout) {
      return NextResponse.json(
        { error: 'Session workout not found' },
        { status: 404 }
      );
    }

    // Create performance records
    const createdPerformances = [];
    
    for (const performance of performances) {
      const {
        exerciseId,
        exerciseName,
        order,
        plannedSets,
        plannedReps,
        plannedWeight,
        plannedRestTime,
        plannedTempo,
        plannedRpe,
        setPerformances
      } = performance;

      const sessionPerformance = await prisma.sessionPerformance.create({
        data: {
          sessionWorkoutId: sessionWorkout.id,
          exerciseId,
          exerciseName,
          order,
          plannedSets,
          plannedReps,
          plannedWeight,
          plannedRestTime,
          plannedTempo,
          plannedRpe,
          setPerformances: {
            create: setPerformances?.map((set: any, index: number) => ({
              setNumber: index + 1,
              setType: set.setType || 'WORKING',
              reps: set.reps,
              weight: set.weight,
              restTime: set.restTime,
              tempo: set.tempo,
              rpe: set.rpe,
              completed: set.completed || false,
              skipped: set.skipped || false,
              notes: set.notes,
              difficulty: set.difficulty,
              formQuality: set.formQuality
            })) || []
          }
        },
        include: {
          setPerformances: {
            orderBy: { setNumber: 'asc' }
          }
        }
      });

      createdPerformances.push(sessionPerformance);
    }

    return NextResponse.json(createdPerformances, { status: 201 });
  } catch (error) {
    console.error('Error creating session performances:', error);
    return NextResponse.json(
      { error: 'Failed to create session performances' },
      { status: 500 }
    );
  }
}

// PUT /api/sessions/[id]/workouts/[workoutId]/performance - Update performance data
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; workoutId: string }> }
) {
  try {
    const { id, workoutId } = await params;
    const body = await request.json();
    
    const { exerciseId, actualSets, actualReps, actualWeight, actualRestTime, actualTempo, actualRpe, completed, skipped, notes, difficulty, formQuality, setPerformances } = body;

    if (!exerciseId) {
      return NextResponse.json(
        { error: 'Missing required field: exerciseId' },
        { status: 400 }
      );
    }

    // Get the session workout
    const sessionWorkout = await prisma.sessionWorkout.findUnique({
      where: {
        sessionId_workoutId: {
          sessionId: id,
          workoutId
        }
      }
    });

    if (!sessionWorkout) {
      return NextResponse.json(
        { error: 'Session workout not found' },
        { status: 404 }
      );
    }

    // Update performance data
    const updatedPerformance = await prisma.sessionPerformance.update({
      where: {
        sessionWorkoutId_exerciseId: {
          sessionWorkoutId: sessionWorkout.id,
          exerciseId
        }
      },
      data: {
        actualSets,
        actualReps,
        actualWeight,
        actualRestTime,
        actualTempo,
        actualRpe,
        completed,
        skipped,
        notes,
        difficulty,
        formQuality
      },
      include: {
        setPerformances: {
          orderBy: { setNumber: 'asc' }
        }
      }
    });

    // Update set performances if provided
    if (setPerformances && Array.isArray(setPerformances)) {
      for (const set of setPerformances) {
        if (set.id) {
          // Update existing set
          await prisma.setPerformance.update({
            where: { id: set.id },
            data: {
              reps: set.reps,
              weight: set.weight,
              restTime: set.restTime,
              tempo: set.tempo,
              rpe: set.rpe,
              completed: set.completed,
              skipped: set.skipped,
              notes: set.notes,
              difficulty: set.difficulty,
              formQuality: set.formQuality
            }
          });
        } else {
          // Create new set
          await prisma.setPerformance.create({
            data: {
              sessionPerformanceId: updatedPerformance.id,
              setNumber: set.setNumber,
              setType: set.setType || 'WORKING',
              reps: set.reps,
              weight: set.weight,
              restTime: set.restTime,
              tempo: set.tempo,
              rpe: set.rpe,
              completed: set.completed || false,
              skipped: set.skipped || false,
              notes: set.notes,
              difficulty: set.difficulty,
              formQuality: set.formQuality
            }
          });
        }
      }
    }

    // Return updated performance with set performances
    const finalPerformance = await prisma.sessionPerformance.findUnique({
      where: { id: updatedPerformance.id },
      include: {
        setPerformances: {
          orderBy: { setNumber: 'asc' }
        }
      }
    });

    return NextResponse.json(finalPerformance);
  } catch (error) {
    console.error('Error updating session performance:', error);
    return NextResponse.json(
      { error: 'Failed to update session performance' },
      { status: 500 }
    );
  }
} 