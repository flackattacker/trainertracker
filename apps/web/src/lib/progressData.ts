// Industry-standard progress tracking data structures

export interface ProgressMetrics {
  // Body composition
  weight?: number; // kg
  bodyFatPercentage?: number;
  leanBodyMass?: number;
  fatMass?: number;
  bmi?: number;
  
  // Circumference measurements (cm)
  neck?: number;
  chestCircumference?: number;
  waist?: number;
  hips?: number;
  bicepsCircumference?: number;
  forearms?: number;
  thighsCircumference?: number;
  calves?: number;
  
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
  
  // Strength metrics
  benchPress?: number; // kg 1RM
  squat?: number; // kg 1RM
  deadlift?: number; // kg 1RM
  overheadPress?: number; // kg 1RM
  pullUps?: number; // max reps
  pushUps?: number; // max reps
  plankTime?: number; // seconds
  
  // Cardiovascular metrics
  restingHeartRate?: number;
  maxHeartRate?: number;
  vo2Max?: number; // ml/kg/min
  mileRun?: number; // minutes
  beepTest?: number; // level reached
  
  // Flexibility metrics
  sitAndReach?: number; // cm
  shoulderFlexion?: number; // degrees
  hipFlexion?: number; // degrees
  
  // Functional metrics
  singleLegStand?: number; // seconds
  overheadSquat?: 'POOR' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  
  // Performance metrics
  verticalJump?: number; // cm
  broadJump?: number; // cm
  agilityTest?: number; // seconds
  
  // Subjective metrics
  energyLevel?: number; // 1-10
  sleepQuality?: number; // 1-10
  stressLevel?: number; // 1-10
  motivation?: number; // 1-10
  
  // Custom metrics
  customMetrics?: Record<string, number>;
}

export interface ProgressGoal {
  id: string;
  name: string;
  category: 'BODY_COMPOSITION' | 'STRENGTH' | 'CARDIOVASCULAR' | 'FLEXIBILITY' | 'PERFORMANCE' | 'LIFESTYLE';
  targetValue: number;
  currentValue?: number;
  unit: string;
  deadline?: Date;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'ACHIEVED' | 'BEHIND_SCHEDULE';
  notes?: string;
}

export interface ProgressEntry {
  id: string;
  date: Date;
  metrics: ProgressMetrics;
  notes?: string;
  photos?: {
    front?: string; // URL or base64
    back?: string;
    side?: string;
  };
  mood?: 'EXCELLENT' | 'GOOD' | 'OKAY' | 'POOR' | 'TERRIBLE';
  energyLevel?: number; // 1-10
  sleepHours?: number;
  stressLevel?: number; // 1-10
  workoutCompleted?: boolean;
  workoutNotes?: string;
  nutritionNotes?: string;
  supplements?: string[];
  injuries?: string[];
  medications?: string[];
}

export interface ProgressData {
  clientId: string;
  programId?: string;
  startDate: Date;
  goals: ProgressGoal[];
  entries: ProgressEntry[];
  summary?: {
    totalEntries: number;
    lastEntryDate?: Date;
    goalProgress: Record<string, number>; // goalId -> percentage complete
    trends: {
      weight?: 'INCREASING' | 'DECREASING' | 'STABLE';
      strength?: 'IMPROVING' | 'DECLINING' | 'STABLE';
      cardio?: 'IMPROVING' | 'DECLINING' | 'STABLE';
    };
  };
  notes?: string;
}

// Progress tracking templates
export const progressTrackingTemplates = {
  WEIGHT_LOSS: {
    primaryMetrics: ['weight', 'bodyFatPercentage', 'waist', 'bmi'],
    secondaryMetrics: ['energyLevel', 'sleepQuality', 'stressLevel'],
    frequency: 'WEEKLY',
    goals: [
      { name: 'Weight Loss', category: 'BODY_COMPOSITION', unit: 'kg' },
      { name: 'Body Fat Reduction', category: 'BODY_COMPOSITION', unit: '%' },
      { name: 'Waist Circumference', category: 'BODY_COMPOSITION', unit: 'cm' }
    ]
  },
  MUSCLE_GAIN: {
    primaryMetrics: ['weight', 'leanBodyMass', 'biceps', 'chest'],
    secondaryMetrics: ['benchPress', 'squat', 'energyLevel'],
    frequency: 'WEEKLY',
    goals: [
      { name: 'Weight Gain', category: 'BODY_COMPOSITION', unit: 'kg' },
      { name: 'Lean Mass Increase', category: 'BODY_COMPOSITION', unit: 'kg' },
      { name: 'Strength Improvement', category: 'STRENGTH', unit: 'kg' }
    ]
  },
  STRENGTH: {
    primaryMetrics: ['benchPress', 'squat', 'deadlift', 'overheadPress'],
    secondaryMetrics: ['weight', 'energyLevel'],
    frequency: 'BIWEEKLY',
    goals: [
      { name: 'Bench Press 1RM', category: 'STRENGTH', unit: 'kg' },
      { name: 'Squat 1RM', category: 'STRENGTH', unit: 'kg' },
      { name: 'Deadlift 1RM', category: 'STRENGTH', unit: 'kg' }
    ]
  },
  ENDURANCE: {
    primaryMetrics: ['restingHeartRate', 'vo2Max', 'mileRun', 'beepTest'],
    secondaryMetrics: ['energyLevel', 'sleepQuality'],
    frequency: 'WEEKLY',
    goals: [
      { name: 'VO2 Max Improvement', category: 'CARDIOVASCULAR', unit: 'ml/kg/min' },
      { name: 'Mile Run Time', category: 'CARDIOVASCULAR', unit: 'minutes' },
      { name: 'Resting Heart Rate', category: 'CARDIOVASCULAR', unit: 'bpm' }
    ]
  },
  FLEXIBILITY: {
    primaryMetrics: ['sitAndReach', 'shoulderFlexion', 'hipFlexion'],
    secondaryMetrics: ['energyLevel', 'stressLevel'],
    frequency: 'WEEKLY',
    goals: [
      { name: 'Sit and Reach', category: 'FLEXIBILITY', unit: 'cm' },
      { name: 'Shoulder Flexibility', category: 'FLEXIBILITY', unit: 'degrees' },
      { name: 'Hip Flexibility', category: 'FLEXIBILITY', unit: 'degrees' }
    ]
  },
  GENERAL_FITNESS: {
    primaryMetrics: ['weight', 'bmi', 'restingHeartRate', 'pushUps'],
    secondaryMetrics: ['energyLevel', 'sleepQuality', 'stressLevel'],
    frequency: 'WEEKLY',
    goals: [
      { name: 'Body Weight', category: 'BODY_COMPOSITION', unit: 'kg' },
      { name: 'Fitness Level', category: 'PERFORMANCE', unit: 'score' },
      { name: 'Energy Level', category: 'LIFESTYLE', unit: '1-10' }
    ]
  }
};

// Default progress data
export const defaultProgressData: ProgressData = {
  clientId: '',
  startDate: new Date(),
  goals: [],
  entries: []
};

// Progress calculation utilities
export const calculateProgress = (entries: ProgressEntry[], goal: ProgressGoal): number => {
  if (entries.length === 0) return 0;
  
  const firstEntry = entries[0];
  const lastEntry = entries[entries.length - 1];
  
  if (!firstEntry || !lastEntry) return 0;
  
  const startValue = firstEntry.metrics[goal.name.toLowerCase() as keyof ProgressMetrics] as number || 0;
  const currentValue = lastEntry.metrics[goal.name.toLowerCase() as keyof ProgressMetrics] as number || 0;
  
  if (startValue === 0) return 0;
  
  return ((currentValue - startValue) / (goal.targetValue - startValue)) * 100;
};

export const calculateTrend = (entries: ProgressEntry[], metric: keyof ProgressMetrics): 'INCREASING' | 'DECREASING' | 'STABLE' => {
  if (entries.length < 3) return 'STABLE';
  
  const recentEntries = entries.slice(-3);
  const values = recentEntries.map(entry => entry.metrics[metric] as number).filter(v => v !== undefined);
  
  if (values.length < 3) return 'STABLE';
  
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  
  if (firstValue === undefined || lastValue === undefined) return 'STABLE';
  
  const change = lastValue - firstValue;
  
  if (Math.abs(change) < (firstValue * 0.02)) return 'STABLE'; // Less than 2% change
  return change > 0 ? 'INCREASING' : 'DECREASING';
};

// Progress visualization data
export interface ProgressChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }[];
}

export const generateProgressChartData = (
  entries: ProgressEntry[], 
  metric: keyof ProgressMetrics
): ProgressChartData => {
  const sortedEntries = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return {
    labels: sortedEntries.map(entry => new Date(entry.date).toLocaleDateString()),
    datasets: [{
      label: metric.toString(),
      data: sortedEntries.map(entry => entry.metrics[metric] as number || 0),
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)'
    }]
  };
}; 