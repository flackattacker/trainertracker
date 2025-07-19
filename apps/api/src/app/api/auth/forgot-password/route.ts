import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateResetToken } from '../../../../lib/passwordValidation';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export async function POST(req: NextRequest) {
  try {
    const { email, userType } = await req.json();
    
    if (!email || !userType) {
      return NextResponse.json({ 
        error: 'Email and user type are required.' 
      }, { status: 400 });
    }
    
    if (!['CPT', 'CLIENT'].includes(userType)) {
      return NextResponse.json({ 
        error: 'User type must be either CPT or CLIENT.' 
      }, { status: 400 });
    }
    
    // Check if user exists
    let user;
    if (userType === 'CPT') {
      user = await prisma.cPT.findUnique({ where: { email } });
    } else {
      user = await prisma.client.findUnique({ where: { email } });
    }
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ 
        message: 'If an account with that email exists, a password reset link has been sent.' 
      });
    }
    
    // Generate reset token
    const token = generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    // Store reset token
    await prisma.passwordReset.create({
      data: {
        email,
        token,
        userType,
        expiresAt,
      },
    });
    
    // In a real application, you would send an email here
    // For now, we'll just return the token for testing
    console.log(`Password reset token for ${email}: ${token}`);
    
    return NextResponse.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.' 
    });
    
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json({ 
      error: 'Failed to process password reset request.' 
    }, { status: 500 });
  }
} 