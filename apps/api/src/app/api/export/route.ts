export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();

// Since middleware already verifies the token, we can get the user ID from headers
function getCptIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

async function fetchRecord(type: string, id: string, cptId: string) {
  if (type === 'assessment') {
    const assessment = await prisma.assessment.findUnique({ where: { id } });
    if (!assessment) return null;
    const client = await prisma.client.findUnique({ where: { id: assessment.clientId } });
    if (!client || client.cptId !== cptId) return null;
    return { ...assessment, client };
  } else if (type === 'program') {
    const program = await prisma.program.findUnique({ where: { id } });
    if (!program) return null;
    const client = await prisma.client.findUnique({ where: { id: program.clientId } });
    if (!client || client.cptId !== cptId) return null;
    return { ...program, client };
  } else if (type === 'progress') {
    const progress = await prisma.progress.findUnique({ where: { id } });
    if (!progress) return null;
    const client = await prisma.client.findUnique({ where: { id: progress.clientId } });
    if (!client || client.cptId !== cptId) return null;
    return { ...progress, client };
  }
  return null;
}

function generatePdf(type: string, record: any): Buffer {
  const doc = new PDFDocument({ 
    autoFirstPage: true,
    bufferPages: true,
    font: 'Helvetica'
  });
  const chunks: Buffer[] = [];
  doc.on('data', (chunk: Buffer) => chunks.push(chunk));
  doc.on('end', () => {});
  
  // Add title
  doc.fontSize(18).text(`${type.toUpperCase()} EXPORT`, { align: 'center' });
  doc.moveDown();
  
  // Add client info
  doc.fontSize(12).text(`Client: ${record.client.firstName} ${record.client.lastName}`);
  doc.text(`Code Name: ${record.client.codeName}`);
  doc.text(`ID: ${record.id}`);
  doc.text(`Created: ${new Date(record.createdAt).toLocaleDateString()}`);
  doc.moveDown();
  
  // Add type-specific data
  if (type === 'assessment') {
    doc.text(`Assessment Type: ${record.type}`);
    doc.moveDown();
    if (record.data && Object.keys(record.data).length > 0) {
      doc.text('Assessment Data:');
      doc.fontSize(10);
      Object.entries(record.data).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          doc.text(`${key}: ${JSON.stringify(value, null, 2)}`);
        } else {
          doc.text(`${key}: ${value}`);
        }
      });
    }
  } else if (type === 'program') {
    doc.text('Program Data:');
    doc.moveDown();
    if (record.data && Object.keys(record.data).length > 0) {
      doc.fontSize(10);
      Object.entries(record.data).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          doc.text(`${key}: ${JSON.stringify(value, null, 2)}`);
        } else {
          doc.text(`${key}: ${value}`);
        }
      });
    }
  } else if (type === 'progress') {
    doc.text('Progress Data:');
    doc.moveDown();
    if (record.data && Object.keys(record.data).length > 0) {
      doc.fontSize(10);
      Object.entries(record.data).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          doc.text(`${key}: ${JSON.stringify(value, null, 2)}`);
        } else {
          doc.text(`${key}: ${value}`);
        }
      });
    }
  }
  
  doc.end();
  return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { type, id } = await req.json();
  if (!type || !id) return NextResponse.json({ error: 'type and id are required.' }, { status: 400 });
  const record = await fetchRecord(type, id, cptId);
  if (!record) return NextResponse.json({ error: 'Not found or unauthorized.' }, { status: 404 });
  const pdfBuffer = generatePdf(type, record);
  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${type}-${id}.pdf"`,
    },
  });
} 