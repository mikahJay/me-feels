import fs from 'fs';
import path from 'path';
import { pool } from './index';

async function migrate(): Promise<void> {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;

    const { rows } = await pool.query(
      'SELECT 1 FROM public.schema_migrations WHERE filename = $1',
      [file]
    );

    if (rows.length > 0) {
      console.log(`  ⏭  Skipping ${file} (already applied)`);
      continue;
    }

    console.log(`  ▶️  Applying ${file}…`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await pool.query(sql);
    await pool.query(
      'INSERT INTO public.schema_migrations (filename) VALUES ($1)',
      [file]
    );
    console.log(`  ✅ Applied ${file}`);
  }

  await pool.end();
  console.log('Migrations complete.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
