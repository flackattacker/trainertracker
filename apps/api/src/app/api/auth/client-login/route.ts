export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required.' }, { status: 400 });
    }
    const client = await prisma.client.findUnique({ where: { email } });
    if (!client || !client.passwordHash) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, client.passwordHash);
    if (!valid) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }
    const token = jwt.sign({ clientId: client.id, email: client.email }, JWT_SECRET, { expiresIn: '7d' });
    
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

    return NextResponse.json({ token, client: clientData });
  } catch (error) {
    return NextResponse.json({ message: 'Login failed.' }, { status: 500 });
  }
} 