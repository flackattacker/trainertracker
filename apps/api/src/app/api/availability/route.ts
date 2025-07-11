import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to get CPT ID from request
function getCptIdFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;
    return decoded.id || null;
  } catch (error) {
    return null;
  }
}

// GET /api/availability - Get trainer's availability
export async function GET(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const includeExceptions = searchParams.get('includeExceptions') === 'true';

    const availabilities = await prisma.availability.findMany({
      where: { trainerId: cptId },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    let exceptions: any[] = [];
    if (includeExceptions) {
      exceptions = await prisma.availabilityException.findMany({
        where: { trainerId: cptId },
        orderBy: { date: 'asc' }
      });
    }

    return NextResponse.json({
      availabilities,
      exceptions
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

// POST /api/availability - Create or update availability
export async function POST(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { availabilities, exceptions } = body;

    // Validate availabilities
    if (availabilities && Array.isArray(availabilities)) {
      for (const availability of availabilities) {
        if (typeof availability.dayOfWeek !== 'number' || 
            availability.dayOfWeek < 0 || 
            availability.dayOfWeek > 6) {
          return NextResponse.json(
            { error: 'Invalid day of week' },
            { status: 400 }
          );
        }
        
        if (!availability.startTime || !availability.endTime) {
          return NextResponse.json(
            { error: 'Start time and end time are required' },
            { status: 400 }
          );
        }
      }
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing availabilities for this trainer
      await tx.availability.deleteMany({
        where: { trainerId: cptId }
      });

      // Create new availabilities
      const createdAvailabilities = [];
      if (availabilities && Array.isArray(availabilities)) {
        for (const availability of availabilities) {
          const created = await tx.availability.create({
            data: {
              trainerId: cptId,
              dayOfWeek: availability.dayOfWeek,
              startTime: availability.startTime,
              endTime: availability.endTime,
              isAvailable: availability.isAvailable ?? true,
              sessionTypes: availability.sessionTypes || { inPerson: true, virtual: true },
              maxSessionsPerDay: availability.maxSessionsPerDay || 8
            }
          });
          createdAvailabilities.push(created);
        }
      }

      // Handle exceptions
      let createdExceptions = [];
      if (exceptions && Array.isArray(exceptions)) {
        // Delete existing exceptions for this trainer
        await tx.availabilityException.deleteMany({
          where: { trainerId: cptId }
        });

        // Create new exceptions
        for (const exception of exceptions) {
          const created = await tx.availabilityException.create({
            data: {
              trainerId: cptId,
              date: new Date(exception.date),
              startTime: exception.startTime,
              endTime: exception.endTime,
              isAvailable: exception.isAvailable ?? false,
              reason: exception.reason
            }
          });
          createdExceptions.push(created);
        }
      }

      return {
        availabilities: createdAvailabilities,
        exceptions: createdExceptions
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating availability:', error);
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    );
  }
} 