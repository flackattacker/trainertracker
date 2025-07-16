import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch('http://localhost:3001/api/exercise-categories');
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching exercise categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exercise categories' },
      { status: 500 }
    );
  }
} 