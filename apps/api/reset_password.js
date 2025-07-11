import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const email = 'stuby@flack.com';
    const newPassword = 'password123'; // Simple password for testing
    
    // Hash the new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    
    // Update the user's password
    const user = await prisma.cPT.update({
      where: { email },
      data: {
        passwordHash,
        onboardingCompleted: false, // Reset onboarding status
        onboardingCompletedAt: null
      }
    });
    
    console.log('Password reset successful!');
    console.log('Email:', user.email);
    console.log('New password:', newPassword);
    console.log('Onboarding completed:', user.onboardingCompleted);
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword(); 