export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validatePassword } from '../../../../lib/passwordValidation';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(password, undefined, { email });
    if (!passwordValidation.isValid) {
      return NextResponse.json({ 
        error: 'Password does not meet requirements.',
        details: passwordValidation.errors 
      }, { status: 400 });
    }
    
    const existing = await prisma.cPT.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'User already exists.' }, { status: 409 });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.cPT.create({
      data: { email, passwordHash },
    });
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
  }
} 