export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Since middleware already verifies the token, we can get the user ID from headers
function getCptIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

// GET /api/program-templates - Get program templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cptId = getCptIdFromRequest(request);
    const experienceLevel = searchParams.get('experienceLevel');
    const goal = searchParams.get('goal');
    const periodizationType = searchParams.get('periodizationType');

    // Build where clause
    const where: any = {};
    
    if (cptId) {
      where.OR = [
        { cptId },
        { isPublic: true }
      ];
    } else {
      where.isPublic = true;
    }
    
    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }
    
    if (goal) {
      where.goal = { contains: goal, mode: 'insensitive' };
    }
    
    if (periodizationType) {
      where.periodizationType = periodizationType;
    }

    const templates = await prisma.programTemplate.findMany({
      where,
      include: {
        cpt: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            macrocycles: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching program templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program templates' },
      { status: 500 }
    );
  }
}

// POST /api/program-templates - Create a new program template
export async function POST(request: NextRequest) {
  try {
    const cptId = getCptIdFromRequest(request);
    if (!cptId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      goal,
      experienceLevel,
      duration,
      periodizationType,
      isPublic = false
    } = body;

    // Validate required fields
    if (!name || !goal || !experienceLevel || !duration || !periodizationType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const template = await prisma.programTemplate.create({
      data: {
        name,
        description,
        goal,
        experienceLevel,
        duration,
        periodizationType,
        isPublic,
        cptId
      },
      include: {
        cpt: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating program template:', error);
    return NextResponse.json(
      { error: 'Failed to create program template' },
      { status: 500 }
    );
  }
} 