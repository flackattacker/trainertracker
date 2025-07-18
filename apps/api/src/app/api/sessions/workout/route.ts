export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Since middleware already verifies the token, we can get the user ID from headers
function getCptIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

export async function POST(req: NextRequest) {
  try {
    const cptId = getCptIdFromRequest(req);
    if (!cptId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      programId,
      clientId,
      workoutId,
      sessionDate,
      sessionNotes,
      exercisePerformances,
      completed,
      totalExercises,
      completedExercises
    } = body;

    // Validate required fields
    if (!programId || !clientId || !workoutId || !sessionDate) {
      return NextResponse.json({ 
        error: 'Missing required fields: programId, clientId, workoutId, sessionDate' 
      }, { status: 400 });
    }

    // Verify the client belongs to this CPT
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        cptId: cptId
      }
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found or unauthorized' }, { status: 404 });
    }

    // For now, just create a progress record with the session data
    // This is a simplified approach until we get the full session workout system working
    const progressData = {
      sessionDate,
      workoutId,
      exercisePerformances,
      completed,
      totalExercises,
      completedExercises,
      sessionNotes
    };

    const progress = await prisma.progress.create({
      data: {
        cptId,
        clientId,
        programId,
        date: new Date(sessionDate),
        notes: sessionNotes || '',
        data: progressData
      }
    });

    return NextResponse.json({
      success: true,
      progress: {
        id: progress.id,
        sessionDate: progress.date,
        completed,
        totalExercises,
        completedExercises,
        exerciseCount: exercisePerformances.length
      }
    });

  } catch (error) {
    console.error('Error creating session workout:', error);
    return NextResponse.json(
      { error: 'Failed to create session workout' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const cptId = getCptIdFromRequest(req);
    if (!cptId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const programId = searchParams.get('programId');
    const clientId = searchParams.get('clientId');
    const workoutId = searchParams.get('workoutId');

    if (!programId || !clientId) {
      return NextResponse.json({ 
        error: 'Missing required parameters: programId, clientId' 
      }, { status: 400 });
    }

    // Build where clause
    const whereClause: any = {
      cptId,
      clientId,
      programId
    };

    // Get progress records that contain session workout data
    const progressRecords = await prisma.progress.findMany({
      where: whereClause,
      orderBy: {
        date: 'desc'
      }
    });

    // Filter for records that contain workout data
    const sessionWorkouts = progressRecords.filter(record => {
      const data = record.data as any;
      return data && data.workoutId;
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