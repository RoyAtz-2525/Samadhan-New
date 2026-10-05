const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://127.0.0.1:5000/api';
const API = axios.create({ baseURL: BASE_URL });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let managerToken;

const getOrCreateUser = async (email, role, name, phone) => {
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    if (role === 'MANAGER') {
      const bcrypt = require('bcrypt');
      const roleRecord = await prisma.role.findUnique({ where: { name: 'MANAGER' } });
      user = await prisma.user.create({
        data: { email, roleId: roleRecord.id, passwordHash: await bcrypt.hash('password123', 10) }
      });
      await prisma.managerProfile.create({ data: { userId: user.id, department: 'TEST', region: 'TEST' } });
    }
  }
  const res = await API.post(`/auth/login`, { email, password: 'password123' });
  return res.data.accessToken;
};

const setupTestEnv = async () => {
  console.log('Logging in/Setting up users...');
  managerToken = await getOrCreateUser('test.managerwork@samadhan.com', 'MANAGER', 'Manager Work', '1234567802');
};

const runTest = async () => {
  try {
    await setupTestEnv();
    
    // Find an assignment that is COMPLETED and issue is RESOLVED
    const res = await API.get('/manager/assignments', {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    
    let assignments = res.data.data.filter(a => a.status === 'COMPLETED' && a.issue.status === 'RESOLVED');
    let assignment = null;
    
    // Check which one doesn't have a payment
    for (const a of assignments) {
      try {
         const pRes = await API.get(`/manager/assignments/${a.id}/payment`, { headers: { Authorization: `Bearer ${managerToken}` }});
         if (!pRes.data.data || pRes.data.data.status !== 'COMPLETED') {
            assignment = a;
            break;
         }
      } catch (e) {
         assignment = a;
         break;
      }
    }
    
    if (!assignment) {
       console.log('No eligible assignment found. Payment needs COMPLETED assignment with RESOLVED issue and APPROVED verification.');
       // Fallback: forcefully mock one using prisma if we really need it, but test-after-work.js left one in this state.
       const assign = await prisma.workAssignment.findFirst({
         where: { 
           status: 'COMPLETED',
           payments: { none: { status: 'COMPLETED' } }
         }
       });
       if (assign) {
           console.log('Force updating an assignment for test...');
           await prisma.issue.update({ where: { id: assign.issueId }, data: { status: 'RESOLVED' }});
           await prisma.afterWorkVerification.updateMany({ where: { assignmentId: assign.id }, data: { status: 'APPROVED' }});
           assignment = (await API.get(`/manager/assignments/${assign.id}`, { headers: { Authorization: `Bearer ${managerToken}` }})).data.data;
       } else {
           return;
       }
    }
    
    console.log('--- TESTING PAYMENT MODULE ---');
    console.log(`Using Assignment ID: ${assignment.id}`);
    
    // 1. Create Payment Order
    console.log('Creating Payment Order...');
    const orderRes = await API.post(`/manager/assignments/${assignment.id}/order`, {}, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    
    console.log('Order Result:', orderRes.data.success);
    const orderData = orderRes.data.data;
    console.log('Payment ID:', orderData.paymentId);
    console.log('Razorpay Order ID:', orderData.razorpayOrderId);
    
    // 2. Verify Payment (Mock Signature)
    console.log('Verifying Payment...');
    const verifyRes = await API.post(`/manager/payments/${orderData.paymentId}/verify`, {
      razorpay_order_id: orderData.razorpayOrderId,
      razorpay_payment_id: `pay_dummy_${Date.now()}`,
      razorpay_signature: 'dummy_signature'
    }, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    
    console.log('Verify Result:', verifyRes.data.success);
    console.log('Payment Final Status:', verifyRes.data.payment.status);
    
    // 3. Verify Payment Details
    const detailRes = await API.get(`/manager/payments/${orderData.paymentId}`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    
    console.log('Fetched Payment Status:', detailRes.data.data.status);
    console.log('Transactions Count:', detailRes.data.data.transactions.length);
    
    if (detailRes.data.data.status === 'COMPLETED') {
      console.log('✅ PAYMENT INTEGRATION TEST PASSED');
    } else {
      console.log('❌ Payment status is not COMPLETED!');
    }
    
  } catch (err) {
    console.error('Test failed:', err.response?.data || err.message);
  }
};

runTest();
