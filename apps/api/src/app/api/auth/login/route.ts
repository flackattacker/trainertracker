export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export async function POST(req: NextRequest) {
  try {
    console.log('Trainer Login: Starting login process');
    const { email, password } = await req.json();
    console.log('Trainer Login: Email received:', email);
    
    if (!email || !password) {
      console.log('Trainer Login: Missing email or password');
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }
    
    console.log('Trainer Login: Looking up user in database');
    const user = await prisma.cPT.findUnique({ where: { email } });
    console.log('Trainer Login: User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('Trainer Login: User not found');
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }
    
    console.log('Trainer Login: Comparing passwords');
    const valid = await bcrypt.compare(password, user.passwordHash);
    console.log('Trainer Login: Password valid:', valid);
    
    if (!valid) {
      console.log('Trainer Login: Invalid password');
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }
    
    console.log('Trainer Login: Generating JWT token');
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    console.log('Trainer Login: Token generated successfully');
    
    const response = { token, user: { id: user.id, email: user.email } };
    console.log('Trainer Login: Sending response:', JSON.stringify(response));
    
    return NextResponse.json(response);
  } catch (error) {
    console.log('Trainer Login: Error occurred:', error);
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 });
  }
} 