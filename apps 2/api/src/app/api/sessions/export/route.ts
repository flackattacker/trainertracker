import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getUserFromRequest(req: NextRequest): { id?: string; clientId?: string; [key: string]: any } | null {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try {
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(auth.replace('Bearer ', ''), process.env.JWT_SECRET || 'dev_secret');
    if (typeof payload === 'string') return null;
    return payload as { id?: string; clientId?: string; [key: string]: any };
  } catch {
    return null;
  }
}

// Generate iCal content for sessions
function generateICalContent(sessions: any[], userType: 'trainer' | 'client', userName: string) {
  const now = new Date();
  const calendarName = userType === 'trainer' ? `${userName}'s Training Sessions` : `${userName}'s Sessions`;
  
  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TrainerTracker//Calendar Export//EN',
    `X-WR-CALNAME:${calendarName}`,
    `X-WR-CALDESC:Training sessions from TrainerTracker`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `DTSTAMP:${formatDateForICal(now)}`,
    ''
  ];

  sessions.forEach(session => {
    const startDate = new Date(session.startTime);
    const endDate = session.endTime ? new Date(session.endTime) : new Date(startDate.getTime() + 60 * 60 * 1000);
    
    const summary = userType === 'trainer' 
      ? `Training Session - ${session.client?.firstName} ${session.client?.lastName}`
      : `Training Session with ${session.client?.firstName} ${session.client?.lastName}`;
    
    const description = [
      `Session Type: ${session.type}`,
      session.location ? `Location: ${session.location}` : '',
      session.notes ? `Notes: ${session.notes}` : '',
      `Status: ${session.status}`
    ].filter(Boolean).join('\\n');

    const uid = `trainertracker-${session.id}@${process.env.NEXT_PUBLIC_APP_URL || 'trainertracker.com'}`;
    
    ical.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTART:${formatDateForICal(startDate)}`,
      `DTEND:${formatDateForICal(endDate)}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${session.location || 'TBD'}`,
      `STATUS:${session.status === 'SCHEDULED' ? 'CONFIRMED' : session.status.toUpperCase()}`,
      `CREATED:${formatDateForICal(new Date(session.createdAt))}`,
      `LAST-MODIFIED:${formatDateForICal(new Date(session.updatedAt))}`,
      'END:VEVENT',
      ''
    );
  });

  ical.push('END:VCALENDAR');
  return ical.join('\r\n');
}

// Format date for iCal (YYYYMMDDTHHMMSSZ)
function formatDateForICal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

// GET /api/sessions/export - Export sessions as iCal file
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') || 'ical';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  try {
    let sessions;
    let userType: 'trainer' | 'client';
    let userName: string;

    if (user.id) {
      // Trainer export
      userType = 'trainer';
      const trainer = await prisma.cPT.findUnique({
        where: { id: user.id },
        select: { firstName: true, lastName: true }
      });
      userName = `${trainer?.firstName || 'Trainer'} ${trainer?.lastName || ''}`.trim();

      const whereClause: any = { cptId: user.id };
      if (startDate && endDate) {
        whereClause.startTime = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      sessions = await prisma.session.findMany({
        where: whereClause,
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
    } else if (user.clientId) {
      // Client export
      userType = 'client';
      const client = await prisma.client.findUnique({
        where: { id: user.clientId },
        select: { firstName: true, lastName: true }
      });
      userName = `${client?.firstName || 'Client'} ${client?.lastName || ''}`.trim();

      const whereClause: any = { clientId: user.clientId };
      if (startDate && endDate) {
        whereClause.startTime = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }

      sessions = await prisma.session.findMany({
        where: whereClause,
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
      return NextResponse.json({ error: 'Invalid user type' }, { status: 400 });
    }

    if (format === 'ical') {
      const icalContent = generateICalContent(sessions, userType, userName);
      const filename = `trainertracker-sessions-${userType}-${new Date().toISOString().split('T')[0]}.ics`;
      
      return new NextResponse(icalContent, {
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache'
        }
      });
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error exporting sessions:', error);
    return NextResponse.json({ error: 'Failed to export sessions' }, { status: 500 });
  }
} 