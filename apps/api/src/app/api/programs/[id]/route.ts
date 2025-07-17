import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Since middleware already verifies the token, we can get the user ID from headers
function getCptIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cptId = getCptIdFromRequest(req);
    if (!cptId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 });
    }

    // Get the program
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            codeName: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Ensure the program belongs to this CPT
    if (program.cptId !== cptId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program' },
      { status: 500 }
    );
  }
} 