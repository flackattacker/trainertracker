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

function buildPrompt(client: any, assessments: any[], progress: any[], formData: any) {
  return `You are a certified personal trainer using the NASM OPT (Optimum Performance Training) model. Based on the following client data and trainer specifications, generate a comprehensive OPT training program.

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

Trainer Specifications:
- OPT Phase: ${formData.optPhase}
- Primary Goal: ${formData.primaryGoal}
- Secondary Goals: ${formData.secondaryGoals || 'Not specified'}
- Experience Level: ${formData.experienceLevel}
- Duration: ${formData.duration} weeks

Assessment History:
${assessments.map(a => `- ${a.type} (${a.assessmentDate}): ${JSON.stringify(a.data)}`).join('\n')}

Progress History:
${progress.map(p => `- ${p.date}: ${JSON.stringify(p.data)}`).join('\n')}

Generate a comprehensive OPT training program with the following structure:

1. **Phase Selection**: Use the specified OPT phase (${formData.optPhase})
2. **Training Objectives**: Specific, measurable goals based on the primary goal: ${formData.primaryGoal}
3. **Weekly Workout Structure**: Detailed ${formData.duration}-week program with:
   - Appropriate exercises for the ${formData.experienceLevel} level
   - Exercise progressions and regressions
   - Proper exercise order and supersets
   - Warm-up and cool-down protocols
4. **Progress Tracking Metrics**: Specific measurements to track progress toward the primary goal
5. **Assessment Criteria**: Clear benchmarks for phase completion
6. **Nutrition Guidelines**: Basic nutrition recommendations
7. **Recovery Guidelines**: Recovery and rest recommendations

Return only valid JSON with this exact structure:
{
  "name": "OPT Training Program",
  "description": "Systematic training program following the Optimum Performance Training model",
  "optPhase": "${formData.optPhase}",
  "primaryGoal": "${formData.primaryGoal}",
  "secondaryGoals": ${formData.secondaryGoals ? `["${formData.secondaryGoals.split(',').map((s: string) => s.trim()).join('", "')}"]` : '[]'},
  "duration": ${formData.duration},
  "difficulty": "${formData.experienceLevel}",
  "phases": [{
    "name": "${formData.optPhase}",
    "duration": ${formData.duration},
    "focus": "Focus description based on the primary goal",
    "trainingObjectives": [
      "Objective 1 based on primary goal",
      "Objective 2 based on primary goal",
      "Objective 3 based on primary goal"
    ],
    "weeklyPlans": [{
      "week": 1,
      "workouts": [{
        "day": "Monday",
        "focus": "Workout focus",
        "exercises": [{
          "exerciseId": "exercise_id",
          "name": "Exercise Name",
          "sets": 3,
          "reps": "10 reps",
          "rest": "60 seconds",
          "tempo": "2-0-2",
          "rpe": 6,
          "notes": "Exercise notes"
        }]
      }]
    }],
    "progressionRules": {
      "repIncrease": 2,
      "volumeIncrease": 10,
      "intensityIncrease": 5
    },
    "assessmentCriteria": [
      "Assessment 1",
      "Assessment 2",
      "Assessment 3"
    ]
  }],
  "nutritionGuidelines": "Focus on whole foods, adequate protein, and proper hydration",
  "recoveryGuidelines": "Ensure adequate sleep, active recovery, and stress management",
  "progressTracking": {
    "metrics": ["Metric 1", "Metric 2", "Metric 3"],
    "frequency": "WEEKLY",
    "assessments": ["Assessment 1", "Assessment 2"]
  },
  "notes": ""
}

IMPORTANT: 
- Use the specified OPT phase: ${formData.optPhase}
- Focus on the primary goal: ${formData.primaryGoal}
- Design for ${formData.experienceLevel} experience level
- Create a ${formData.duration}-week program
- Include appropriate exercises and acute variables for the experience level
- Ensure the program aligns with the client's assessment data and progress history`;
}

function determineClientLevel(client: any, assessments: any[], progress: any[], formData: any): 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' {
  // Use the experience level from the form data
  return formData.experienceLevel;
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

function generateWorkoutPlan(phase: string, clientLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED', duration: number = 4): WeeklyPlan[] {
  const exercises = getExercisesByPhase(phase);
  const levelExercises = exercises.filter((ex: Exercise) => ex.difficulty === clientLevel || 
    (clientLevel === 'BEGINNER' && ex.difficulty === 'BEGINNER') ||
    (clientLevel === 'INTERMEDIATE' && ['BEGINNER', 'INTERMEDIATE'].includes(ex.difficulty)) ||
    (clientLevel === 'ADVANCED' && ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(ex.difficulty))
  );

  const weeklyPlans: WeeklyPlan[] = [];
  
  for (let week = 1; week <= duration; week++) {
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

    const { clientId, primaryGoal, secondaryGoals, optPhase, experienceLevel, duration } = await req.json();
    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    if (!primaryGoal) {
      return NextResponse.json({ error: 'Primary goal is required' }, { status: 400 });
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

    // Use form data for client level and other specifications
    const formData = {
      primaryGoal,
      secondaryGoals,
      optPhase: optPhase || 'STABILIZATION_ENDURANCE',
      experienceLevel: experienceLevel || 'BEGINNER',
      duration: duration || 12
    };

    const clientLevel = determineClientLevel(client, assessments, progress, formData);

    // Build AI prompt with form data
    const prompt = buildPrompt(client, assessments, progress, formData);

    console.log('AI Generation: Sending request to OpenAI...');
    
    // Generate program with AI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a certified personal trainer with expertise in the NASM OPT model. Generate comprehensive, scientifically-based training programs based on trainer specifications and client data.'
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

    // Transform AI response to match frontend Program interface
    const transformedProgram = {
      id: `ai-generated-${Date.now()}`,
      name: programData.name || `${primaryGoal} Program`,
      description: programData.description || `AI-generated program for ${primaryGoal}`,
      goal: primaryGoal,
      experienceLevel: formData.experienceLevel,
      duration: formData.duration,
      optPhase: formData.optPhase,
      primaryGoal: formData.primaryGoal,
      secondaryGoals: formData.secondaryGoals,
      aiGenerated: true,
      workouts: [] as any[]
    };

    // Generate workout plan and transform to frontend format
    const weeklyPlans = generateWorkoutPlan(formData.optPhase, clientLevel, formData.duration);
    
    // Flatten weekly plans into individual workout days
    weeklyPlans.forEach((weekPlan, weekIndex) => {
      weekPlan.workouts.forEach((workout, dayIndex) => {
        const workoutDay = {
          id: `week-${weekIndex + 1}-day-${dayIndex + 1}`,
          name: `Week ${weekIndex + 1} - ${workout.day} (${workout.focus})`,
          exercises: workout.exercises.map((exercise, exerciseIndex) => ({
            id: `exercise-${weekIndex}-${dayIndex}-${exerciseIndex}`,
            exerciseId: exercise.exerciseId,
            exercise: {
              id: exercise.exerciseId,
              name: exercise.name,
              description: exercise.notes || '',
              category: { id: '1', name: 'Strength Training' },
              muscleGroups: [],
              equipment: [],
              difficulty: formData.experienceLevel,
              instructions: exercise.notes || ''
            },
            sets: exercise.sets,
            reps: parseInt(exercise.reps) || undefined,
            restTime: parseInt(exercise.rest) || undefined,
            tempo: exercise.tempo,
            rpe: exercise.rpe,
            notes: exercise.notes,
            order: exerciseIndex
          }))
        };
        transformedProgram.workouts.push(workoutDay);
      });
    });

    console.log('AI Generation: Transformed program data for frontend');

    return NextResponse.json({
      success: true,
      program: transformedProgram,
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