/**
 * SAMADHAN RazorpayX Worker Payouts Integration Test Suite
 * Validates:
 * 1. Authorization checks (non-manager blocked)
 * 2. Unapproved assignments blocked from payout
 * 3. Worker missing payout beneficiary blocked
 * 4. Beneficiary consent enforcement
 * 5. Worker Bank & UPI registration with masking & RazorpayX Contacts/Fund Accounts
 * 6. Successful server-side payout initiation with stable Idempotency Key
 * 7. Duplicate payout prevention (HTTP 409)
 * 8. Provider timeout resilience
 * 9. Duplicate webhook processing idempotency
 * 10. Failed and Reversed payout webhook processing
 * 11. Role-based worker payout history isolation
 */

require('dotenv').config();
const { prisma } = require('./src/config/db');
const paymentService = require('./src/services/paymentService');
const razorpayXService = require('./src/services/razorpayXService');

const runPayoutTestSuite = async () => {
  console.log('====================================================');
  console.log('   SAMADHAN RazorpayX Payouts Integration Suite     ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, name, details = '') => {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name} ${details ? `(${details})` : ''}`);
      failed++;
    }
  };

  try {
    // 0. Setup test users and assignment in DB
    console.log('--- Step 0: Setting up Test Entities ---');
    const timestamp = Date.now();

    // Roles and Category
    const managerRole = await prisma.role.findFirst({ where: { name: 'MANAGER' } });
    const workerRole = await prisma.role.findFirst({ where: { name: 'WORKER' } });
    const citizenRole = await prisma.role.findFirst({ where: { name: 'CITIZEN' } });
    const category = await prisma.issueCategory.findFirst();

    // Manager user
    const managerUser = await prisma.user.create({
      data: {
        email: `manager_payout_${timestamp}@samadhan.gov`,
        passwordHash: 'dummy_hash',
        roleId: managerRole.id,
      },
    });
    const managerProfile = await prisma.managerProfile.create({
      data: {
        userId: managerUser.id,
        department: 'PUBLIC_WORKS',
        region: 'ZONE_A',
      },
    });

    // Worker user
    const workerUser = await prisma.user.create({
      data: {
        email: `worker_payout_${timestamp}@samadhan.gov`,
        passwordHash: 'dummy_hash',
        roleId: workerRole.id,
      },
    });
    const workerProfile = await prisma.workerProfile.create({
      data: {
        userId: workerUser.id,
        status: 'AVAILABLE',
      },
    });

    // Citizen user (for authorization negative test & reporter)
    const citizenUser = await prisma.user.create({
      data: {
        email: `citizen_payout_${timestamp}@samadhan.gov`,
        passwordHash: 'dummy_hash',
        roleId: citizenRole.id,
      },
    });
    const citizenProfile = await prisma.citizenProfile.create({
      data: {
        userId: citizenUser.id,
      },
    });

    // Civic Issue
    const issue = await prisma.issue.create({
      data: {
        title: `Test Payout Pothole Issue ${timestamp}`,
        description: 'Road damage requiring verified repair and worker payout',
        status: 'WORK_STARTED',
        priority: 'MEDIUM',
        latitude: 19.0760,
        longitude: 72.8777,
        reporterId: citizenProfile.id,
        categoryId: category.id,
      },
    });

    // Work Assignment
    const assignment = await prisma.workAssignment.create({
      data: {
        issueId: issue.id,
        workerId: workerProfile.id,
        managerId: managerProfile.id,
        status: 'IN_PROGRESS',
        assignedRate: 750.00, // ₹750 trusted server-side rate
      },
    });
    console.log(`Created test assignment: ${assignment.id} (Rate: ₹${assignment.assignedRate})\n`);

    // ----------------------------------------------------
    // TEST 1: Authorization Failure (Non-Manager)
    // ----------------------------------------------------
    console.log('--- Test 1: Role-Based Authorization Failure ---');
    try {
      await paymentService.initiateWorkerPayout(citizenUser.id, assignment.id);
      assert(false, 'Non-manager blocked from initiating payout', 'Allowed unauthorized user');
    } catch (err) {
      assert(
        err.statusCode === 403 || err.message.includes('Unauthorized'),
        'Non-manager rejected with HTTP 403 Forbidden',
        err.message
      );
    }

    // ----------------------------------------------------
    // TEST 2: Unapproved Assignment Payout Block
    // ----------------------------------------------------
    console.log('\n--- Test 2: Unapproved Assignment Block ---');
    try {
      await paymentService.initiateWorkerPayout(managerUser.id, assignment.id);
      assert(false, 'Incomplete assignment blocked from payout', 'Processed payout for in-progress assignment');
    } catch (err) {
      assert(
        err.statusCode === 400 && err.message.includes('COMPLETED'),
        'Incomplete assignment blocked with HTTP 400',
        err.message
      );
    }

    // Mark completed, but after-verification not approved yet
    await prisma.workAssignment.update({
      where: { id: assignment.id },
      data: { status: 'COMPLETED' },
    });

    try {
      await paymentService.initiateWorkerPayout(managerUser.id, assignment.id);
      assert(false, 'Unverified assignment blocked from payout', 'Processed payout without after-verification');
    } catch (err) {
      assert(
        err.statusCode === 400 && err.message.includes('verification'),
        'Unverified assignment blocked with HTTP 400',
        err.message
      );
    }

    // Create After-Work Verification in PENDING status
    const verification = await prisma.afterWorkVerification.create({
      data: {
        assignmentId: assignment.id,
        workerId: workerProfile.id,
        latitude: 19.0760,
        longitude: 72.8777,
        status: 'PENDING',
        workSummary: 'Verification submitted by worker',
      },
    });

    try {
      await paymentService.initiateWorkerPayout(managerUser.id, assignment.id);
      assert(false, 'Pending verification blocked from payout', 'Processed payout for pending verification');
    } catch (err) {
      assert(
        err.statusCode === 400 && err.message.includes('verification'),
        'Pending after-verification blocked with HTTP 400',
        err.message
      );
    }

    // Approve After-Work Verification
    await prisma.afterWorkVerification.update({
      where: { id: verification.id },
      data: { status: 'APPROVED' },
    });
    console.log('  ✔ After-work verification approved');

    // ----------------------------------------------------
    // TEST 3: Worker Missing Payout Beneficiary Details Block
    // ----------------------------------------------------
    console.log('\n--- Test 3: Worker Missing Beneficiary Account Block ---');
    try {
      await paymentService.initiateWorkerPayout(managerUser.id, assignment.id);
      assert(false, 'Worker without bank/UPI details blocked from payout', 'Allowed payout without beneficiary account');
    } catch (err) {
      assert(
        err.statusCode === 400 && err.message.includes('bank account or UPI ID'),
        'Worker without payout account blocked with HTTP 400',
        err.message
      );
    }

    // ----------------------------------------------------
    // TEST 4: Beneficiary Consent Enforcement
    // ----------------------------------------------------
    console.log('\n--- Test 4: Beneficiary Consent Enforcement ---');
    try {
      await paymentService.saveWorkerPayoutAccount(workerUser.id, {
        payoutMethod: 'BANK_ACCOUNT',
        bankAccountName: 'Field Worker',
        bankAccountNumber: '987654321012',
        bankIfsc: 'HDFC0001234',
        consentGiven: false, // NO CONSENT
      });
      assert(false, 'Payout setup without consent blocked', 'Saved account without user consent');
    } catch (err) {
      assert(
        err.statusCode === 400 && err.message.includes('consent'),
        'Missing consent blocked with HTTP 400',
        err.message
      );
    }

    // ----------------------------------------------------
    // TEST 5: Worker Payout Account Setup & Masking (Bank & UPI)
    // ----------------------------------------------------
    console.log('\n--- Test 5: Worker Payout Account Setup & Data Masking ---');
    const bankSetupRes = await paymentService.saveWorkerPayoutAccount(workerUser.id, {
      payoutMethod: 'BANK_ACCOUNT',
      bankAccountName: 'Field Payout Worker',
      bankAccountNumber: '12345678901234',
      bankIfsc: 'SBIN0001234',
      consentGiven: true,
    });

    assert(bankSetupRes.success === true, 'Bank payout account saved successfully');
    assert(
      bankSetupRes.data.bankAccountNumberMasked === '•••• •••• 1234',
      'Bank account number strictly masked in database and response',
      `Got: ${bankSetupRes.data.bankAccountNumberMasked}`
    );
    assert(bankSetupRes.data.payoutAccountVerified === true, 'Bank account marked verified');

    // Verify raw account number is NOT in DB
    const refreshedWorker = await prisma.workerProfile.findUnique({ where: { id: workerProfile.id } });
    assert(
      !refreshedWorker.bankAccountNumber,
      'Raw unmasked bank account number is NEVER persisted in schema'
    );
    assert(
      refreshedWorker.razorpayFundAccountId && refreshedWorker.razorpayFundAccountId.startsWith('fa_'),
      'RazorpayX Fund Account ID created and linked',
      refreshedWorker.razorpayFundAccountId
    );

    // Also test UPI setup
    const upiSetupRes = await paymentService.saveWorkerPayoutAccount(workerUser.id, {
      payoutMethod: 'UPI',
      upiVpa: 'worker.payout@okhdfcbank',
      consentGiven: true,
    });
    assert(upiSetupRes.success === true, 'UPI payout account saved successfully');
    assert(upiSetupRes.data.upiVpa === 'worker.payout@okhdfcbank', 'UPI VPA configured');
    assert(upiSetupRes.data.payoutAccountVerified === true, 'UPI account verified');

    // ----------------------------------------------------
    // TEST 6: Successful Test-Mode Payout Initiation
    // ----------------------------------------------------
    console.log('\n--- Test 6: Server-Side Payout Initiation (Idempotency Key & Trusted Rate) ---');
    const payoutRes = await paymentService.initiateWorkerPayout(managerUser.id, assignment.id);

    assert(payoutRes.success === true, 'Worker payout initiated successfully');
    assert(Number(payoutRes.payment.amount) === 750.00, 'Payout amount matches trusted server assignedRate (₹750)');
    assert(payoutRes.payment.status === 'COMPLETED', 'Payment status marked COMPLETED');
    assert(payoutRes.payment.payoutStatus === 'processed', 'Payout status marked processed');
    assert(
      payoutRes.payment.idempotencyKey === `samadhan_payout_${assignment.id}`,
      'Stable X-Payout-Idempotency key generated and saved',
      payoutRes.payment.idempotencyKey
    );
    assert(
      payoutRes.payment.payoutUtr && payoutRes.payment.payoutUtr.includes('UTR_'),
      'Bank UTR reference generated and recorded',
      payoutRes.payment.payoutUtr
    );

    // Verify transaction recorded
    const txRecords = await prisma.paymentTransaction.findMany({
      where: { paymentId: payoutRes.payment.id },
    });
    assert(txRecords.length >= 1 && txRecords[0].gateway === 'RAZORPAYX', 'PaymentTransaction audit log recorded with gateway RAZORPAYX');

    // Verify worker notification
    const notifications = await prisma.notification.findMany({
      where: { userId: workerUser.id, type: 'PAYMENT' },
    });
    assert(notifications.length >= 1, 'Worker notification created upon successful payout');

    // ----------------------------------------------------
    // TEST 7: Duplicate Payout Prevention (HTTP 409)
    // ----------------------------------------------------
    console.log('\n--- Test 7: Duplicate Payout Prevention ---');
    try {
      await paymentService.initiateWorkerPayout(managerUser.id, assignment.id);
      assert(false, 'Duplicate payout blocked', 'Allowed second payout for already completed assignment');
    } catch (err) {
      assert(
        err.statusCode === 409 && err.message.includes('already been completed'),
        'Duplicate payout request blocked with HTTP 409 Conflict',
        err.message
      );
    }

    // ----------------------------------------------------
    // TEST 8: Provider Timeout Resilience & Safe Reconciliation
    // ----------------------------------------------------
    console.log('\n--- Test 8: Provider Timeout Handling & Non-Duplication ---');
    const issue2 = await prisma.issue.create({
      data: {
        title: `Timeout Test Issue ${timestamp}`,
        description: 'Test timeout resilience',
        status: 'WORK_STARTED',
        priority: 'HIGH',
        latitude: 19.0760,
        longitude: 72.8777,
        reporterId: citizenProfile.id,
        categoryId: category.id,
      },
    });
    const assignment2 = await prisma.workAssignment.create({
      data: {
        issueId: issue2.id,
        workerId: workerProfile.id,
        managerId: managerProfile.id,
        status: 'COMPLETED',
        assignedRate: 500.00,
      },
    });
    await prisma.afterWorkVerification.create({
      data: {
        assignmentId: assignment2.id,
        workerId: workerProfile.id,
        latitude: 19.0760,
        longitude: 72.8777,
        status: 'APPROVED',
      },
    });

    const originalCreatePayout = razorpayXService.createPayout;
    razorpayXService.createPayout = async () => {
      const timeoutErr = new Error('Gateway Timeout');
      timeoutErr.isTimeout = true;
      throw timeoutErr;
    };

    const timeoutRes = await paymentService.initiateWorkerPayout(managerUser.id, assignment2.id);
    assert(timeoutRes.pendingReconciliation === true, 'Handled timeout gracefully without throwing uncaught failure');
    assert(timeoutRes.payment.status === 'PROCESSING', 'Retained payment in PROCESSING status with idempotency key preserved');

    // Restore original function
    razorpayXService.createPayout = originalCreatePayout;

    const reconcilePayment = await prisma.payment.findFirst({ where: { assignmentId: assignment2.id } });
    assert(reconcilePayment.idempotencyKey === `samadhan_payout_${assignment2.id}`, 'Idempotency key retained for reconciliation');

    // ----------------------------------------------------
    // TEST 9: Idempotent Webhook Processing (Duplicate Processed)
    // ----------------------------------------------------
    console.log('\n--- Test 9: Idempotent Webhook Processing ---');
    const webhookPayload = {
      payout: {
        entity: {
          id: payoutRes.payment.payoutId,
          status: 'processed',
          reference_id: assignment.id,
          utr: payoutRes.payment.payoutUtr,
        },
      },
    };

    const webhookResult = await paymentService.handlePayoutWebhook('payout.processed', webhookPayload);
    assert(
      webhookResult.handled === true && webhookResult.duplicate === true,
      'Duplicate payout.processed webhook recognized and ignored idempotently'
    );

    // ----------------------------------------------------
    // TEST 10: Payout Reversed Webhook Handling
    // ----------------------------------------------------
    console.log('\n--- Test 10: Payout Reversed Webhook Handling ---');
    const reversalPayload = {
      payout: {
        entity: {
          id: payoutRes.payment.payoutId,
          status: 'reversed',
          reference_id: assignment.id,
          failure_reason: 'Account closed by beneficiary bank',
        },
      },
    };

    const reversalResult = await paymentService.handlePayoutWebhook('payout.reversed', reversalPayload);
    assert(reversalResult.handled === true && reversalResult.status === 'REVERSED', 'Reversal webhook processed');

    const reversedPayment = await prisma.payment.findUnique({ where: { id: payoutRes.payment.id } });
    assert(reversedPayment.status === 'FAILED', 'Payment status updated to FAILED upon reversal');
    assert(reversedPayment.payoutStatus === 'reversed', 'Payout status updated to reversed');
    assert(reversedPayment.payoutReversedAt !== null, 'payoutReversedAt timestamp recorded');

    // ----------------------------------------------------
    // TEST 11: Worker Payout History Isolation (Role RBAC)
    // ----------------------------------------------------
    console.log('\n--- Test 11: Worker Payout History Isolation ---');
    const workerPayouts = await paymentService.getWorkerPayments(workerUser.id);
    assert(Array.isArray(workerPayouts) && workerPayouts.length >= 1, 'Worker can retrieve their own payout records');
    assert(
      workerPayouts.every(p => p.workerId === workerProfile.id),
      'Worker receives ONLY their own payouts (isolated by workerId)'
    );

    // Cleanup test records
    console.log('\n--- Cleanup: Removing Test Records ---');
    await prisma.paymentTransaction.deleteMany({ where: { payment: { workerId: workerProfile.id } } });
    await prisma.payment.deleteMany({ where: { workerId: workerProfile.id } });
    await prisma.afterWorkVerification.deleteMany({ where: { workerId: workerProfile.id } });
    await prisma.workAssignment.deleteMany({ where: { workerId: workerProfile.id } });
    await prisma.notification.deleteMany({ where: { userId: { in: [workerUser.id, managerUser.id, citizenUser.id] } } });
    await prisma.issue.deleteMany({ where: { id: { in: [issue.id, issue2.id] } } });
    await prisma.managerProfile.delete({ where: { id: managerProfile.id } });
    await prisma.workerProfile.delete({ where: { id: workerProfile.id } });
    await prisma.citizenProfile.delete({ where: { id: citizenProfile.id } });
    await prisma.user.deleteMany({ where: { id: { in: [workerUser.id, managerUser.id, citizenUser.id] } } });
    console.log('Test records cleaned up.');

  } catch (error) {
    console.error('Unexpected test suite error:', error);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
};

runPayoutTestSuite();
