export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// Since middleware already verifies the token, we can get the user ID from headers
function getCptIdFromRequest(req: NextRequest): string | null {
  return req.headers.get('x-user-id');
}

export async function POST(req: NextRequest) {
  try {
    const cptId = getCptIdFromRequest(req);
    if (!cptId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { program, clientData, goals } = await req.json();

    if (!program || !clientData) {
      return NextResponse.json({ error: 'Program and client data required' }, { status: 400 });
    }

    // Build minimal prompt with only essential data
    const prompt = buildAnalysisPrompt(program, clientData, goals);

    console.log('AI Review: Analyzing program for client:', clientData.firstName || 'Unknown');
    console.log('AI Review: Program goal:', goals);
    console.log('AI Review: Program workouts:', program.workouts?.length || 0);
    console.log('AI Review: Sending request to OpenAI...');

    // Generate AI analysis
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a personal trainer. Analyze training programs and return JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('AI Review: Received response from OpenAI');
    console.log('AI Review: Response length:', aiResponse.length);

    // Parse AI response
    let reviewData;
    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('AI Review: No JSON found in AI response');
        console.log('AI Review: Raw AI response:', aiResponse);
        throw new Error('No JSON found in AI response');
      }
      
      let jsonString = jsonMatch[0];
      
      // Try to fix common JSON issues
      try {
        reviewData = JSON.parse(jsonString);
      } catch (initialParseError) {
        console.log('AI Review: Initial JSON parse failed, attempting to fix common issues');
        
        // Try to fix incomplete JSON by finding the last complete object
        const lastBraceIndex = jsonString.lastIndexOf('}');
        if (lastBraceIndex > 0) {
          const truncatedJson = jsonString.substring(0, lastBraceIndex + 1);
          console.log('AI Review: Attempting to parse truncated JSON');
          try {
            reviewData = JSON.parse(truncatedJson);
            console.log('AI Review: Successfully parsed truncated JSON');
          } catch (truncatedError) {
            console.log('AI Review: Truncated JSON also failed, using fallback');
            throw truncatedError;
          }
        } else {
          throw initialParseError;
        }
      }
      
      console.log('AI Review: Successfully parsed JSON');
    } catch (parseError) {
      console.error('AI Review: Error parsing AI response:', parseError);
      console.log('AI Review: Raw AI response length:', aiResponse.length);
      console.log('AI Review: Raw AI response preview:', aiResponse.substring(0, 1000));
      
      // Use fallback analysis if AI parsing fails
      console.log('AI Review: Using fallback analysis due to JSON parsing failure');
      reviewData = generateFallbackAnalysis(program, clientData, goals);
    }

    // Ensure the review has the correct structure
    const finalReview = {
      originalProgram: program,
      suggestedChanges: reviewData.suggestedChanges || [],
      overallAssessment: {
        strengths: reviewData.overallAssessment?.strengths || [],
        areasForImprovement: reviewData.overallAssessment?.areasForImprovement || [],
        recommendations: reviewData.overallAssessment?.recommendations || []
      }
    };

    console.log('AI Review: Analysis completed successfully');
    console.log('AI Review: Suggested changes:', finalReview.suggestedChanges.length);
    console.log('AI Review: Strengths identified:', finalReview.overallAssessment.strengths.length);
    console.log('AI Review: Areas for improvement:', finalReview.overallAssessment.areasForImprovement.length);
    console.log('AI Review: Recommendations:', finalReview.overallAssessment.recommendations.length);

    return NextResponse.json(finalReview);
  } catch (error) {
    console.error('AI Review: Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze program', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function buildAnalysisPrompt(program: any, clientData: any, goals: string) {
  const clientAge = calculateAge(clientData.dateOfBirth);
  const clientInfo = `${clientAge}yo ${clientData.gender}, ${clientData.experienceLevel}`;
  
  // Create minimal program summary - avoid sending full object
  const workoutNames = program.workouts?.map((w: any) => w.name).filter((name: string) => 
    !name.includes('Warmup') && !name.includes('Cooldown')
  ) || [];
  
  const totalExercises = program.workouts?.reduce((sum: number, workout: any) => 
    sum + (workout.exercises?.length || 0), 0) || 0;

  return `Analyze this training program:

CLIENT: ${clientInfo}
GOAL: ${goals}
PROGRAM: ${program.name}
MAIN WORKOUTS: ${workoutNames.join(', ')}
TOTAL EXERCISES: ${totalExercises}

Return JSON:
{
  "suggestedChanges": [
    {
      "type": "exercise|volume|progression",
      "description": "Brief description",
      "suggestedAction": "Specific action"
    }
  ],
  "overallAssessment": {
    "strengths": ["Strength 1"],
    "areasForImprovement": ["Area 1"],
    "recommendations": ["Recommendation 1"]
  }
}`;
}

function calculateAge(dateOfBirth: string | Date): number {
  try {
    // Handle different date formats
    let birthDate: Date;
    
    // If it's already a Date object or timestamp
    if (dateOfBirth instanceof Date) {
      birthDate = dateOfBirth;
    } else if (typeof dateOfBirth === 'string') {
      // Try parsing as ISO string first
      birthDate = new Date(dateOfBirth);
      
      // If that fails, try other common formats
      if (isNaN(birthDate.getTime())) {
        // Try YYYY-MM-DD format
        const parts = dateOfBirth.split('-');
        if (parts.length === 3) {
          birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
      }
      
      // If still invalid, try MM/DD/YYYY format
      if (isNaN(birthDate.getTime())) {
        const parts = dateOfBirth.split('/');
        if (parts.length === 3) {
          birthDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        }
      }
    } else {
      return 25; // Default age
    }
    
    if (!isNaN(birthDate.getTime())) {
      const now = new Date();
      const age = Math.floor((now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      if (age > 0 && age < 120) {
        return age;
      }
    }
  } catch (error) {
    console.log('AI Review: Error calculating client age:', error);
  }
  
  return 25; // Default age
}



function generateFallbackAnalysis(program: any, clientData: any, goals: string) {
  // Fallback analysis using rule-based logic (original implementation)
  const analysis = {
    suggestedChanges: [] as any[],
    overallAssessment: {
      strengths: [] as string[],
      areasForImprovement: [] as string[],
      recommendations: [] as string[]
    }
  };

  // Analyze workout structure
  if (program.workouts && program.workouts.length > 0) {
    const totalExercises = program.workouts.reduce((sum: number, workout: any) => 
      sum + (workout.exercises?.length || 0), 0);
    
    if (totalExercises < 6) {
      analysis.suggestedChanges.push({
        type: 'volume',
        description: 'Low exercise volume',
        reasoning: 'The program has fewer than 6 total exercises, which may not provide sufficient stimulus for progress.',
        suggestedAction: 'Consider adding 2-3 more exercises to ensure comprehensive muscle coverage.'
      });
    }

    if (totalExercises > 20) {
      analysis.suggestedChanges.push({
        type: 'volume',
        description: 'High exercise volume',
        reasoning: 'The program has more than 20 exercises, which may lead to overtraining and reduced recovery.',
        suggestedAction: 'Consider reducing to 12-15 exercises to optimize recovery and focus.'
      });
    }

    // Check for muscle group balance
    const muscleGroups = new Set();
    program.workouts.forEach((workout: any) => {
      workout.exercises?.forEach((exercise: any) => {
        if (exercise.exercise?.muscleGroups) {
          exercise.exercise.muscleGroups.forEach((group: string) => muscleGroups.add(group));
        }
      });
    });

    if (muscleGroups.size < 4) {
      analysis.suggestedChanges.push({
        type: 'exercise',
        description: 'Limited muscle group coverage',
        reasoning: 'The program targets fewer than 4 muscle groups, which may create imbalances.',
        suggestedAction: 'Add exercises targeting different muscle groups for balanced development.'
      });
    }
  }

  // Analyze based on goals
  const goalLower = goals.toLowerCase();
  if (goalLower.includes('strength')) {
    analysis.overallAssessment.strengths.push('Program structure supports strength development');
    analysis.overallAssessment.recommendations.push('Consider adding compound movements if not present');
  } else if (goalLower.includes('endurance')) {
    analysis.overallAssessment.strengths.push('Program focuses on endurance goals');
    analysis.overallAssessment.recommendations.push('Ensure adequate rest periods between sets');
  } else if (goalLower.includes('muscle') || goalLower.includes('hypertrophy')) {
    analysis.overallAssessment.strengths.push('Program targets muscle growth');
    analysis.overallAssessment.recommendations.push('Consider adding isolation exercises for specific muscle groups');
  }

  // Analyze based on experience level
  if (program.experienceLevel === 'BEGINNER') {
    analysis.overallAssessment.strengths.push('Appropriate for beginner level');
    analysis.overallAssessment.recommendations.push('Focus on form and technique over weight');
  } else if (program.experienceLevel === 'ADVANCED') {
    analysis.overallAssessment.strengths.push('Suitable for advanced training');
    analysis.overallAssessment.recommendations.push('Consider adding advanced techniques like supersets or drop sets');
  }

  // Check for progressive overload structure
  const hasProgressiveStructure = program.workouts?.some((workout: any) => 
    workout.exercises?.some((exercise: any) => 
      exercise.sets && exercise.reps && exercise.weight !== undefined
    )
  );

  if (!hasProgressiveStructure) {
    analysis.suggestedChanges.push({
      type: 'progression',
      description: 'Missing progressive overload structure',
      reasoning: 'The program lacks clear progression parameters for continued improvement.',
      suggestedAction: 'Add specific weight, sets, and reps targets with progression guidelines.'
    });
  }

  // Add general strengths
  if (program.duration >= 8) {
    analysis.overallAssessment.strengths.push('Good program duration for sustainable progress');
  }
  
  if (program.workouts?.length >= 3) {
    analysis.overallAssessment.strengths.push('Adequate training frequency');
  }

  // Add general recommendations
  analysis.overallAssessment.recommendations.push('Monitor client progress and adjust as needed');
  analysis.overallAssessment.recommendations.push('Ensure proper warm-up and cool-down protocols');

  return analysis;
} 