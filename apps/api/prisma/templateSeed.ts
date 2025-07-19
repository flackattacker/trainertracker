import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding program templates...');

  // Clear existing templates
  await prisma.programTemplate.deleteMany({});

  // Get a CPT ID for the templates (you'll need to create one first or use an existing one)
  const cpt = await prisma.cPT.findFirst();
  if (!cpt) {
    console.log('No CPT found. Please create a CPT first.');
    return;
  }

  // Beginner Strength Template
  await prisma.programTemplate.create({
    data: {
      cptId: cpt.id,
      name: 'Beginner Strength Foundation',
      description: 'A 12-week program designed to build fundamental strength for beginners. Focuses on compound movements and proper form.',
      goal: 'Strength',
      experienceLevel: 'BEGINNER',
      duration: 12,
      periodizationType: 'LINEAR',
      isPublic: true
    }
  });

  // Intermediate Hypertrophy Template
  await prisma.programTemplate.create({
    data: {
      cptId: cpt.id,
      name: 'Intermediate Muscle Builder',
      description: 'A 12-week hypertrophy program for intermediate lifters. Focuses on muscle growth through moderate weights and higher volume.',
      goal: 'Muscle Growth',
      experienceLevel: 'INTERMEDIATE',
      duration: 12,
      periodizationType: 'UNDULATING',
      isPublic: true
    }
  });

  // Advanced Power Template
  await prisma.programTemplate.create({
    data: {
      cptId: cpt.id,
      name: 'Advanced Power Development',
      description: 'A 12-week power-focused program for advanced athletes. Emphasizes explosive movements and Olympic lifts.',
      goal: 'Power',
      experienceLevel: 'ADVANCED',
      duration: 12,
      periodizationType: 'CONJUGATE',
      isPublic: true
    }
  });

  // Weight Loss Template
  await prisma.programTemplate.create({
    data: {
      cptId: cpt.id,
      name: 'Weight Loss Circuit',
      description: 'A 12-week program designed for fat loss through high-intensity circuit training and metabolic conditioning.',
      goal: 'Weight Loss',
      experienceLevel: 'INTERMEDIATE',
      duration: 12,
      periodizationType: 'WAVE',
      isPublic: true
    }
  });

  // Endurance Template
  await prisma.programTemplate.create({
    data: {
      cptId: cpt.id,
      name: 'Endurance Builder',
      description: 'A 12-week program focused on building cardiovascular endurance and muscular stamina.',
      goal: 'Endurance',
      experienceLevel: 'BEGINNER',
      duration: 12,
      periodizationType: 'LINEAR',
      isPublic: true
    }
  });

  console.log('Program templates seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 