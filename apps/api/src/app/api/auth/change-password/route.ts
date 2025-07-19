import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validatePassword } from '../../../../lib/passwordValidation';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ 
        error: 'Authentication token required.' 
      }, { status: 401 });
    }
    
    const { currentPassword, newPassword } = await req.json();
    
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        error: 'Current password and new password are required.' 
      }, { status: 400 });
    }
    
    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ 
        error: 'New password does not meet requirements.',
        details: passwordValidation.errors 
      }, { status: 400 });
    }
    
    // Verify current password and get user
    let user;
    let userType: 'CPT' | 'CLIENT';
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (decoded.id) {
        // CPT user
        user = await prisma.cPT.findUnique({ where: { id: decoded.id } });
        userType = 'CPT';
      } else if (decoded.clientId) {
        // Client user
        user = await prisma.client.findUnique({ where: { id: decoded.clientId } });
        userType = 'CLIENT';
      } else {
        return NextResponse.json({ 
          error: 'Invalid token format.' 
        }, { status: 401 });
      }
      
      if (!user) {
        return NextResponse.json({ 
          error: 'User not found.' 
        }, { status: 404 });
      }
      
      // Verify current password
      const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.passwordHash || '');
      if (!isValidCurrentPassword) {
        return NextResponse.json({ 
          error: 'Current password is incorrect.' 
        }, { status: 400 });
      }
      
      // Check if new password is same as current
      const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash || '');
      if (isSamePassword) {
        return NextResponse.json({ 
          error: 'New password must be different from current password.' 
        }, { status: 400 });
      }
      
      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);
      
      // Update password
      if (userType === 'CPT') {
        await prisma.cPT.update({
          where: { id: user.id },
          data: { passwordHash },
        });
      } else {
        await prisma.client.update({
          where: { id: user.id },
          data: { passwordHash },
        });
      }
      
      return NextResponse.json({ 
        message: 'Password changed successfully.' 
      });
      
    } catch (jwtError) {
      return NextResponse.json({ 
        error: 'Invalid authentication token.' 
      }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ 
      error: 'Failed to change password.' 
    }, { status: 500 });
  }
} 