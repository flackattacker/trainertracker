export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Since middleware already verifies the token, we can get the user ID from headers
function getCptIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

export async function GET(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const clients = await prisma.client.findMany({
    where: { cptId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const {
    codeName,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    email,
    phone,
    notes,
    status
  } = body;
  if (!codeName || !firstName || !lastName || !dateOfBirth || !gender || !status) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }
  try {
    const client = await prisma.client.create({
      data: {
        cptId,
        codeName,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        email,
        phone,
        notes,
        status,
      },
    });
    return NextResponse.json(client);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Client id required.' }, { status: 400 });
  try {
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client || client.cptId !== cptId) {
      return NextResponse.json({ error: 'Not found or unauthorized.' }, { status: 404 });
    }
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Client deletion failed.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, codeName, status } = await req.json();
  if (!id) return NextResponse.json({ error: 'Client id required.' }, { status: 400 });
  try {
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client || client.cptId !== cptId) {
      return NextResponse.json({ error: 'Not found or unauthorized.' }, { status: 404 });
    }
    const updated = await prisma.client.update({
      where: { id },
      data: { codeName: codeName ?? client.codeName, status: status ?? client.status },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Client update failed.' }, { status: 500 });
  }
} 