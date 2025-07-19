import { PrismaClient, Difficulty } from '@prisma/client';
import { exerciseDatabase } from '../src/lib/exerciseDatabase';

const prisma = new PrismaClient();

// Map our exercise categories to database categories
const categoryMapping = {
  'STABILITY_TRAINING': 'Core & Stability',
  'STRENGTH_TRAINING': 'Compound Movements',
  'POWER_TRAINING': 'Olympic Lifts',
  'CARDIOVASCULAR_TRAINING': 'Cardiovascular',
  'FLEXIBILITY_TRAINING': 'Flexibility & Mobility',
  'BALANCE_TRAINING': 'Core & Stability',
  'PLYOMETRIC_TRAINING': 'Plyometric',
  'FUNCTIONAL_TRAINING': 'Compound Movements'
};

// Map our difficulty levels to Prisma enum
const difficultyMapping = {
  'BEGINNER': Difficulty.BEGINNER,
  'INTERMEDIATE': Difficulty.INTERMEDIATE,
  'ADVANCED': Difficulty.ADVANCED
};

async function seedExercises() {
  console.log('🌱 Starting comprehensive exercise database seed...');

  // Create exercise categories if they don't exist
  const categories = [
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

  for (const category of categories) {
    await prisma.exerciseCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }
  console.log('✅ Created exercise categories');

  // Create exercises from our comprehensive database
  let createdCount = 0;
  let updatedCount = 0;

  for (const exercise of exerciseDatabase) {
    try {
      // Map category
      const categoryName = categoryMapping[exercise.category as keyof typeof categoryMapping] || 'Compound Movements';
    const category = await prisma.exerciseCategory.findUnique({
        where: { name: categoryName }
    });

      if (!category) {
        console.warn(`Category not found: ${categoryName}, skipping exercise: ${exercise.name}`);
        continue;
      }

             // Map difficulty
       const difficulty = difficultyMapping[exercise.difficulty as keyof typeof difficultyMapping];

      // Create or update exercise
      const result = await prisma.exercise.upsert({
        where: { name: exercise.name },
        update: {
          description: exercise.instructions,
          categoryId: category.id,
          muscleGroups: exercise.muscleGroups,
          equipment: exercise.equipment,
          difficulty: difficulty,
          instructions: exercise.instructions,
          isPublic: true
        },
        create: {
          name: exercise.name,
          description: exercise.instructions,
          categoryId: category.id,
          muscleGroups: exercise.muscleGroups,
          equipment: exercise.equipment,
          difficulty: difficulty,
          instructions: exercise.instructions,
          isPublic: true
        }
      });

      if (result) {
        createdCount++;
    }
    } catch (error) {
      console.error(`Error creating exercise ${exercise.name}:`, error);
    }
  }

  console.log(`✅ Exercise seeding completed!`);
  console.log(`📊 Created/Updated ${createdCount} exercises`);
  console.log(`📚 Total exercises in database: ${exerciseDatabase.length}`);

  // Verify the seeding
  const totalExercises = await prisma.exercise.count();
  console.log(`🔍 Total exercises in database after seeding: ${totalExercises}`);

  // Show some sample exercises by category
  const categoriesWithCounts = await prisma.exerciseCategory.findMany({
    include: {
      _count: {
        select: { exercises: true }
      }
      }
  });

  console.log('\n📋 Exercises by category:');
  categoriesWithCounts.forEach(cat => {
    console.log(`  ${cat.name}: ${cat._count.exercises} exercises`);
  });

  console.log('\n🎉 Exercise database seeding completed successfully!');
}

async function main() {
  try {
    await seedExercises();
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
main();

export { seedExercises }; 