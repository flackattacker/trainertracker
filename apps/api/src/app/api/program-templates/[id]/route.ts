export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Since middleware already verifies the token, we can get the user ID from headers
function getCptIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

// GET /api/program-templates/[id] - Get a specific program template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cptId = getCptIdFromRequest(request);
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const template = await prisma.programTemplate.findUnique({
      where: { id },
      include: {
        cpt: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        macrocycles: {
          include: {
            mesocycles: {
              include: {
                microcycles: true
              }
            }
          }
        }
      }
    });

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Check if user can access this template (owner or public)
    if (template.cptId !== cptId && !template.isPublic) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching program template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch program template' },
      { status: 500 }
    );
  }
}

// PUT /api/program-templates/[id] - Update a program template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cptId = getCptIdFromRequest(request);
    if (!cptId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
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
      isPublic
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

    // Check if template exists and user owns it
    const existingTemplate = await prisma.programTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (existingTemplate.cptId !== cptId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updatedTemplate = await prisma.programTemplate.update({
      where: { id },
      data: {
        name,
        description,
        goal,
        experienceLevel,
        duration,
        periodizationType,
        isPublic: isPublic ?? existingTemplate.isPublic,
        updatedAt: new Date()
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

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating program template:', error);
    return NextResponse.json(
      { error: 'Failed to update program template' },
      { status: 500 }
    );
  }
}

// DELETE /api/program-templates/[id] - Delete a program template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cptId = getCptIdFromRequest(request);
    if (!cptId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Check if template exists and user owns it
    const existingTemplate = await prisma.programTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    if (existingTemplate.cptId !== cptId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if template is being used by any programs
    const programsUsingTemplate = await prisma.program.findMany({
      where: {
        data: {
          path: ['templateId'],
          equals: id
        }
      }
    });

    if (programsUsingTemplate.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete template that is being used by programs',
          programsCount: programsUsingTemplate.length
        },
        { status: 409 }
      );
    }

    await prisma.programTemplate.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting program template:', error);
    return NextResponse.json(
      { error: 'Failed to delete program template' },
      { status: 500 }
    );
  }
} 