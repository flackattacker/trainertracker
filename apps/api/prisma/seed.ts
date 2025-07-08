import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a CPT (trainer)
  const hashedPassword = await bcrypt.hash('password123', 10);
  const cpt = await prisma.cPT.upsert({
    where: { email: 'jonflack@gmail.com' },
    update: {},
    create: {
      email: 'jonflack@gmail.com',
      passwordHash: hashedPassword,
    },
  });
  console.log('✅ Created CPT:', cpt.email);

  // Create a client
  const client = await prisma.client.upsert({
    where: { codeName: 'CLIENT-001' },
    update: {},
    create: {
      cptId: cpt.id,
      codeName: 'CLIENT-001',
      firstName: 'Sarah',
      lastName: 'Johnson',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'female',
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0123',
      notes: 'New client, interested in weight loss and general fitness. Has some experience with basic exercises.',
      status: 'active',
    },
  });
  console.log('✅ Created client:', client.codeName);

  // Create PARQ assessment
  const parqAssessment = await prisma.assessment.create({
    data: {
      cptId: cpt.id,
      clientId: client.id,
      type: 'PARQ',
      assessmentDate: new Date('2025-07-01'),
      assessor: 'Trainer Flack',
      notes: 'Client completed PARQ assessment. No health concerns identified.',
      status: 'COMPLETED',
      data: {
        questions: {
          q1: false, // Heart condition
          q2: false, // Chest pain
          q3: false, // Dizziness
          q4: false, // Bone/joint problem
          q5: false, // Blood pressure medication
          q6: false, // Other medical condition
          q7: false  // Pregnancy
        },
        riskLevel: 'LOW',
        clearedForExercise: true,
        requiresMedicalClearance: false,
        notes: 'Client is cleared for exercise with no restrictions'
      }
    },
  });
  console.log('✅ Created PARQ assessment');

  // Create Fitness Assessment
  const fitnessAssessment = await prisma.assessment.create({
    data: {
      cptId: cpt.id,
      clientId: client.id,
      type: 'FITNESS_ASSESSMENT',
      assessmentDate: new Date('2025-07-02'),
      assessor: 'Trainer Flack',
      notes: 'Comprehensive fitness assessment completed. Client shows good baseline fitness.',
      status: 'COMPLETED',
      data: {
        fitness: {
          restingHeartRate: 72,
          bloodPressure: '120/80',
          bodyComposition: {
            weight: 68.5, // kg
            bodyFatPercentage: 25.5,
            bmi: 23.8
          },
          flexibility: {
            sitAndReach: 15, // cm
            shoulderFlexibility: 'GOOD',
            hipFlexion: 95 // degrees
          },
          strength: {
            pushUps: 8, // max reps
            plankTime: 45, // seconds
            wallSit: 60 // seconds
          },
          cardiovascular: {
            mileRun: 12.5, // minutes
            vo2Max: 32 // ml/kg/min
          },
          balance: {
            singleLegStand: 25, // seconds
            balanceTest: 'FAIR'
          },
          notes: 'Client demonstrates fair to good baseline fitness. Areas for improvement: upper body strength, cardiovascular endurance, and balance.'
        }
      }
    },
  });
  console.log('✅ Created Fitness Assessment');

  // Create Body Composition Assessment
  const bodyCompAssessment = await prisma.assessment.create({
    data: {
      cptId: cpt.id,
      clientId: client.id,
      type: 'BODY_COMPOSITION',
      assessmentDate: new Date('2025-07-02'),
      assessor: 'Trainer Flack',
      notes: 'Body composition analysis using skinfold calipers.',
      status: 'COMPLETED',
      data: {
        bodyComposition: {
          weight: 68.5, // kg
          height: 170, // cm
          bodyFatPercentage: 25.5,
          leanBodyMass: 51.0, // kg
          fatMass: 17.5, // kg
          bmi: 23.8,
          measurements: {
            neck: 32, // cm
            chest: 95,
            waist: 78,
            hips: 98,
            biceps: 28,
            forearms: 25,
            thighs: 58,
            calves: 35
          },
          skinfolds: {
            triceps: 18, // mm
            biceps: 12,
            subscapular: 22,
            iliacCrest: 25,
            supraspinale: 20,
            abdominal: 28,
            thigh: 30,
            chest: 15,
            axilla: 16
          },
          notes: 'Body composition indicates healthy weight with room for improvement in body fat percentage.'
        }
      }
    },
  });
  console.log('✅ Created Body Composition Assessment');

  // Create Progress entries over the last 4 weeks
  const progressEntries = [
    {
      date: new Date('2025-06-10'),
      weight: 70.2,
      bodyFat: 26.8,
      notes: 'Initial progress check-in. Starting baseline established.',
      data: {
        metrics: {
          energyLevel: 6,
          sleepQuality: 7,
          stressLevel: 5,
          motivation: 8
        },
        mood: 'GOOD',
        workoutCompleted: true,
        workoutNotes: 'Completed 30-minute cardio session',
        nutritionNotes: 'Maintained calorie deficit, good protein intake'
      }
    },
    {
      date: new Date('2025-06-17'),
      weight: 69.8,
      bodyFat: 26.2,
      notes: 'Good progress week. Weight trending down, energy improving.',
      data: {
        metrics: {
          energyLevel: 7,
          sleepQuality: 8,
          stressLevel: 4,
          motivation: 9
        },
        mood: 'EXCELLENT',
        workoutCompleted: true,
        workoutNotes: 'Completed 3 strength training sessions',
        nutritionNotes: 'Consistent meal prep, good hydration'
      }
    },
    {
      date: new Date('2025-06-24'),
      weight: 69.1,
      bodyFat: 25.8,
      notes: 'Continued progress. Strength improving, endurance building.',
      data: {
        metrics: {
          energyLevel: 8,
          sleepQuality: 8,
          stressLevel: 3,
          motivation: 9
        },
        mood: 'EXCELLENT',
        workoutCompleted: true,
        workoutNotes: 'Increased weights on squats and deadlifts',
        nutritionNotes: 'Added more vegetables, reduced processed foods'
      }
    },
    {
      date: new Date('2025-07-01'),
      weight: 68.5,
      bodyFat: 25.5,
      notes: 'Excellent progress! Reached first milestone. Ready for program progression.',
      data: {
        metrics: {
          energyLevel: 8,
          sleepQuality: 9,
          stressLevel: 3,
          motivation: 10
        },
        mood: 'EXCELLENT',
        workoutCompleted: true,
        workoutNotes: 'Completed all planned workouts, feeling stronger',
        nutritionNotes: 'Consistent with nutrition plan, seeing results'
      }
    }
  ];

  for (const entry of progressEntries) {
    await prisma.progress.create({
      data: {
        cptId: cpt.id,
        clientId: client.id,
        date: entry.date,
        weight: entry.weight,
        bodyFat: entry.bodyFat,
        notes: entry.notes,
        data: entry.data
      },
    });
  }
  console.log('✅ Created 4 progress entries');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Seed Data Summary:');
  console.log(`- CPT: ${cpt.email}`);
  console.log(`- Client: ${client.codeName} (${client.firstName} ${client.lastName})`);
  console.log(`- Assessments: 3 (PARQ, Fitness, Body Composition)`);
  console.log(`- Progress Entries: 4 (4 weeks of tracking)`);
  console.log('\n🔑 Login Credentials:');
  console.log(`- Email: ${cpt.email}`);
  console.log(`- Password: password123`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 