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
You are a certified personal trainer with expertise in program design. You need to adjust an existing training program based on the trainer's request.

CURRENT PROGRAM:
${JSON.stringify(existingProgram, null, 2)}

TRAINER'S ADJUSTMENT REQUEST:
${adjustment}

Please provide an adjusted version of this program that incorporates the trainer's request. Return the response as a valid JSON object with the same structure as the original program, but with the requested adjustments applied.

The adjusted program should:
1. Maintain the same overall structure and format
2. Apply the specific adjustments requested
3. Keep all existing workout days and exercises unless explicitly asked to remove them
4. Ensure the adjustments are practical and safe
5. Maintain proper exercise progression and variety

Return only the JSON object, no additional text.
`;

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
      temperature: 0.7,
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