// Run database migrations against Supabase
// Usage: node scripts/run-migration.mjs [migration-file]

import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'
import dotenv from 'dotenv'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '..', '.env.local') })

const { Pool } = pg

async function runMigration() {
  const migrationFile = process.argv[2] || '012_lead_activity.sql'
  const migrationPath = join(__dirname, '..', 'supabase', 'migrations', migrationFile)

  console.log(`Running migration: ${migrationFile}`)

  // Parse connection string from Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const dbPassword = process.env.SUPABASE_DB_PASSWORD?.trim()

  if (!supabaseUrl || !dbPassword) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_DB_PASSWORD')
    process.exit(1)
  }

  // Extract project ref from URL
  const projectRef = supabaseUrl.replace('https://', '').split('.')[0]
  // Use transaction pooler connection (port 6543) for migrations - no sslmode in URL, set in pool config
  const connectionString = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-us-west-2.pooler.supabase.com:6543/postgres`

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    const sql = readFileSync(migrationPath, 'utf8')
    console.log('Executing SQL...')
    await pool.query(sql)
    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigration()
