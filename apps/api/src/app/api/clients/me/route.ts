export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Authorization header required.' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { clientId: string; email: string };

    const client = await prisma.client.findUnique({
      where: { id: decoded.clientId },
    });

    if (!client) {
      return NextResponse.json({ message: 'Client not found.' }, { status: 404 });
    }

    // Fetch client's programs, progress, and sessions
    const [programs, progress, sessions] = await Promise.all([
      prisma.program.findMany({
        where: { clientId: client.id },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.progress.findMany({
        where: { clientId: client.id },
        orderBy: { date: 'desc' },
        take: 10
      }),
      prisma.session.findMany({
        where: { clientId: client.id },
        orderBy: { startTime: 'desc' },
        take: 10
      })
    ]);

    const clientData = {
      id: client.id,
      email: client.email,
      firstName: client.firstName,
      lastName: client.lastName,
      dateOfBirth: client.dateOfBirth,
      gender: client.gender,
      phone: client.phone,
      notes: client.notes,
      status: client.status,
      experienceLevel: client.experienceLevel,
      programs,
      progress,
      sessions
    };

    return NextResponse.json(clientData);
  } catch (error) {
    console.error('Error fetching client data:', error);
    return NextResponse.json({ message: 'Failed to fetch client data.' }, { status: 500 });
  }
} 