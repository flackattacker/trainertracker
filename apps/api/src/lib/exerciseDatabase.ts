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

// --- BEGIN MASSIVE EXERCISE DATABASE ---
export const exerciseDatabase: Exercise[] = [
  // STABILIZATION TRAINING
  {
    id: 'side-plank',
    name: 'Side Plank',
    category: 'STABILITY_TRAINING',
    muscleGroups: ['CORE', 'SHOULDERS'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Lie on your side, prop up on elbow, hold hips off ground.',
    acuteVariables: { sets: 3, duration: 30, restTime: 60, rpe: 5 },
    progressions: ['Side Plank with Leg Lift'],
    regressions: ['Knee Side Plank'],
    contraindications: ['Shoulder pain']
  },
  {
    id: 'stability-ball-crunch',
    name: 'Stability Ball Crunch',
    category: 'STABILITY_TRAINING',
    muscleGroups: ['CORE'],
    equipment: ['STABILITY_BALL'],
    difficulty: 'BEGINNER',
    instructions: 'Lie on ball, feet flat, crunch up keeping core engaged.',
    acuteVariables: { sets: 3, reps: 15, restTime: 60, rpe: 5 },
    progressions: ['Weighted Ball Crunch'],
    regressions: ['Floor Crunch'],
    contraindications: ['Lower back pain']
  },
  {
    id: 'bosu-plank',
    name: 'BOSU Plank',
    category: 'STABILITY_TRAINING',
    muscleGroups: ['CORE', 'SHOULDERS'],
    equipment: ['BOSU_BALL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Hold plank position with forearms on BOSU ball.',
    acuteVariables: { sets: 3, duration: 30, restTime: 60, rpe: 6 },
    progressions: ['BOSU Plank with Leg Lift'],
    regressions: ['Floor Plank'],
    contraindications: ['Shoulder pain']
  },
  // STRENGTH TRAINING
  {
    id: 'goblet-squat',
    name: 'Goblet Squat',
    category: 'STRENGTH_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CORE'],
    equipment: ['DUMBBELLS'],
    difficulty: 'BEGINNER',
    instructions: 'Hold dumbbell at chest, squat down, keep chest up.',
    acuteVariables: { sets: 3, reps: 12, restTime: 90, rpe: 6 },
    progressions: ['Front Squat'],
    regressions: ['Bodyweight Squat'],
    contraindications: ['Knee pain']
  },
  {
    id: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    category: 'STRENGTH_TRAINING',
    muscleGroups: ['HAMSTRINGS', 'GLUTES', 'BACK'],
    equipment: ['BARBELL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Hinge at hips, lower bar down legs, keep back flat.',
    acuteVariables: { sets: 3, reps: 10, restTime: 120, rpe: 7 },
    progressions: ['Single Leg RDL'],
    regressions: ['Dumbbell RDL'],
    contraindications: ['Lower back pain']
  },
  {
    id: 'lat-pulldown',
    name: 'Lat Pulldown',
    category: 'STRENGTH_TRAINING',
    muscleGroups: ['BACK', 'BICEPS'],
    equipment: ['CABLE_MACHINE'],
    difficulty: 'BEGINNER',
    instructions: 'Pull bar to chest, squeeze shoulder blades, control up.',
    acuteVariables: { sets: 3, reps: 12, restTime: 90, rpe: 6 },
    progressions: ['Pull-up'],
    regressions: ['Assisted Pulldown'],
    contraindications: ['Shoulder pain']
  },
  {
    id: 'seated-row',
    name: 'Seated Row',
    category: 'STRENGTH_TRAINING',
    muscleGroups: ['BACK', 'BICEPS'],
    equipment: ['CABLE_MACHINE'],
    difficulty: 'BEGINNER',
    instructions: 'Pull handles to torso, squeeze shoulder blades, control back.',
    acuteVariables: { sets: 3, reps: 12, restTime: 90, rpe: 6 },
    progressions: ['Single Arm Row'],
    regressions: ['Resistance Band Row'],
    contraindications: ['Shoulder pain']
  },
  // POWER TRAINING
  {
    id: 'push-press',
    name: 'Push Press',
    category: 'POWER_TRAINING',
    muscleGroups: ['SHOULDERS', 'TRICEPS', 'CORE'],
    equipment: ['BARBELL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Dip knees, drive bar overhead explosively, lock out arms.',
    acuteVariables: { sets: 3, reps: 5, restTime: 120, rpe: 8 },
    progressions: ['Split Jerk'],
    regressions: ['Dumbbell Push Press'],
    contraindications: ['Shoulder pain']
  },
  {
    id: 'medicine-ball-slam',
    name: 'Medicine Ball Slam',
    category: 'POWER_TRAINING',
    muscleGroups: ['CORE', 'SHOULDERS', 'FULL_BODY'],
    equipment: ['MEDICINE_BALL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Lift ball overhead, slam to ground with force, repeat.',
    acuteVariables: { sets: 3, reps: 8, restTime: 90, rpe: 7 },
    progressions: ['Rotational Slam'],
    regressions: ['Lighter Ball'],
    contraindications: ['Back pain']
  },
  {
    id: 'box-jump',
    name: 'Box Jump',
    category: 'PLYOMETRIC_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Jump onto box, land softly, step down and repeat.',
    acuteVariables: { sets: 3, reps: 8, restTime: 90, rpe: 7 },
    progressions: ['Higher Box'],
    regressions: ['Step Up'],
    contraindications: ['Knee pain']
  },
  {
    id: 'depth-jump',
    name: 'Depth Jump',
    category: 'PLYOMETRIC_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'ADVANCED',
    instructions: 'Step off box, land, immediately jump as high as possible.',
    acuteVariables: { sets: 3, reps: 6, restTime: 120, rpe: 8 },
    progressions: ['Weighted Depth Jump'],
    regressions: ['Box Jump'],
    contraindications: ['Knee pain']
  },
  // CARDIOVASCULAR TRAINING
  {
    id: 'elliptical',
    name: 'Elliptical Trainer',
    category: 'CARDIOVASCULAR_TRAINING',
    muscleGroups: ['FULL_BODY'],
    equipment: ['ELLIPTICAL'],
    difficulty: 'BEGINNER',
    instructions: 'Maintain steady pace, use arms and legs, keep posture upright.',
    acuteVariables: { sets: 1, duration: 1800, restTime: 0, rpe: 5 },
    progressions: ['Interval Elliptical'],
    regressions: ['Shorter Duration'],
    contraindications: ['Knee pain']
  },
  {
    id: 'stair-climber',
    name: 'Stair Climber',
    category: 'CARDIOVASCULAR_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Climb stairs at steady pace, keep core engaged.',
    acuteVariables: { sets: 1, duration: 1200, restTime: 0, rpe: 6 },
    progressions: ['Weighted Climb'],
    regressions: ['Slower Pace'],
    contraindications: ['Knee pain']
  },
  // FLEXIBILITY TRAINING
  {
    id: 'childs-pose',
    name: "Child's Pose",
    category: 'FLEXIBILITY_TRAINING',
    muscleGroups: ['LOWER_BODY', 'BACK'],
    equipment: ['YOGAMAT'],
    difficulty: 'BEGINNER',
    instructions: 'Kneel, sit back on heels, stretch arms forward, relax.',
    acuteVariables: { sets: 3, duration: 30, restTime: 30, rpe: 2 },
    progressions: ['Extended Child Pose'],
    regressions: ['Supported Child Pose'],
    contraindications: ['Knee pain']
  },
  {
    id: 'cat-cow',
    name: 'Cat-Cow Stretch',
    category: 'FLEXIBILITY_TRAINING',
    muscleGroups: ['BACK', 'CORE'],
    equipment: ['YOGAMAT'],
    difficulty: 'BEGINNER',
    instructions: 'On all fours, alternate arching and rounding back.',
    acuteVariables: { sets: 3, reps: 10, restTime: 30, rpe: 2 },
    progressions: ['Add Deep Breathing'],
    regressions: ['Partial Range'],
    contraindications: ['Wrist pain']
  },
  // BALANCE TRAINING
  {
    id: 'single-leg-balance-reach',
    name: 'Single Leg Balance Reach',
    category: 'BALANCE_TRAINING',
    muscleGroups: ['CORE', 'QUADS', 'GLUTES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Stand on one leg, reach forward, side, and back with other leg.',
    acuteVariables: { sets: 3, reps: 8, restTime: 60, rpe: 5 },
    progressions: ['Eyes Closed'],
    regressions: ['Support with Hand'],
    contraindications: ['Balance issues']
  },
  {
    id: 'bosu-lunge',
    name: 'BOSU Lunge',
    category: 'BALANCE_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CORE'],
    equipment: ['BOSU_BALL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Lunge forward onto BOSU ball, keep balance, return to start.',
    acuteVariables: { sets: 3, reps: 10, restTime: 90, rpe: 6 },
    progressions: ['Weighted BOSU Lunge'],
    regressions: ['Floor Lunge'],
    contraindications: ['Knee pain']
  },
  // FUNCTIONAL TRAINING
  {
    id: 'farmer-carry',
    name: 'Farmer Carry',
    category: 'FUNCTIONAL_TRAINING',
    muscleGroups: ['FULL_BODY', 'CORE'],
    equipment: ['DUMBBELLS'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Walk holding heavy dumbbells at sides, keep core tight.',
    acuteVariables: { sets: 3, duration: 60, restTime: 90, rpe: 7 },
    progressions: ['Heavier Weight'],
    regressions: ['Lighter Weight'],
    contraindications: ['Grip issues']
  },
  {
    id: 'sled-push',
    name: 'Sled Push',
    category: 'FUNCTIONAL_TRAINING',
    muscleGroups: ['FULL_BODY', 'QUADS', 'GLUTES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'ADVANCED',
    instructions: 'Push weighted sled across floor, keep back flat.',
    acuteVariables: { sets: 3, duration: 30, restTime: 120, rpe: 8 },
    progressions: ['Heavier Sled'],
    regressions: ['Unweighted Sled'],
    contraindications: ['Back pain']
  },
  // Additional exercises for comprehensive OPT phase coverage
  // PLYOMETRIC TRAINING (Power Phase)
  {
    id: 'box-jump-variations',
    name: 'Box Jump Variations',
    category: 'PLYOMETRIC_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Jump onto box with different heights and landing techniques.',
    acuteVariables: { sets: 3, reps: 8, restTime: 90, rpe: 7 },
    progressions: ['Single Leg Box Jump'],
    regressions: ['Step Up'],
    contraindications: ['Knee pain']
  },
  {
    id: 'single-leg-box-jump',
    name: 'Single Leg Box Jump',
    category: 'PLYOMETRIC_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'ADVANCED',
    instructions: 'Jump onto box using one leg, land softly, step down.',
    acuteVariables: { sets: 3, reps: 6, restTime: 120, rpe: 8 },
    progressions: ['Single Leg Depth Jump'],
    regressions: ['Box Jump'],
    contraindications: ['Knee pain']
  },
  {
    id: 'lateral-box-jump',
    name: 'Lateral Box Jump',
    category: 'PLYOMETRIC_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Jump sideways onto box, land softly, step down.',
    acuteVariables: { sets: 3, reps: 8, restTime: 90, rpe: 7 },
    progressions: ['Lateral Single Leg Jump'],
    regressions: ['Lateral Step Up'],
    contraindications: ['Knee pain']
  },
  {
    id: 'tuck-jump',
    name: 'Tuck Jump',
    category: 'PLYOMETRIC_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Jump up, bring knees to chest, land softly.',
    acuteVariables: { sets: 3, reps: 8, restTime: 90, rpe: 7 },
    progressions: ['Weighted Tuck Jump'],
    regressions: ['Squat Jump'],
    contraindications: ['Knee pain']
  },
  {
    id: 'split-jump',
    name: 'Split Jump',
    category: 'PLYOMETRIC_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Jump from lunge position, switch legs mid-air, land in opposite lunge.',
    acuteVariables: { sets: 3, reps: 8, restTime: 90, rpe: 7 },
    progressions: ['Weighted Split Jump'],
    regressions: ['Alternating Lunge'],
    contraindications: ['Knee pain']
  },
  {
    id: 'broad-jump',
    name: 'Broad Jump',
    category: 'PLYOMETRIC_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Jump forward as far as possible, land softly.',
    acuteVariables: { sets: 3, reps: 6, restTime: 120, rpe: 8 },
    progressions: ['Weighted Broad Jump'],
    regressions: ['Standing Long Jump'],
    contraindications: ['Knee pain']
  },
  {
    id: 'medicine-ball-chest-pass',
    name: 'Medicine Ball Chest Pass',
    category: 'PLYOMETRIC_TRAINING',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    equipment: ['MEDICINE_BALL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Throw medicine ball explosively from chest, catch and repeat.',
    acuteVariables: { sets: 3, reps: 8, restTime: 90, rpe: 7 },
    progressions: ['Heavier Ball'],
    regressions: ['Lighter Ball'],
    contraindications: ['Shoulder pain']
  },
  {
    id: 'medicine-ball-overhead-throw',
    name: 'Medicine Ball Overhead Throw',
    category: 'PLYOMETRIC_TRAINING',
    muscleGroups: ['SHOULDERS', 'TRICEPS', 'CORE'],
    equipment: ['MEDICINE_BALL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Throw medicine ball overhead explosively, catch and repeat.',
    acuteVariables: { sets: 3, reps: 8, restTime: 90, rpe: 7 },
    progressions: ['Heavier Ball'],
    regressions: ['Lighter Ball'],
    contraindications: ['Shoulder pain']
  },
  {
    id: 'clap-push-up',
    name: 'Clap Push-Up',
    category: 'PLYOMETRIC_TRAINING',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'ADVANCED',
    instructions: 'Explosive push-up, clap hands mid-air, land softly.',
    acuteVariables: { sets: 3, reps: 6, restTime: 120, rpe: 8 },
    progressions: ['Double Clap Push-Up'],
    regressions: ['Regular Push-Up'],
    contraindications: ['Wrist pain']
  },
  {
    id: 'plyo-push-up',
    name: 'Plyometric Push-Up',
    category: 'PLYOMETRIC_TRAINING',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'ADVANCED',
    instructions: 'Explosive push-up, hands leave ground, land softly.',
    acuteVariables: { sets: 3, reps: 8, restTime: 90, rpe: 7 },
    progressions: ['Clap Push-Up'],
    regressions: ['Regular Push-Up'],
    contraindications: ['Wrist pain']
  },

  // AGILITY TRAINING
  {
    id: 'ladder-drills',
    name: 'Ladder Drills',
    category: 'FUNCTIONAL_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Various footwork patterns through agility ladder.',
    acuteVariables: { sets: 3, duration: 30, restTime: 60, rpe: 6 },
    progressions: ['Faster Speed'],
    regressions: ['Slower Speed'],
    contraindications: ['Balance issues']
  },
  {
    id: 'cone-drills',
    name: 'Cone Drills',
    category: 'FUNCTIONAL_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Sprint, cut, and change direction around cones.',
    acuteVariables: { sets: 3, duration: 45, restTime: 90, rpe: 7 },
    progressions: ['More Complex Patterns'],
    regressions: ['Simpler Patterns'],
    contraindications: ['Knee pain']
  },
  {
    id: 'shuttle-run',
    name: 'Shuttle Run',
    category: 'FUNCTIONAL_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Sprint to cone, touch, sprint back, repeat.',
    acuteVariables: { sets: 3, duration: 30, restTime: 90, rpe: 7 },
    progressions: ['Longer Distance'],
    regressions: ['Shorter Distance'],
    contraindications: ['Knee pain']
  },
  {
    id: 't-drill',
    name: 'T-Drill',
    category: 'FUNCTIONAL_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Sprint forward, shuffle left, shuffle right, backpedal.',
    acuteVariables: { sets: 3, duration: 45, restTime: 90, rpe: 7 },
    progressions: ['Faster Speed'],
    regressions: ['Slower Speed'],
    contraindications: ['Knee pain']
  },
  {
    id: 'pro-agility-drill',
    name: 'Pro Agility Drill',
    category: 'FUNCTIONAL_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'ADVANCED',
    instructions: 'Sprint 5 yards, change direction, sprint 10 yards, change direction, sprint 5 yards.',
    acuteVariables: { sets: 3, duration: 60, restTime: 120, rpe: 8 },
    progressions: ['Faster Speed'],
    regressions: ['Slower Speed'],
    contraindications: ['Knee pain']
  },

  // POWER TRAINING
  {
    id: 'clean-and-jerk',
    name: 'Clean and Jerk',
    category: 'POWER_TRAINING',
    muscleGroups: ['FULL_BODY'],
    equipment: ['BARBELL'],
    difficulty: 'ADVANCED',
    instructions: 'Explosive lift from ground to overhead in two movements.',
    acuteVariables: { sets: 3, reps: 3, restTime: 180, rpe: 9 },
    progressions: ['Heavier Weight'],
    regressions: ['Dumbbell Clean'],
    contraindications: ['Back pain']
  },
  {
    id: 'snatch',
    name: 'Snatch',
    category: 'POWER_TRAINING',
    muscleGroups: ['FULL_BODY'],
    equipment: ['BARBELL'],
    difficulty: 'ADVANCED',
    instructions: 'Explosive lift from ground to overhead in one movement.',
    acuteVariables: { sets: 3, reps: 3, restTime: 180, rpe: 9 },
    progressions: ['Heavier Weight'],
    regressions: ['Dumbbell Snatch'],
    contraindications: ['Back pain']
  },
  {
    id: 'kettlebell-swing',
    name: 'Kettlebell Swing',
    category: 'POWER_TRAINING',
    muscleGroups: ['HAMSTRINGS', 'GLUTES', 'CORE'],
    equipment: ['KETTLEBELL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Hinge at hips, swing kettlebell between legs, snap hips forward.',
    acuteVariables: { sets: 3, reps: 12, restTime: 90, rpe: 7 },
    progressions: ['Heavier Kettlebell'],
    regressions: ['Lighter Kettlebell'],
    contraindications: ['Back pain']
  },
  {
    id: 'kettlebell-clean',
    name: 'Kettlebell Clean',
    category: 'POWER_TRAINING',
    muscleGroups: ['FULL_BODY'],
    equipment: ['KETTLEBELL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Explosive lift from ground to rack position.',
    acuteVariables: { sets: 3, reps: 8, restTime: 90, rpe: 7 },
    progressions: ['Heavier Kettlebell'],
    regressions: ['Lighter Kettlebell'],
    contraindications: ['Back pain']
  },
  {
    id: 'kettlebell-snatch',
    name: 'Kettlebell Snatch',
    category: 'POWER_TRAINING',
    muscleGroups: ['FULL_BODY'],
    equipment: ['KETTLEBELL'],
    difficulty: 'ADVANCED',
    instructions: 'Explosive lift from ground to overhead in one movement.',
    acuteVariables: { sets: 3, reps: 6, restTime: 120, rpe: 8 },
    progressions: ['Heavier Kettlebell'],
    regressions: ['Kettlebell Clean'],
    contraindications: ['Back pain']
  },

  // STRENGTH TRAINING (Additional)
  {
    id: 'front-squat',
    name: 'Front Squat',
    category: 'STRENGTH_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CORE'],
    equipment: ['BARBELL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Hold barbell on front of shoulders, squat down, keep chest up.',
    acuteVariables: { sets: 3, reps: 8, restTime: 120, rpe: 7 },
    progressions: ['Heavier Weight'],
    regressions: ['Goblet Squat'],
    contraindications: ['Knee pain']
  },
  {
    id: 'overhead-squat',
    name: 'Overhead Squat',
    category: 'STRENGTH_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'SHOULDERS', 'CORE'],
    equipment: ['BARBELL'],
    difficulty: 'ADVANCED',
    instructions: 'Hold barbell overhead, squat down, keep bar stable.',
    acuteVariables: { sets: 3, reps: 6, restTime: 120, rpe: 8 },
    progressions: ['Heavier Weight'],
    regressions: ['Front Squat'],
    contraindications: ['Shoulder pain']
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    category: 'STRENGTH_TRAINING',
    muscleGroups: ['HAMSTRINGS', 'GLUTES', 'BACK'],
    equipment: ['BARBELL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Lift barbell from ground, keep back flat, drive through heels.',
    acuteVariables: { sets: 3, reps: 8, restTime: 120, rpe: 7 },
    progressions: ['Heavier Weight'],
    regressions: ['Dumbbell Deadlift'],
    contraindications: ['Back pain']
  },
  {
    id: 'sumo-deadlift',
    name: 'Sumo Deadlift',
    category: 'STRENGTH_TRAINING',
    muscleGroups: ['HAMSTRINGS', 'GLUTES', 'BACK'],
    equipment: ['BARBELL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Wide stance deadlift, keep back flat, drive through heels.',
    acuteVariables: { sets: 3, reps: 8, restTime: 120, rpe: 7 },
    progressions: ['Heavier Weight'],
    regressions: ['Regular Deadlift'],
    contraindications: ['Back pain']
  },
  {
    id: 'bench-press',
    name: 'Bench Press',
    category: 'STRENGTH_TRAINING',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    equipment: ['BARBELL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Lie on bench, lower bar to chest, press up explosively.',
    acuteVariables: { sets: 3, reps: 8, restTime: 120, rpe: 7 },
    progressions: ['Heavier Weight'],
    regressions: ['Dumbbell Bench Press'],
    contraindications: ['Shoulder pain']
  },
  {
    id: 'incline-bench-press',
    name: 'Incline Bench Press',
    category: 'STRENGTH_TRAINING',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    equipment: ['BARBELL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Lie on inclined bench, lower bar to chest, press up.',
    acuteVariables: { sets: 3, reps: 8, restTime: 120, rpe: 7 },
    progressions: ['Heavier Weight'],
    regressions: ['Flat Bench Press'],
    contraindications: ['Shoulder pain']
  },
  {
    id: 'pull-up',
    name: 'Pull-Up',
    category: 'STRENGTH_TRAINING',
    muscleGroups: ['BACK', 'BICEPS'],
    equipment: ['PULL_UP_BAR'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Hang from bar, pull body up until chin over bar.',
    acuteVariables: { sets: 3, reps: 8, restTime: 120, rpe: 7 },
    progressions: ['Weighted Pull-Up'],
    regressions: ['Assisted Pull-Up'],
    contraindications: ['Shoulder pain']
  },
  {
    id: 'chin-up',
    name: 'Chin-Up',
    category: 'STRENGTH_TRAINING',
    muscleGroups: ['BACK', 'BICEPS'],
    equipment: ['PULL_UP_BAR'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Hang from bar with underhand grip, pull body up.',
    acuteVariables: { sets: 3, reps: 8, restTime: 120, rpe: 7 },
    progressions: ['Weighted Chin-Up'],
    regressions: ['Assisted Chin-Up'],
    contraindications: ['Shoulder pain']
  },
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    category: 'STRENGTH_TRAINING',
    muscleGroups: ['SHOULDERS', 'TRICEPS'],
    equipment: ['BARBELL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Press barbell from shoulders to overhead, lock out arms.',
    acuteVariables: { sets: 3, reps: 8, restTime: 120, rpe: 7 },
    progressions: ['Heavier Weight'],
    regressions: ['Dumbbell Press'],
    contraindications: ['Shoulder pain']
  },
  {
    id: 'barbell-row',
    name: 'Barbell Row',
    category: 'STRENGTH_TRAINING',
    muscleGroups: ['BACK', 'BICEPS'],
    equipment: ['BARBELL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Bend over, pull barbell to lower chest, squeeze shoulder blades.',
    acuteVariables: { sets: 3, reps: 8, restTime: 120, rpe: 7 },
    progressions: ['Heavier Weight'],
    regressions: ['Dumbbell Row'],
    contraindications: ['Back pain']
  },

  // STABILITY TRAINING (Additional)
  {
    id: 'plank-variations',
    name: 'Plank Variations',
    category: 'STABILITY_TRAINING',
    muscleGroups: ['CORE', 'SHOULDERS'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Hold plank position with various modifications.',
    acuteVariables: { sets: 3, duration: 45, restTime: 60, rpe: 5 },
    progressions: ['Side Plank'],
    regressions: ['Knee Plank'],
    contraindications: ['Shoulder pain']
  },
  {
    id: 'bird-dog',
    name: 'Bird Dog',
    category: 'STABILITY_TRAINING',
    muscleGroups: ['CORE', 'BACK'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'On all fours, extend opposite arm and leg, hold.',
    acuteVariables: { sets: 3, reps: 10, restTime: 60, rpe: 4 },
    progressions: ['Longer Hold'],
    regressions: ['Shorter Hold'],
    contraindications: ['Back pain']
  },
  {
    id: 'dead-bug',
    name: 'Dead Bug',
    category: 'STABILITY_TRAINING',
    muscleGroups: ['CORE'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Lie on back, extend opposite arm and leg, keep core engaged.',
    acuteVariables: { sets: 3, reps: 10, restTime: 60, rpe: 4 },
    progressions: ['Longer Hold'],
    regressions: ['Shorter Hold'],
    contraindications: ['Back pain']
  },
  {
    id: 'pallof-press',
    name: 'Pallof Press',
    category: 'STABILITY_TRAINING',
    muscleGroups: ['CORE'],
    equipment: ['CABLE_MACHINE'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Stand sideways to cable, press handle away, resist rotation.',
    acuteVariables: { sets: 3, reps: 12, restTime: 60, rpe: 5 },
    progressions: ['Heavier Weight'],
    regressions: ['Lighter Weight'],
    contraindications: ['Back pain']
  },

  // BALANCE TRAINING (Additional)
  {
    id: 'single-leg-deadlift',
    name: 'Single Leg Deadlift',
    category: 'BALANCE_TRAINING',
    muscleGroups: ['HAMSTRINGS', 'GLUTES', 'CORE'],
    equipment: ['DUMBBELLS'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Stand on one leg, hinge forward, touch ground with dumbbell.',
    acuteVariables: { sets: 3, reps: 10, restTime: 90, rpe: 6 },
    progressions: ['Heavier Weight'],
    regressions: ['Bodyweight Only'],
    contraindications: ['Balance issues']
  },
  {
    id: 'single-leg-squat',
    name: 'Single Leg Squat',
    category: 'BALANCE_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CORE'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'ADVANCED',
    instructions: 'Stand on one leg, squat down, keep balance.',
    acuteVariables: { sets: 3, reps: 8, restTime: 90, rpe: 7 },
    progressions: ['Weighted'],
    regressions: ['Assisted'],
    contraindications: ['Knee pain']
  },
  {
    id: 'bosu-squat',
    name: 'BOSU Squat',
    category: 'BALANCE_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CORE'],
    equipment: ['BOSU_BALL'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Stand on BOSU ball, squat down, keep balance.',
    acuteVariables: { sets: 3, reps: 10, restTime: 90, rpe: 6 },
    progressions: ['Weighted'],
    regressions: ['Floor Squat'],
    contraindications: ['Knee pain']
  },

  // FUNCTIONAL TRAINING (Additional)
  {
    id: 'burpee',
    name: 'Burpee',
    category: 'FUNCTIONAL_TRAINING',
    muscleGroups: ['FULL_BODY'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'INTERMEDIATE',
    instructions: 'Squat, jump back to plank, jump forward, jump up.',
    acuteVariables: { sets: 3, reps: 10, restTime: 90, rpe: 7 },
    progressions: ['Burpee Pull-Up'],
    regressions: ['Squat Thrust'],
    contraindications: ['Knee pain']
  },
  {
    id: 'mountain-climber',
    name: 'Mountain Climber',
    category: 'FUNCTIONAL_TRAINING',
    muscleGroups: ['CORE', 'SHOULDERS'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'In plank position, alternate bringing knees to chest.',
    acuteVariables: { sets: 3, duration: 30, restTime: 60, rpe: 6 },
    progressions: ['Faster Speed'],
    regressions: ['Slower Speed'],
    contraindications: ['Shoulder pain']
  },
  {
    id: 'jumping-jack',
    name: 'Jumping Jack',
    category: 'FUNCTIONAL_TRAINING',
    muscleGroups: ['FULL_BODY'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Jump while raising arms and legs out to sides.',
    acuteVariables: { sets: 3, duration: 30, restTime: 60, rpe: 5 },
    progressions: ['Faster Speed'],
    regressions: ['Slower Speed'],
    contraindications: ['Knee pain']
  },
  {
    id: 'high-knee',
    name: 'High Knee',
    category: 'FUNCTIONAL_TRAINING',
    muscleGroups: ['QUADS', 'GLUTES', 'CALVES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Run in place, bring knees up to waist level.',
    acuteVariables: { sets: 3, duration: 30, restTime: 60, rpe: 6 },
    progressions: ['Faster Speed'],
    regressions: ['Slower Speed'],
    contraindications: ['Knee pain']
  },
  {
    id: 'butt-kick',
    name: 'Butt Kick',
    category: 'FUNCTIONAL_TRAINING',
    muscleGroups: ['HAMSTRINGS', 'CALVES'],
    equipment: ['BODYWEIGHT'],
    difficulty: 'BEGINNER',
    instructions: 'Run in place, kick heels up to buttocks.',
    acuteVariables: { sets: 3, duration: 30, restTime: 60, rpe: 5 },
    progressions: ['Faster Speed'],
    regressions: ['Slower Speed'],
    contraindications: ['Knee pain']
  }
];
// --- END MASSIVE EXERCISE DATABASE ---

// Helper functions
export function getExercisesByPhase(phase: string): Exercise[] {
  switch (phase) {
    case 'STABILIZATION_ENDURANCE':
      return exerciseDatabase.filter(ex => ex.category === 'STABILITY_TRAINING');
    case 'STRENGTH_ENDURANCE':
      return exerciseDatabase.filter(ex => 
        ex.category === 'STRENGTH_TRAINING' && ex.difficulty === 'BEGINNER'
      );
    case 'MUSCULAR_DEVELOPMENT':
      return exerciseDatabase.filter(ex => 
        ex.category === 'STRENGTH_TRAINING' && ex.difficulty === 'INTERMEDIATE'
      );
    case 'MAXIMAL_STRENGTH':
      return exerciseDatabase.filter(ex => 
        ex.category === 'STRENGTH_TRAINING' && ex.difficulty === 'ADVANCED'
      );
    case 'POWER':
      return exerciseDatabase.filter(ex => 
        ex.category === 'POWER_TRAINING' || ex.category === 'PLYOMETRIC_TRAINING'
      );
    default:
      return exerciseDatabase;
  }
}

export function getExercisesByMuscleGroup(muscleGroups: MuscleGroup[]): Exercise[] {
  return exerciseDatabase.filter(ex => 
    ex.muscleGroups.some(mg => muscleGroups.includes(mg))
  );
}

export function getExercisesByDifficulty(difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'): Exercise[] {
  return exerciseDatabase.filter(ex => ex.difficulty === difficulty);
}

export function getExercisesByEquipment(equipment: Equipment[]): Exercise[] {
  return exerciseDatabase.filter(ex => 
    ex.equipment.some(eq => equipment.includes(eq))
  );
}

export function generateAcuteVariables(exercise: Exercise, phase: string, clientLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'): AcuteVariables {
  const guidelines = optPhaseGuidelines[phase as keyof typeof optPhaseGuidelines];
  
  if (!guidelines) {
    return exercise.acuteVariables;
  }

  // Adjust based on client level
  let intensityMultiplier = 1;
  switch (clientLevel) {
    case 'BEGINNER':
      intensityMultiplier = 0.8;
      break;
    case 'INTERMEDIATE':
      intensityMultiplier = 1.0;
      break;
    case 'ADVANCED':
      intensityMultiplier = 1.2;
      break;
  }

  return {
    sets: Math.floor(Math.random() * (guidelines.sets.max - guidelines.sets.min + 1)) + guidelines.sets.min,
    reps: Math.floor(Math.random() * (guidelines.reps.max - guidelines.reps.min + 1)) + guidelines.reps.min,
    intensity: Math.floor(guidelines.intensity.min + (guidelines.intensity.max - guidelines.intensity.min) * intensityMultiplier),
    tempo: guidelines.tempo,
    restTime: Math.floor(Math.random() * (guidelines.restTime.max - guidelines.restTime.min + 1)) + guidelines.restTime.min,
    rpe: Math.floor(Math.random() * (guidelines.rpe.max - guidelines.rpe.min + 1)) + guidelines.rpe.min
  };
} 