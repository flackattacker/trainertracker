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
    return NextResponse.json({ token, user: { id: client.id, email: client.email, firstName: client.firstName, lastName: client.lastName } });
  } catch (error) {
    return NextResponse.json({ message: 'Login failed.' }, { status: 500 });
  }
} 