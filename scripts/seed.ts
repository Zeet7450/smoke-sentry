import 'dotenv/config'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_w7EcZMvYWmR1@ep-billowing-mountain-amqa74k5-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
})

async function seed() {
  console.log('🌱 Seeding database...')

  // 1. Buat user demo
  const password_hash = await bcrypt.hash('demo123456', 12)
  const userResult = await pool.query(`
    INSERT INTO users (email, password_hash, name, telegram_chat_id, is_verified)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (email) DO UPDATE SET password_hash = $2
    RETURNING id, email
  `, ['demo@smokesentry.com', password_hash, 'Demo User', '123456789', true])
  
  const user = userResult.rows[0]
  console.log('✓ User created:', user.email)

  // 2. Buat device demo
  const deviceResult = await pool.query(`
    INSERT INTO devices (owner_id, device_code, name, location, status, firmware_version)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (device_code) DO UPDATE SET name = $3, location = $4
    RETURNING id, device_code
  `, [user.id, 'SS-001-DEMO', 'SmokeSentry Demo', 'Ruang Tamu', 'online', 'v2.1.0'])
  
  const device = deviceResult.rows[0]
  console.log('✓ Device created:', device.device_code)

  // 3. Generate sensor readings 24 jam terakhir untuk chart
  const readings = []
  const now = Date.now()
  for (let i = 288; i >= 0; i--) {
    const t = new Date(now - i * 5 * 60 * 1000) // tiap 5 menit
    const isAlert = Math.random() < 0.05
    readings.push({
      device_id: device.id,
      mq2_value: Math.floor(100 + Math.random() * 200 + (isAlert ? 400 : 0)),
      mq135_value: Math.floor(80 + Math.random() * 150 + (isAlert ? 300 : 0)),
      flame_value: Math.floor(isAlert ? 50 + Math.random() * 100 : 800 + Math.random() * 200),
      flame_detected: isAlert && Math.random() < 0.3,
      is_alert: isAlert,
      recorded_at: t,
    })
  }

  for (const reading of readings) {
    await pool.query(`
      INSERT INTO sensor_readings (device_id, mq2_value, mq135_value, flame_value, flame_detected, is_alert, recorded_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [reading.device_id, reading.mq2_value, reading.mq135_value, reading.flame_value, reading.flame_detected, reading.is_alert, reading.recorded_at])
  }
  console.log(`✓ ${readings.length} sensor readings inserted`)

  // 4. Buat beberapa alert history
  await pool.query(`
    INSERT INTO alerts (device_id, type, severity, mq2_value, message, telegram_sent, is_resolved, resolved_at, resolved_by, triggered_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `, [device.id, 'smoke', 'high', 892, 'MQ-2 membaca 892 ppm, melebihi threshold 400', true, true, new Date(), user.id, new Date(now - 2 * 3600000)])

  await pool.query(`
    INSERT INTO alerts (device_id, type, severity, mq135_value, message, telegram_sent, is_resolved, triggered_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [device.id, 'vape', 'medium', 650, 'MQ-135 mendeteksi VOC tinggi: 650 ppm', true, false, new Date(now - 30 * 60000)])

  await pool.query(`
    INSERT INTO alerts (device_id, type, severity, mq2_value, message, telegram_sent, is_resolved, resolved_at, resolved_by, triggered_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `, [device.id, 'gas_lpg', 'critical', 1450, 'Kebocoran gas terdeteksi! MQ-2: 1450 ppm', true, true, new Date(now - 6 * 3600000), user.id, new Date(now - 8 * 3600000)])
  
  console.log('✓ Alert history inserted')
  console.log('✅ Seeding complete!')
  console.log('\nLogin credentials:')
  console.log('  Email   : demo@smokesentry.com')
  console.log('  Password: demo123456')
  
  await pool.end()
  process.exit(0)
}

seed().catch(console.error)
