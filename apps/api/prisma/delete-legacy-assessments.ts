import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function isLegacyPARQ(assessment: any) {
  return !assessment.data || !assessment.data.questions;
}
function isLegacyFitness(assessment: any) {
  return !assessment.data || !assessment.data.fitness;
}
function isLegacyBodyComp(assessment: any) {
  return !assessment.data || !assessment.data.bodyComposition;
}

async function main() {
  console.log('🔍 Searching for legacy-format assessments...');

  // Get all PARQ assessments
  const allPARQ = await prisma.assessment.findMany({ where: { type: 'PARQ' } });
  const legacyPARQ = allPARQ.filter(isLegacyPARQ);

  // Get all FITNESS_ASSESSMENT assessments
  const allFitness = await prisma.assessment.findMany({ where: { type: 'FITNESS_ASSESSMENT' } });
  const legacyFitness = allFitness.filter(isLegacyFitness);

  // Get all BODY_COMPOSITION assessments
  const allBodyComp = await prisma.assessment.findMany({ where: { type: 'BODY_COMPOSITION' } });
  const legacyBodyComp = allBodyComp.filter(isLegacyBodyComp);

  const legacyIds = [
    ...legacyPARQ.map(a => a.id),
    ...legacyFitness.map(a => a.id),
    ...legacyBodyComp.map(a => a.id)
  ];

  if (legacyIds.length === 0) {
    console.log('✅ No legacy-format assessments found.');
    return;
  }

  console.log(`🗑 Deleting ${legacyIds.length} legacy-format assessments...`);
  await prisma.assessment.deleteMany({ where: { id: { in: legacyIds } } });
  console.log('✅ Legacy-format assessments deleted.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 