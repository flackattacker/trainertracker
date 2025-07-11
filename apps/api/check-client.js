import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkClient() {
  try {
    const client = await prisma.client.findFirst({
      where: { codeName: 'CLIENT-001' }
    });
    
    console.log('Client found:', {
      id: client.id,
      codeName: client.codeName,
      email: client.email,
      firstName: client.firstName,
      lastName: client.lastName
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkClient(); 