const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');

const prisma = new PrismaClient();

const registerCitizen = async ({ email, password, name, phone }) => {
  const orConditions = [{ email }];
  if (phone) {
    orConditions.push({ phone });
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: orConditions }
  });

  if (existingUser) {
    throw { statusCode: 400, message: 'User with email or phone already exists' };
  }

  const role = await prisma.role.findUnique({ where: { name: 'CITIZEN' } });
  if (!role) throw { statusCode: 500, message: 'Citizen role not found in database' };

  const hashedPassword = await hashPassword(password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        phone,
        passwordHash: hashedPassword,
        roleId: role.id,
      },
      include: { role: true }
    });

    await tx.citizenProfile.create({
      data: {
        userId: user.id
        // name isn't in the citizen schema directly, we could add it to a generic user profile or just keep email/phone for now based on current schema. Wait, schema has no name field. I will omit it. 
      }
    });

    return user;
  });
};

const registerWorker = async ({ email, password, name, phone }) => {
  const orConditions = [{ email }];
  if (phone) {
    orConditions.push({ phone });
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: orConditions }
  });

  if (existingUser) {
    throw { statusCode: 400, message: 'User with email or phone already exists' };
  }

  const role = await prisma.role.findUnique({ where: { name: 'WORKER' } });
  if (!role) throw { statusCode: 500, message: 'Worker role not found in database' };

  const hashedPassword = await hashPassword(password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        phone,
        passwordHash: hashedPassword,
        roleId: role.id,
      },
      include: { role: true }
    });

    await tx.workerProfile.create({
      data: {
        userId: user.id
      }
    });

    return user;
  });
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true }
  });

  if (!user) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }

  if (user.status !== 'ACTIVE') {
    throw { statusCode: 403, message: `Account is ${user.status}` };
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw { statusCode: 401, message: 'Invalid credentials' };
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const { passwordHash, ...safeUser } = user;

  return { safeUser, accessToken, refreshToken };
};

const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { 
      role: true,
      citizenProfile: true,
      workerProfile: true,
      managerProfile: true,
      adminProfile: true
    }
  });

  if (!user) {
    throw { statusCode: 404, message: 'User not found' };
  }

  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

module.exports = {
  registerCitizen,
  registerWorker,
  login,
  getUserById
};
