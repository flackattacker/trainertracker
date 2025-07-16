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
  const progresses = await prisma.progress.findMany({
    where: { cptId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(progresses);
}

export async function POST(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { clientId, programId, date, weight, bodyFat, notes, data } = await req.json();
  if (!clientId || !date) {
    return NextResponse.json({ error: 'clientId and date are required.' }, { status: 400 });
  }
  try {
    const progress = await prisma.progress.create({
      data: {
        cptId,
        clientId,
        programId,
        date: new Date(date),
        weight,
        bodyFat,
        notes,
        data: data || {},
      },
    });
    return NextResponse.json(progress);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, data } = await req.json();
  if (!id || !data) return NextResponse.json({ error: 'id and data required.' }, { status: 400 });
  const progress = await prisma.progress.findUnique({ where: { id } });
  if (!progress) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  // Ensure the progress record belongs to a client of this CPT
  const client = await prisma.client.findUnique({ where: { id: progress.clientId } });
  if (!client || client.cptId !== cptId) {
    return NextResponse.json({ error: 'Not found or unauthorized.' }, { status: 404 });
  }
  try {
    const updated = await prisma.progress.update({ where: { id }, data: { data } });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Progress update failed.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Progress id required.' }, { status: 400 });
  const progress = await prisma.progress.findUnique({ where: { id } });
  if (!progress) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  // Ensure the progress record belongs to a client of this CPT
  const client = await prisma.client.findUnique({ where: { id: progress.clientId } });
  if (!client || client.cptId !== cptId) {
    return NextResponse.json({ error: 'Not found or unauthorized.' }, { status: 404 });
  }
  try {
    await prisma.progress.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Progress deletion failed.' }, { status: 500 });
  }
} 