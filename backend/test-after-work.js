const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BASE_URL = 'http://127.0.0.1:5000/api';
const API = axios.create({ baseURL: BASE_URL });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let citizenToken, managerToken, workerToken;
let issueId = '';
let assignmentId = '';

const getOrCreateUser = async (email, role, name, phone) => {
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const endpoint = role.toLowerCase();
    if (role === 'MANAGER') {
      const bcrypt = require('bcrypt');
      const roleRecord = await prisma.role.findUnique({ where: { name: 'MANAGER' } });
      user = await prisma.user.create({
        data: { email, roleId: roleRecord.id, passwordHash: await bcrypt.hash('password123', 10) }
      });
      await prisma.managerProfile.create({ data: { userId: user.id, department: 'TEST', region: 'TEST' } });
    } else {
      await API.post(`/auth/register/${endpoint}`, { name, email, password: 'password123', role, phone });
    }
  }
  const res = await API.post(`/auth/login`, { email, password: 'password123' });
  return res.data.accessToken;
};

const setupTestEnv = async () => {
  console.log('Logging in/Setting up users...');
  citizenToken = await getOrCreateUser('test.citizenwork@samadhan.com', 'CITIZEN', 'Citizen Work', '1234567801');
  managerToken = await getOrCreateUser('test.managerwork@samadhan.com', 'MANAGER', 'Manager Work', '1234567802');
  workerToken = await getOrCreateUser('test.workerwork@samadhan.com', 'WORKER', 'Worker Work', '1234567803');
  
  // Make sure manager profile exists
  const managerUser = await prisma.user.findUnique({ where: { email: 'test.managerwork@samadhan.com' } });
  let managerProfile = await prisma.managerProfile.findUnique({ where: { userId: managerUser.id } });
  if (!managerProfile) {
    await prisma.managerProfile.create({ data: { userId: managerUser.id, department: 'TEST', region: 'TEST' } });
  }

  // Make sure worker profile exists
  const workerUser = await prisma.user.findUnique({ where: { email: 'test.workerwork@samadhan.com' } });
  let workerProfile = await prisma.workerProfile.findUnique({ where: { userId: workerUser.id } });
  if (!workerProfile) {
    await prisma.workerProfile.create({ data: { userId: workerUser.id, skills: ['TEST'], rating: 5.0, isActive: true } });
  }
};

const runTest = async () => {
  try {
    await setupTestEnv();
    
    // Instead of doing the full setup, I will find an assignment that is already 'COMPLETED' (worker completed work execution)
    // Or I'll find an 'IN_PROGRESS' one and complete it.
    
    // Let's find an IN_PROGRESS or COMPLETED assignment
    const res = await API.get('/manager/assignments', {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    
    let assignment = res.data.data.find(a => a.status === 'COMPLETED' && a.issue.status === 'WORK_COMPLETED');
    
    if (!assignment) {
      console.log('No COMPLETED assignment found. Looking for IN_PROGRESS...');
      assignment = res.data.data.find(a => a.status === 'IN_PROGRESS' && a.issue.status === 'IN_PROGRESS');
      
      if (!assignment) {
         console.log('No IN_PROGRESS assignment found. Cannot run test seamlessly. Need to setup full flow.');
         return;
      }
      
      console.log('Completing work execution for assignment:', assignment.id);
      
      // Complete work
      const form = new FormData();
      form.append('completionNote', 'Test completion');
      form.append('media', Buffer.from('test'), { filename: 'test.jpg', contentType: 'image/jpeg' });
      
      const compRes = await API.post(`/worker/work-execution/${assignment.id}/complete`, form, {
        headers: { 
          Authorization: `Bearer ${workerToken}`,
          ...form.getHeaders()
        }
      });
      console.log('Work completed:', compRes.data.success);
      assignment.status = 'COMPLETED';
    }
    
    console.log('--- TESTING AFTER-WORK VERIFICATION ---');
    console.log(`Using Assignment ID: ${assignment.id}`);
    
    // 1. Worker Submits After-Work Verification
    console.log('Worker submitting after-work verification...');
    const form = new FormData();
    form.append('latitude', '18.5204');
    form.append('longitude', '73.8567');
    form.append('workSummary', 'I have completed the work completely and correctly.');
    form.append('notes', 'Cleaned up the area as well.');
    const validImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    form.append('media', validImageBuffer, { filename: 'after-test.png', contentType: 'image/png' });
    
    const submitRes = await API.post(`/verification/after/${assignment.id}`, form, {
      headers: { 
        Authorization: `Bearer ${workerToken}`,
        ...form.getHeaders()
      }
    });
    
    console.log('Submit Result:', submitRes.data.success);
    const verificationId = submitRes.data.data.id;
    console.log('Verification ID:', verificationId);
    
    // 2. Manager Fetches After-Work Verifications
    console.log('Manager fetching verifications...');
    const listRes = await API.get(`/manager/verifications/after`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    console.log('Manager Verifications Count:', listRes.data.data.length);
    
    // 3. Manager Fetches Verification Details
    console.log('Manager fetching verification details...');
    const detailRes = await API.get(`/manager/verifications/after/${verificationId}`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    console.log('Verification Details ID:', detailRes.data.data.verification.id);
    console.log('Verification Status:', detailRes.data.data.verification.status);
    
    // 4. Manager Rejects Verification
    console.log('Manager rejecting verification...');
    const rejectRes = await API.patch(`/manager/verifications/after/${verificationId}/review`, {
      action: 'REJECT',
      reason: 'Not good enough, redo some parts.'
    }, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    console.log('Reject Result:', rejectRes.data.data.status);
    
    // 5. Worker Re-submits Verification (using PUT/update logic implicit in the service)
    console.log('Worker re-submitting verification...');
    const reForm = new FormData();
    reForm.append('latitude', '18.5204');
    reForm.append('longitude', '73.8567');
    reForm.append('workSummary', 'Redid the work, everything is fine now.');
    reForm.append('notes', 'Fixed the specific parts.');
    reForm.append('media', validImageBuffer, { filename: 'after-test-2.png', contentType: 'image/png' });
    
    const resubmitRes = await API.post(`/verification/after/${assignment.id}`, reForm, {
      headers: { 
        Authorization: `Bearer ${workerToken}`,
        ...reForm.getHeaders()
      }
    });
    console.log('Re-submit Result:', resubmitRes.data.data.status);
    
    // 6. Manager Approves Verification
    console.log('Manager approving verification...');
    const approveRes = await API.patch(`/manager/verifications/after/${verificationId}/review`, {
      action: 'APPROVE'
    }, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    
    console.log('Approve Result:', approveRes.data.data.status);
    
    // 7. Verify Issue Status is RESOLVED
    console.log('Verifying issue status is RESOLVED...');
    const assignRes = await API.get(`/manager/assignments/${assignment.id}`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    
    console.log('Final Issue Status:', assignRes.data.data.issue.status);
    
    if (assignRes.data.data.issue.status === 'RESOLVED') {
      console.log('✅ AFTER-WORK VERIFICATION INTEGRATION TEST PASSED');
    } else {
      console.log('❌ Issue status is not RESOLVED!');
    }
    
  } catch (err) {
    console.error('Test failed:', err.response?.data || err.message);
  }
};

runTest();
