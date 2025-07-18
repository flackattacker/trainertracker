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

    const resolvedParams = await params;
    const { id } = resolvedParams;
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cptId = getCptIdFromRequest(req);
    if (!cptId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    if (!id) {
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Check if program exists and belongs to this CPT
    const existingProgram = await prisma.program.findUnique({
      where: { id },
      select: { cptId: true }
    });

    if (!existingProgram) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    if (existingProgram.cptId !== cptId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If activating a program, ensure only one active program per client
    if (status === 'ACTIVE') {
      // Get the program to be activated
      const programToActivate = await prisma.program.findUnique({
        where: { id },
        select: { clientId: true }
      });

      if (programToActivate) {
        // Deactivate any other active programs for this client
        await prisma.program.updateMany({
          where: {
            clientId: programToActivate.clientId,
            status: 'ACTIVE',
            id: { not: id }
          },
          data: { status: 'PAUSED' }
        });
      }
    }

    // Update the program status
    const updatedProgram = await prisma.program.update({
      where: { id },
      data: { status },
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

    return NextResponse.json(updatedProgram);
  } catch (error) {
    console.error('Error updating program:', error);
    return NextResponse.json(
      { error: 'Failed to update program' },
      { status: 500 }
    );
  }
} 