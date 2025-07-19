// Industry-standard assessment data structures

// Assessment Standards and Templates
export interface AssessmentTemplate {
  id: string;
  name: string;
  type: AssessmentType;
  version: string;
  description: string;
  requiredFields: string[];
  optionalFields: string[];
  validationRules: ValidationRule[];
  scoringMethod?: ScoringMethod;
}

export interface ValidationRule {
  field: string;
  type: 'range' | 'required' | 'format' | 'custom';
  min?: number;
  max?: number;
  required?: boolean;
  format?: string;
  customValidator?: (value: any) => boolean;
  errorMessage: string;
}

export interface ScoringMethod {
  type: 'numeric' | 'categorical' | 'composite';
  ranges?: Array<{
    min: number;
    max: number;
    score: string;
    description: string;
  }>;
  categories?: Array<{
    value: string;
    score: string;
    description: string;
  }>;
  formula?: string;
}

export type AssessmentType = 
  | 'PARQ' 
  | 'FITNESS_ASSESSMENT' 
  | 'BODY_COMPOSITION' 
  | 'FLEXIBILITY' 
  | 'STRENGTH' 
  | 'CARDIOVASCULAR'
  | 'FMS'
  | 'POSTURAL'
  | 'BALANCE'
  | 'MOBILITY'
  | 'OTHER';

// Standard measurement ranges for validation
export const MEASUREMENT_STANDARDS = {
  weight: { min: 20, max: 300, unit: 'kg' },
  height: { min: 100, max: 250, unit: 'cm' },
  bmi: { min: 10, max: 60, unit: 'kg/m²' },
  bodyFatPercentage: { min: 2, max: 50, unit: '%' },
  restingHeartRate: { min: 40, max: 120, unit: 'bpm' },
  bloodPressureSystolic: { min: 70, max: 200, unit: 'mmHg' },
  bloodPressureDiastolic: { min: 40, max: 130, unit: 'mmHg' },
  pushUps: { min: 0, max: 100, unit: 'reps' },
  sitUps: { min: 0, max: 100, unit: 'reps' },
  plankTime: { min: 0, max: 600, unit: 'seconds' },
  sitAndReach: { min: -20, max: 50, unit: 'cm' },
  mileRun: { min: 3, max: 30, unit: 'minutes' },
  vo2Max: { min: 20, max: 80, unit: 'ml/kg/min' }
};

export interface PARQData {
  // Physical Activity Readiness Questionnaire (PAR-Q+)
  questions?: {
    q1?: boolean; // Heart condition
    q2?: boolean; // Chest pain during physical activity
    q3?: boolean; // Chest pain when not doing physical activity
    q4?: boolean; // Loss of balance due to dizziness
    q5?: boolean; // Bone or joint problem
    q6?: boolean; // Blood pressure medication
    q7?: boolean; // Other reason not to do physical activity
  };
  followUpQuestions?: {
    q1a?: string; // Heart condition details
    q2a?: string; // Chest pain details
    q3a?: string; // Rest pain details
    q4a?: string; // Balance issues details
    q5a?: string; // Joint problem details
    q6a?: string; // Medication details
    q7a?: string; // Other reasons details
  };
  riskLevel?: 'LOW' | 'MODERATE' | 'HIGH';
  clearedForExercise?: boolean;
  requiresMedicalClearance?: boolean;
  notes?: string;
}

export interface FitnessAssessmentData {
  // Basic measurements
  height?: number; // cm
  weight?: number; // kg
  bodyFatPercentage?: number;
  bmi?: number;
  
  // Cardiovascular fitness
  restingHeartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  
  // Strength assessments
  pushUps?: number; // max reps
  sitUps?: number; // max reps in 1 minute
  plankTime?: number; // seconds
  squatTest?: number; // max reps
  
  // Flexibility
  sitAndReach?: number; // cm
  shoulderFlexibility?: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  
  // Balance and coordination
  singleLegStand?: number; // seconds each leg
  balanceTest?: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  
  // Functional movement
  overheadSquat?: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  singleLegSquat?: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  
  notes?: string;
}

export interface BodyCompositionData {
  // Skinfold measurements (mm)
  tricepsSkinfold?: number;
  bicepsSkinfold?: number;
  subscapular?: number;
  iliacCrest?: number;
  supraspinale?: number;
  abdominal?: number;
  thighSkinfold?: number;
  chestSkinfold?: number;
  axilla?: number;
  
  // Circumference measurements (cm)
  neck?: number;
  chestCircumference?: number;
  waist?: number;
  hips?: number;
  bicepsCircumference?: number;
  forearms?: number;
  thighsCircumference?: number;
  calves?: number;
  
  // Body composition analysis
  bodyFatPercentage?: number;
  leanBodyMass?: number;
  fatMass?: number;
  
  // Additional measurements
  bodyWaterPercentage?: number;
  muscleMass?: number;
  boneMass?: number;
  
  notes?: string;
}

export interface FlexibilityAssessmentData {
  // Upper body flexibility
  shoulderFlexion?: number; // degrees
  shoulderExtension?: number; // degrees
  shoulderAbduction?: number; // degrees
  shoulderInternalRotation?: number; // degrees
  shoulderExternalRotation?: number; // degrees
  
  // Lower body flexibility
  hipFlexion?: number; // degrees
  hipExtension?: number; // degrees
  hipAbduction?: number; // degrees
  hipInternalRotation?: number; // degrees
  hipExternalRotation?: number; // degrees
  
  // Spine flexibility
  trunkFlexion?: number; // cm (sit and reach)
  trunkExtension?: number; // degrees
  trunkRotation?: number; // degrees
  
  // Functional flexibility tests
  toeTouch?: 'CAN_TOUCH' | 'CANNOT_TOUCH' | 'PAST_TOES';
  shoulderReach?: 'CAN_REACH' | 'CANNOT_REACH';
  
  notes?: string;
}

export interface StrengthAssessmentData {
  // Upper body strength
  benchPress?: number; // kg 1RM
  overheadPress?: number; // kg 1RM
  pullUps?: number; // max reps
  pushUps?: number; // max reps
  dips?: number; // max reps
  
  // Lower body strength
  squat?: number; // kg 1RM
  deadlift?: number; // kg 1RM
  legPress?: number; // kg 1RM
  lunges?: number; // max reps each leg
  
  // Core strength
  plankTime?: number; // seconds
  sidePlankTime?: number; // seconds each side
  crunches?: number; // max reps in 1 minute
  legRaises?: number; // max reps
  
  // Grip strength
  leftGrip?: number; // kg
  rightGrip?: number; // kg
  
  notes?: string;
}

export interface CardiovascularAssessmentData {
  // Resting measurements
  restingHeartRate?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  
  // Submaximal tests
  stepTest?: {
    heartRateAfter: number;
    recoveryHeartRate: number; // after 1 minute
    vo2Max?: number; // estimated
  };
  
  // Field tests
  mileRun?: number; // minutes
  beepTest?: number; // level reached
  cooperTest?: number; // distance in 12 minutes (m)
  
  // Heart rate zones
  maxHeartRate?: number;
  targetHeartRateZones?: {
    zone1: { min: number; max: number }; // 50-60% HRR
    zone2: { min: number; max: number }; // 60-70% HRR
    zone3: { min: number; max: number }; // 70-80% HRR
    zone4: { min: number; max: number }; // 80-90% HRR
    zone5: { min: number; max: number }; // 90-100% HRR
  };
  
  notes?: string;
}

export interface FMSData {
  // Functional Movement Screen (7 tests)
  deepSquat?: 0 | 1 | 2 | 3;
  hurdleStep?: 0 | 1 | 2 | 3;
  inlineLunge?: 0 | 1 | 2 | 3;
  shoulderMobility?: 0 | 1 | 2 | 3;
  activeStraightLegRaise?: 0 | 1 | 2 | 3;
  trunkStabilityPushup?: 0 | 1 | 2 | 3;
  rotaryStability?: 0 | 1 | 2 | 3;
  
  // FMS scoring
  totalScore?: number; // 0-21
  asymmetry?: string[]; // Tests with left/right asymmetry
  clearingTests?: {
    shoulderClearing?: boolean;
    spineClearing?: boolean;
  };
  
  notes?: string;
}

export interface AssessmentData {
  PARQ?: PARQData;
  fitness?: FitnessAssessmentData;
  bodyComposition?: BodyCompositionData;
  flexibility?: FlexibilityAssessmentData;
  strength?: StrengthAssessmentData;
  cardiovascular?: CardiovascularAssessmentData;
  fms?: FMSData;
  [key: string]: any; // Allow for custom assessment types
}

// Assessment Templates
export const ASSESSMENT_TEMPLATES: Record<string, AssessmentTemplate> = {
  PARQ: {
    id: 'parq-v1',
    name: 'Physical Activity Readiness Questionnaire (PAR-Q+)',
    type: 'PARQ',
    version: '1.0',
    description: 'Standard health screening questionnaire for exercise readiness',
    requiredFields: ['questions.q1', 'questions.q2', 'questions.q3', 'questions.q4', 'questions.q5', 'questions.q6', 'questions.q7'],
    optionalFields: ['followUpQuestions', 'notes'],
    validationRules: [
      {
        field: 'riskLevel',
        type: 'required',
        required: true,
        errorMessage: 'Risk level must be determined'
      }
    ],
    scoringMethod: {
      type: 'categorical',
      categories: [
        { value: 'LOW', score: 'CLEARED', description: 'Cleared for exercise' },
        { value: 'MODERATE', score: 'CONSULT', description: 'Consult healthcare provider' },
        { value: 'HIGH', score: 'MEDICAL_CLEARANCE', description: 'Medical clearance required' }
      ]
    }
  },
  FITNESS_ASSESSMENT: {
    id: 'fitness-v1',
    name: 'Comprehensive Fitness Assessment',
    type: 'FITNESS_ASSESSMENT',
    version: '1.0',
    description: 'Multi-component fitness assessment including strength, cardio, and flexibility',
    requiredFields: ['height', 'weight', 'restingHeartRate'],
    optionalFields: ['bodyFatPercentage', 'bloodPressure', 'pushUps', 'sitUps', 'plankTime', 'sitAndReach', 'shoulderFlexibility', 'balanceTest'],
    validationRules: [
      {
        field: 'height',
        type: 'range',
        min: MEASUREMENT_STANDARDS.height.min,
        max: MEASUREMENT_STANDARDS.height.max,
        errorMessage: `Height must be between ${MEASUREMENT_STANDARDS.height.min}-${MEASUREMENT_STANDARDS.height.max} ${MEASUREMENT_STANDARDS.height.unit}`
      },
      {
        field: 'weight',
        type: 'range',
        min: MEASUREMENT_STANDARDS.weight.min,
        max: MEASUREMENT_STANDARDS.weight.max,
        errorMessage: `Weight must be between ${MEASUREMENT_STANDARDS.weight.min}-${MEASUREMENT_STANDARDS.weight.max} ${MEASUREMENT_STANDARDS.weight.unit}`
      },
      {
        field: 'restingHeartRate',
        type: 'range',
        min: MEASUREMENT_STANDARDS.restingHeartRate.min,
        max: MEASUREMENT_STANDARDS.restingHeartRate.max,
        errorMessage: `Resting heart rate must be between ${MEASUREMENT_STANDARDS.restingHeartRate.min}-${MEASUREMENT_STANDARDS.restingHeartRate.max} ${MEASUREMENT_STANDARDS.restingHeartRate.unit}`
      }
    ]
  },
  FMS: {
    id: 'fms-v1',
    name: 'Functional Movement Screen',
    type: 'FMS',
    version: '1.0',
    description: '7-part movement screen to identify movement limitations and asymmetries',
    requiredFields: ['deepSquat', 'hurdleStep', 'inlineLunge', 'shoulderMobility', 'activeStraightLegRaise', 'trunkStabilityPushup', 'rotaryStability'],
    optionalFields: ['clearingTests', 'notes'],
    validationRules: [
      {
        field: 'deepSquat',
        type: 'range',
        min: 0,
        max: 3,
        errorMessage: 'Deep squat score must be 0-3'
      }
    ],
    scoringMethod: {
      type: 'numeric',
      ranges: [
        { min: 0, max: 13, score: 'POOR', description: 'High injury risk, corrective exercise needed' },
        { min: 14, max: 16, score: 'FAIR', description: 'Moderate injury risk, some corrective exercise needed' },
        { min: 17, max: 21, score: 'GOOD', description: 'Low injury risk, ready for training' }
      ]
    }
  }
};

// Default assessment templates
export const defaultPARQData: PARQData = {
  questions: {
    q1: false,
    q2: false,
    q3: false,
    q4: false,
    q5: false,
    q6: false,
    q7: false,
  },
  riskLevel: 'LOW',
  clearedForExercise: true,
  requiresMedicalClearance: false,
};

export const defaultFitnessAssessmentData: FitnessAssessmentData = {
  height: 0,
  weight: 0,
  bmi: 0,
  restingHeartRate: 0,
};

export const defaultBodyCompositionData: BodyCompositionData = {};

export const defaultFlexibilityAssessmentData: FlexibilityAssessmentData = {};

export const defaultStrengthAssessmentData: StrengthAssessmentData = {};

export const defaultCardiovascularAssessmentData: CardiovascularAssessmentData = {
  restingHeartRate: 0,
};

export const defaultFMSData: FMSData = {
  deepSquat: 0,
  hurdleStep: 0,
  inlineLunge: 0,
  shoulderMobility: 0,
  activeStraightLegRaise: 0,
  trunkStabilityPushup: 0,
  rotaryStability: 0,
  totalScore: 0,
  asymmetry: [],
  clearingTests: {
    shoulderClearing: false,
    spineClearing: false,
  }
};

// Assessment type to default data mapping
export const assessmentDefaults: Record<string, any> = {
  PARQ: defaultPARQData,
  FITNESS_ASSESSMENT: defaultFitnessAssessmentData,
  BODY_COMPOSITION: defaultBodyCompositionData,
  FLEXIBILITY: defaultFlexibilityAssessmentData,
  STRENGTH: defaultStrengthAssessmentData,
  CARDIOVASCULAR: defaultCardiovascularAssessmentData,
  FMS: defaultFMSData,
};

// Validation functions
export const validateAssessmentData = (type: AssessmentType, data: any): { isValid: boolean; errors: string[] } => {
  const template = ASSESSMENT_TEMPLATES[type];
  if (!template) {
    return { isValid: true, errors: [] }; // No template, skip validation
  }

  const errors: string[] = [];

  // Check required fields
  template.requiredFields.forEach(field => {
    const value = getNestedValue(data, field);
    if (value === undefined || value === null || value === '') {
      errors.push(`${field} is required`);
    }
  });

  // Check validation rules
  template.validationRules.forEach(rule => {
    const value = getNestedValue(data, rule.field);
    
    if (rule.type === 'range' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(rule.errorMessage);
      }
      if (rule.max !== undefined && value > rule.max) {
        errors.push(rule.errorMessage);
      }
    }
    
    if (rule.type === 'required' && rule.required) {
      if (value === undefined || value === null || value === '') {
        errors.push(rule.errorMessage);
      }
    }
  });

  return { isValid: errors.length === 0, errors };
};

// Helper function to get nested object values
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Calculate BMI
export const calculateBMI = (weight: number, height: number): number => {
  if (height <= 0) return 0;
  return weight / Math.pow(height / 100, 2);
};

// Calculate FMS total score
export const calculateFMSScore = (fmsData: FMSData): number => {
  const scores = [
    fmsData.deepSquat || 0,
    fmsData.hurdleStep || 0,
    fmsData.inlineLunge || 0,
    fmsData.shoulderMobility || 0,
    fmsData.activeStraightLegRaise || 0,
    fmsData.trunkStabilityPushup || 0,
    fmsData.rotaryStability || 0
  ];
  return scores.reduce((sum, score) => sum + score, 0);
}; 