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

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        codeName: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!client) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json(client);

  } catch (error) {
    console.error('Get client profile error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json(
      { message: 'Failed to get client profile' },
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
      email,
      phone,
      notes
    } = body;

    // Validate that the client exists and belongs to the authenticated user
    const existingClient = await prisma.client.findUnique({
      where: { id: clientId }
    });

    if (!existingClient) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    // Update client profile
    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        email: email !== undefined ? email : existingClient.email,
        phone: phone !== undefined ? phone : existingClient.phone,
        notes: notes !== undefined ? notes : existingClient.notes,
      },
      select: {
        id: true,
        codeName: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
        status: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      client: updatedClient
    });

  } catch (error) {
    console.error('Update client profile error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 