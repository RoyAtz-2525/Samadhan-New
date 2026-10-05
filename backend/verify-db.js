const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const issues = await prisma.issue.count();
    const workAssignments = await prisma.workAssignment.count();
    const beforeVerifications = await prisma.beforeWorkVerification.count();
    const afterVerifications = await prisma.afterWorkVerification.count();
    const workProgressRecords = await prisma.workProgressRecord.count();
    const workProgressMedia = await prisma.workProgressMedia.count();
    const users = await prisma.user.count();

    console.log(`Issues: ${issues}`);
    console.log(`WorkAssignments: ${workAssignments}`);
    console.log(`BeforeWorkVerifications: ${beforeVerifications}`);
    console.log(`AfterWorkVerifications: ${afterVerifications}`);
    console.log(`WorkProgressRecords: ${workProgressRecords}`);
    console.log(`WorkProgressMedia: ${workProgressMedia}`);
    console.log(`Users: ${users}`);
    
    console.log('VERIFICATION SUCCESSFUL');
  } catch (err) {
    console.error('Error verifying data:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
