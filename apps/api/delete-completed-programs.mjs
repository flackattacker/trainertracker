import { PrismaClient } from '@prisma/client';

async function deleteCompletedPrograms() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Finding all completed programs...');
    
    // First, let's see what completed programs exist
    const completedPrograms = await prisma.program.findMany({
      where: { status: 'COMPLETED' },
      select: { 
        id: true, 
        programName: true, 
        clientId: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    console.log(`📋 Found ${completedPrograms.length} completed programs:`);
    completedPrograms.forEach(program => {
      console.log(`  - ${program.programName} (ID: ${program.id}) - Created: ${program.createdAt}`);
    });
    
    if (completedPrograms.length === 0) {
      console.log('✅ No completed programs found to delete.');
      return;
    }
    
    // Ask for confirmation
    console.log('\n⚠️  WARNING: This will permanently delete all completed programs!');
    console.log('This action cannot be undone.');
    
    // For safety, let's also check if there are any other statuses
    const allPrograms = await prisma.program.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    
    console.log('\n📊 Current program status distribution:');
    allPrograms.forEach(group => {
      console.log(`  - ${group.status}: ${group._count.status}`);
    });
    
    // Delete the completed programs
    console.log('\n🗑️  Deleting completed programs...');
    
    const deleteResult = await prisma.program.deleteMany({
      where: { status: 'COMPLETED' }
    });
    
    console.log(`✅ Successfully deleted ${deleteResult.count} completed programs!`);
    
    // Verify deletion
    const remainingCompleted = await prisma.program.findMany({
      where: { status: 'COMPLETED' },
      select: { id: true, programName: true }
    });
    
    if (remainingCompleted.length === 0) {
      console.log('✅ Verification: All completed programs have been deleted.');
    } else {
      console.log(`❌ Warning: ${remainingCompleted.length} completed programs still exist.`);
    }
    
    // Show final status distribution
    const finalStatuses = await prisma.program.groupBy({
      by: ['status'],
      _count: { status: true }
    });
    
    console.log('\n📊 Final program status distribution:');
    finalStatuses.forEach(group => {
      console.log(`  - ${group.status}: ${group._count.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error deleting completed programs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteCompletedPrograms(); 