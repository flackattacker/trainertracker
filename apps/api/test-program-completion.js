const { PrismaClient } = require('@prisma/client');

async function testProgramCompletion() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Querying database for active programs...');
    
    // Find active programs
    const activePrograms = await prisma.program.findMany({
      where: { status: 'ACTIVE' },
      select: { 
        id: true, 
        programName: true, 
        clientId: true,
        cptId: true 
      },
      take: 3
    });
    
    console.log('📋 Found active programs:', activePrograms);
    
    if (activePrograms.length === 0) {
      console.log('❌ No active programs found');
      return;
    }
    
    // Test with the first active program
    const testProgram = activePrograms[0];
    console.log(`\n🧪 Testing with program: ${testProgram.programName} (ID: ${testProgram.id})`);
    
    // Test the PATCH endpoint
    console.log('\n🌐 Testing PATCH /api/programs endpoint...');
    
    const response = await fetch('http://localhost:3001/api/programs', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // We need a valid token - let's try without auth first to see the error
      },
      body: JSON.stringify({
        id: testProgram.id,
        status: 'COMPLETED'
      })
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📡 Response body:', responseText);
    
    // Now let's check what tokens are available
    console.log('\n🔑 Checking for authentication tokens...');
    
    // Try to get a valid token by looking at the auth system
    const cpt = await prisma.cPT.findUnique({
      where: { id: testProgram.cptId },
      select: { id: true, email: true }
    });
    
    console.log('👤 CPT info:', cpt);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProgramCompletion(); 