import { PrismaClient, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

const exerciseCategories = [
  { name: 'Compound Movements', description: 'Multi-joint exercises that work multiple muscle groups' },
  { name: 'Isolation Movements', description: 'Single-joint exercises that target specific muscles' },
  { name: 'Cardiovascular', description: 'Aerobic and anaerobic conditioning exercises' },
  { name: 'Bodyweight', description: 'Exercises using only body weight as resistance' },
  { name: 'Plyometric', description: 'Explosive movements for power development' },
  { name: 'Core & Stability', description: 'Exercises for core strength and stability' },
  { name: 'Flexibility & Mobility', description: 'Stretching and mobility exercises' },
  { name: 'Olympic Lifts', description: 'Explosive compound movements for power' },
  { name: 'Kettlebell', description: 'Exercises using kettlebells' },
  { name: 'Cable & Machine', description: 'Exercises using cable machines and equipment' }
];

const exercises = [
  // Compound Movements
  {
    name: 'Barbell Squat',
    description: 'A fundamental lower body exercise that targets quadriceps, hamstrings, and glutes',
    category: 'Compound Movements',
    muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core'],
    equipment: ['Barbell', 'Squat Rack', 'Weight Plates'],
    difficulty: Difficulty.INTERMEDIATE,
    instructions: 'Stand with feet shoulder-width apart, bar on upper back, squat down until thighs are parallel to ground, then stand back up',
    videoUrl: 'https://example.com/barbell-squat.mp4'
  },
  {
    name: 'Deadlift',
    description: 'A full-body exercise that primarily targets the posterior chain',
    category: 'Compound Movements',
    muscleGroups: ['Hamstrings', 'Glutes', 'Lower Back', 'Core', 'Trapezius'],
    equipment: ['Barbell', 'Weight Plates'],
    difficulty: Difficulty.INTERMEDIATE,
    instructions: 'Stand with feet hip-width apart, grip bar with hands shoulder-width, lift bar by extending hips and knees',
    videoUrl: 'https://example.com/deadlift.mp4'
  },
  {
    name: 'Bench Press',
    description: 'A compound upper body exercise targeting chest, shoulders, and triceps',
    category: 'Compound Movements',
    muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
    equipment: ['Barbell', 'Bench', 'Weight Plates'],
    difficulty: Difficulty.INTERMEDIATE,
    instructions: 'Lie on bench, grip bar slightly wider than shoulders, lower bar to chest, then press back up',
    videoUrl: 'https://example.com/bench-press.mp4'
  },
  {
    name: 'Overhead Press',
    description: 'A compound shoulder exercise that also works triceps and core',
    category: 'Compound Movements',
    muscleGroups: ['Shoulders', 'Triceps', 'Core'],
    equipment: ['Barbell', 'Weight Plates'],
    difficulty: Difficulty.INTERMEDIATE,
    instructions: 'Stand with feet shoulder-width, hold bar at shoulder level, press overhead while keeping core tight',
    videoUrl: 'https://example.com/overhead-press.mp4'
  },
  {
    name: 'Pull-up',
    description: 'A bodyweight exercise that targets back and biceps',
    category: 'Compound Movements',
    muscleGroups: ['Back', 'Biceps', 'Core'],
    equipment: ['Pull-up Bar'],
    difficulty: Difficulty.INTERMEDIATE,
    instructions: 'Hang from pull-up bar, pull body up until chin is over bar, then lower back down',
    videoUrl: 'https://example.com/pull-up.mp4'
  },

  // Isolation Movements
  {
    name: 'Bicep Curl',
    description: 'An isolation exercise targeting the biceps',
    category: 'Isolation Movements',
    muscleGroups: ['Biceps'],
    equipment: ['Dumbbells'],
    difficulty: Difficulty.BEGINNER,
    instructions: 'Stand with dumbbells at sides, curl weights up to shoulders, then lower back down',
    videoUrl: 'https://example.com/bicep-curl.mp4'
  },
  {
    name: 'Tricep Extension',
    description: 'An isolation exercise targeting the triceps',
    category: 'Isolation Movements',
    muscleGroups: ['Triceps'],
    equipment: ['Dumbbell'],
    difficulty: Difficulty.BEGINNER,
    instructions: 'Hold dumbbell overhead, lower behind head, then extend back up',
    videoUrl: 'https://example.com/tricep-extension.mp4'
  },
  {
    name: 'Lateral Raise',
    description: 'An isolation exercise targeting the lateral deltoids',
    category: 'Isolation Movements',
    muscleGroups: ['Shoulders'],
    equipment: ['Dumbbells'],
    difficulty: Difficulty.BEGINNER,
    instructions: 'Stand with dumbbells at sides, raise arms out to sides until parallel to ground',
    videoUrl: 'https://example.com/lateral-raise.mp4'
  },

  // Bodyweight
  {
    name: 'Push-up',
    description: 'A bodyweight exercise targeting chest, shoulders, and triceps',
    category: 'Bodyweight',
    muscleGroups: ['Chest', 'Shoulders', 'Triceps', 'Core'],
    equipment: [],
    difficulty: Difficulty.BEGINNER,
    instructions: 'Start in plank position, lower body to ground, then push back up',
    videoUrl: 'https://example.com/push-up.mp4'
  },
  {
    name: 'Plank',
    description: 'A core stability exercise',
    category: 'Bodyweight',
    muscleGroups: ['Core', 'Shoulders'],
    equipment: [],
    difficulty: Difficulty.BEGINNER,
    instructions: 'Hold body in straight line from head to heels, engaging core muscles',
    videoUrl: 'https://example.com/plank.mp4'
  },

  // Cardiovascular
  {
    name: 'Running',
    description: 'Aerobic cardiovascular exercise',
    category: 'Cardiovascular',
    muscleGroups: ['Legs', 'Cardiovascular System'],
    equipment: [],
    difficulty: Difficulty.BEGINNER,
    instructions: 'Run at a steady pace, maintaining good form and breathing rhythm',
    videoUrl: 'https://example.com/running.mp4'
  },
  {
    name: 'Cycling',
    description: 'Low-impact cardiovascular exercise',
    category: 'Cardiovascular',
    muscleGroups: ['Legs', 'Cardiovascular System'],
    equipment: ['Bicycle'],
    difficulty: Difficulty.BEGINNER,
    instructions: 'Pedal at a steady pace, maintaining good posture and breathing',
    videoUrl: 'https://example.com/cycling.mp4'
  },

  // Core & Stability
  {
    name: 'Russian Twist',
    description: 'A rotational core exercise',
    category: 'Core & Stability',
    muscleGroups: ['Core', 'Obliques'],
    equipment: ['Medicine Ball'],
    difficulty: Difficulty.INTERMEDIATE,
    instructions: 'Sit with knees bent, lean back slightly, rotate torso from side to side',
    videoUrl: 'https://example.com/russian-twist.mp4'
  },
  {
    name: 'Bird Dog',
    description: 'A stability exercise for core and balance',
    category: 'Core & Stability',
    muscleGroups: ['Core', 'Glutes', 'Shoulders'],
    equipment: [],
    difficulty: Difficulty.BEGINNER,
    instructions: 'On hands and knees, extend opposite arm and leg, hold, then switch sides',
    videoUrl: 'https://example.com/bird-dog.mp4'
  }
];

const exerciseVariations = [
  {
    exerciseName: 'Barbell Squat',
    variations: [
      {
        name: 'Front Squat',
        description: 'Barbell held in front of shoulders',
        difficulty: Difficulty.ADVANCED,
        equipment: ['Barbell', 'Squat Rack', 'Weight Plates'],
        instructions: 'Hold barbell in front of shoulders, squat down maintaining upright torso',
        videoUrl: 'https://example.com/front-squat.mp4'
      },
      {
        name: 'Goblet Squat',
        description: 'Dumbbell held at chest level',
        difficulty: Difficulty.BEGINNER,
        equipment: ['Dumbbell'],
        instructions: 'Hold dumbbell vertically at chest, squat down keeping elbows close to body',
        videoUrl: 'https://example.com/goblet-squat.mp4'
      }
    ]
  },
  {
    exerciseName: 'Push-up',
    variations: [
      {
        name: 'Incline Push-up',
        description: 'Hands elevated on surface',
        difficulty: Difficulty.BEGINNER,
        equipment: ['Bench'],
        instructions: 'Place hands on elevated surface, perform push-up with reduced body weight',
        videoUrl: 'https://example.com/incline-pushup.mp4'
      },
      {
        name: 'Decline Push-up',
        description: 'Feet elevated on surface',
        difficulty: Difficulty.ADVANCED,
        equipment: ['Bench'],
        instructions: 'Place feet on elevated surface, perform push-up with increased difficulty',
        videoUrl: 'https://example.com/decline-pushup.mp4'
      }
    ]
  }
];

async function seedExercises() {
  console.log('🌱 Starting exercise database seed...');

  // Create exercise categories
  for (const category of exerciseCategories) {
    await prisma.exerciseCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }
  console.log('✅ Created exercise categories');

  // Create exercises
  for (const exercise of exercises) {
    const category = await prisma.exerciseCategory.findUnique({
      where: { name: exercise.category }
    });

    if (category) {
      await prisma.exercise.upsert({
        where: { name: exercise.name },
        update: {},
        create: {
          name: exercise.name,
          description: exercise.description,
          categoryId: category.id,
          muscleGroups: exercise.muscleGroups,
          equipment: exercise.equipment,
          difficulty: exercise.difficulty,
          instructions: exercise.instructions,
          videoUrl: exercise.videoUrl
        }
      });
    }
  }
  console.log('✅ Created exercises');

  // Create exercise variations
  for (const exerciseVariation of exerciseVariations) {
    const exercise = await prisma.exercise.findUnique({
      where: { name: exerciseVariation.exerciseName }
    });

    if (exercise) {
      for (const variation of exerciseVariation.variations) {
        await prisma.exerciseVariation.upsert({
          where: { 
            exerciseId_name: {
              exerciseId: exercise.id,
              name: variation.name
            }
          },
          update: {},
          create: {
            name: variation.name,
            description: variation.description,
            difficulty: variation.difficulty,
            equipment: variation.equipment,
            instructions: variation.instructions,
            videoUrl: variation.videoUrl || null,
            exerciseId: exercise.id
          }
        });
      }
    }
  }
  console.log('✅ Created exercise variations');

  console.log('🎉 Exercise database seeding completed successfully!');
  console.log(`📊 Seed Summary:`);
  console.log(`- Categories: ${exerciseCategories.length}`);
  console.log(`- Exercises: ${exercises.length}`);
  console.log(`- Variations: ${exerciseVariations.reduce((sum, ev) => sum + ev.variations.length, 0)}`);
}

seedExercises()
  .catch((e) => {
    console.error('❌ Error during exercise seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 