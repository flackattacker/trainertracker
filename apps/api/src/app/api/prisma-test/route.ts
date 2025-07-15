import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Try a simple query
    const categories = await prisma.exerciseCategory.findMany({ take: 1 });
    return NextResponse.json({ ok: true, categories });
  } catch (error) {
    console.error('Prisma test error:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    return NextResponse.json({ ok: false, error: error?.message || error, stack: error?.stack || '' }, { status: 500 });
  }
} 