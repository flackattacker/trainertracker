export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Since middleware already verifies the token, we can get the user ID from headers
function getCptIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

export async function GET(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');
  
  const whereClause: any = { cptId };
  if (clientId) {
    whereClause.clientId = clientId;
  }
  
  const programs = await prisma.program.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });
  
  // Ensure all programs have a status (fallback for existing programs)
  const programsWithStatus = programs.map(program => ({
    ...program,
    status: (program as any).status || 'ACTIVE'
  }));
  
  return NextResponse.json(programsWithStatus);
}

export async function POST(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const requestBody = await req.json();
  console.log('Programs POST: cptId =', cptId);
  console.log('Programs POST: request body =', requestBody);
  
  // Handle both old format (for backward compatibility) and new format
  const { 
    clientId, 
    programName, 
    startDate, 
    endDate, 
    optPhase, 
    primaryGoal, 
    secondaryGoals, 
    notes, 
    data,
    // New format fields
    name,
    description,
    goal,
    experienceLevel,
    duration,
    workouts
  } = requestBody;

  // Check if this is the new format (ProgramBuilder)
  if (name && goal && experienceLevel && duration && workouts) {
    try {
      // Helper function to safely parse dates
      const parseDate = (dateString: string | null | undefined): Date => {
        if (!dateString) return new Date();
        try {
          // Handle different date formats
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            console.warn('Invalid date string:', dateString, 'using current date');
            return new Date();
          }
          return date;
        } catch (error) {
          console.warn('Error parsing date:', dateString, 'using current date');
          return new Date();
        }
      };

      // Check if client already has an active program
      if (clientId) {
        const existingActiveProgram = await prisma.program.findFirst({
          where: {
            clientId,
            status: 'ACTIVE'
          }
        });

        if (existingActiveProgram) {
          return NextResponse.json({ 
            error: 'Client already has an active program. Please mark the existing program as complete before creating a new one.',
            existingProgramId: existingActiveProgram.id,
            existingProgramName: existingActiveProgram.programName
          }, { status: 409 });
        }
      }

      const programData = {
        cptId,
        clientId: clientId || null, // Optional for templates
        programName: name,
        startDate: parseDate(startDate),
        endDate: endDate ? parseDate(endDate) : null,
        optPhase: 'STABILIZATION_ENDURANCE' as const, // Default for new format
        primaryGoal: goal,
        secondaryGoals: description,
        notes,
        status: 'ACTIVE' as const, // Explicitly set as active
        data: {
          experienceLevel,
          duration,
          workouts,
          ...data
        },
      };
      console.log('Programs POST: Creating new format program with data =', programData);
      
      const program = await prisma.program.create({
        data: programData,
      });
      console.log('Programs POST: Program created successfully =', program);
      return NextResponse.json(program);
    } catch (err) {
      console.error('Programs POST: Error creating new format program =', err);
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
    }
  }
  
  // Old format handling
  if (!clientId || !programName || !startDate || !optPhase || !primaryGoal) {
    console.log('Programs POST: Missing required fields', { clientId, programName, startDate, optPhase, primaryGoal });
    return NextResponse.json({ error: 'clientId, programName, startDate, optPhase, and primaryGoal are required.' }, { status: 400 });
  }
  
  try {
    // Check if client already has an active program
    const existingActiveProgram = await prisma.program.findFirst({
      where: {
        clientId,
        status: 'ACTIVE'
      }
    });

    if (existingActiveProgram) {
      return NextResponse.json({ 
        error: 'Client already has an active program. Please mark the existing program as complete before creating a new one.',
        existingProgramId: existingActiveProgram.id,
        existingProgramName: existingActiveProgram.programName
      }, { status: 409 });
    }

    const programData = {
      cptId,
      clientId,
      programName,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      optPhase,
      primaryGoal,
      secondaryGoals,
      notes,
      status: 'ACTIVE' as const, // Explicitly set as active
      data: data || {},
    };
    console.log('Programs POST: Creating old format program with data =', programData);
    
    const program = await prisma.program.create({
      data: programData,
    });
    console.log('Programs POST: Program created successfully =', program);
    return NextResponse.json(program);
  } catch (err) {
    console.error('Programs POST: Error creating old format program =', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  console.log('Programs PATCH: Request received');
  console.log('Programs PATCH: Headers:', Object.fromEntries(req.headers.entries()));
  
  const cptId = getCptIdFromRequest(req);
  console.log('Programs PATCH: cptId =', cptId);
  
  if (!cptId) {
    console.log('Programs PATCH: No cptId found, returning 401');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { id, data, status } = await req.json();
  console.log('Programs PATCH: Request body =', { id, data, status });
  
  if (!id) {
    console.log('Programs PATCH: No id provided, returning 400');
    return NextResponse.json({ error: 'id required.' }, { status: 400 });
  }
  
  const program = await prisma.program.findUnique({ where: { id } });
  console.log('Programs PATCH: Found program =', program ? 'yes' : 'no');
  
  if (!program) {
    console.log('Programs PATCH: Program not found, returning 404');
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }
  
  // Ensure the program belongs to a client of this CPT
  const client = await prisma.client.findUnique({ where: { id: program.clientId } });
  console.log('Programs PATCH: Found client =', client ? 'yes' : 'no');
  console.log('Programs PATCH: Client cptId =', client?.cptId);
  console.log('Programs PATCH: Request cptId =', cptId);
  
  if (!client || client.cptId !== cptId) {
    console.log('Programs PATCH: Client not found or unauthorized, returning 404');
    return NextResponse.json({ error: 'Not found or unauthorized.' }, { status: 404 });
  }
  
  try {
    const updateData: any = {};
    if (data) updateData.data = data;
    if (status) updateData.status = status;
    
    console.log('Programs PATCH: Update data =', updateData);
    
    const updated = await prisma.program.update({ where: { id }, data: updateData });
    console.log('Programs PATCH: Program updated successfully =', updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Programs PATCH: Error updating program =', error);
    return NextResponse.json({ error: 'Program update failed.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Program id required.' }, { status: 400 });
  const program = await prisma.program.findUnique({ where: { id } });
  if (!program) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  // Ensure the program belongs to a client of this CPT
  const client = await prisma.client.findUnique({ where: { id: program.clientId } });
  if (!client || client.cptId !== cptId) {
    return NextResponse.json({ error: 'Not found or unauthorized.' }, { status: 404 });
  }
  try {
    await prisma.program.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Program deletion failed.' }, { status: 500 });
  }
} 