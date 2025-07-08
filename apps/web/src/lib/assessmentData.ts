// Industry-standard assessment data structures

export interface PARQData {
  // Physical Activity Readiness Questionnaire (PAR-Q+)
  questions: {
    q1: boolean; // Heart condition
    q2: boolean; // Chest pain during physical activity
    q3: boolean; // Chest pain when not doing physical activity
    q4: boolean; // Loss of balance due to dizziness
    q5: boolean; // Bone or joint problem
    q6: boolean; // Blood pressure medication
    q7: boolean; // Other reason not to do physical activity
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
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  clearedForExercise: boolean;
  requiresMedicalClearance: boolean;
  notes?: string;
}

export interface FitnessAssessmentData {
  // Basic measurements
  height: number; // cm
  weight: number; // kg
  bodyFatPercentage?: number;
  bmi: number;
  
  // Cardiovascular fitness
  restingHeartRate: number;
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
  restingHeartRate: number;
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

export interface AssessmentData {
  PARQ?: PARQData;
  fitness?: FitnessAssessmentData;
  bodyComposition?: BodyCompositionData;
  flexibility?: FlexibilityAssessmentData;
  strength?: StrengthAssessmentData;
  cardiovascular?: CardiovascularAssessmentData;
  [key: string]: any; // Allow for custom assessment types
}

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

// Assessment type to default data mapping
export const assessmentDefaults: Record<string, any> = {
  PARQ: defaultPARQData,
  FITNESS_ASSESSMENT: defaultFitnessAssessmentData,
  BODY_COMPOSITION: defaultBodyCompositionData,
  FLEXIBILITY: defaultFlexibilityAssessmentData,
  STRENGTH: defaultStrengthAssessmentData,
  CARDIOVASCULAR: defaultCardiovascularAssessmentData,
}; 