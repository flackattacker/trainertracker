export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/exercise-categories - Get all exercise categories
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.exerciseCategory.findMany({
      orderBy: { name: 'asc' }
    });

    // Add exercise count manually since SQLite doesn't support _count
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const exerciseCount = await prisma.exercise.count({
          where: { categoryId: category.id }
        });
        return {
          ...category,
          _count: {
            exercises: exerciseCount
          }
        };
      })
    );

    return NextResponse.json(categoriesWithCount);
  } catch (error) {
    console.error('Error fetching exercise categories:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to fetch exercise categories', details: error?.message || error },
      { status: 500 }
    );
  }
}

// POST /api/exercise-categories - Create a new category (trainer only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existingCategory = await prisma.exerciseCategory.findUnique({
      where: { name }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }

    const category = await prisma.exerciseCategory.create({
      data: {
        name,
        description
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise category:', error);
    return NextResponse.json(
      { error: 'Failed to create exercise category' },
      { status: 500 }
    );
  }
} 