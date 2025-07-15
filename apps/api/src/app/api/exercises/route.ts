export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Since middleware already verifies the token, we can get the user ID from headers
function getCptIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

// GET /api/exercises - Get all exercises with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const muscleGroup = searchParams.get('muscleGroup');
    const equipment = searchParams.get('equipment');
    const includeVariations = searchParams.get('includeVariations') === 'true';

    // Build where clause
    const where: any = { isPublic: true };
    
    if (category) {
      where.category = { name: category };
    }
    
    if (difficulty) {
      where.difficulty = difficulty;
    }
    
    if (muscleGroup) {
      where.muscleGroups = {
        array_contains: [muscleGroup]
      };
    }
    
    if (equipment) {
      where.equipment = {
        array_contains: [equipment]
      };
    }

    const exercises = await prisma.exercise.findMany({
      where,
      include: {
        category: true,
        exerciseVariations: includeVariations,
        cpt: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

// POST /api/exercises - Create a new exercise (trainer only)
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
      categoryId,
      muscleGroups,
      equipment,
      difficulty,
      instructions,
      videoUrl,
      imageUrl,
      isPublic = false
    } = body;

    // Validate required fields
    if (!name || !categoryId || !muscleGroups || !equipment || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if exercise name already exists
    const existingExercise = await prisma.exercise.findUnique({
      where: { name }
    });

    if (existingExercise) {
      return NextResponse.json(
        { error: 'Exercise with this name already exists' },
        { status: 409 }
      );
    }

    const exercise = await prisma.exercise.create({
      data: {
        name,
        description,
        categoryId,
        muscleGroups,
        equipment,
        difficulty,
        instructions,
        videoUrl,
        imageUrl,
        isPublic,
        cptId: cptId
      },
      include: {
        category: true,
        cpt: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise' },
      { status: 500 }
    );
  }
} 