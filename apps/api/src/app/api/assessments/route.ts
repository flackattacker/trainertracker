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
  const assessments = await prisma.assessment.findMany({
    where: { cptId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(assessments);
}

export async function POST(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  console.log('Assessments POST: cptId =', cptId);
  console.log('Assessments POST: headers =', Object.fromEntries(req.headers.entries()));
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { clientId, type, assessmentDate, assessor, notes, data } = await req.json();
  console.log('Assessments POST: request body =', { clientId, type, assessmentDate, assessor, notes, data });
  if (!clientId || !type || !assessmentDate || !assessor) {
    return NextResponse.json({ error: 'clientId, type, assessmentDate, and assessor are required.' }, { status: 400 });
  }
  try {
    const assessment = await prisma.assessment.create({
      data: {
        cptId,
        clientId,
        type,
        assessmentDate: new Date(assessmentDate),
        assessor,
        notes,
        data: data || {},
      },
    });
    return NextResponse.json(assessment);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Assessment id required.' }, { status: 400 });
  // Ensure the assessment belongs to a client of this CPT
  const assessment = await prisma.assessment.findUnique({ where: { id } });
  if (!assessment) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  const client = await prisma.client.findUnique({ where: { id: assessment.clientId } });
  if (!client || client.cptId !== cptId) {
    return NextResponse.json({ error: 'Not found or unauthorized.' }, { status: 404 });
  }
  try {
    await prisma.assessment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Assessment deletion failed.' }, { status: 500 });
  }
} 