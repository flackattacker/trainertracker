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
  const programs = await prisma.program.findMany({
    where: { cptId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(programs);
}

export async function POST(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const requestBody = await req.json();
  console.log('Programs POST: cptId =', cptId);
  console.log('Programs POST: request body =', requestBody);
  
  const { clientId, programName, startDate, endDate, optPhase, primaryGoal, secondaryGoals, notes, data } = requestBody;
  if (!clientId || !programName || !startDate || !optPhase || !primaryGoal) {
    console.log('Programs POST: Missing required fields', { clientId, programName, startDate, optPhase, primaryGoal });
    return NextResponse.json({ error: 'clientId, programName, startDate, optPhase, and primaryGoal are required.' }, { status: 400 });
  }
  
  try {
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
      data: data || {},
    };
    console.log('Programs POST: Creating program with data =', programData);
    
    const program = await prisma.program.create({
      data: programData,
    });
    console.log('Programs POST: Program created successfully =', program);
    return NextResponse.json(program);
  } catch (err) {
    console.error('Programs POST: Error creating program =', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, data } = await req.json();
  if (!id || !data) return NextResponse.json({ error: 'id and data required.' }, { status: 400 });
  const program = await prisma.program.findUnique({ where: { id } });
  if (!program) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  // Ensure the program belongs to a client of this CPT
  const client = await prisma.client.findUnique({ where: { id: program.clientId } });
  if (!client || client.cptId !== cptId) {
    return NextResponse.json({ error: 'Not found or unauthorized.' }, { status: 404 });
  }
  try {
    const updated = await prisma.program.update({ where: { id }, data: { data } });
    return NextResponse.json(updated);
  } catch (error) {
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