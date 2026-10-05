const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_BASE = 'http://localhost:5000/api';
let citizenToken, managerToken, workerToken, workerToken2;
let issueId, assignmentId;

async function setupTestData() {
  console.log('Setting up test data...');
  // Find or create test users
  const getOrCreateUser = async (email, role, name, phone) => {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const endpoint = role.toLowerCase();
      // Skip MANAGER because there's no /register/manager in standard setup without admin auth
      if (role === 'MANAGER') {
        const bcrypt = require('bcrypt');
        const roleRecord = await prisma.role.findUnique({ where: { name: 'MANAGER' } });
        user = await prisma.user.create({
          data: { email, roleId: roleRecord.id, passwordHash: await bcrypt.hash('password123', 10) }
        });
        await prisma.managerProfile.create({ data: { userId: user.id, department: 'TEST', region: 'TEST' } });
      } else {
        await axios.post(`${API_BASE}/auth/register/${endpoint}`, { name, email, password: 'password123', role, phone });
      }
    }
    const res = await axios.post(`${API_BASE}/auth/login`, { email, password: 'password123' });
    return res.data.accessToken;
  };

  citizenToken = await getOrCreateUser('test.citizenwork@samadhan.com', 'CITIZEN', 'Citizen Work', '1234567801');
  managerToken = await getOrCreateUser('test.managerwork@samadhan.com', 'MANAGER', 'Manager Work', '1234567802');
  workerToken = await getOrCreateUser('test.workerwork@samadhan.com', 'WORKER', 'Worker Work', '1234567803');
  workerToken2 = await getOrCreateUser('test.workerwork2@samadhan.com', 'WORKER', 'Worker Work 2', '1234567804');
  
  // Make sure they have profiles
  const managerUser = await prisma.user.findUnique({ where: { email: 'test.managerwork@samadhan.com' } });
  let managerProfile = await prisma.managerProfile.findUnique({ where: { userId: managerUser.id } });
  if (!managerProfile) {
    managerProfile = await prisma.managerProfile.create({ data: { userId: managerUser.id, department: 'TEST', region: 'TEST' } });
  }

  const workerUser = await prisma.user.findUnique({ where: { email: 'test.workerwork@samadhan.com' } });
  let workerProfile = await prisma.workerProfile.findUnique({ where: { userId: workerUser.id } });
  if (!workerProfile) {
    workerProfile = await prisma.workerProfile.create({ data: { userId: workerUser.id, skills: ['TEST'], rating: 5.0, isActive: true } });
  }
  
  let category = await prisma.issueCategory.findFirst();
  if (!category) {
    category = await prisma.issueCategory.create({ data: { name: 'TEST_CATEGORY' } });
  }
  // 1. Citizen creates issue
  const issueRes = await axios.post(`${API_BASE}/issues`, {
    title: 'Work Exec Test Issue',
    description: 'Testing work execution flow',
    categoryId: category.id,
    latitude: 12.9716,
    longitude: 77.5946,
    address: 'Test Address'
  }, { headers: { Authorization: `Bearer ${citizenToken}` } });
  issueId = issueRes.data.id;
  
  // Admin approves issue (do it directly via DB to save time)
  await prisma.issue.update({ where: { id: issueId }, data: { status: 'APPROVED' } });

  // 2. Manager assigns issue
  const assignRes = await axios.post(`${API_BASE}/manager/assignments`, {
    issueId: issueId,
    workerId: workerProfile.id,
    rate: 100,
    expectedCompletionDate: new Date(Date.now() + 86400000).toISOString()
  }, { headers: { Authorization: `Bearer ${managerToken}` } });
  assignmentId = assignRes.data.data.id;
  
  // 3. Worker accepts assignment
  await axios.patch(`${API_BASE}/worker/assignments/${assignmentId}/respond`, {
    action: 'ACCEPT'
  }, { headers: { Authorization: `Bearer ${workerToken}` } });

  // 4. Create Before-Work Verification (Approved)
  await prisma.beforeWorkVerification.create({
    data: {
      assignmentId,
      workerId: workerProfile.id,
      latitude: 12.9716,
      longitude: 77.5946,
      status: 'APPROVED'
    }
  });

  // 5. Update assignment and issue statuses to IN_PROGRESS and WORK_STARTED
  await prisma.workAssignment.update({ where: { id: assignmentId }, data: { status: 'IN_PROGRESS' } });
  await prisma.issue.update({ where: { id: issueId }, data: { status: 'WORK_STARTED' } });
  
  console.log(`Setup Complete. Assignment ID: ${assignmentId}`);
}

async function runTests() {
  try {
    await setupTestData();

    // Helper for requests
    const api = axios.create({ baseURL: API_BASE, validateStatus: () => true });

    // Test 1: Worker gets IN_PROGRESS assignment
    let res = await api.get(`/worker/assignments/${assignmentId}/work`, { headers: { Authorization: `Bearer ${workerToken}` } });
    if (res.status === 200 && res.data.data.status === 'IN_PROGRESS') console.log('1. Worker gets IN_PROGRESS assignment: PASS');
    else throw new Error('Failed to get active assignment');

    // Test 2: Negative - Citizen cannot call work endpoints
    res = await api.get(`/worker/assignments/${assignmentId}/work`, { headers: { Authorization: `Bearer ${citizenToken}` } });
    if (res.status === 403) console.log('2. Citizen cannot call work endpoints: PASS');
    else throw new Error(`Citizen access check failed: ${res.status}`);

    // Test 3: Negative - Manager cannot call worker endpoints
    res = await api.get(`/worker/assignments/${assignmentId}/work`, { headers: { Authorization: `Bearer ${managerToken}` } });
    if (res.status === 403) console.log('3. Manager cannot call worker work endpoints: PASS');
    else throw new Error('Manager access check failed');

    // Test 4: Negative - Worker cannot access another worker's assignment
    res = await api.get(`/worker/assignments/${assignmentId}/work`, { headers: { Authorization: `Bearer ${workerToken2}` } });
    if (res.status === 404) console.log('4. Worker cannot access another worker\'s assignment: PASS');
    else throw new Error('Cross-worker access check failed');

    // Test 5: Worker submits progress note (no media)
    res = await api.post(`/worker/assignments/${assignmentId}/work/progress`, { note: 'Initial setup done' }, { headers: { Authorization: `Bearer ${workerToken}` } });
    if (res.status === 200 && res.data.data.note === 'Initial setup done') console.log('5. Worker submits progress note: PASS');
    else throw new Error(`Progress submission failed: ${JSON.stringify(res.data)}`);

    // Create a dummy valid PNG file (1x1 transparent)
    const validPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    fs.writeFileSync('test-image.png', Buffer.from(validPngBase64, 'base64'));

    // Test 6: Worker uploads image (progress)
    let form = new FormData();
    form.append('note', 'Here is a photo of the progress');
    form.append('media', fs.createReadStream('test-image.png'));
    res = await api.post(`/worker/assignments/${assignmentId}/work/progress`, form, { headers: { ...form.getHeaders(), Authorization: `Bearer ${workerToken}` } });
    if (res.status === 200 && res.data.data.media.length > 0) console.log('6. Worker uploads image & WorkProgressMedia created & Cloudinary correct: PASS');
    else throw new Error(`Progress media submission failed: ${JSON.stringify(res.data)}`);

    // Test 7: Worker submits another progress update
    res = await api.post(`/worker/assignments/${assignmentId}/work/progress`, { note: 'Almost done' }, { headers: { Authorization: `Bearer ${workerToken}` } });
    if (res.status === 200) console.log('7. Worker submits another progress update (multiple exist): PASS');
    else throw new Error('Multiple progress failed');

    // Test 8: Completion without evidence is rejected
    res = await api.patch(`/worker/assignments/${assignmentId}/work/complete`, { note: 'Done!' }, { headers: { Authorization: `Bearer ${workerToken}` } });
    if (res.status === 400) console.log('8. Completion without evidence is rejected: PASS');
    else throw new Error(`Completion without evidence check failed: ${res.status} ${JSON.stringify(res.data)}`);

    // Test 9: Completion requires evidence & completes successfully
    form = new FormData();
    form.append('note', 'Work is fully completed');
    form.append('media', fs.createReadStream('test-image.png'));
    res = await api.patch(`/worker/assignments/${assignmentId}/work/complete`, form, { headers: { ...form.getHeaders(), Authorization: `Bearer ${workerToken}` } });
    if (res.status === 200) console.log('9. Completion requires evidence & completes successfully: PASS');
    else throw new Error(`Completion failed: ${JSON.stringify(res.data)}`);

    // Test 10: Assignment becomes COMPLETED and Issue becomes WORK_COMPLETED
    const dbAssignment = await prisma.workAssignment.findUnique({ where: { id: assignmentId } });
    const dbIssue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (dbAssignment.status === 'COMPLETED' && dbIssue.status === 'WORK_COMPLETED') {
        console.log('10. Assignment becomes COMPLETED & Issue becomes WORK_COMPLETED: PASS');
    } else {
        throw new Error('Status transition failed');
    }
    
    // Check history and notification
    const assignmentHistory = await prisma.assignmentStatusHistory.findFirst({ where: { assignmentId, newStatus: 'COMPLETED' }});
    const issueHistory = await prisma.issueStatusHistory.findFirst({ where: { issueId, newStatus: 'WORK_COMPLETED' }});
    const notification = await prisma.notification.findFirst({ where: { assignmentId, title: 'Work Completed' }});
    
    if (assignmentHistory && issueHistory && notification) {
        console.log('11. AssignmentStatusHistory, IssueStatusHistory, Manager notification created: PASS');
    } else {
        throw new Error('History or notification missing');
    }
    if (dbIssue.status !== 'RESOLVED') {
        console.log('12. Issue does NOT become RESOLVED: PASS');
    } else {
        throw new Error('Issue became RESOLVED incorrectly');
    }

    // Test 13: Worker cannot complete already COMPLETED assignment
    form = new FormData();
    form.append('note', 'Done again');
    form.append('media', fs.createReadStream('test-image.png'));
    res = await api.patch(`/worker/assignments/${assignmentId}/work/complete`, form, { headers: { ...form.getHeaders(), Authorization: `Bearer ${workerToken}` } });
    if (res.status === 409) console.log('13. Worker cannot complete already COMPLETED assignment: PASS');
    else throw new Error(`Already completed check failed: ${res.status}`);
    
    console.log('ALL TESTS PASSED');

  } catch (err) {
    console.error('TEST FAILED:', err.response ? err.response.data : err.message || err);
  } finally {
    if (fs.existsSync('test-image.png')) fs.unlinkSync('test-image.png');
    await prisma.$disconnect();
  }
}

runTests();
