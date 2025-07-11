import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const userId = decoded.id;

    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      bio,
      businessName,
      businessType,
      website,
      address,
      city,
      state,
      zipCode,
      country,
      timezone,
      defaultSessionDuration,
      businessHours,
      certifications,
      reminderPreferences,
      privacySettings,
      aiFeatures
    } = body;

    // Update user profile
    const updatedUser = await prisma.cPT.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        bio,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      }
    });

    // Create or update trainer profile
    const trainerProfile = await prisma.trainerProfile.upsert({
      where: { userId },
      update: {
        businessName,
        businessType,
        website,
        address,
        city,
        state,
        zipCode,
        country,
        timezone,
        defaultSessionDuration,
        businessHours,
        reminderPreferences,
        privacySettings,
        aiFeatures,
      },
      create: {
        userId,
        businessName,
        businessType,
        website,
        address,
        city,
        state,
        zipCode,
        country,
        timezone,
        defaultSessionDuration,
        businessHours,
        reminderPreferences,
        privacySettings,
        aiFeatures,
      }
    });

    // Handle certifications
    if (certifications && certifications.length > 0) {
      // Delete existing certifications
      await prisma.certification.deleteMany({
        where: { userId }
      });

      // Create new certifications
      for (const cert of certifications) {
        if (cert.name && cert.issuingOrganization) {
          await prisma.certification.create({
            data: {
              userId,
              name: cert.name,
              issuingOrganization: cert.issuingOrganization,
              issueDate: cert.issueDate ? new Date(cert.issueDate) : null,
              expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
              certificationNumber: cert.certificationNumber,
            }
          });
        }
      }
    }

    return NextResponse.json({
      message: 'Onboarding completed successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        onboardingCompleted: updatedUser.onboardingCompleted,
      },
      trainerProfile
    });

  } catch (error) {
    console.error('Onboarding error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json(
      { message: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const userId = decoded.id;

    const user = await prisma.cPT.findUnique({
      where: { id: userId },
      include: {
        trainerProfile: true,
        certifications: true,
      }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      onboardingCompleted: user.onboardingCompleted,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        bio: user.bio,
      },
      trainerProfile: user.trainerProfile,
      certifications: user.certifications,
    });

  } catch (error) {
    console.error('Get onboarding status error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    return NextResponse.json(
      { message: 'Failed to get onboarding status' },
      { status: 500 }
    );
  }
} 