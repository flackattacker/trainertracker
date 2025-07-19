import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

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
    
    // Get CPT info to generate a valid token
    const cpt = await prisma.cPT.findUnique({
      where: { id: testProgram.cptId },
      select: { id: true, email: true }
    });
    
    console.log('👤 CPT info:', cpt);
    
    if (!cpt) {
      console.log('❌ CPT not found');
      return;
    }
    
    // Generate a valid JWT token for the CPT
    const token = jwt.sign({ id: cpt.id }, JWT_SECRET, { expiresIn: '1h' });
    console.log('🔑 Generated token:', token.substring(0, 50) + '...');
    
    // Test the PATCH endpoint with valid authentication
    console.log('\n🌐 Testing PATCH /api/programs endpoint with valid auth...');
    
    const response = await fetch('http://localhost:3001/api/programs', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
    
    // Check if the program was actually updated in the database
    if (response.ok) {
      console.log('\n✅ PATCH request succeeded! Checking database...');
      
      const updatedProgram = await prisma.program.findUnique({
        where: { id: testProgram.id },
        select: { id: true, programName: true, status: true }
      });
      
      console.log('📊 Updated program in database:', updatedProgram);
      
      // Revert the status back to ACTIVE for testing
      console.log('\n🔄 Reverting status back to ACTIVE...');
      await prisma.program.update({
        where: { id: testProgram.id },
        data: { status: 'ACTIVE' }
      });
      
      console.log('✅ Status reverted to ACTIVE');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProgramCompletion(); 