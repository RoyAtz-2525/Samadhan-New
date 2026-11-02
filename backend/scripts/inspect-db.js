const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');

async function inspectDatabase() {
  console.log('================================================================');
  console.log('  SAMADHAN — NEON DATABASE READ-ONLY INSPECTION');
  console.log('================================================================\n');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL is not set in backend/.env');
    process.exit(1);
  }

  // Safely parse and display database context without printing password or credentials
  try {
    const urlObj = new URL(dbUrl);
    console.log('Database Connection Context (Sanitized):');
    console.log('  • Protocol:   ', urlObj.protocol);
    console.log('  • Host:       ', urlObj.hostname);
    console.log('  • Database:   ', urlObj.pathname.replace(/^\//, ''));
    console.log('  • Port:       ', urlObj.port || '5432 (default)');
    console.log('  • Endpoint:   ', urlObj.hostname.split('.')[0]);
    console.log('  • SSL Mode:   ', urlObj.searchParams.get('sslmode') || 'require');
    console.log('  • User:       ', urlObj.username ? `${urlObj.username.slice(0, 3)}***` : 'N/A');
    console.log('  • Password:    [PROTECTED - NOT DISPLAYED]');
    console.log('');
  } catch (err) {
    console.log('  • Host Parsing Warning:', err.message);
  }

  const prisma = new PrismaClient({
    datasources: {
      db: { url: dbUrl },
    },
    log: ['error'],
  });

  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('✓ Successfully connected to Neon database.\n');

    // 0. Query all tables in public schema
    console.log('--- 0. Existing Tables in Database ---');
    const existingTables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    console.log(`  • Total tables found: ${existingTables.length}`);
    console.log('  • Tables:', existingTables.map(t => t.table_name).join(', '));
    console.log('');

    // 1. Query _prisma_migrations table
    console.log('--- 1. Migration History Table (_prisma_migrations) ---');
    const migrationsTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = '_prisma_migrations'
      ) as "exists";
    `;
    const hasMigrationsTable = migrationsTableExists[0]?.exists === true;
    console.log(`  • _prisma_migrations table exists: ${hasMigrationsTable ? 'YES' : 'NO'}`);

    if (hasMigrationsTable) {
      const recordedMigrations = await prisma.$queryRaw`
        SELECT migration_name, finished_at, rolled_back_at, applied_steps_count
        FROM _prisma_migrations
        ORDER BY started_at ASC;
      `;
      console.log(`  • Total recorded migrations: ${recordedMigrations.length}`);
      if (recordedMigrations.length > 0) {
        recordedMigrations.forEach((m, idx) => {
          const status = m.rolled_back_at ? 'ROLLED BACK' : (m.finished_at ? 'APPLIED' : 'IN PROGRESS');
          console.log(`    [${idx + 1}] ${m.migration_name} -> ${status} (steps: ${m.applied_steps_count})`);
        });
      } else {
        console.log('    (Table exists but is empty - 0 migrations recorded)');
      }
    }
    console.log('');

    // 2. Query WebhookEvent Table
    console.log('--- 2. WebhookEvent Table Verification ---');
    const webhookTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'WebhookEvent'
      ) as "exists";
    `;
    const hasWebhookTable = webhookTableExists[0]?.exists === true;
    console.log(`  • WebhookEvent table exists: ${hasWebhookTable ? 'YES' : 'NO'}`);

    if (hasWebhookTable) {
      const webhookColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'WebhookEvent'
        ORDER BY ordinal_position;
      `;
      console.log('  • WebhookEvent columns:', webhookColumns.map(c => `${c.column_name} (${c.data_type})`).join(', '));
    }
    console.log('');

    // 3. Query Payment Table (idempotencyKey & unique constraint)
    console.log('--- 3. Payment Table & Idempotency Key ---');
    const paymentColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Payment'
        AND column_name IN ('idempotencyKey', 'payoutId', 'payoutStatus', 'payoutMode', 'payoutUtr', 'approvedById');
    `;
    console.log('  • Payout columns in Payment table:');
    paymentColumns.forEach(c => {
      console.log(`    - ${c.column_name}: ${c.data_type} (nullable: ${c.is_nullable})`);
    });

    const paymentIndexes = await prisma.$queryRaw`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'Payment'
        AND (indexname LIKE '%idempotency%' OR indexdef LIKE '%idempotency%');
    `;
    console.log('  • Idempotency indexes on Payment table:');
    if (paymentIndexes.length > 0) {
      paymentIndexes.forEach(idx => {
        const isUnique = idx.indexdef.toLowerCase().includes('unique');
        console.log(`    - ${idx.indexname}: ${isUnique ? 'UNIQUE' : 'NON-UNIQUE'} (${idx.indexdef})`);
      });
    } else {
      console.log('    - [None found]');
    }
    console.log('');

    // 4. Query RewardLedger Table
    console.log('--- 4. Citizen RewardLedger Table Verification ---');
    const rewardTableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'RewardLedger'
      ) as "exists";
    `;
    const hasRewardTable = rewardTableExists[0]?.exists === true;
    console.log(`  • RewardLedger table exists: ${hasRewardTable ? 'YES' : 'NO'}`);
    console.log('');

    // 5. Key Table Row Counts
    console.log('--- 5. Database Row Counts ---');
    const userCount = await prisma.user.count();
    const paymentCount = await prisma.payment.count();
    const issueCount = await prisma.issue.count();
    const workAssignmentCount = await prisma.workAssignment.count();
    console.log(`  • User table row count:           ${userCount}`);
    console.log(`  • Payment table row count:        ${paymentCount}`);
    console.log(`  • Issue table row count:          ${issueCount}`);
    console.log(`  • WorkAssignment table row count: ${workAssignmentCount}`);
    console.log('');

    console.log('================================================================');
    console.log('  INSPECTION COMPLETE (READ-ONLY)');
    console.log('  No database modifications were made.');
    console.log('================================================================\n');

  } catch (err) {
    console.error('Inspection failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  inspectDatabase().catch(err => {
    console.error('Fatal error during inspection:', err.message);
    process.exit(1);
  });
}

module.exports = { inspectDatabase };
