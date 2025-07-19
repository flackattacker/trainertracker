export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Since middleware already verifies the token, we can get the user ID from headers
function getCptIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

// GET /api/program-templates - Get all program templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cptId = getCptIdFromRequest(request);
    const goal = searchParams.get('goal');
    const experienceLevel = searchParams.get('experienceLevel');
    const periodizationType = searchParams.get('periodizationType');
    const isPublic = searchParams.get('isPublic');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};
    
    // Filter by CPT or public templates
    if (cptId) {
      where.OR = [
        { cptId: cptId },
        { isPublic: true }
      ];
    } else {
      where.isPublic = true;
    }
    
    if (goal) {
      where.goal = { contains: goal, mode: 'insensitive' };
    }
    
    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }
    
    if (periodizationType) {
      where.periodizationType = periodizationType;
    }

    if (isPublic !== null) {
      where.isPublic = isPublic === 'true';
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
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.programTemplate.count({ where });

    return NextResponse.json({
      templates,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });
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

    // Validate duration
    if (duration < 4 || duration > 52) {
      return NextResponse.json(
        { error: 'Duration must be between 4 and 52 weeks' },
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
        cptId: cptId
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