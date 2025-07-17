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

function calculateAge(dateOfBirth: string): number {
  try {
    const birthDate = new Date(dateOfBirth);
    if (!isNaN(birthDate.getTime())) {
      const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age > 0 && age < 120) {
        return age;
      }
    }
  } catch (error) {
    console.log('Error calculating client age:', error);
  }
  return 25; // Default age
}

function buildPrompt(client: any, assessments: any[], progress: any[], formData: any) {
  const clientAge = formData.clientAge || calculateAge(client.dateOfBirth);

  // Simplified acute variables based on OPT phase
  const getAcuteVariables = (phase: string) => {
    switch (phase) {
      case 'STABILIZATION_ENDURANCE':
        return { sets: '1-3', reps: '12-20', tempo: '4-2-1', rest: '0-90s', rpe: '3-5', workouts: '2-4' };
      case 'STRENGTH_ENDURANCE':
        return { sets: '2-4', reps: '8-12', tempo: '3-1-2', rest: '60-120s', rpe: '5-7', workouts: '3-4' };
      case 'MUSCULAR_DEVELOPMENT':
      case 'HYPERTROPHY':
        return { sets: '3-5', reps: '6-12', tempo: '2-1-2', rest: '90-180s', rpe: '7-9', workouts: '4-5' };
      case 'MAXIMAL_STRENGTH':
        return { sets: '4-6', reps: '1-5', tempo: '1-1-1', rest: '180-300s', rpe: '8-10', workouts: '3-4' };
      case 'POWER':
        return { sets: '3-5', reps: '1-10', tempo: '1-1-1', rest: '180-300s', rpe: '8-10', workouts: '3-4' };
      default:
        return { sets: '3-5', reps: '6-12', tempo: '2-1-2', rest: '90-180s', rpe: '7-9', workouts: '4-5' };
    }
  };

  const acute = getAcuteVariables(formData.optPhase);

  return `Create a ${formData.duration}-week NASM OPT ${formData.optPhase} program for ${clientAge}yo ${client.gender} ${formData.experienceLevel} client.

Goal: ${formData.primaryGoal}
Acute variables: ${acute.sets} sets, ${acute.reps} reps, ${acute.tempo} tempo, ${acute.rest} rest, RPE ${acute.rpe}, ${acute.workouts} workouts/week

Return JSON with ${formData.duration} weeks, ${acute.workouts} workouts per week:
{
  "name": "OPT Program",
  "optPhase": "${formData.optPhase === 'HYPERTROPHY' ? 'MUSCULAR_DEVELOPMENT' : formData.optPhase}",
  "phases": [{
    "name": "${formData.optPhase === 'HYPERTROPHY' ? 'MUSCULAR_DEVELOPMENT' : formData.optPhase}",
    "weeklyPlans": [
      {
        "week": 1,
        "workouts": [
          {
            "day": "Monday",
            "focus": "Upper Body",
            "exercises": [
              {
                "exerciseId": "bench_press",
                "name": "Bench Press",
                "sets": 3,
                "reps": "8-12",
                "rest": "90s",
                "tempo": "2-1-2",
                "rpe": 7,
                "notes": "Focus on form"
              }
            ]
          }
        ]
      }
    ]
  }]
}`;
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

    const requestBody = await req.json();
    console.log('Backend: Received request body:', requestBody);
    
    const { clientId, programName, clientAge, primaryGoal, secondaryGoals, optPhase, experienceLevel, duration } = requestBody;
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
      clientAge: clientAge || null,
      primaryGoal,
      secondaryGoals,
      optPhase: optPhase || 'STABILIZATION_ENDURANCE',
      experienceLevel: experienceLevel || 'BEGINNER',
      duration: duration || 12
    };

    const clientLevel = determineClientLevel(client, assessments, progress, formData);

    // Build AI prompt with form data
    const prompt = buildPrompt(client, assessments, progress, formData);

    // Get acute variables for logging
    const getAcuteVariables = (phase: string) => {
      switch (phase) {
        case 'STABILIZATION_ENDURANCE':
          return { sets: '1-3', reps: '12-20', workouts: '2-4' };
        case 'STRENGTH_ENDURANCE':
          return { sets: '2-4', reps: '8-12', workouts: '3-4' };
        case 'MUSCULAR_DEVELOPMENT':
        case 'HYPERTROPHY':
          return { sets: '3-5', reps: '6-12', workouts: '4-5' };
        case 'MAXIMAL_STRENGTH':
          return { sets: '4-6', reps: '1-5', workouts: '3-4' };
        case 'POWER':
          return { sets: '3-5', reps: '1-10', workouts: '3-4' };
        default:
          return { sets: '3-5', reps: '6-12', workouts: '4-5' };
      }
    };
    
    const acute = getAcuteVariables(formData.optPhase);
    console.log('AI Generation: OPT Phase Guidelines for', formData.optPhase);
    console.log('AI Generation: Sets range:', acute.sets);
    console.log('AI Generation: Reps range:', acute.reps);
    console.log('AI Generation: Workouts per week:', acute.workouts);

    console.log('AI Generation: Sending request to OpenAI...');
    
    // Generate program with AI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a NASM-certified trainer. Generate complete training programs with all weeks and workouts as specified. Use MUSCULAR_DEVELOPMENT instead of HYPERTROPHY.'
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
    console.log('AI Generation: Response length:', aiResponse.length);
    console.log('AI Generation: Raw response preview:', aiResponse.substring(0, 500));

    // Parse AI response
    let programData;
    try {
      // Extract JSON from AI response with more robust matching
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('AI Generation: No JSON found in AI response');
        console.log('AI Generation: Raw AI response:', aiResponse);
        throw new Error('No JSON found in AI response');
      }
      
      let jsonString = jsonMatch[0];
      console.log('AI Generation: Extracted JSON string length:', jsonString.length);
      console.log('AI Generation: JSON preview:', jsonString.substring(0, 500));
      
      // Try to fix common JSON issues
      try {
        programData = JSON.parse(jsonString);
      } catch (initialParseError) {
        console.log('AI Generation: Initial JSON parse failed, attempting to fix common issues');
        
        // Try to fix incomplete JSON by finding the last complete object
        const lastBraceIndex = jsonString.lastIndexOf('}');
        if (lastBraceIndex > 0) {
          const truncatedJson = jsonString.substring(0, lastBraceIndex + 1);
          console.log('AI Generation: Attempting to parse truncated JSON');
          try {
            programData = JSON.parse(truncatedJson);
            console.log('AI Generation: Successfully parsed truncated JSON');
          } catch (truncatedError) {
            console.log('AI Generation: Truncated JSON also failed, using fallback');
            throw truncatedError;
          }
        } else {
          throw initialParseError;
        }
      }
      
      // Post-process to ensure correct terminology
      if (programData.optPhase === 'HYPERTROPHY') {
        console.log('AI Generation: Converting HYPERTROPHY to MUSCULAR_DEVELOPMENT');
        programData.optPhase = 'MUSCULAR_DEVELOPMENT';
      }
      if (programData.phases && Array.isArray(programData.phases)) {
        programData.phases.forEach((phase: any) => {
          if (phase.name === 'HYPERTROPHY') {
            console.log('AI Generation: Converting phase name HYPERTROPHY to MUSCULAR_DEVELOPMENT');
            phase.name = 'MUSCULAR_DEVELOPMENT';
          }
        });
      }
      
      console.log('AI Generation: Successfully parsed JSON:', programData);
    } catch (parseError) {
      console.error('AI Generation: Error parsing AI response:', parseError);
      console.log('AI Generation: Raw AI response length:', aiResponse.length);
      console.log('AI Generation: Raw AI response preview:', aiResponse.substring(0, 1000));
      
      // Instead of throwing an error, use fallback generator
      console.log('AI Generation: Using fallback generator due to JSON parsing failure');
      programData = {
        name: programName || `${primaryGoal} Program`,
        description: `AI-generated program for ${primaryGoal}`,
        optPhase: formData.optPhase,
        phases: []
      };
    }

    console.log('AI Generation: Parsed programData:', JSON.stringify(programData, null, 2));

    // Transform AI response to match frontend Program interface
    const transformedProgram = {
      id: `ai-generated-${Date.now()}`,
      name: programName || programData.name || `${primaryGoal} Program`,
      description: programData.description || `AI-generated program for ${primaryGoal}`,
      goal: primaryGoal,
      experienceLevel: formData.experienceLevel,
      duration: formData.duration,
      optPhase: programData.optPhase, // Use the processed optPhase from AI response
      primaryGoal: formData.primaryGoal,
      secondaryGoals: formData.secondaryGoals,
      aiGenerated: true,
      workouts: [] as any[]
    };

    // Try to use AI-generated workouts if available
    let usedAI = false;
    if (
      programData.phases &&
      Array.isArray(programData.phases) &&
      programData.phases[0]?.weeklyPlans &&
      Array.isArray(programData.phases[0].weeklyPlans)
    ) {
      console.log('AI Generation: Found phases and weeklyPlans');
      console.log('AI Generation: Number of phases:', programData.phases.length);
      console.log('AI Generation: Number of weekly plans:', programData.phases[0].weeklyPlans.length);
      
      // Flatten AI weeklyPlans into workouts
      programData.phases[0].weeklyPlans.forEach((weekPlan: any, weekIdx: number) => {
        console.log(`AI Generation: Processing week ${weekIdx + 1}, workouts:`, weekPlan.workouts?.length || 0);
        if (weekPlan.workouts && Array.isArray(weekPlan.workouts)) {
          weekPlan.workouts.forEach((workout: any, dayIdx: number) => {
            console.log(`AI Generation: Processing workout ${dayIdx + 1}, exercises:`, workout.exercises?.length || 0);
            const workoutDay = {
              id: `week-${weekIdx + 1}-day-${dayIdx + 1}`,
              name: `Week ${weekIdx + 1} - ${workout.day || 'Day'} (${workout.focus || ''})`,
              exercises: (workout.exercises || []).map((exercise: any, exIdx: number) => ({
                id: `exercise-${weekIdx}-${dayIdx}-${exIdx}`,
                exerciseId: exercise.exerciseId || '',
                exercise: {
                  id: exercise.exerciseId || '',
                  name: exercise.name || '',
                  description: exercise.notes || '',
                  category: { id: '1', name: 'Strength Training' },
                  muscleGroups: [],
                  equipment: [],
                  difficulty: formData.experienceLevel,
                  instructions: exercise.notes || ''
                },
                sets: exercise.sets || 0,
                reps: parseInt(exercise.reps) || undefined,
                restTime: parseInt(exercise.rest) || undefined,
                tempo: exercise.tempo,
                rpe: exercise.rpe,
                notes: exercise.notes,
                order: exIdx
              }))
            };
            transformedProgram.workouts.push(workoutDay);
          });
        }
      });
      usedAI = transformedProgram.workouts.length > 0;
      console.log('AI Generation: Total workouts processed:', transformedProgram.workouts.length);
      
      // Log acute variable compliance
      if (transformedProgram.workouts.length > 0) {
        const firstWorkout = transformedProgram.workouts[0];
        if (firstWorkout.exercises && firstWorkout.exercises.length > 0) {
          const firstExercise = firstWorkout.exercises[0];
          console.log('AI Generation: Sample exercise acute variables:');
          console.log('  - Sets:', firstExercise.sets);
          console.log('  - Reps:', firstExercise.reps);
          console.log('  - Rest:', firstExercise.restTime);
          console.log('  - Tempo:', firstExercise.tempo);
          console.log('  - RPE:', firstExercise.rpe);
        }
      }
    } else {
      console.log('AI Generation: No valid phases/weeklyPlans found, using fallback');
    }

    // Fallback to local generator if AI failed
    if (!usedAI) {
      const weeklyPlans = generateWorkoutPlan(formData.optPhase, clientLevel, formData.duration);
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
    }

    console.log('AI Generation: Final workouts array:', JSON.stringify(transformedProgram.workouts, null, 2));

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