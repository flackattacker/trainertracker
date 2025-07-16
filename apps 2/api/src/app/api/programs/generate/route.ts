export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';
import { 
  exerciseDatabase, 
  getExercisesByPhase, 
  getExercisesByDifficulty, 
  generateAcuteVariables,
  type Exercise 
} from '../../../../lib/exerciseDatabase';

const prisma = new PrismaClient();
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Since middleware already verifies the token, we can get the user ID from headers
function getCptIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

function buildPrompt(client: any, assessments: any[], progress: any[]) {
  return `You are a certified personal trainer using the NASM OPT (Optimum Performance Training) model. Based on the following client data, generate a comprehensive OPT training program that can be used as the foundation for progress tracking.

The OPT model consists of 5 phases:
1. STABILIZATION_ENDURANCE - Focus on stability, core strength, and muscular endurance
2. STRENGTH_ENDURANCE - Build strength while maintaining stability
3. MUSCULAR_DEVELOPMENT - Focus on muscle growth and hypertrophy
4. MAXIMAL_STRENGTH - Develop maximal strength and force production
5. POWER - Develop explosive power and speed

Client Information:
- Code: ${client.codeName}
- Status: ${client.status}
- Gender: ${client.gender}
- Age: ${Math.floor((new Date().getTime() - new Date(client.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old

Assessment History:
${assessments.map(a => `- ${a.type} (${a.assessmentDate}): ${JSON.stringify(a.data)}`).join('\n')}

Progress History:
${progress.map(p => `- ${p.date}: ${JSON.stringify(p.data)}`).join('\n')}

Available Exercises Database:
${exerciseDatabase.map(ex => `- ${ex.name} (${ex.category}): ${ex.muscleGroups.join(', ')} - ${ex.difficulty}`).join('\n')}

Generate a comprehensive OPT training program with the following structure:

1. **Phase Selection**: Choose the most appropriate OPT phase based on client assessment and progress
2. **Training Objectives**: Specific, measurable goals for this phase
3. **Weekly Workout Structure**: Detailed 4-week program with:
   - Specific exercises from the database with proper acute variables
   - Exercise progressions and regressions
   - Proper exercise order and supersets
   - Warm-up and cool-down protocols
4. **Progress Tracking Metrics**: Specific measurements to track progress
5. **Assessment Criteria**: Clear benchmarks for phase completion
6. **Nutrition Guidelines**: Basic nutrition recommendations
7. **Recovery Guidelines**: Recovery and rest recommendations

Return only valid JSON with this exact structure:
{
  "name": "OPT Training Program",
  "description": "Systematic training program following the Optimum Performance Training model",
  "optPhase": "STABILIZATION_ENDURANCE",
  "primaryGoal": "Improve overall fitness and movement quality",
  "secondaryGoals": ["Enhance joint stability", "Improve muscular endurance"],
  "duration": 12,
  "difficulty": "BEGINNER",
  "phases": [{
    "name": "STABILIZATION_ENDURANCE",
    "duration": 4,
    "focus": "Improve muscular endurance, joint stability, and neuromuscular efficiency",
    "trainingObjectives": [
      "Enhance joint stability and postural control",
      "Improve muscular endurance",
      "Develop neuromuscular efficiency",
      "Establish proper movement patterns"
    ],
    "weeklyPlans": [{
      "week": 1,
      "workouts": [{
        "day": "Monday",
        "focus": "Upper Body Stability",
        "exercises": [{
          "exerciseId": "plank",
          "name": "Plank",
          "sets": 3,
          "reps": "30 seconds",
          "rest": "60 seconds",
          "tempo": "4-2-2",
          "rpe": 5,
          "notes": "Maintain neutral spine"
        }]
      }]
    }],
    "progressionRules": {
      "repIncrease": 2,
      "volumeIncrease": 10,
      "intensityIncrease": 5
    },
    "assessmentCriteria": [
      "Static postural assessment",
      "Dynamic movement assessment",
      "Core stability tests",
      "Muscular endurance tests"
    ]
  }],
  "nutritionGuidelines": "Focus on whole foods, adequate protein, and proper hydration",
  "recoveryGuidelines": "Ensure adequate sleep, active recovery, and stress management",
  "progressTracking": {
    "metrics": ["Body composition", "Strength", "Endurance", "Movement quality"],
    "frequency": "WEEKLY",
    "assessments": ["Weekly body weight", "Monthly body composition", "Bi-weekly strength tests"]
  },
  "notes": ""
}

IMPORTANT: Use only exercises from the provided database. For each exercise, include the exerciseId, name, sets, reps (or duration), rest time, tempo, RPE, and any specific notes.`;
}

function determineClientLevel(client: any, assessments: any[], progress: any[]): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
  // Analyze client data to determine fitness level
  const age = Math.floor((new Date().getTime() - new Date(client.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  
  // Check for strength assessments
  const strengthAssessment = assessments.find(a => a.type === 'STRENGTH');
  const fitnessAssessment = assessments.find(a => a.type === 'FITNESS_ASSESSMENT');
  
  if (strengthAssessment) {
    const data = strengthAssessment.data as any;
    if (data.benchPress && data.benchPress > 100) return 'ADVANCED';
    if (data.benchPress && data.benchPress > 60) return 'INTERMEDIATE';
  }
  
  if (fitnessAssessment) {
    const data = fitnessAssessment.data as any;
    if (data.fitness?.pushUps && data.fitness.pushUps > 20) return 'ADVANCED';
    if (data.fitness?.pushUps && data.fitness.pushUps > 10) return 'INTERMEDIATE';
  }
  
  // Default based on age and status
  if (age < 30 && client.status === 'active') return 'INTERMEDIATE';
  return 'BEGINNER';
}

interface WorkoutExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  tempo: string;
  rpe?: number;
  notes: string;
}

interface Workout {
  day: string;
  focus: string;
  exercises: WorkoutExercise[];
}

interface WeeklyPlan {
  week: number;
  workouts: Workout[];
}

function generateWorkoutPlan(phase: string, clientLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'): WeeklyPlan[] {
  const exercises = getExercisesByPhase(phase);
  const levelExercises = exercises.filter((ex: Exercise) => ex.difficulty === clientLevel || 
    (clientLevel === 'BEGINNER' && ex.difficulty === 'BEGINNER') ||
    (clientLevel === 'INTERMEDIATE' && ['BEGINNER', 'INTERMEDIATE'].includes(ex.difficulty)) ||
    (clientLevel === 'ADVANCED' && ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(ex.difficulty))
  );

  const weeklyPlans: WeeklyPlan[] = [];
  
  for (let week = 1; week <= 4; week++) {
    const workouts: Workout[] = [];
    
    // Generate 3-4 workouts per week
    const workoutDays = ['Monday', 'Wednesday', 'Friday'];
    if (clientLevel === 'ADVANCED') workoutDays.push('Saturday');
    
    workoutDays.forEach((day, index) => {
      const workoutFocus = index === 0 ? 'Upper Body' : index === 1 ? 'Lower Body' : index === 2 ? 'Full Body' : 'Power/Performance';
      const workoutExercises: WorkoutExercise[] = [];
      
      // Select 4-6 exercises per workout
      const numExercises = clientLevel === 'BEGINNER' ? 4 : clientLevel === 'INTERMEDIATE' ? 5 : 6;
      const selectedExercises = levelExercises
        .filter((ex: Exercise) => {
          if (workoutFocus === 'Upper Body') {
            return ['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'CORE'].some(mg => ex.muscleGroups.includes(mg as any));
          } else if (workoutFocus === 'Lower Body') {
            return ['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES', 'CORE'].some(mg => ex.muscleGroups.includes(mg as any));
          } else if (workoutFocus === 'Full Body') {
            return ex.muscleGroups.includes('FULL_BODY' as any) || ex.muscleGroups.length > 2;
          } else {
            return ex.category === 'POWER_TRAINING' || ex.category === 'PLYOMETRIC_TRAINING';
          }
        })
        .slice(0, numExercises);
      
      selectedExercises.forEach((exercise: Exercise) => {
        const acuteVars = generateAcuteVariables(exercise, phase, clientLevel);
        workoutExercises.push({
          exerciseId: exercise.id,
          name: exercise.name,
          sets: acuteVars.sets,
          reps: acuteVars.reps ? `${acuteVars.reps} reps` : acuteVars.duration ? `${acuteVars.duration} seconds` : 'As prescribed',
          rest: `${acuteVars.restTime} seconds`,
          tempo: acuteVars.tempo || '2-0-2',
          rpe: acuteVars.rpe,
          notes: exercise.instructions
        });
      });
      
      workouts.push({
        day,
        focus: workoutFocus,
        exercises: workoutExercises
      });
    });
    
    weeklyPlans.push({
      week,
      workouts
    });
  }
  
  return weeklyPlans;
}

export async function POST(req: NextRequest) {
  try {
    const cptId = getCptIdFromRequest(req);
    if (!cptId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clientId } = await req.json();
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Get client data
    const client = await prisma.client.findUnique({
      where: { id: clientId, cptId },
    });
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Get client assessments and progress
    const assessments = await prisma.assessment.findMany({
      where: { clientId, cptId },
      orderBy: { assessmentDate: 'desc' },
    });

    const progress = await prisma.progress.findMany({
      where: { clientId, cptId },
      orderBy: { date: 'desc' },
    });

    // Determine client level
    const clientLevel = determineClientLevel(client, assessments, progress);

    // Build AI prompt
    const prompt = buildPrompt(client, assessments, progress);

    console.log('AI Generation: Sending request to OpenAI...');
    
    // Generate program with AI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a certified personal trainer with expertise in the NASM OPT model. Generate comprehensive, scientifically-based training programs.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('AI Generation: Received response from OpenAI');

    // Parse AI response
    let programData;
    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      programData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('AI Generation: Error parsing AI response:', parseError);
      console.log('AI Generation: Raw AI response:', aiResponse);
      throw new Error('Failed to parse AI response');
    }

    // Enhance the AI-generated program with exercise database integration
    const enhancedProgramData = {
      ...programData,
      phases: programData.phases.map((phase: any) => ({
        ...phase,
        weeklyPlans: generateWorkoutPlan(phase.name, clientLevel)
      }))
    };

    console.log('AI Generation: Enhanced program data generated');

    return NextResponse.json({
      success: true,
      program: enhancedProgramData,
      message: 'AI program generation completed successfully'
    });

  } catch (error) {
    console.error('AI Generation: Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate program', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 