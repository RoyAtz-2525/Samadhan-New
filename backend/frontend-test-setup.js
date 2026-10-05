const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const API_BASE = "http://localhost:5000/api";

async function setup() {
  console.log("Setting up test data for frontend...");

  const getOrCreateUser = async (email, role, name, phone) => {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      if (role === "MANAGER") {
        const bcrypt = require("bcrypt");
        const roleRecord = await prisma.role.findUnique({
          where: { name: "MANAGER" },
        });
        user = await prisma.user.create({
          data: {
            email,
            roleId: roleRecord.id,
            passwordHash: await bcrypt.hash("password123", 10),
            phone,
          },
        });
        await prisma.managerProfile.create({
          data: { userId: user.id, department: "TEST", region: "TEST" },
        });
      } else {
        await axios.post(`${API_BASE}/auth/register/${role.toLowerCase()}`, {
          name,
          email,
          password: "password123",
          role,
          phone,
        });
      }
    } else {
      console.log(`${role} already exists.`);
    }
    const res = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password: "password123",
    });
    return res.data.accessToken;
  };

  const citizenToken = await getOrCreateUser(
    "test.citizengui@samadhan.com",
    "CITIZEN",
    "Citizen GUI",
    "5555555551",
  );
  const managerToken = await getOrCreateUser(
    "test.managergui@samadhan.com",
    "MANAGER",
    "Manager GUI",
    "5555555552",
  );
  const workerToken = await getOrCreateUser(
    "test.workergui@samadhan.com",
    "WORKER",
    "Worker GUI",
    "5555555553",
  );

  const managerUser = await prisma.user.findUnique({
    where: { email: "test.managergui@samadhan.com" },
  });
  const workerUser = await prisma.user.findUnique({
    where: { email: "test.workergui@samadhan.com" },
  });

  let workerProfile = await prisma.workerProfile.findUnique({
    where: { userId: workerUser.id },
  });
  if (!workerProfile) {
    workerProfile = await prisma.workerProfile.create({
      data: {
        userId: workerUser.id,
        skills: ["TEST"],
        rating: 5.0,
        isActive: true,
      },
    });
  }

  let category = await prisma.issueCategory.findFirst();

  // Create issue
  const issueRes = await axios.post(
    `${API_BASE}/issues`,
    {
      title: "GUI Test Work Execution Issue",
      description: "This issue is meant for testing the frontend UI",
      categoryId: category.id,
      latitude: 12.9716,
      longitude: 77.5946,
      address: "Test Address",
    },
    { headers: { Authorization: `Bearer ${citizenToken}` } },
  );
  const issueId = issueRes.data.id;

  // Admin approves issue
  await prisma.issue.update({
    where: { id: issueId },
    data: { status: "APPROVED" },
  });

  // Manager assigns issue
  const assignRes = await axios.post(
    `${API_BASE}/manager/assignments`,
    {
      issueId: issueId,
      workerId: workerProfile.id,
      rate: 150,
      expectedCompletionDate: new Date(Date.now() + 86400000).toISOString(),
    },
    { headers: { Authorization: `Bearer ${managerToken}` } },
  );
  const assignmentId = assignRes.data.data.id;

  // Worker accepts
  await axios.patch(
    `${API_BASE}/worker/assignments/${assignmentId}/respond`,
    {
      action: "ACCEPT",
    },
    { headers: { Authorization: `Bearer ${workerToken}` } },
  );

  // Update directly to IN_PROGRESS
  await prisma.workAssignment.update({
    where: { id: assignmentId },
    data: { status: "IN_PROGRESS" },
  });
  await prisma.issue.update({
    where: { id: issueId },
    data: { status: "WORK_STARTED" },
  });

  console.log(`Setup Complete.`);
  console.log(`Assignment ID: ${assignmentId}`);
}

setup()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
