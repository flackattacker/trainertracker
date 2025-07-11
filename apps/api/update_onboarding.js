import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateOnboardingStatus() {
  try {
    const user = await prisma.cPT.update({
      where: { email: 'stuby@flack.com' },
      data: {
        onboardingCompleted: false,
        onboardingCompletedAt: null
      }
    });
    
    console.log('Updated user:', user.email, 'onboardingCompleted:', user.onboardingCompleted);
  } catch (error) {
    console.error('Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateOnboardingStatus();
