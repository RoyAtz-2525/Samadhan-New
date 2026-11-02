/**
 * Phase 5 Automated Verification Suite
 * Tests Razorpay payment hardening, webhook processing, idempotency,
 * citizen reward points, database constraints, and redemption guardrails.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

const paymentService = require('./src/services/paymentService');
const razorpayService = require('./src/services/razorpayService');
const rewardService = require('./src/services/rewardService');
const { REWARD_POINTS, REWARD_CATALOG } = require('./src/config/rewardConfig');

async function runTestSuite() {
  console.log('===============================================================');
  console.log('   SAMADHAN PHASE 5: RELIABILITY & SECURITY TEST SUITE         ');
  console.log('===============================================================\n');

  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      testsPassed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      testsFailed++;
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Razorpay Signature Verification & Tamper Detection
    // -------------------------------------------------------------------------
    console.log('--- TEST GROUP 1: Signature Verification & Tampering ---');
    const dummyOrderId = 'order_dummy_12345';
    const dummyPaymentId = 'pay_dummy_67890';

    // Test mode simulated signatures
    const validTestSig = razorpayService.verifySignature(
      dummyOrderId,
      dummyPaymentId,
      'test_simulated_sig'
    );
    assert(validTestSig === true, 'Test mode accepts valid simulation signature');

    const tamperedSig = razorpayService.verifySignature(
      dummyOrderId,
      dummyPaymentId,
      'invalid_signature'
    );
    assert(tamperedSig === false, 'Rejects invalid or tampered signature');

    // Webhook signature verification
    const validWebhookSig = razorpayService.verifyWebhookSignature(
      '{"event":"payment.captured"}',
      'test_simulated_webhook'
    );
    assert(validWebhookSig === true, 'Webhook accepts valid simulation signature in test mode');

    const invalidWebhookSig = razorpayService.verifyWebhookSignature(
      '{"event":"payment.captured"}',
      'invalid_signature'
    );
    assert(invalidWebhookSig === false, 'Webhook rejects tampered signature');

    // -------------------------------------------------------------------------
    // TEST 2: Citizen Reward Idempotency & DB Uniqueness Constraints
    // -------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 2: Citizen Reward Ledger & Idempotency ---');
    
    // Find or create test citizen
    let testUser = await prisma.user.findFirst({
      where: { citizenProfile: { isNot: null } },
      include: { citizenProfile: true }
    });

    if (!testUser) {
      console.log('Creating mock citizen user for testing...');
      const role = await prisma.role.findFirst({ where: { name: 'CITIZEN' } });
      testUser = await prisma.user.create({
        data: {
          email: `test.citizen.${Date.now()}@samadhan.org`,
          passwordHash: 'dummy_hash',
          roleId: role.id,
          citizenProfile: { create: {} }
        },
        include: { citizenProfile: true }
      });
    }

    const citizenId = testUser.citizenProfile.id;
    const initialPoints = testUser.citizenProfile.rewardPoints || 0;
    const initialLifetime = testUser.citizenProfile.lifetimePoints || 0;

    // Create a mock issue for testing rewards
    const category = await prisma.issueCategory.findFirst();
    const testIssue = await prisma.issue.create({
      data: {
        title: `Test Civic Issue for Rewards ${Date.now()}`,
        description: 'Pothole verification and resolution reward test',
        reporterId: citizenId,
        categoryId: category.id,
        latitude: 28.6139,
        longitude: 77.2090,
        status: 'APPROVED'
      },
      include: { reporter: { include: { user: true } } }
    });

    // Award 1: Report Approved (+10 pts)
    const reward1 = await rewardService.awardReportApprovedReward(prisma, testIssue);
    assert(reward1 && reward1.points === REWARD_POINTS.REPORT_APPROVED, 'Awarded 10 points for approved report');

    const profileAfterReward1 = await prisma.citizenProfile.findUnique({ where: { id: citizenId } });
    assert(profileAfterReward1.rewardPoints === initialPoints + 10, 'Citizen point balance incremented by 10');
    assert(profileAfterReward1.lifetimePoints === initialLifetime + 10, 'Lifetime points incremented by 10');

    // Award 1 (Duplicate attempt): Must be completely idempotent
    const duplicateReward1 = await rewardService.awardReportApprovedReward(prisma, testIssue);
    assert(duplicateReward1 && duplicateReward1.id === reward1.id, 'Duplicate report approval returned existing reward (Idempotent)');

    const profileAfterDup = await prisma.citizenProfile.findUnique({ where: { id: citizenId } });
    assert(profileAfterDup.rewardPoints === initialPoints + 10, 'Balance did NOT increase on duplicate reward attempt');

    // Direct DB Uniqueness check: Attempting raw duplicate insertion into RewardLedger
    let uniqueConstraintCaught = false;
    try {
      await prisma.rewardLedger.create({
        data: {
          citizenId,
          issueId: testIssue.id,
          points: 10,
          eventType: 'REPORT_APPROVED',
          status: 'EARNED',
          reason: 'Forced duplicate insertion'
        }
      });
    } catch (err) {
      uniqueConstraintCaught = true;
    }
    assert(uniqueConstraintCaught === true, 'Database @@unique([citizenId, issueId, eventType]) strictly blocked duplicate');

    // Award 2: Issue Resolved (+10 bonus pts)
    const reward2 = await rewardService.awardIssueResolvedReward(prisma, testIssue.id);
    assert(reward2 && reward2.points === REWARD_POINTS.ISSUE_RESOLVED, 'Awarded 10 bonus points for issue resolution');

    const profileAfterReward2 = await prisma.citizenProfile.findUnique({ where: { id: citizenId } });
    assert(profileAfterReward2.rewardPoints === initialPoints + 20, 'Citizen point balance now has total 20 points');

    // Duplicate resolved bonus check
    const duplicateReward2 = await rewardService.awardIssueResolvedReward(prisma, testIssue.id);
    assert(duplicateReward2 && duplicateReward2.id === reward2.id, 'Duplicate resolution reward returned existing ledger entry');

    // -------------------------------------------------------------------------
    // TEST 3: Citizen Reward Redemption (Phase 4 Foundation)
    // -------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 3: Non-Monetary Voucher Redemption ---');
    
    // Choose catalog item (e.g. 20 pts badge)
    const badgeItem = REWARD_CATALOG.find(i => i.pointsCost <= 20) || REWARD_CATALOG[0];
    const balanceBeforeRedeem = (await prisma.citizenProfile.findUnique({ where: { id: citizenId } })).rewardPoints;

    const redeemRes = await rewardService.redeemReward(testUser.id, badgeItem.id);
    assert(redeemRes.success === true, 'Redemption transaction executed successfully');
    assert(redeemRes.voucher && redeemRes.voucher.code.startsWith('SMD-'), 'Voucher code generated with secure prefix (SMD-...)');
    assert(redeemRes.currentBalance === balanceBeforeRedeem - badgeItem.pointsCost, 'Citizen points deducted correctly on redemption');

    const profileAfterRedeem = await prisma.citizenProfile.findUnique({ where: { id: citizenId } });
    assert(profileAfterRedeem.lifetimePoints === initialLifetime + 20, 'Lifetime points preserved and NOT decreased by redemption');

    // Insufficient Balance check: Try to redeem expensive item exceeding balance
    let insufficientBalanceBlocked = false;
    try {
      await rewardService.redeemReward(testUser.id, 'civic_transit_pass'); // 50 pts
    } catch (err) {
      insufficientBalanceBlocked = true;
      assert(err.message.includes('Insufficient points balance'), 'Blocked redemption when balance is insufficient');
    }
    assert(insufficientBalanceBlocked === true, 'Insufficient balance guardrail working');

    // -------------------------------------------------------------------------
    // TEST 4: Razorpay Webhook Processing & Idempotency
    // -------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 4: Webhook Processing & Idempotency ---');

    // Create a mock payment record in PENDING state
    const worker = await prisma.workerProfile.findFirst({ include: { user: true } });
    const manager = await prisma.managerProfile.findFirst({ include: { user: true } });
    const assignment = await prisma.workAssignment.findFirst();

    if (worker && manager && assignment) {
      const mockOrderId = `order_hook_test_${Date.now()}`;
      const mockPayId = `pay_hook_${Date.now()}`;

      const testPayment = await prisma.payment.create({
        data: {
          workerId: worker.id,
          assignmentId: assignment.id,
          issueId: testIssue.id,
          amount: 500,
          rate: 500,
          status: 'PENDING',
          gatewayTransactionId: mockOrderId,
          approvedById: manager.userId
        }
      });

      // Send payment.captured webhook payload
      const webhookPayload = {
        payment: {
          entity: {
            id: mockPayId,
            order_id: mockOrderId,
            amount: 50000,
            status: 'captured',
            notes: { paymentId: testPayment.id }
          }
        }
      };

      const hookRes1 = await paymentService.handleWebhook('payment.captured', webhookPayload);
      assert(hookRes1.handled === true && hookRes1.status === 'COMPLETED', 'Webhook transitioned payment to COMPLETED');

      const updatedPayment = await prisma.payment.findUnique({ where: { id: testPayment.id } });
      assert(updatedPayment.status === 'COMPLETED', 'Payment record is marked COMPLETED in database');

      // Send duplicate webhook
      const hookRes2 = await paymentService.handleWebhook('payment.captured', webhookPayload);
      assert(hookRes2.duplicate === true, 'Duplicate webhook identified and handled idempotently');

      // Clean up test payment
      await prisma.paymentTransaction.deleteMany({ where: { paymentId: testPayment.id } });
      await prisma.payment.delete({ where: { id: testPayment.id } });
    } else {
      console.log('Skipping webhook DB test because no worker/manager profiles found');
    }

    // -------------------------------------------------------------------------
    // TEST 5: Clean Up Test Records
    // -------------------------------------------------------------------------
    console.log('\n--- Cleaning up test records ---');
    await prisma.rewardLedger.deleteMany({ where: { citizenId } });
    await prisma.issue.delete({ where: { id: testIssue.id } });
    console.log('Cleaned up test rewards and test issue.');

  } catch (error) {
    console.error('Test suite runtime error:', error);
    testsFailed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n===============================================================');
  console.log(`   TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED                    `);
  console.log('===============================================================');
  
  if (testsFailed > 0) {
    process.exit(1);
  }
}

runTestSuite();
