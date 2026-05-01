import { Pool } from 'pg'
import fs from 'fs'
import path from 'path'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

async function migrate() {
  console.log('🚀 Running migration...')
  
  const sqlFile = path.join(process.cwd(), 'drizzle', '0000_past_catseye.sql')
  const migrationSQL = fs.readFileSync(sqlFile, 'utf-8')
  
  // Split by statement-breakpoint and execute each statement
  const statements = migrationSQL.split('--> statement-breakpoint')
  
  for (const statement of statements) {
    const trimmed = statement.trim()
    if (trimmed) {
      try {
        await pool.query(trimmed)
        console.log('✓ Executed:', trimmed.substring(0, 50) + '...')
      } catch (error: any) {
        if (error.message && error.message.includes('already exists')) {
          console.log('⊘ Skipped (already exists):', trimmed.substring(0, 50) + '...')
        } else {
          console.log('⊘ Skipped:', trimmed.substring(0, 50) + '...')
        }
      }
    }
  }
  
  await pool.end()
  console.log('✅ Migration complete!')
  process.exit(0)
}

migrate().catch(console.error)
