export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Since middleware already verifies the token, we can get the user ID from headers
function getCptIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

// GET /api/exercises - Get all exercises with enhanced filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const muscleGroup = searchParams.get('muscleGroup');
    const equipment = searchParams.get('equipment');
    const search = searchParams.get('search');
    const includeVariations = searchParams.get('includeVariations') === 'true';
    const hasVideo = searchParams.get('hasVideo') === 'true';
    const hasImage = searchParams.get('hasImage') === 'true';
    const isPublic = searchParams.get('isPublic');
    const cptId = searchParams.get('cptId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Build where clause
    const where: any = {};
    
    // Handle public/private filtering
    if (isPublic !== null) {
      where.isPublic = isPublic === 'true';
    } else {
      // Default to public exercises if not specified
      where.isPublic = true;
    }
    
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

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { instructions: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (hasVideo) {
      where.videoUrl = { not: null };
    }

    if (hasImage) {
      where.imageUrl = { not: null };
    }

    if (cptId) {
      where.cptId = cptId;
    }

    // Build orderBy clause
    const orderBy: any = {};
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'difficulty') {
      orderBy.difficulty = sortOrder;
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder;
    } else if (sortBy === 'category') {
      orderBy.category = { name: sortOrder };
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
      orderBy,
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.exercise.count({ where });

    return NextResponse.json({
      exercises,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });
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

    // Validate video URL format if provided
    if (videoUrl && !isValidVideoUrl(videoUrl)) {
      return NextResponse.json(
        { error: 'Invalid video URL format' },
        { status: 400 }
      );
    }

    // Validate image URL format if provided
    if (imageUrl && !isValidImageUrl(imageUrl)) {
      return NextResponse.json(
        { error: 'Invalid image URL format' },
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

// Helper functions for URL validation
function isValidVideoUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const validDomains = [
      'youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com',
      'facebook.com', 'instagram.com', 'tiktok.com'
    ];
    return validDomains.some(domain => urlObj.hostname.includes(domain));
  } catch {
    return false;
  }
}

function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return validExtensions.some(ext => urlObj.pathname.toLowerCase().endsWith(ext));
  } catch {
    return false;
  }
} 