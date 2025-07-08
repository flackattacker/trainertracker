// OPT (Optimum Performance Training) Model Data Structures

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  instructions?: string;
  videoUrl?: string;
  imageUrl?: string;
}

export type ExerciseCategory = 
  | 'STRENGTH'
  | 'CARDIO'
  | 'FLEXIBILITY'
  | 'BALANCE'
  | 'PLYOMETRIC'
  | 'FUNCTIONAL'
  | 'SPORTS_SPECIFIC';

export type MuscleGroup = 
  | 'CHEST'
  | 'BACK'
  | 'SHOULDERS'
  | 'BICEPS'
  | 'TRICEPS'
  | 'FOREARMS'
  | 'CORE'
  | 'QUADS'
  | 'HAMSTRINGS'
  | 'GLUTES'
  | 'CALVES'
  | 'FULL_BODY'
  | 'HIP_FLEXORS';

export type Equipment = 
  | 'BODYWEIGHT'
  | 'DUMBBELLS'
  | 'BARBELL'
  | 'KETTLEBELL'
  | 'RESISTANCE_BANDS'
  | 'CABLE_MACHINE'
  | 'SMITH_MACHINE'
  | 'LEG_PRESS'
  | 'TREADMILL'
  | 'STATIONARY_BIKE'
  | 'ROWING_MACHINE'
  | 'ELLIPTICAL'
  | 'STABILITY_BALL'
  | 'FOAM_ROLLER'
  | 'YOGAMAT'
  | 'MEDICINE_BALL';

export interface WorkoutSet {
  exerciseId: string;
  sets: number;
  reps?: number;
  weight?: number; // kg
  duration?: number; // seconds
  distance?: number; // meters
  restTime?: number; // seconds
  tempo?: string; // e.g., "2-0-2" (eccentric-pause-concentric)
  rpe?: number; // Rate of Perceived Exertion (1-10)
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  type: OPTTrainingType;
  duration: number; // minutes
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  exercises: WorkoutSet[];
  warmUp?: string;
  coolDown?: string;
  notes?: string;
}

export type OPTTrainingType = 
  | 'STABILITY_TRAINING'
  | 'STRENGTH_TRAINING'
  | 'POWER_TRAINING'
  | 'CARDIOVASCULAR_TRAINING'
  | 'FLEXIBILITY_TRAINING'
  | 'BALANCE_TRAINING'
  | 'PLYOMETRIC_TRAINING'
  | 'SPORTS_SPECIFIC_TRAINING';

export interface WeeklyPlan {
  week: number;
  workouts: {
    monday?: Workout;
    tuesday?: Workout;
    wednesday?: Workout;
    thursday?: Workout;
    friday?: Workout;
    saturday?: Workout;
    sunday?: Workout;
  };
  notes?: string;
}

export interface OPTPhase {
  name: OPTPhaseName;
  duration: number; // weeks
  focus: string;
  trainingObjectives: string[];
  weeklyPlans: WeeklyPlan[];
  progressionRules?: {
    weightIncrease?: number; // percentage
    repIncrease?: number;
    volumeIncrease?: number; // percentage
    intensityIncrease?: number; // percentage
  };
  assessmentCriteria?: string[];
}

export type OPTPhaseName = 
  | 'STABILIZATION_ENDURANCE'
  | 'STRENGTH_ENDURANCE'
  | 'MUSCULAR_DEVELOPMENT'
  | 'MAXIMAL_STRENGTH'
  | 'POWER';

export interface OPTProgramData {
  name: string;
  description: string;
  optPhase: OPTPhaseName;
  primaryGoal: string;
  secondaryGoals?: string[];
  duration: number; // weeks
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  phases: OPTPhase[];
  nutritionGuidelines?: string;
  recoveryGuidelines?: string;
  progressTracking?: {
    metrics: string[];
    frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  };
  notes?: string;
}

// OPT Phase Templates
export const optPhaseTemplates: Record<OPTPhaseName, OPTPhase> = {
  STABILIZATION_ENDURANCE: {
    name: 'STABILIZATION_ENDURANCE',
    duration: 4,
    focus: 'Improve muscular endurance, joint stability, and neuromuscular efficiency',
    trainingObjectives: [
      'Enhance joint stability and postural control',
      'Improve muscular endurance',
      'Develop neuromuscular efficiency',
      'Establish proper movement patterns'
    ],
    weeklyPlans: [],
    progressionRules: {
      repIncrease: 2,
      volumeIncrease: 10
    },
    assessmentCriteria: [
      'Static postural assessment',
      'Dynamic movement assessment',
      'Core stability tests',
      'Muscular endurance tests'
    ]
  },
  STRENGTH_ENDURANCE: {
    name: 'STRENGTH_ENDURANCE',
    duration: 4,
    focus: 'Build strength while maintaining stability and endurance',
    trainingObjectives: [
      'Increase muscular strength',
      'Maintain joint stability',
      'Improve work capacity',
      'Enhance movement efficiency'
    ],
    weeklyPlans: [],
    progressionRules: {
      weightIncrease: 5,
      repIncrease: 1,
      volumeIncrease: 5
    },
    assessmentCriteria: [
      'Strength assessments',
      'Stability maintenance tests',
      'Work capacity tests',
      'Movement quality assessment'
    ]
  },
  MUSCULAR_DEVELOPMENT: {
    name: 'MUSCULAR_DEVELOPMENT',
    duration: 4,
    focus: 'Maximize muscle growth and hypertrophy',
    trainingObjectives: [
      'Increase muscle size and mass',
      'Improve body composition',
      'Enhance metabolic efficiency',
      'Develop muscular strength'
    ],
    weeklyPlans: [],
    progressionRules: {
      weightIncrease: 2.5,
      volumeIncrease: 5,
      intensityIncrease: 2
    },
    assessmentCriteria: [
      'Body composition measurements',
      'Muscle size measurements',
      'Strength assessments',
      'Metabolic rate testing'
    ]
  },
  MAXIMAL_STRENGTH: {
    name: 'MAXIMAL_STRENGTH',
    duration: 4,
    focus: 'Develop maximal strength and force production',
    trainingObjectives: [
      'Maximize force production',
      'Improve neural efficiency',
      'Enhance strength-to-weight ratio',
      'Develop absolute strength'
    ],
    weeklyPlans: [],
    progressionRules: {
      weightIncrease: 2.5,
      intensityIncrease: 5
    },
    assessmentCriteria: [
      '1RM strength tests',
      'Force production tests',
      'Neural efficiency assessments',
      'Strength-to-weight ratio calculations'
    ]
  },
  POWER: {
    name: 'POWER',
    duration: 4,
    focus: 'Develop explosive power and speed',
    trainingObjectives: [
      'Improve rate of force development',
      'Enhance power output',
      'Develop explosive movement',
      'Optimize sports performance'
    ],
    weeklyPlans: [],
    progressionRules: {
      intensityIncrease: 2.5,
      volumeIncrease: 3
    },
    assessmentCriteria: [
      'Power output tests',
      'Rate of force development',
      'Speed assessments',
      'Sports-specific performance tests'
    ]
  }
};

// Default OPT program data
export const defaultOPTProgramData: OPTProgramData = {
  name: 'OPT Training Program',
  description: 'Systematic training program following the Optimum Performance Training model',
  optPhase: 'STABILIZATION_ENDURANCE',
  primaryGoal: 'Improve overall fitness and movement quality',
  secondaryGoals: [],
  duration: 12,
  difficulty: 'BEGINNER',
  phases: [optPhaseTemplates.STABILIZATION_ENDURANCE],
  nutritionGuidelines: 'Focus on whole foods, adequate protein, and proper hydration',
  recoveryGuidelines: 'Ensure adequate sleep, active recovery, and stress management',
  progressTracking: {
    metrics: ['Body composition', 'Strength', 'Endurance', 'Movement quality'],
    frequency: 'WEEKLY'
  },
  notes: ''
};

// Common exercise library with OPT-specific categorizations
export const commonExercises: Exercise[] = [
  // Stability Training Exercises
  {
    id: 'plank',
    name: 'Plank',
    category: 'STRENGTH',
    muscleGroups: ['CORE', 'SHOULDERS'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Hold body in straight line from head to heels'
  },
  {
    id: 'bird-dog',
    name: 'Bird Dog',
    category: 'BALANCE',
    muscleGroups: ['CORE', 'BACK'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Extend opposite arm and leg while maintaining balance'
  },
  {
    id: 'single-leg-stance',
    name: 'Single Leg Stance',
    category: 'BALANCE',
    muscleGroups: ['CORE', 'QUADS', 'GLUTES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Stand on one leg while maintaining balance'
  },

  // Strength Training Exercises
  {
    id: 'push-up',
    name: 'Push-Up',
    category: 'STRENGTH',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Start in plank position, lower body until chest nearly touches ground, push back up'
  },
  {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    category: 'STRENGTH',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    equipment: ['BARBELL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Lie on bench, lower bar to chest, press back up'
  },
  {
    id: 'squat',
    name: 'Barbell Squat',
    category: 'STRENGTH',
    muscleGroups: ['QUADS', 'GLUTES', 'HAMSTRINGS'],
    equipment: ['BARBELL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Bar on upper back, squat down, stand back up'
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    category: 'STRENGTH',
    muscleGroups: ['BACK', 'GLUTES', 'HAMSTRINGS'],
    equipment: ['BARBELL'],
    difficulty: 'ADVANCED',
    instructions: 'Stand with bar at shins, hinge at hips, lift bar while keeping back straight'
  },

  // Power Training Exercises
  {
    id: 'box-jump',
    name: 'Box Jump',
    category: 'PLYOMETRIC',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Jump explosively onto box, land softly'
  },
  {
    id: 'medicine-ball-throw',
    name: 'Medicine Ball Chest Throw',
    category: 'PLYOMETRIC',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    equipment: ['MEDICINE_BALL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Throw medicine ball explosively against wall'
  },
  {
    id: 'clean',
    name: 'Power Clean',
    category: 'STRENGTH',
    muscleGroups: ['FULL_BODY'],
    equipment: ['BARBELL'],
    difficulty: 'ADVANCED',
    instructions: 'Explosive lift from ground to rack position'
  },

  // Cardiovascular Training
  {
    id: 'treadmill-run',
    name: 'Treadmill Running',
    category: 'CARDIO',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['TREADMILL'],
    difficulty: 'BEGINNER',
    instructions: 'Run at moderate pace for specified duration'
  },
  {
    id: 'rowing',
    name: 'Rowing Machine',
    category: 'CARDIO',
    muscleGroups: ['FULL_BODY'],
    equipment: ['ROWING_MACHINE'],
    difficulty: 'BEGINNER',
    instructions: 'Row with proper form for specified duration'
  },

  // Flexibility Training
  {
    id: 'hamstring-stretch',
    name: 'Hamstring Stretch',
    category: 'FLEXIBILITY',
    muscleGroups: ['HAMSTRINGS'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Sit with legs extended, reach toward toes'
  },
  {
    id: 'hip-flexor-stretch',
    name: 'Hip Flexor Stretch',
    category: 'FLEXIBILITY',
    muscleGroups: ['QUADS', 'HIP_FLEXORS'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Lunge position, stretch hip flexor of back leg'
  }
];

// Legacy types for backward compatibility
export type ProgramGoal = OPTPhaseName;
export type ProgramPhase = OPTPhase;
export type ProgramData = OPTProgramData;

// Legacy exports for backward compatibility
export const defaultProgramData = defaultOPTProgramData;
export const programTemplates = optPhaseTemplates; 