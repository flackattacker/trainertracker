export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { OpenAI } from 'openai';

const prisma = new PrismaClient();
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

    const { programId, adjustment } = await req.json();
    if (!programId || !adjustment) {
      return NextResponse.json({ error: 'Program ID and adjustment are required' }, { status: 400 });
    }

    // Get the existing program
    const existingProgram = await prisma.program.findUnique({
      where: { id: programId, cptId },
    });

    if (!existingProgram) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Build prompt for AI adjustment
    const prompt = `
You are a certified personal trainer with expertise in program design. You need to adjust an existing training program based on the trainer's specific request.

CURRENT PROGRAM:
${JSON.stringify(existingProgram, null, 2)}

TRAINER'S ADJUSTMENT REQUEST:
${adjustment}

CRITICAL INSTRUCTION: You MUST make the requested changes. Do NOT return the original program unchanged. The trainer is asking for specific modifications, and you need to implement them.

ANALYZE THE REQUEST:
- If the trainer asks to "add exercise volume for full 6 weeks" and only 1 week is populated, you MUST add the missing 5 weeks with appropriate exercises
- If the trainer asks to "increase reps", you MUST modify the reps values
- If the trainer asks to "add more exercises", you MUST add new exercises
- If the trainer asks to "change intensity", you MUST adjust sets, reps, or exercise difficulty

IMPLEMENTATION REQUIREMENTS:
1. APPLY THE SPECIFIC ADJUSTMENTS REQUESTED - This is the MOST IMPORTANT requirement
2. If adding weeks/exercises, ensure they follow proper progression and variety
3. Maintain the same overall structure and format
4. Keep existing workout days and exercises unless explicitly asked to remove them
5. Ensure all adjustments are practical and safe
6. PRESERVE THE ORIGINAL PROGRAM NAME - do not change the programName field
7. PRESERVE THE ORIGINAL PROGRAM DURATION - maintain the same number of weeks/workouts
8. Keep all other metadata fields (optPhase, primaryGoal, secondaryGoals, etc.) intact
9. Ensure the response is a complete, valid JSON object

SPECIFIC EXAMPLES FOR YOUR REQUEST:
- If asked to "add exercise volume for full 6 weeks" and only week 1 exists:
  * Add weeks 2-6 with appropriate exercises
  * Each week should have the same number of workout days as week 1
  * Vary exercises slightly between weeks for progression
  * Maintain the same exercise categories (upper body, lower body, full body)
  * Adjust sets/reps progressively across weeks

- If asked to "increase reps": Modify the "reps" field for all exercises
- If asked to "add more exercises": Add new exercises to existing workout days
- If asked to "change to higher intensity": Increase sets, reps, or add more challenging exercises

The adjusted program should be a complete replacement that incorporates ALL requested changes while maintaining the original structure.

Return only the JSON object, no additional text or explanations.
`;

    console.log('AI Adjustment: Trainer adjustment request:', adjustment);
    console.log('AI Adjustment: Current program structure:', {
      totalWeeks: (existingProgram.data as any)?.duration || 'unknown',
      currentWorkouts: (existingProgram.data as any)?.workouts?.length || 0,
      workoutNames: (existingProgram.data as any)?.workouts?.map((w: any) => w.name) || []
    });
    console.log('AI Adjustment: Sending request to OpenAI...');
    
    // Generate adjusted program with AI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a certified personal trainer with expertise in program design. Generate adjusted training programs based on trainer specifications while maintaining safety and effectiveness.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 4000,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('AI Adjustment: Received response from OpenAI');

    // Parse AI response
    let adjustedProgramData;
    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }
      adjustedProgramData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('AI Adjustment: Error parsing AI response:', parseError);
      console.log('AI Adjustment: Raw AI response:', aiResponse);
      throw new Error('Failed to parse AI response');
    }

    console.log('AI Adjustment: Successfully adjusted program');
    console.log('AI Adjustment: Raw AI response before fixes:', JSON.stringify(adjustedProgramData, null, 2));
    console.log('AI Adjustment: Original program name:', existingProgram.programName);
    console.log('AI Adjustment: Original program duration (weeks):', (existingProgram.data as any)?.duration || 'unknown');
    console.log('AI Adjustment: Original workout count:', (existingProgram.data as any)?.workouts?.length || 0);
    console.log('AI Adjustment: Adjusted workout count:', (adjustedProgramData?.data as any)?.workouts?.length || 0);

    // Ensure the adjusted program preserves the original program name
    if (adjustedProgramData && !adjustedProgramData.programName) {
      console.log('AI Adjustment: Program name missing, restoring from original');
      adjustedProgramData.programName = existingProgram.programName;
    }

    // Ensure the adjusted program preserves the original duration
    if (adjustedProgramData?.data && (existingProgram.data as any)?.duration) {
      if (!(adjustedProgramData.data as any).duration || (adjustedProgramData.data as any).duration !== (existingProgram.data as any).duration) {
        console.log('AI Adjustment: Duration mismatch, restoring from original');
        (adjustedProgramData.data as any).duration = (existingProgram.data as any).duration;
      }
    }

    console.log('AI Adjustment: Final adjusted program name:', adjustedProgramData?.programName);
    console.log('AI Adjustment: Final adjusted program duration:', (adjustedProgramData?.data as any)?.duration);

    return NextResponse.json({
      success: true,
      program: adjustedProgramData,
      message: 'AI program adjustment completed successfully'
    });

  } catch (error) {
    console.error('AI Adjustment: Error:', error);
    return NextResponse.json(
      { error: 'Failed to adjust program', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}