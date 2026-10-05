const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const superAdminService = require('./src/services/superAdminService');

async function testSuperAdminAppraisals() {
  console.log('--- TEST SUPER ADMIN APPRAISALS ---');
  
  let createdAppraisalId = null;
  let createdWorkerId = null;
  let createdManagerId = null;

  try {
    // Setup dummy data
    const workerUser = await prisma.user.create({
      data: {
        email: `worker_${Date.now()}@test.com`,
        passwordHash: 'hash',
        phone: `w${Date.now()}`,
        role: { connect: { name: 'WORKER' } },
        workerProfile: { create: {} }
      },
      include: { workerProfile: true }
    });

    const managerUser = await prisma.user.create({
      data: {
        email: `manager_${Date.now()}@test.com`,
        passwordHash: 'hash',
        phone: `m${Date.now()}`,
        role: { connect: { name: 'MANAGER' } },
        managerProfile: { create: { department: 'test' } }
      },
      include: { managerProfile: true }
    });

    const appraisal = await prisma.workerAppraisal.create({
      data: {
        workerId: workerUser.workerProfile.id,
        managerId: managerUser.managerProfile.id,
        status: 'SUBMITTED',
        overallRating: 4,
        workQualityRating: 4,
        timelinessRating: 4,
        reliabilityRating: 4,
        periodStart: new Date('2026-01-01'),
        periodEnd: new Date('2026-01-31'),
        managerComments: 'Test appraisal'
      }
    });

    createdAppraisalId = appraisal.id;
    createdWorkerId = workerUser.id;
    createdManagerId = managerUser.id;

    // 1. Fetch all appraisals with no filters
    let result = await superAdminService.getAllAppraisals({});
    console.log(`\n[+] No filters - Total count: ${result.pagination.total}`);
    
    if (result.pagination.total === 0) {
      console.log('No appraisals found in DB. Test might be inconclusive unless we create one.');
    } else {
      const sample = result.appraisals[0];
      
      // 2. Worker filter
      let filterResult = await superAdminService.getAllAppraisals({ workerId: sample.workerId });
      console.log(`\n[+] Worker filter (${sample.workerId}) - Count: ${filterResult.pagination.total}`);
      if (filterResult.pagination.total > 0 && filterResult.appraisals.every(a => a.workerId === sample.workerId)) {
        console.log('  -> Worker filter WORKS');
      } else {
        console.log('  -> Worker filter FAILED');
      }
      
      // 3. Manager filter
      filterResult = await superAdminService.getAllAppraisals({ managerId: sample.managerId });
      console.log(`\n[+] Manager filter (${sample.managerId}) - Count: ${filterResult.pagination.total}`);
      if (filterResult.pagination.total > 0 && filterResult.appraisals.every(a => a.managerId === sample.managerId)) {
        console.log('  -> Manager filter WORKS');
      } else {
        console.log('  -> Manager filter FAILED');
      }
      
      // 4. Status filter
      filterResult = await superAdminService.getAllAppraisals({ status: sample.status });
      console.log(`\n[+] Status filter (${sample.status}) - Count: ${filterResult.pagination.total}`);
      if (filterResult.pagination.total > 0 && filterResult.appraisals.every(a => a.status === sample.status)) {
        console.log('  -> Status filter WORKS');
      } else {
        console.log('  -> Status filter FAILED');
      }
      
      // 5. Overall Rating filter
      if (sample.overallRating) {
        filterResult = await superAdminService.getAllAppraisals({ overallRating: sample.overallRating });
        console.log(`\n[+] Rating filter (${sample.overallRating}) - Count: ${filterResult.pagination.total}`);
        if (filterResult.pagination.total > 0 && filterResult.appraisals.every(a => a.overallRating === sample.overallRating)) {
          console.log('  -> Rating filter WORKS');
        } else {
          console.log('  -> Rating filter FAILED');
        }
      } else {
        console.log('\n[!] Skipping Rating filter test - sample has no rating');
      }
      
      // 6. Date Range filter
      const sd = new Date(sample.periodEnd);
      sd.setDate(sd.getDate() - 1);
      const ed = new Date(sample.periodEnd);
      ed.setDate(ed.getDate() + 1);
      
      filterResult = await superAdminService.getAllAppraisals({ 
        startDate: sd.toISOString(), 
        endDate: ed.toISOString() 
      });
      console.log(`\n[+] Date filter (${sd.toISOString().split('T')[0]} to ${ed.toISOString().split('T')[0]}) - Count: ${filterResult.pagination.total}`);
      if (filterResult.pagination.total > 0) {
        console.log('  -> Date filter WORKS');
      } else {
        console.log('  -> Date filter FAILED');
      }
      
      // 7. Pagination test
      filterResult = await superAdminService.getAllAppraisals({ limit: 1 });
      console.log(`\n[+] Pagination filter (limit=1) - Items returned: ${filterResult.appraisals.length}`);
      if (filterResult.appraisals.length === 1 && filterResult.pagination.limit === 1) {
        console.log('  -> Pagination filter WORKS');
      } else {
        console.log('  -> Pagination filter FAILED');
      }
      
      // 8. Detail test
      const detail = await superAdminService.getAppraisalDetail(sample.id);
      console.log(`\n[+] Detail fetch (${sample.id}) - Found: ${!!detail}`);
      if (detail && detail.id === sample.id) {
        console.log('  -> Detail fetch WORKS');
      } else {
        console.log('  -> Detail fetch FAILED');
      }
    }
  } catch (error) {
    console.error('\nTest failed with error:', error);
  } finally {
    // Cleanup
    if (createdAppraisalId) {
      await prisma.workerAppraisal.deleteMany({ where: { id: createdAppraisalId } });
    }
    if (createdWorkerId) {
      const w = await prisma.user.findUnique({ where: { id: createdWorkerId }, include: { workerProfile: true } });
      if (w && w.workerProfile) await prisma.workerProfile.delete({ where: { id: w.workerProfile.id } });
      await prisma.user.delete({ where: { id: createdWorkerId } });
    }
    if (createdManagerId) {
      const m = await prisma.user.findUnique({ where: { id: createdManagerId }, include: { managerProfile: true } });
      if (m && m.managerProfile) await prisma.managerProfile.delete({ where: { id: m.managerProfile.id } });
      await prisma.user.delete({ where: { id: createdManagerId } });
    }
    await prisma.$disconnect();
  }
}

testSuperAdminAppraisals();
