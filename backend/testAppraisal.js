const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const managerService = require('./src/services/managerService');
const workerService = require('./src/services/workerService');
const { validationResult } = require('express-validator');

async function runTests() {
  let passed = [];
  let failed = [];

  const assert = (condition, flowId, msg) => {
    if (condition) {
      passed.push(`[PASS] ${flowId}: ${msg}`);
    } else {
      failed.push(`[FAIL] ${flowId}: ${msg}`);
      console.error(`[FAIL] ${flowId}: ${msg}`);
    }
  };

  try {
    const managerRole = await prisma.role.findUnique({ where: { name: 'MANAGER' }});
    const workerRole = await prisma.role.findUnique({ where: { name: 'WORKER' }});

    // Setup Test Data
    const managerUser = await prisma.user.create({
      data: {
        email: `test_manager_${Date.now()}@samadhan.com`,
        passwordHash: 'hashedpassword',
        roleId: managerRole.id,

        phone: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        managerProfile: {
          create: {
            department: 'Test Dept',
            region: 'Test Region'
          }
        }
      },
      include: { managerProfile: true }
    });

    const otherManagerUser = await prisma.user.create({
      data: {
        email: `test_manager_2_${Date.now()}@samadhan.com`,
        passwordHash: 'hashedpassword',
        roleId: managerRole.id,

        phone: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        managerProfile: {
          create: {
            department: 'Test Dept',
            region: 'Test Region 2'
          }
        }
      },
      include: { managerProfile: true }
    });

    const workerUser = await prisma.user.create({
      data: {
        email: `test_worker_${Date.now()}@samadhan.com`,
        passwordHash: 'hashedpassword',
        roleId: workerRole.id,

        phone: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        workerProfile: {
          create: {
            experienceYears: 2
          }
        }
      },
      include: { workerProfile: true }
    });

    const otherWorkerUser = await prisma.user.create({
      data: {
        email: `test_worker_2_${Date.now()}@samadhan.com`,
        passwordHash: 'hashedpassword',
        roleId: workerRole.id,

        phone: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
        workerProfile: {
          create: {
            experienceYears: 2
          }
        }
      },
      include: { workerProfile: true }
    });

    console.log("Users created.");

    // 1. Manager can create a DRAFT appraisal for an authorized worker.
    let appraisal1;
    try {
      appraisal1 = await managerService.createAppraisal(managerUser.id, workerUser.workerProfile.id, {
        periodStart: '2025-01-01',
        periodEnd: '2025-01-31'
      });
      assert(appraisal1 && appraisal1.status === 'DRAFT', 1, "DRAFT appraisal created.");
    } catch(e) { assert(false, 1, e.message); }

    // 3. Manager can update DRAFT appraisal.
    try {
      appraisal1 = await managerService.updateAppraisal(managerUser.id, appraisal1.id, {
        overallRating: 4,
        strengths: 'Very good'
      });
      assert(appraisal1.overallRating === 4 && appraisal1.strengths === 'Very good', 3, "DRAFT appraisal updated.");
    } catch(e) { assert(false, 3, e.message); }

    // 6. Duplicate/overlapping appraisal period is correctly prevented.
    try {
      await managerService.createAppraisal(managerUser.id, workerUser.workerProfile.id, {
        periodStart: '2025-01-15',
        periodEnd: '2025-02-15'
      });
      assert(false, 6, "Allowed overlapping appraisal");
    } catch (e) {
      assert(e.statusCode === 400 && e.message.includes('already exists in the given period'), 6, "Prevented overlapping appraisal");
    }

    // 7. Manager can submit DRAFT.
    try {
      // Complete rating first
      await managerService.updateAppraisal(managerUser.id, appraisal1.id, {
        overallRating: 4, workQualityRating: 4, timelinessRating: 4, reliabilityRating: 4, professionalismRating: 4, communicationRating: 4
      });
      appraisal1 = await managerService.submitAppraisal(managerUser.id, appraisal1.id);
      assert(appraisal1.status === 'SUBMITTED', 7, "DRAFT submitted successfully.");
    } catch(e) { assert(false, 7, e.message); }

    // 8. SUBMITTED appraisal becomes immutable.
    try {
      await managerService.updateAppraisal(managerUser.id, appraisal1.id, { overallRating: 5 });
      assert(false, 8, "Allowed update to SUBMITTED appraisal");
    } catch (e) {
      assert(e.statusCode === 400 && e.message.toLowerCase().includes('draft'), 8, "Prevented update to SUBMITTED appraisal");
    }

    // 10. Worker can view own SUBMITTED appraisal.
    try {
      const appraisals = await workerService.getAppraisals(workerUser.id);
      assert(appraisals.length === 1 && appraisals[0].id === appraisal1.id, 10, "Worker viewed own SUBMITTED appraisal.");
    } catch(e) { assert(false, 10, e.message); }

    // 9. Worker cannot access another worker's appraisal.
    try {
      await workerService.getAppraisalDetails(otherWorkerUser.id, appraisal1.id);
      assert(false, 9, "Allowed worker to view another worker's appraisal");
    } catch(e) {
      assert(e.statusCode === 404, 9, "Prevented worker from viewing another worker's appraisal");
    }

    // 11. Worker can acknowledge SUBMITTED appraisal.
    try {
      appraisal1 = await workerService.acknowledgeAppraisal(workerUser.id, appraisal1.id);
      assert(appraisal1.status === 'ACKNOWLEDGED', 11, "Worker acknowledged SUBMITTED appraisal.");
    } catch(e) { assert(false, 11, e.message); }

    // 12. ACKNOWLEDGED appraisal remains immutable.
    try {
      await managerService.updateAppraisal(managerUser.id, appraisal1.id, { overallRating: 5 });
      assert(false, 12, "Allowed update to ACKNOWLEDGED appraisal");
    } catch (e) {
      assert(e.statusCode === 400, 12, "Prevented update to ACKNOWLEDGED appraisal");
    }
    
    // 13. Manager submission creates Worker notification.
    try {
      const workerNotifications = await prisma.notification.findMany({ where: { userId: workerUser.id, type: 'APPRAISAL' }});
      assert(workerNotifications.length >= 1, 13, "Worker notification created on submission.");
    } catch(e) { assert(false, 13, e.message); }

    // 14. Worker acknowledgement creates Manager notification.
    try {
      const managerNotifications = await prisma.notification.findMany({ where: { userId: managerUser.id, type: 'APPRAISAL' }});
      assert(managerNotifications.length >= 1, 14, "Manager notification created on acknowledgement.");
    } catch(e) { assert(false, 14, e.message); }

    // 15. Appraisal create/submit/acknowledge creates AuditLog records.
    try {
      const auditLogs = await prisma.auditLog.findMany({ where: { entityId: appraisal1.id, entityType: 'APPRAISAL' }});
      const actions = auditLogs.map(l => l.action);
      assert(actions.includes('APPRAISAL_CREATED') && actions.includes('APPRAISAL_SUBMITTED') && actions.includes('APPRAISAL_ACKNOWLEDGED'), 15, "Audit logs created.");
    } catch(e) { assert(false, 15, e.message); }

    // 16. WorkerProfile.rating remains unchanged.
    try {
      const workerProfile = await prisma.workerProfile.findUnique({ where: { id: workerUser.workerProfile.id }});
      assert(parseFloat(workerProfile.rating) === 0, 16, "WorkerProfile.rating remains unchanged.");
    } catch(e) { assert(false, 16, e.message); }

    // 17. Existing Worker Performance metrics still work.
    try {
      const metrics = await workerService.getPerformanceMetricsByWorkerId(workerUser.workerProfile.id);
      assert(metrics && metrics.reviewMetrics, 17, "Performance metrics still work.");
    } catch(e) { assert(false, 17, e.message); }

    console.log("Summary:");
    passed.forEach(p => console.log(p));
    failed.forEach(f => console.log(f));
    
    // Cleanup
    await prisma.workerAppraisal.deleteMany({ where: { id: appraisal1.id } });
    await prisma.auditLog.deleteMany({ where: { entityId: appraisal1.id } });
    await prisma.notification.deleteMany({ where: { appraisalId: appraisal1.id } });
    await prisma.workerProfile.delete({ where: { id: workerUser.workerProfile.id } });
    await prisma.workerProfile.delete({ where: { id: otherWorkerUser.workerProfile.id } });
    await prisma.managerProfile.delete({ where: { id: managerUser.managerProfile.id } });
    await prisma.managerProfile.delete({ where: { id: otherManagerUser.managerProfile.id } });
    await prisma.user.deleteMany({ where: { id: { in: [workerUser.id, otherWorkerUser.id, managerUser.id, otherManagerUser.id] } } });

  } catch (error) {
    console.error("Test setup error", error);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
