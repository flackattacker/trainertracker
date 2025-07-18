import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

// GET /api/sessions/[id]/workouts - Get all workouts for a session
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const sessionWorkouts = await prisma.sessionWorkout.findMany({
      where: { sessionId: id },
      include: {
        performances: {
          include: {
            setPerformances: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json(sessionWorkouts);
  } catch (error) {
    console.error('Error fetching session workouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session workouts' },
      { status: 500 }
    );
  }
}

// POST /api/sessions/[id]/workouts - Create a new session workout
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { programId, workoutId, workoutName, weekNumber, dayNumber } = body;

    // Validate required fields
    if (!programId || !workoutId || !workoutName || weekNumber === undefined || dayNumber === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: programId, workoutId, workoutName, weekNumber, dayNumber' },
        { status: 400 }
      );
    }

    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { id },
      include: { program: true }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if workout already exists for this session
    const existingWorkout = await prisma.sessionWorkout.findUnique({
      where: {
        sessionId_workoutId: {
          sessionId: id,
          workoutId
        }
      }
    });

    if (existingWorkout) {
      return NextResponse.json(
        { error: 'Workout already exists for this session' },
        { status: 409 }
      );
    }

    // Create session workout
    const sessionWorkout = await prisma.sessionWorkout.create({
      data: {
        sessionId: id,
        programId,
        workoutId,
        workoutName,
        weekNumber,
        dayNumber,
        status: 'PLANNED'
      },
      include: {
        performances: {
          include: {
            setPerformances: true
          }
        }
      }
    });

    return NextResponse.json(sessionWorkout, { status: 201 });
  } catch (error) {
    console.error('Error creating session workout:', error);
    return NextResponse.json(
      { error: 'Failed to create session workout' },
      { status: 500 }
    );
  }
}

// PUT /api/sessions/[id]/workouts - Update session workout status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { workoutId, status, notes } = body;

    if (!workoutId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: workoutId, status' },
        { status: 400 }
      );
    }

    const sessionWorkout = await prisma.sessionWorkout.update({
      where: {
        sessionId_workoutId: {
          sessionId: id,
          workoutId
        }
      },
      data: {
        status,
        notes
      },
      include: {
        performances: {
          include: {
            setPerformances: true
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    return NextResponse.json(sessionWorkout);
  } catch (error) {
    console.error('Error updating session workout:', error);
    return NextResponse.json(
      { error: 'Failed to update session workout' },
      { status: 500 }
    );
  }
} 