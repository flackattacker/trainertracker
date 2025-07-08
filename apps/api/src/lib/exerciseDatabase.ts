// Comprehensive Exercise Database with Acute Variables
// Based on NASM OPT Model and industry standards

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroups: MuscleGroup[];
  equipment: Equipment[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  instructions: string;
  acuteVariables: AcuteVariables;
  progressions?: string[];
  regressions?: string[];
  contraindications?: string[];
  videoUrl?: string;
  imageUrl?: string;
}

export type ExerciseCategory = 
  | 'STABILITY_TRAINING'
  | 'STRENGTH_TRAINING'
  | 'POWER_TRAINING'
  | 'CARDIOVASCULAR_TRAINING'
  | 'FLEXIBILITY_TRAINING'
  | 'BALANCE_TRAINING'
  | 'PLYOMETRIC_TRAINING'
  | 'FUNCTIONAL_TRAINING';

export type MuscleGroup = 
  | 'CORE'
  | 'CHEST'
  | 'BACK'
  | 'SHOULDERS'
  | 'BICEPS'
  | 'TRICEPS'
  | 'QUADS'
  | 'HAMSTRINGS'
  | 'GLUTES'
  | 'CALVES'
  | 'FULL_BODY'
  | 'UPPER_BODY'
  | 'LOWER_BODY'
  | 'UPPER_BACK'
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
  | 'MEDICINE_BALL'
  | 'BOSU_BALL'
  | 'TRX'
  | 'PULL_UP_BAR';

export interface AcuteVariables {
  sets: number;
  reps?: number;
  duration?: number; // seconds
  weight?: number; // kg or % of 1RM
  intensity?: number; // % of 1RM
  tempo?: string; // e.g., "2-0-2" (eccentric-pause-concentric)
  restTime: number; // seconds
  rpe?: number; // Rate of Perceived Exertion (1-10)
  distance?: number; // meters
  speed?: number; // km/h or mph
  incline?: number; // degrees
  resistance?: number; // level 1-10
}

// OPT Phase-specific acute variable guidelines
export const optPhaseGuidelines = {
  STABILIZATION_ENDURANCE: {
    sets: { min: 1, max: 3 },
    reps: { min: 12, max: 20 },
    intensity: { min: 50, max: 70 }, // % of 1RM
    tempo: '4-2-2', // Slow eccentric, pause, controlled concentric
    restTime: { min: 0, max: 90 }, // seconds
    rpe: { min: 4, max: 6 }
  },
  STRENGTH_ENDURANCE: {
    sets: { min: 2, max: 4 },
    reps: { min: 8, max: 12 },
    intensity: { min: 70, max: 80 }, // % of 1RM
    tempo: '3-1-2', // Moderate eccentric, brief pause, controlled concentric
    restTime: { min: 60, max: 120 }, // seconds
    rpe: { min: 6, max: 8 }
  },
  MUSCULAR_DEVELOPMENT: {
    sets: { min: 3, max: 5 },
    reps: { min: 6, max: 12 },
    intensity: { min: 75, max: 85 }, // % of 1RM
    tempo: '2-1-2', // Moderate eccentric, brief pause, controlled concentric
    restTime: { min: 90, max: 180 }, // seconds
    rpe: { min: 7, max: 9 }
  },
  MAXIMAL_STRENGTH: {
    sets: { min: 2, max: 6 },
    reps: { min: 1, max: 5 },
    intensity: { min: 85, max: 100 }, // % of 1RM
    tempo: '2-1-1', // Controlled eccentric, brief pause, explosive concentric
    restTime: { min: 180, max: 300 }, // seconds
    rpe: { min: 8, max: 10 }
  },
  POWER: {
    sets: { min: 2, max: 4 },
    reps: { min: 1, max: 5 },
    intensity: { min: 30, max: 45 }, // % of 1RM for power exercises
    tempo: '1-0-1', // Fast eccentric, no pause, explosive concentric
    restTime: { min: 180, max: 300 }, // seconds
    rpe: { min: 7, max: 9 }
  }
};

// Comprehensive Exercise Database
export const exerciseDatabase: Exercise[] = [
  // STABILIZATION TRAINING EXERCISES
  {
    id: 'plank',
    name: 'Plank',
    category: 'STABILITY_TRAINING',
    muscleGroups: ['CORE', 'SHOULDERS'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Hold body in straight line from head to heels, engage core muscles',
    acuteVariables: {
      sets: 3,
      duration: 30,
      restTime: 60,
      rpe: 5
    },
    progressions: ['Side Plank', 'Plank with Leg Lift', 'Plank with Arm Reach'],
    regressions: ['Knee Plank', 'Wall Plank'],
    contraindications: ['Shoulder pain', 'lower back pain']
  },
  {
    id: 'bird-dog',
    name: 'Bird Dog',
    category: 'STABILITY_TRAINING',
    muscleGroups: ['CORE', 'BACK'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Extend opposite arm and leg while maintaining balance and neutral spine',
    acuteVariables: {
      sets: 3,
      reps: 12,
      restTime: 45,
      rpe: 4
    },
    progressions: ['Bird Dog with Resistance Band', 'Bird Dog on Stability Ball'],
    regressions: ['Kneeling Bird Dog', 'Seated Bird Dog'],
    contraindications: ['Lower back pain', 'balance issues']
  },
  {
    id: 'single-leg-stance',
    name: 'Single Leg Stance',
    category: 'STABILITY_TRAINING',
    muscleGroups: ['CORE', 'QUADS', 'GLUTES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Stand on one leg while maintaining balance and proper posture',
    acuteVariables: {
      sets: 3,
      duration: 30,
      restTime: 60,
      rpe: 4
    },
    progressions: ['Single Leg Stance with Eyes Closed', 'Single Leg Stance on BOSU'],
    regressions: ['Single Leg Stance with Support', 'Double Leg Stance'],
    contraindications: ['Balance issues', 'ankle instability']
  },
  {
    id: 'wall-slide',
    name: 'Wall Slide',
    category: 'STABILITY_TRAINING',
    muscleGroups: ['SHOULDERS', 'UPPER_BACK'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Slide arms up and down wall while maintaining contact and proper posture',
    acuteVariables: {
      sets: 3,
      reps: 15,
      restTime: 60,
      rpe: 4
    },
    progressions: ['Wall Slide with Resistance Band', 'Wall Slide with Weight'],
    regressions: ['Seated Wall Slide', 'Partial Range Wall Slide'],
    contraindications: ['Shoulder pain', 'upper back pain']
  },

  // STRENGTH TRAINING EXERCISES
  {
    id: 'push-up',
    name: 'Push-Up',
    category: 'STRENGTH_TRAINING',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Start in plank position, lower body until chest nearly touches ground, push back up',
    acuteVariables: {
      sets: 3,
      reps: 10,
      restTime: 90,
      rpe: 7
    },
    progressions: ['Diamond Push-Up', 'One-Arm Push-Up', 'Plyometric Push-Up'],
    regressions: ['Knee Push-Up', 'Wall Push-Up', 'Incline Push-Up'],
    contraindications: ['Shoulder pain', 'wrist pain']
  },
  {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    category: 'STRENGTH_TRAINING',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    equipment: ['BARBELL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Lie on bench, lower bar to chest, press back up with controlled movement',
    acuteVariables: {
      sets: 4,
      reps: 8,
      intensity: 75,
      restTime: 120,
      rpe: 8
    },
    progressions: ['Incline Bench Press', 'Decline Bench Press', 'Close-Grip Bench Press'],
    regressions: ['Dumbbell Bench Press', 'Smith Machine Bench Press'],
    contraindications: ['Shoulder pain', 'chest pain']
  },
  {
    id: 'squat',
    name: 'Barbell Squat',
    category: 'STRENGTH_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'HAMSTRINGS'],
    equipment: ['BARBELL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Bar on upper back, squat down to parallel, stand back up with proper form',
    acuteVariables: {
      sets: 4,
      reps: 8,
      intensity: 75,
      restTime: 120,
      rpe: 8
    },
    progressions: ['Front Squat', 'Overhead Squat', 'Pistol Squat'],
    regressions: ['Bodyweight Squat', 'Goblet Squat', 'Wall Squat'],
    contraindications: ['Knee pain', 'lower back pain']
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    category: 'STRENGTH_TRAINING',
    muscleGroups: ['BACK', 'GLUTES', 'HAMSTRINGS'],
    equipment: ['BARBELL'],
    difficulty: 'ADVANCED',
    instructions: 'Stand with bar at shins, hinge at hips, lift bar while keeping back straight',
    acuteVariables: {
      sets: 4,
      reps: 6,
      intensity: 80,
      restTime: 180,
      rpe: 8
    },
    progressions: ['Romanian Deadlift', 'Sumo Deadlift', 'Single-Leg Deadlift'],
    regressions: ['Dumbbell Deadlift', 'Kettlebell Deadlift', 'Rack Pull'],
    contraindications: ['Lower back pain', 'hip pain']
  },

  // POWER TRAINING EXERCISES
  {
    id: 'box-jump',
    name: 'Box Jump',
    category: 'POWER_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Jump explosively onto box, land softly with proper form',
    acuteVariables: {
      sets: 3,
      reps: 5,
      restTime: 180,
      rpe: 8
    },
    progressions: ['Single-Leg Box Jump', 'Box Jump with Weight', 'Depth Jump'],
    regressions: ['Step-Up', 'Box Jump to Lower Height'],
    contraindications: ['Knee pain', 'ankle instability']
  },
  {
    id: 'medicine-ball-throw',
    name: 'Medicine Ball Chest Throw',
    category: 'POWER_TRAINING',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    equipment: ['MEDICINE_BALL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Throw medicine ball explosively against wall or to partner',
    acuteVariables: {
      sets: 3,
      reps: 8,
      restTime: 120,
      rpe: 7
    },
    progressions: ['Medicine Ball Slam', 'Medicine Ball Overhead Throw'],
    regressions: ['Medicine Ball Chest Pass', 'Medicine Ball Toss'],
    contraindications: ['Shoulder pain', 'chest pain']
  },
  {
    id: 'clean',
    name: 'Power Clean',
    category: 'POWER_TRAINING',
    muscleGroups: ['FULL_BODY'],
    equipment: ['BARBELL'],
    difficulty: 'ADVANCED',
    instructions: 'Explosive lift from ground to rack position with proper technique',
    acuteVariables: {
      sets: 3,
      reps: 3,
      intensity: 70,
      restTime: 180,
      rpe: 8
    },
    progressions: ['Hang Clean', 'Split Clean', 'Clean and Jerk'],
    regressions: ['Dumbbell Clean', 'Kettlebell Clean'],
    contraindications: ['Lower back pain', 'shoulder pain', 'wrist pain']
  },

  // CARDIOVASCULAR TRAINING
  {
    id: 'treadmill-run',
    name: 'Treadmill Running',
    category: 'CARDIOVASCULAR_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['TREADMILL'],
    difficulty: 'BEGINNER',
    instructions: 'Run at moderate pace for specified duration with proper form',
    acuteVariables: {
      sets: 1,
      duration: 1200, // 20 minutes
      speed: 8, // km/h
      restTime: 0,
      rpe: 6
    },
    progressions: ['Interval Running', 'Hill Running', 'Long Distance Running'],
    regressions: ['Walking', 'Jogging', 'Elliptical'],
    contraindications: ['Knee pain', 'hip pain', 'cardiovascular issues']
  },
  {
    id: 'rowing',
    name: 'Rowing Machine',
    category: 'CARDIOVASCULAR_TRAINING',
    muscleGroups: ['FULL_BODY'],
    equipment: ['ROWING_MACHINE'],
    difficulty: 'BEGINNER',
    instructions: 'Row with proper form for specified duration',
    acuteVariables: {
      sets: 1,
      duration: 900, // 15 minutes
      resistance: 5,
      restTime: 0,
      rpe: 6
    },
    progressions: ['Interval Rowing', 'High-Intensity Rowing'],
    regressions: ['Low Resistance Rowing', 'Shorter Duration'],
    contraindications: ['Lower back pain', 'shoulder pain']
  },

  // FLEXIBILITY TRAINING
  {
    id: 'hamstring-stretch',
    name: 'Hamstring Stretch',
    category: 'FLEXIBILITY_TRAINING',
    muscleGroups: ['HAMSTRINGS'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Sit with legs extended, reach toward toes while keeping back straight',
    acuteVariables: {
      sets: 3,
      duration: 30,
      restTime: 30,
      rpe: 3
    },
    progressions: ['Standing Hamstring Stretch', 'Partner Hamstring Stretch'],
    regressions: ['Seated Hamstring Stretch with Support'],
    contraindications: ['Lower back pain', 'hamstring injury']
  },
  {
    id: 'hip-flexor-stretch',
    name: 'Hip Flexor Stretch',
    category: 'FLEXIBILITY_TRAINING',
    muscleGroups: ['HIP_FLEXORS'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Kneel with one foot forward, lean forward to stretch hip flexor',
    acuteVariables: {
      sets: 3,
      duration: 30,
      restTime: 30,
      rpe: 3
    },
    progressions: ['Lunge Stretch', 'Pigeon Pose'],
    regressions: ['Seated Hip Flexor Stretch'],
    contraindications: ['Hip pain', 'knee pain']
  },

  // BALANCE TRAINING
  {
    id: 'single-leg-deadlift',
    name: 'Single-Leg Deadlift',
    category: 'BALANCE_TRAINING',
    muscleGroups: ['GLUTES', 'HAMSTRINGS', 'CORE'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Stand on one leg, hinge at hips while reaching opposite hand toward ground',
    acuteVariables: {
      sets: 3,
      reps: 10,
      restTime: 90,
      rpe: 6
    },
    progressions: ['Single-Leg Deadlift with Weight', 'Single-Leg Deadlift on BOSU'],
    regressions: ['Double-Leg Deadlift', 'Single-Leg Deadlift with Support'],
    contraindications: ['Balance issues', 'lower back pain']
  },
  {
    id: 'bosu-squat',
    name: 'BOSU Ball Squat',
    category: 'BALANCE_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CORE'],
    equipment: ['BOSU_BALL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Stand on BOSU ball, perform squat while maintaining balance',
    acuteVariables: {
      sets: 3,
      reps: 12,
      restTime: 90,
      rpe: 6
    },
    progressions: ['BOSU Squat with Weight', 'BOSU Single-Leg Squat'],
    regressions: ['Regular Squat', 'BOSU Squat with Support'],
    contraindications: ['Balance issues', 'knee pain']
  }
];

// Exercise selection functions
export function getExercisesByPhase(phase: string): Exercise[] {
  const phaseMap: Record<string, ExerciseCategory[]> = {
    'STABILIZATION_ENDURANCE': ['STABILITY_TRAINING', 'BALANCE_TRAINING'],
    'STRENGTH_ENDURANCE': ['STRENGTH_TRAINING', 'STABILITY_TRAINING'],
    'MUSCULAR_DEVELOPMENT': ['STRENGTH_TRAINING'],
    'MAXIMAL_STRENGTH': ['STRENGTH_TRAINING'],
    'POWER': ['POWER_TRAINING', 'PLYOMETRIC_TRAINING']
  };

  const categories = phaseMap[phase] || ['STRENGTH_TRAINING'];
  return exerciseDatabase.filter(exercise => categories.includes(exercise.category));
}

export function getExercisesByMuscleGroup(muscleGroups: MuscleGroup[]): Exercise[] {
  return exerciseDatabase.filter(exercise => 
    exercise.muscleGroups.some(group => muscleGroups.includes(group))
  );
}

export function getExercisesByDifficulty(difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'): Exercise[] {
  return exerciseDatabase.filter(exercise => exercise.difficulty === difficulty);
}

export function getExercisesByEquipment(equipment: Equipment[]): Exercise[] {
  return exerciseDatabase.filter(exercise => 
    exercise.equipment.some(eq => equipment.includes(eq))
  );
}

export function generateAcuteVariables(exercise: Exercise, phase: string, clientLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'): AcuteVariables {
  const guidelines = optPhaseGuidelines[phase as keyof typeof optPhaseGuidelines];
  if (!guidelines) {
    return exercise.acuteVariables;
  }

  // Adjust based on client level
  const levelMultiplier = {
    'BEGINNER': 0.8,
    'INTERMEDIATE': 1.0,
    'ADVANCED': 1.2
  };

  const multiplier = levelMultiplier[clientLevel];

  return {
    sets: Math.round(guidelines.sets.min * multiplier),
    reps: guidelines.reps ? Math.round(guidelines.reps.min * multiplier) : undefined,
    duration: exercise.acuteVariables.duration,
    weight: exercise.acuteVariables.weight,
    intensity: guidelines.intensity ? Math.round(guidelines.intensity.min * multiplier) : undefined,
    tempo: guidelines.tempo,
    restTime: Math.round(guidelines.restTime.min * multiplier),
    rpe: guidelines.rpe ? Math.round(guidelines.rpe.min * multiplier) : undefined,
    distance: exercise.acuteVariables.distance,
    speed: exercise.acuteVariables.speed,
    incline: exercise.acuteVariables.incline,
    resistance: exercise.acuteVariables.resistance
  };
} 