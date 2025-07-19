import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { validatePassword, validateResetToken } from '../../../../lib/passwordValidation';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword, userType } = await req.json();
    
    if (!token || !newPassword || !userType) {
      return NextResponse.json({ 
        error: 'Token, new password, and user type are required.' 
      }, { status: 400 });
    }
    
    if (!['CPT', 'CLIENT'].includes(userType)) {
      return NextResponse.json({ 
        error: 'User type must be either CPT or CLIENT.' 
      }, { status: 400 });
    }
    
    // Validate token format
    if (!validateResetToken(token)) {
      return NextResponse.json({ 
        error: 'Invalid reset token format.' 
      }, { status: 400 });
    }
    
    // Find and validate reset token
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
    });
    
    if (!resetRecord) {
      return NextResponse.json({ 
        error: 'Invalid or expired reset token.' 
      }, { status: 400 });
    }
    
    if (resetRecord.used) {
      return NextResponse.json({ 
        error: 'Reset token has already been used.' 
      }, { status: 400 });
    }
    
    if (resetRecord.expiresAt < new Date()) {
      return NextResponse.json({ 
        error: 'Reset token has expired.' 
      }, { status: 400 });
    }
    
    if (resetRecord.userType !== userType) {
      return NextResponse.json({ 
        error: 'Invalid user type for this reset token.' 
      }, { status: 400 });
    }
    
    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ 
        error: 'Password does not meet requirements.',
        details: passwordValidation.errors 
      }, { status: 400 });
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    // Update user password
    if (userType === 'CPT') {
      await prisma.cPT.update({
        where: { email: resetRecord.email },
        data: { passwordHash },
      });
    } else {
      await prisma.client.update({
        where: { email: resetRecord.email },
        data: { passwordHash },
      });
    }
    
    // Mark reset token as used
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });
    
    return NextResponse.json({ 
      message: 'Password has been successfully reset.' 
    });
    
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ 
      error: 'Failed to reset password.' 
    }, { status: 500 });
  }
} 