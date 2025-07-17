export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Since middleware already verifies the token, we can get the user ID from headers
function getCptIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

// Extract standardized fields from assessment data
function extractStandardizedFields(data: any, type: string) {
  const standardized: any = {};
  
  // Extract common measurements based on assessment type
  if (type === 'FITNESS_ASSESSMENT' || type === 'BODY_COMPOSITION') {
    if (data.fitness?.height) standardized.height = data.fitness.height;
    if (data.fitness?.weight) standardized.weight = data.fitness.weight;
    if (data.fitness?.bmi) standardized.bmi = data.fitness.bmi;
    if (data.fitness?.bodyFatPercentage) standardized.bodyFatPercentage = data.fitness.bodyFatPercentage;
    if (data.fitness?.restingHeartRate) standardized.restingHeartRate = data.fitness.restingHeartRate;
    if (data.fitness?.bloodPressure?.systolic) standardized.bloodPressureSystolic = data.fitness.bloodPressure.systolic;
    if (data.fitness?.bloodPressure?.diastolic) standardized.bloodPressureDiastolic = data.fitness.bloodPressure.diastolic;
  }
  
  if (type === 'BODY_COMPOSITION') {
    if (data.bodyComposition?.weight) standardized.weight = data.bodyComposition.weight;
    if (data.bodyComposition?.height) standardized.height = data.bodyComposition.height;
    if (data.bodyComposition?.bodyFatPercentage) standardized.bodyFatPercentage = data.bodyComposition.bodyFatPercentage;
  }
  
  // Calculate BMI if we have height and weight
  if (standardized.height && standardized.weight && !standardized.bmi) {
    standardized.bmi = standardized.weight / Math.pow(standardized.height / 100, 2);
  }
  
  return standardized;
}

// Validate assessment data
function validateAssessmentData(type: string, data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Basic validation for required fields
  if (!data) {
    errors.push('Assessment data is required');
    return { isValid: false, errors };
  }
  
  // Type-specific validation
  switch (type) {
    case 'PARQ':
      if (!data.questions) {
        errors.push('PARQ questions are required');
      } else {
        const requiredQuestions = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'];
        requiredQuestions.forEach(q => {
          if (data.questions[q] === undefined) {
            errors.push(`PARQ question ${q} is required`);
          }
        });
      }
      if (!data.riskLevel) {
        errors.push('Risk level must be determined');
      }
      break;
      
    case 'FITNESS_ASSESSMENT':
      if (!data.fitness?.height || data.fitness.height <= 0) {
        errors.push('Valid height is required');
      }
      if (!data.fitness?.weight || data.fitness.weight <= 0) {
        errors.push('Valid weight is required');
      }
      if (!data.fitness?.restingHeartRate || data.fitness.restingHeartRate <= 0) {
        errors.push('Valid resting heart rate is required');
      }
      break;
      
    case 'FMS':
      const fmsTests = ['deepSquat', 'hurdleStep', 'inlineLunge', 'shoulderMobility', 'activeStraightLegRaise', 'trunkStabilityPushup', 'rotaryStability'];
      fmsTests.forEach(test => {
        if (data.fms?.[test] === undefined) {
          errors.push(`FMS ${test} score is required`);
        } else if (data.fms[test] < 0 || data.fms[test] > 3) {
          errors.push(`FMS ${test} score must be 0-3`);
        }
      });
      break;
  }
  
  return { isValid: errors.length === 0, errors };
}

export async function GET(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId');
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  
  const where: any = { cptId };
  if (clientId) where.clientId = clientId;
  if (type) where.type = type;
  if (status) where.status = status;
  
  const assessments = await prisma.assessment.findMany({
    where,
    orderBy: { createdAt: 'desc' },
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
  
  return NextResponse.json(assessments);
}

export async function POST(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  console.log('Assessments POST: cptId =', cptId);
  console.log('Assessments POST: headers =', Object.fromEntries(req.headers.entries()));
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { clientId, type, assessmentDate, assessor, notes, data, isBaseline, nextAssessmentDate } = await req.json();
  console.log('Assessments POST: request body =', { clientId, type, assessmentDate, assessor, notes, data, isBaseline, nextAssessmentDate });
  
  if (!clientId || !type || !assessmentDate || !assessor) {
    return NextResponse.json({ error: 'clientId, type, assessmentDate, and assessor are required.' }, { status: 400 });
  }
  
  // Validate assessment data
  const validation = validateAssessmentData(type, data);
  if (!validation.isValid) {
    return NextResponse.json({ 
      error: 'Assessment data validation failed', 
      details: validation.errors 
    }, { status: 400 });
  }
  
  try {
    // Extract standardized fields
    const standardizedFields = extractStandardizedFields(data, type);
    
    // Check for duplicate assessments (same client, same type, same date)
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        clientId,
        type,
        assessmentDate: new Date(assessmentDate),
        status: { not: 'CANCELLED' }
      }
    });
    
    if (existingAssessment) {
      return NextResponse.json({ 
        error: 'An assessment of this type already exists for this client on this date',
        existingAssessmentId: existingAssessment.id
      }, { status: 409 });
    }
    
    const assessment = await prisma.assessment.create({
      data: {
        cptId,
        clientId,
        type,
        assessmentDate: new Date(assessmentDate),
        assessor,
        notes,
        data: data || {},
        isBaseline: isBaseline || false,
        nextAssessmentDate: nextAssessmentDate ? new Date(nextAssessmentDate) : null,
        version: '1.0', // Current version
        template: type, // Use type as template identifier
        ...standardizedFields
      },
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
    
    return NextResponse.json(assessment);
  } catch (err) {
    console.error('Assessment creation error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { id, clientId, type, assessmentDate, assessor, notes, data, status, isBaseline, nextAssessmentDate } = await req.json();
  
  if (!id) return NextResponse.json({ error: 'Assessment id is required.' }, { status: 400 });
  
  // Ensure the assessment belongs to a client of this CPT
  const existingAssessment = await prisma.assessment.findUnique({ 
    where: { id },
    include: { client: true }
  });
  
  if (!existingAssessment) {
    return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 });
  }
  
  if (existingAssessment.client.cptId !== cptId) {
    return NextResponse.json({ error: 'Not authorized to modify this assessment.' }, { status: 403 });
  }
  
  // Validate assessment data if provided
  if (data) {
    const validation = validateAssessmentData(type || existingAssessment.type, data);
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Assessment data validation failed', 
        details: validation.errors 
      }, { status: 400 });
    }
  }
  
  try {
    // Extract standardized fields if data is being updated
    const standardizedFields = data ? extractStandardizedFields(data, type || existingAssessment.type) : {};
    
    const updatedAssessment = await prisma.assessment.update({
      where: { id },
      data: {
        ...(clientId && { clientId }),
        ...(type && { type }),
        ...(assessmentDate && { assessmentDate: new Date(assessmentDate) }),
        ...(assessor && { assessor }),
        ...(notes !== undefined && { notes }),
        ...(data && { data }),
        ...(status && { status }),
        ...(isBaseline !== undefined && { isBaseline }),
        ...(nextAssessmentDate && { nextAssessmentDate: new Date(nextAssessmentDate) }),
        ...standardizedFields
      },
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
    
    return NextResponse.json(updatedAssessment);
  } catch (error) {
    console.error('Assessment update error:', error);
    return NextResponse.json({ error: 'Assessment update failed.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const cptId = getCptIdFromRequest(req);
  if (!cptId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Assessment id required.' }, { status: 400 });
  
  // Ensure the assessment belongs to a client of this CPT
  const assessment = await prisma.assessment.findUnique({ 
    where: { id },
    include: { client: true }
  });
  
  if (!assessment) {
    return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 });
  }
  
  if (assessment.client.cptId !== cptId) {
    return NextResponse.json({ error: 'Not authorized to delete this assessment.' }, { status: 403 });
  }
  
  try {
    await prisma.assessment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Assessment deletion error:', error);
    return NextResponse.json({ error: 'Assessment deletion failed.' }, { status: 500 });
  }
} 