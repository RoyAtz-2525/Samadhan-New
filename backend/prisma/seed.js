const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

// ─── Seed Credentials ────────────────────────────────────────────────────────
// All accounts use the same password: Samadhan@123
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  // ── 1. Roles ────────────────────────────────────────────────────────────────
  const roles = ['CITIZEN', 'ADMIN', 'MANAGER', 'WORKER', 'SUPER_ADMIN'];

  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, isDefault: roleName === 'CITIZEN' }
    });
  }

  // ── 2. Permissions ──────────────────────────────────────────────────────────
  const permissions = [
    { name: 'ISSUE_CREATE',    resource: 'ISSUE',     action: 'CREATE'  },
    { name: 'ISSUE_VIEW',      resource: 'ISSUE',     action: 'VIEW'    },
    { name: 'ISSUE_REVIEW',    resource: 'ISSUE',     action: 'REVIEW'  },
    { name: 'ISSUE_APPROVE',   resource: 'ISSUE',     action: 'APPROVE' },
    { name: 'ISSUE_REJECT',    resource: 'ISSUE',     action: 'REJECT'  },
    { name: 'ISSUE_ASSIGN',    resource: 'ISSUE',     action: 'ASSIGN'  },
    { name: 'WORKER_VIEW',     resource: 'WORKER',    action: 'VIEW'    },
    { name: 'WORKER_ASSIGN',   resource: 'WORKER',    action: 'ASSIGN'  },
    { name: 'WORK_VIEW',       resource: 'WORK',      action: 'VIEW'    },
    { name: 'WORK_VERIFY',     resource: 'WORK',      action: 'VERIFY'  },
    { name: 'PAYMENT_VIEW',    resource: 'PAYMENT',   action: 'VIEW'    },
    { name: 'PAYMENT_APPROVE', resource: 'PAYMENT',   action: 'APPROVE' },
    { name: 'ANALYTICS_VIEW',  resource: 'ANALYTICS', action: 'VIEW'    },
    { name: 'USER_MANAGE',     resource: 'USER',      action: 'MANAGE'  },
    { name: 'ROLE_MANAGE',     resource: 'ROLE',      action: 'MANAGE'  },
    { name: 'AUDIT_VIEW',      resource: 'AUDIT',     action: 'VIEW'    },
    { name: 'FEEDBACK_CREATE', resource: 'FEEDBACK',  action: 'CREATE'  }
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm
    });
  }

  // ── 3. Role → Permission Mappings ───────────────────────────────────────────
  const rolePermissions = {
    CITIZEN:     ['ISSUE_CREATE', 'ISSUE_VIEW', 'FEEDBACK_CREATE'],
    ADMIN:       ['ISSUE_VIEW', 'ISSUE_REVIEW', 'ISSUE_APPROVE', 'ISSUE_REJECT', 'WORKER_VIEW', 'ANALYTICS_VIEW', 'AUDIT_VIEW'],
    MANAGER:     ['ISSUE_VIEW', 'WORKER_VIEW', 'WORKER_ASSIGN', 'WORK_VIEW'],
    WORKER:      ['WORK_VIEW', 'WORK_VERIFY'],
    SUPER_ADMIN: permissions.map(p => p.name)
  };

  for (const [roleName, perms] of Object.entries(rolePermissions)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    for (const permName of perms) {
      const permission = await prisma.permission.findUnique({ where: { name: permName } });
      if (role && permission) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
          update: {},
          create: { roleId: role.id, permissionId: permission.id }
        });
      }
    }
  }

  // ── 4. Issue Categories ─────────────────────────────────────────────────────
  const categories = [
    { name: 'Road Damage',    description: 'Potholes, broken roads, damaged pavements' },
    { name: 'Street Light',   description: 'Broken or non-functional street lights'     },
    { name: 'Garbage',        description: 'Uncollected garbage or illegal dumping'     },
    { name: 'Drainage',       description: 'Blocked drains, flooding, open manholes'    },
    { name: 'Water Leakage',  description: 'Burst pipes or public water leaks'          },
    { name: 'Public Toilet',  description: 'Unclean or broken public facilities'        },
    { name: 'Traffic/Safety', description: 'Broken signals, missing signs, hazards'     },
    { name: 'Other',          description: 'Other civic issues not listed above'        }
  ];

  for (const cat of categories) {
    await prisma.issueCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    });
  }

  // ── 5. Seed Users (one per role) ────────────────────────────────────────────
  const PASSWORD    = 'Samadhan@123';
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const seedUsers = [
    { email: 'superadmin@samadhan.dev', role: 'SUPER_ADMIN' },
    { email: 'admin@samadhan.dev',      role: 'ADMIN'       },
    { email: 'manager@samadhan.dev',    role: 'MANAGER'     },
    { email: 'worker@samadhan.dev',     role: 'WORKER'      },
    { email: 'citizen@samadhan.dev',    role: 'CITIZEN'     },
  ];

  for (const u of seedUsers) {
    const role = await prisma.role.findUnique({ where: { name: u.role } });

    const user = await prisma.user.upsert({
      where:  { email: u.email },
      update: {},
      create: {
        email:        u.email,
        passwordHash: passwordHash,
        status:       'ACTIVE',
        roleId:       role.id,
      }
    });

    // Create role-specific profile
    if (u.role === 'CITIZEN') {
      await prisma.citizenProfile.upsert({
        where:  { userId: user.id },
        update: {},
        create: { userId: user.id }
      });
    } else if (u.role === 'ADMIN') {
      await prisma.adminProfile.upsert({
        where:  { userId: user.id },
        update: {},
        create: { userId: user.id, department: 'General' }
      });
    } else if (u.role === 'MANAGER') {
      await prisma.managerProfile.upsert({
        where:  { userId: user.id },
        update: {},
        create: { userId: user.id, region: 'Central', department: 'Operations' }
      });
    } else if (u.role === 'WORKER') {
      await prisma.workerProfile.upsert({
        where:  { userId: user.id },
        update: {},
        create: { userId: user.id }
      });
    }

    console.log(`✔ ${u.role.padEnd(12)} → ${u.email}`);
  }

  console.log('\n✅ Seeding completed.');
  console.log('──────────────────────────────────');
  console.log('  Password: Samadhan@123');
  console.log('──────────────────────────────────');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
