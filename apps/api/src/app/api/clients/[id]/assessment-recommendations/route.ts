import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Since middleware already verifies the token, we can get the user ID from headers
function getCptIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

interface AssessmentData {
  id: string;
  type: string;
  assessmentDate: string;
  data: any;
  weight?: number;
  height?: number;
  bmi?: number;
  bodyFatPercentage?: number;
  restingHeartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
}

interface TemplateRecommendation {
  templateId: string;
  templateName: string;
  score: number;
  reasoning: string[];
  assessmentFactors: string[];
  suitability: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
}

interface ClientProfile {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  experienceLevel?: string;
  assessments: AssessmentData[];
  recommendations: TemplateRecommendation[];
}

// Template database with assessment-based matching criteria
const TEMPLATE_DATABASE = [
  {
    id: 'stabilization-beginner',
    name: 'Beginner Stability Foundation',
    goal: 'General Fitness',
    experienceLevel: 'BEGINNER',
    optPhase: 'STABILIZATION_ENDURANCE',
    assessmentCriteria: {
      parq: { riskLevel: 'LOW' },
      fitness: { bmi: { min: 18.5, max: 30 }, restingHeartRate: { max: 100 } },
      strength: { pushUps: { max: 10 }, plankTime: { max: 60 } }
    },
    contraindications: ['HIGH_PARQ_RISK', 'HIGH_BMI', 'HIGH_BLOOD_PRESSURE']
  },
  {
    id: 'strength-endurance-intermediate',
    name: 'Intermediate Strength Endurance',
    goal: 'Strength',
    experienceLevel: 'INTERMEDIATE',
    optPhase: 'STRENGTH_ENDURANCE',
    assessmentCriteria: {
      parq: { riskLevel: ['LOW', 'MODERATE'] },
      fitness: { bmi: { min: 18.5, max: 35 }, restingHeartRate: { max: 90 } },
      strength: { pushUps: { min: 5, max: 25 }, plankTime: { min: 30, max: 120 } }
    },
    contraindications: ['HIGH_PARQ_RISK', 'VERY_HIGH_BMI']
  },
  {
    id: 'hypertrophy-advanced',
    name: 'Advanced Hypertrophy Program',
    goal: 'Muscle Mass',
    experienceLevel: 'ADVANCED',
    optPhase: 'MUSCULAR_DEVELOPMENT',
    assessmentCriteria: {
      parq: { riskLevel: 'LOW' },
      fitness: { bmi: { min: 18.5, max: 40 }, restingHeartRate: { max: 85 } },
      strength: { pushUps: { min: 15 }, plankTime: { min: 60 } }
    },
    contraindications: ['HIGH_PARQ_RISK', 'CARDIOVASCULAR_ISSUES']
  },
  {
    id: 'cardio-fitness-beginner',
    name: 'Beginner Cardiovascular Fitness',
    goal: 'Endurance',
    experienceLevel: 'BEGINNER',
    optPhase: 'STABILIZATION_ENDURANCE',
    assessmentCriteria: {
      parq: { riskLevel: 'LOW' },
      fitness: { bmi: { min: 18.5, max: 35 }, restingHeartRate: { max: 100 } },
      cardiovascular: { mileRun: { max: 12 } }
    },
    contraindications: ['HIGH_PARQ_RISK', 'CARDIOVASCULAR_ISSUES']
  },
  {
    id: 'weight-loss-intermediate',
    name: 'Intermediate Weight Loss Program',
    goal: 'Weight Loss',
    experienceLevel: 'INTERMEDIATE',
    optPhase: 'STRENGTH_ENDURANCE',
    assessmentCriteria: {
      parq: { riskLevel: ['LOW', 'MODERATE'] },
      fitness: { bmi: { min: 25, max: 40 }, bodyFatPercentage: { min: 20 } },
      strength: { pushUps: { min: 3, max: 20 } }
    },
    contraindications: ['HIGH_PARQ_RISK']
  },
  {
    id: 'senior-fitness',
    name: 'Senior Fitness & Mobility',
    goal: 'General Fitness',
    experienceLevel: 'BEGINNER',
    optPhase: 'STABILIZATION_ENDURANCE',
    assessmentCriteria: {
      parq: { riskLevel: ['LOW', 'MODERATE'] },
      fitness: { bmi: { min: 18.5, max: 35 }, restingHeartRate: { max: 100 } },
      age: { min: 65 }
    },
    contraindications: ['HIGH_PARQ_RISK', 'SEVERE_MOBILITY_ISSUES']
  }
];

function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

function evaluateAssessmentCriteria(template: any, assessments: AssessmentData[], clientAge: number): {
  score: number;
  reasoning: string[];
  factors: string[];
  suitability: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
} {
  let score = 0;
  let totalCriteria = 0;
  const reasoning: string[] = [];
  const factors: string[] = [];
  
  // Check PARQ assessment
  const parqAssessment = assessments.find(a => a.type === 'PARQ');
  if (parqAssessment && template.assessmentCriteria.parq) {
    totalCriteria++;
    const parqData = parqAssessment.data?.parq || parqAssessment.data;
    const riskLevel = parqData?.riskLevel;
    
    if (riskLevel) {
      if (template.assessmentCriteria.parq.riskLevel === riskLevel || 
          (Array.isArray(template.assessmentCriteria.parq.riskLevel) && 
           template.assessmentCriteria.parq.riskLevel.includes(riskLevel))) {
        score++;
        reasoning.push(`Health screening (PARQ) risk level (${riskLevel}) is appropriate for this program`);
        factors.push('Health Screening');
      } else {
        reasoning.push(`Health screening risk level (${riskLevel}) may not be ideal for this program`);
        factors.push('Health Screening');
      }
    }
  }
  
  // Check fitness assessment
  const fitnessAssessment = assessments.find(a => a.type === 'FITNESS_ASSESSMENT');
  if (fitnessAssessment && template.assessmentCriteria.fitness) {
    totalCriteria++;
    const fitnessData = fitnessAssessment.data?.fitness || fitnessAssessment.data;
    
    // Check BMI
    if (fitnessAssessment.bmi && template.assessmentCriteria.fitness.bmi) {
      const bmi = fitnessAssessment.bmi;
      const bmiCriteria = template.assessmentCriteria.fitness.bmi;
      
      if ((!bmiCriteria.min || bmi >= bmiCriteria.min) && 
          (!bmiCriteria.max || bmi <= bmiCriteria.max)) {
        score += 0.5;
        reasoning.push(`BMI (${bmi.toFixed(1)}) is within appropriate range for this program`);
        factors.push('Body Composition');
      } else {
        reasoning.push(`BMI (${bmi.toFixed(1)}) may need consideration for this program`);
        factors.push('Body Composition');
      }
    }
    
    // Check resting heart rate
    if (fitnessAssessment.restingHeartRate && template.assessmentCriteria.fitness.restingHeartRate) {
      const hr = fitnessAssessment.restingHeartRate;
      const hrCriteria = template.assessmentCriteria.fitness.restingHeartRate;
      
      if ((!hrCriteria.min || hr >= hrCriteria.min) && 
          (!hrCriteria.max || hr <= hrCriteria.max)) {
        score += 0.5;
        reasoning.push(`Resting heart rate (${hr} bpm) indicates good cardiovascular health`);
        factors.push('Cardiovascular Health');
      } else {
        reasoning.push(`Resting heart rate (${hr} bpm) may need monitoring during this program`);
        factors.push('Cardiovascular Health');
      }
    }
  }
  
  // Check strength assessment
  const strengthAssessment = assessments.find(a => a.type === 'STRENGTH');
  if (strengthAssessment && template.assessmentCriteria.strength) {
    totalCriteria++;
    const strengthData = strengthAssessment.data?.strength || strengthAssessment.data;
    
    // Check push-ups
    if (strengthData?.pushUps && template.assessmentCriteria.strength.pushUps) {
      const pushUps = strengthData.pushUps;
      const pushUpCriteria = template.assessmentCriteria.strength.pushUps;
      
      if ((!pushUpCriteria.min || pushUps >= pushUpCriteria.min) && 
          (!pushUpCriteria.max || pushUps <= pushUpCriteria.max)) {
        score += 0.5;
        reasoning.push(`Push-up performance (${pushUps} reps) matches program requirements`);
        factors.push('Upper Body Strength');
      } else {
        reasoning.push(`Push-up performance (${pushUps} reps) may need progression planning`);
        factors.push('Upper Body Strength');
      }
    }
    
    // Check plank time
    if (strengthData?.plankTime && template.assessmentCriteria.strength.plankTime) {
      const plankTime = strengthData.plankTime;
      const plankCriteria = template.assessmentCriteria.strength.plankTime;
      
      if ((!plankCriteria.min || plankTime >= plankCriteria.min) && 
          (!plankCriteria.max || plankTime <= plankCriteria.max)) {
        score += 0.5;
        reasoning.push(`Core endurance (${plankTime}s plank) is suitable for this program`);
        factors.push('Core Strength');
      } else {
        reasoning.push(`Core endurance (${plankTime}s plank) may need development`);
        factors.push('Core Strength');
      }
    }
  }
  
  // Check age criteria
  if (template.assessmentCriteria.age && clientAge >= template.assessmentCriteria.age.min) {
    score++;
    reasoning.push(`Age (${clientAge}) meets program requirements`);
    factors.push('Age Appropriateness');
  }
  
  // Check contraindications
  const contraindications: string[] = [];
  if (parqAssessment) {
    const parqData = parqAssessment.data?.parq || parqAssessment.data;
    if (parqData?.riskLevel === 'HIGH') {
      contraindications.push('HIGH_PARQ_RISK');
    }
  }
  
  if (fitnessAssessment?.bmi && fitnessAssessment.bmi > 40) {
    contraindications.push('VERY_HIGH_BMI');
  }
  
  if (fitnessAssessment?.bloodPressureSystolic && fitnessAssessment.bloodPressureSystolic > 140) {
    contraindications.push('HIGH_BLOOD_PRESSURE');
  }
  
  // Check for contraindications
  const hasContraindication = contraindications.some(contra => 
    template.contraindications.includes(contra)
  );
  
  if (hasContraindication) {
    score = Math.max(0, score - 2); // Penalize for contraindications
    reasoning.push('Some contraindications identified - consult with healthcare provider');
  }
  
  // Calculate final score and suitability
  const finalScore = totalCriteria > 0 ? score / totalCriteria : 0;
  
  let suitability: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR';
  if (finalScore >= 0.8 && !hasContraindication) {
    suitability = 'EXCELLENT';
  } else if (finalScore >= 0.6) {
    suitability = 'GOOD';
  } else if (finalScore >= 0.4) {
    suitability = 'MODERATE';
  } else {
    suitability = 'POOR';
  }
  
  return { score: finalScore, reasoning, factors: Array.from(new Set(factors)), suitability };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cptId = getCptIdFromRequest(request);
    if (!cptId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clientId = params.id;

    // Get client data
    const client = await prisma.client.findUnique({
      where: { id: clientId, cptId },
    });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Get client assessments
    const assessments = await prisma.assessment.findMany({
      where: { clientId, cptId },
      orderBy: { assessmentDate: 'desc' },
    });

    // Transform assessments to match interface
    const transformedAssessments: AssessmentData[] = assessments.map(assessment => ({
      id: assessment.id,
      type: assessment.type,
      assessmentDate: assessment.assessmentDate.toISOString(),
      data: assessment.data,
      weight: assessment.weight || undefined,
      height: assessment.height || undefined,
      bmi: assessment.bmi || undefined,
      bodyFatPercentage: assessment.bodyFatPercentage || undefined,
      restingHeartRate: assessment.restingHeartRate || undefined,
      bloodPressureSystolic: assessment.bloodPressureSystolic || undefined,
      bloodPressureDiastolic: assessment.bloodPressureDiastolic || undefined,
    }));

    // Calculate client age
    const clientAge = calculateAge(client.dateOfBirth.toISOString());

    // Generate template recommendations
    const recommendations: TemplateRecommendation[] = TEMPLATE_DATABASE.map(template => {
      const evaluation = evaluateAssessmentCriteria(template, transformedAssessments, clientAge);
      
      return {
        templateId: template.id,
        templateName: template.name,
        score: evaluation.score,
        reasoning: evaluation.reasoning,
        assessmentFactors: evaluation.factors,
        suitability: evaluation.suitability,
      };
    });

    // Sort recommendations by score (highest first)
    recommendations.sort((a, b) => b.score - a.score);

    // Create client profile
    const clientProfile: ClientProfile = {
      id: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      dateOfBirth: client.dateOfBirth.toISOString(),
      gender: client.gender,
      experienceLevel: client.experienceLevel || undefined,
      assessments: transformedAssessments,
      recommendations,
    };

    return NextResponse.json(clientProfile);

  } catch (error) {
    console.error('Error generating assessment recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
} 