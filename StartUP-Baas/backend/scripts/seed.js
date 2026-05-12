const { Client } = require('pg');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL is not set. Set it in the environment or in .env and retry.');
  process.exit(1);
}

async function seed() {
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const users = [
      { email: 'admin@example.com', password: 'AdminPass123!', full_name: 'Admin User', role: 'admin', phone: '1234567890' },
      { email: 'user1@example.com', password: 'UserPass1!', full_name: 'User One', role: 'member', phone: '1112223333' },
    ];

    // Create minimal tables if they don't exist so seed works without running migrations
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY,
        email text UNIQUE NOT NULL,
        password_hash text NOT NULL,
        full_name text NOT NULL,
        phone_number varchar(20),
        role varchar(20) DEFAULT 'member',
        is_active boolean DEFAULT true,
        email_verified boolean DEFAULT false,
        last_login_at timestamp,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id uuid PRIMARY KEY,
        title text NOT NULL,
        description text,
        type varchar(20),
        status varchar(30) DEFAULT 'pending',
        priority varchar(20) DEFAULT 'medium',
        assigned_to uuid NOT NULL,
        assigned_by uuid,
        is_personal boolean DEFAULT false,
        sort_order integer DEFAULT 0,
        due_date timestamp,
        accepted_at timestamp,
        completed_at timestamp,
        acknowledged_at timestamp,
        revision_notes text,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id uuid PRIMARY KEY,
        user_id uuid NOT NULL,
        title text NOT NULL,
        content text,
        week_start date,
        week_end date,
        status varchar(20) DEFAULT 'submitted',
        admin_feedback text,
        submitted_at timestamp,
        reviewed_at timestamp,
        reviewed_by uuid,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      )
    `);

    for (const u of users) {
      const hash = await bcrypt.hash(u.password, 10);
      const id = randomUUID();
      await client.query(
        `INSERT INTO users (id, email, password_hash, full_name, phone_number, role, is_active, email_verified)
         VALUES ($1,$2,$3,$4,$5,$6,true,true)
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash RETURNING id`,
        [id, u.email, hash, u.full_name, u.phone, u.role]
      );
    }

    const adminRes = await client.query('SELECT id FROM users WHERE email=$1', ['admin@example.com']);
    const user1Res = await client.query('SELECT id FROM users WHERE email=$1', ['user1@example.com']);
    if (!adminRes.rows[0] || !user1Res.rows[0]) {
      throw new Error('Inserted users not found');
    }
    const adminId = adminRes.rows[0].id;
    const user1Id = user1Res.rows[0].id;

    // Insert a sample task assigned to user1
    const taskId = randomUUID();
    await client.query(
      `INSERT INTO tasks (id, title, description, type, priority, assigned_to, assigned_by, is_personal, due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,false, NOW() + interval '7 days') ON CONFLICT DO NOTHING`,
      [taskId, 'Welcome Task', 'This task was seeded for frontend testing', 'assigned', 'medium', user1Id, adminId]
    );

    // Insert a sample report for admin
    const reportId = randomUUID();
    await client.query(
      `INSERT INTO reports (id, user_id, title, content, week_start, week_end, status)
       VALUES ($1,$2,$3,$4, CURRENT_DATE - interval '7 days', CURRENT_DATE, 'submitted') ON CONFLICT DO NOTHING`,
      [reportId, adminId, 'Weekly Report', 'Seeded report content']
    );

    console.log('Seeding complete');
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

seed();
