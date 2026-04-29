import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { join } from 'path';

config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function initDatabase() {
  try {
    const schema = readFileSync(join(process.cwd(), 'schema.sql'), 'utf-8');
    
    // Split by semicolon and execute each statement
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      await sql.query(statement);
      console.log('✓ Executed:', statement.substring(0, 50) + '...');
    }
    
    console.log('✅ Database schema initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
