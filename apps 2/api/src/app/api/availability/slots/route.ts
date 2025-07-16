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

// Helper function to get client ID from request
function getClientIdFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as any;
    return decoded.clientId || null;
  } catch (error) {
    return null;
  }
}

// GET /api/availability/slots - Get available time slots for booking
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trainerId = searchParams.get('trainerId');
  const date = searchParams.get('date');
  const sessionDuration = parseInt(searchParams.get('duration') || '60'); // Default 60 minutes

  // Check if request is from trainer or client
  const cptId = getCptIdFromRequest(req);
  const clientId = getClientIdFromRequest(req);
  
  if (!trainerId || !date) {
    return NextResponse.json(
      { error: 'Trainer ID and date are required' },
      { status: 400 }
    );
  }

  try {
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay(); // 0-6 (Sunday-Saturday)

    // Get trainer's availability for this day
    const availability = await prisma.availability.findFirst({
      where: {
        trainerId,
        dayOfWeek,
        isAvailable: true
      }
    });

    if (!availability) {
      return NextResponse.json({ slots: [] });
    }

    // Check for exceptions on this date
    const exception = await prisma.availabilityException.findFirst({
      where: {
        trainerId,
        date: targetDate
      }
    });

    // If there's an exception that makes the trainer unavailable, return empty slots
    if (exception && !exception.isAvailable) {
      return NextResponse.json({ slots: [] });
    }

    // Get existing sessions for this date
    const existingSessions = await prisma.session.findMany({
      where: {
        cptId: trainerId,
        startTime: {
          gte: new Date(targetDate.setHours(0, 0, 0, 0)),
          lt: new Date(targetDate.setHours(23, 59, 59, 999))
        }
      },
      orderBy: { startTime: 'asc' }
    });

    // Parse availability times
    const [startHour, startMinute] = availability.startTime.split(':').map(Number);
    const [endHour, endMinute] = availability.endTime.split(':').map(Number);
    
    let startTime = new Date(targetDate);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    let endTime = new Date(targetDate);
    endTime.setHours(endHour, endMinute, 0, 0);

    // Apply exception times if they exist
    if (exception && exception.isAvailable) {
      if (exception.startTime) {
        const [exStartHour, exStartMinute] = exception.startTime.split(':').map(Number);
        startTime.setHours(exStartHour, exStartMinute, 0, 0);
      }
      if (exception.endTime) {
        const [exEndHour, exEndMinute] = exception.endTime.split(':').map(Number);
        endTime.setHours(exEndHour, exEndMinute, 0, 0);
      }
    }

    // Generate time slots
    const slots = [];
    const slotDuration = sessionDuration * 60 * 1000; // Convert to milliseconds
    let currentSlot = new Date(startTime);

    while (currentSlot.getTime() + slotDuration <= endTime.getTime()) {
      const slotEnd = new Date(currentSlot.getTime() + slotDuration);
      
      // Check if this slot conflicts with existing sessions
      const hasConflict = existingSessions.some(session => {
        const sessionStart = new Date(session.startTime);
        const sessionEnd = session.endTime ? new Date(session.endTime) : new Date(sessionStart.getTime() + 60 * 60 * 1000);
        
        return (
          (currentSlot >= sessionStart && currentSlot < sessionEnd) ||
          (slotEnd > sessionStart && slotEnd <= sessionEnd) ||
          (currentSlot <= sessionStart && slotEnd >= sessionEnd)
        );
      });

      if (!hasConflict) {
        slots.push({
          startTime: currentSlot.toISOString(),
          endTime: slotEnd.toISOString(),
          duration: sessionDuration
        });
      }

      // Move to next slot (30-minute intervals)
      currentSlot.setMinutes(currentSlot.getMinutes() + 30);
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available slots' },
      { status: 500 }
    );
  }
} 