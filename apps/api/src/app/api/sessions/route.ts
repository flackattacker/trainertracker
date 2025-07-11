import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function getUserFromRequest(req: NextRequest): { id?: string; clientId?: string; [key: string]: any } | null {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    if (typeof payload === 'string') return null;
    return payload as { id?: string; clientId?: string; [key: string]: any };
  } catch {
    return null;
  }
}

// GET /api/sessions?role=trainer|client
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');
  let sessions;
  if (role === 'trainer' && user.id) {
    sessions = await prisma.session.findMany({ 
      where: { cptId: user.id }, 
      orderBy: { startTime: 'asc' },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            codeName: true
          }
        }
      }
    });
  } else if (role === 'client' && user.clientId) {
    sessions = await prisma.session.findMany({ 
      where: { clientId: user.clientId }, 
      orderBy: { startTime: 'asc' },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            codeName: true
          }
        }
      }
    });
  } else {
    return NextResponse.json({ error: 'Invalid role or user' }, { status: 400 });
  }
  return NextResponse.json(sessions);
}

// POST /api/sessions
export async function POST(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const body = await req.json();
  const { clientId, startTime, endTime, type, location, notes } = body;
  if (!startTime) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Handle client self-booking
  if (user.clientId && clientId === 'self') {
    // Client is booking for themselves
    const actualClientId = user.clientId;
    
    // Get the client's trainer ID
    const client = await prisma.client.findUnique({
      where: { id: actualClientId },
      select: { cptId: true }
    });
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    const sessionStart = new Date(startTime);
    const sessionEnd = endTime ? new Date(endTime) : new Date(sessionStart.getTime() + 60 * 60 * 1000);

    // Check for conflicts with existing sessions for this trainer
    const conflictingSessions = await prisma.session.findMany({
      where: {
        cptId: client.cptId,
        OR: [
          {
            startTime: { lte: sessionStart },
            endTime: { gt: sessionStart }
          },
          {
            startTime: { lt: sessionEnd },
            endTime: { gte: sessionEnd }
          },
          {
            startTime: { gte: sessionStart },
            endTime: { lte: sessionEnd }
          }
        ]
      }
    });

    if (conflictingSessions.length > 0) {
      return NextResponse.json({ 
        error: 'Session conflicts with existing appointments'
      }, { status: 409 });
    }

    const session = await prisma.session.create({
      data: {
        cptId: client.cptId,
        clientId: actualClientId,
        startTime: sessionStart,
        endTime: sessionEnd,
        type,
        location,
        notes,
      },
    });
    return NextResponse.json(session);
  }

  // Handle trainer booking for clients
  if (!user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!clientId) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const sessionStart = new Date(startTime);
    const sessionEnd = endTime ? new Date(endTime) : new Date(sessionStart.getTime() + 60 * 60 * 1000); // Default 1 hour

    // Check for conflicts with existing sessions
    const conflictingSessions = await prisma.session.findMany({
      where: {
        cptId: user.id,
        OR: [
          // Session starts during an existing session
          {
            startTime: { lte: sessionStart },
            endTime: { gt: sessionStart }
          },
          // Session ends during an existing session
          {
            startTime: { lt: sessionEnd },
            endTime: { gte: sessionEnd }
          },
          // Session completely contains an existing session
          {
            startTime: { gte: sessionStart },
            endTime: { lte: sessionEnd }
          }
        ]
      }
    });

    if (conflictingSessions.length > 0) {
      const conflicts = conflictingSessions.map(s => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        clientId: s.clientId
      }));
      
      return NextResponse.json({ 
        error: 'Session conflicts with existing appointments',
        conflicts 
      }, { status: 409 });
    }

    const session = await prisma.session.create({
      data: {
        cptId: user.id,
        clientId,
        startTime: sessionStart,
        endTime: sessionEnd,
        type,
        location,
        notes,
      },
    });
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

// PATCH /api/sessions?id=...
export async function PATCH(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || !user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Session id required' }, { status: 400 });
  const body = await req.json();
  try {
    const session = await prisma.session.update({
      where: { id },
      data: { ...body },
    });
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }
}

// DELETE /api/sessions?id=...
export async function DELETE(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user || !user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Session id required' }, { status: 400 });
  
  try {
    // Verify the session belongs to the trainer
    const session = await prisma.session.findFirst({
      where: { id, cptId: user.id }
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
    }
    
    await prisma.session.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}

 