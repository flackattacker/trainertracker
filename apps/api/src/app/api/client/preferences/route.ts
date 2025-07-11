import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { clientId: string };
    const clientId = decoded.clientId;

    // For now, return default preferences since we don't have a preferences table yet
    // In a real implementation, you'd store these in a separate table
    const defaultPreferences = {
      preferredTimes: {
        morning: true,
        afternoon: false,
        evening: false
      },
      sessionTypes: {
        inPerson: true,
        virtual: false
      },
      notifications: {
        email: true,
        sms: false
      }
    };

    return NextResponse.json(defaultPreferences);

  } catch (error) {
    console.error('Get client preferences error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json(
      { message: 'Failed to get preferences' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { clientId: string };
    const clientId = decoded.clientId;

    const body = await request.json();
    const {
      preferredTimes,
      sessionTypes,
      notifications
    } = body;

    // Validate that the client exists
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!existingClient) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    // For now, we'll store preferences in the client's notes field as JSON
    // In a real implementation, you'd have a separate preferences table
    let currentNotes: any = {};
    try {
      currentNotes = existingClient.notes ? JSON.parse(existingClient.notes) : {};
    } catch (error) {
      // If notes is not valid JSON, start with empty object
      currentNotes = {};
    }
    
    const updatedNotes = {
      ...currentNotes,
      preferences: {
        preferredTimes: preferredTimes || currentNotes.preferences?.preferredTimes || {
          morning: true,
          afternoon: false,
          evening: false
        },
        sessionTypes: sessionTypes || currentNotes.preferences?.sessionTypes || {
          inPerson: true,
          virtual: false
        },
        notifications: notifications || currentNotes.preferences?.notifications || {
          email: true,
          sms: false
        }
      }
    };

    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        notes: JSON.stringify(updatedNotes)
      }
    });

    return NextResponse.json({
      message: 'Preferences updated successfully',
      preferences: updatedNotes.preferences
    });

  } catch (error) {
    console.error('Update client preferences error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json(
      { message: 'Failed to update preferences' },
      { status: 500 }
    );
  }
} 