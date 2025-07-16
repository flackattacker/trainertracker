import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const token = auth.replace('Bearer ', '');
    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    const clientId = payload.clientId;
    if (!clientId) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        programs: true,
        progresses: true,
      },
    });
    if (!client) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }
    return NextResponse.json({
      profile: {
        id: client.id,
        email: client.email,
        firstName: client.firstName,
        lastName: client.lastName,
        codeName: client.codeName,
        status: client.status,
        phone: client.phone,
        notes: client.notes,
      },
      programs: client.programs,
      progress: client.progresses,
    });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch client data' }, { status: 500 });
  }
} 