import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { devices, sensorLogs } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      device_code,
      api_key,
      mq2_value    = 0,
      mq135_value  = 0,
      flame_value  = 0,
      flame_detected = false,
      is_alert     = false,
    } = body

    if (!device_code) {
      return NextResponse.json(
        { error: 'device_code is required' },
        { status: 400 }
      )
    }

    // Cari device — coba match device_code + api_key dulu
    let rows = await db
      .select()
      .from(devices)
      .where(
        and(
          eq(devices.device_code, String(device_code).toUpperCase()),
          eq(devices.apikey, String(api_key))
        )
      )
      .limit(1)

    // Fallback: hanya device_code (untuk device lama tanpa api_key)
    if (!rows[0] && device_code) {
      rows = await db
        .select()
        .from(devices)
        .where(eq(devices.device_code, String(device_code).toUpperCase()))
        .limit(1)
    }

    if (!rows[0]) {
      return NextResponse.json(
        { error: 'Device not found', deleted: true },
        { status: 404 }
      )
    }

    const device = rows[0]
    const now    = new Date()

    // Validate API key if device has one
    if (device.apikey && api_key && device.apikey !== api_key) {
      return NextResponse.json(
        { error: 'Invalid API key', deleted: true },
        { status: 401 }
      )
    }

    // Update status device → online + nilai sensor terakhir
    await db
      .update(devices)
      .set({
        status:     'online',
        last_seen:  now,
        is_online:  true,
        last_seen_at: Date.now(),
        lastseenat: now,
        mq2_last:   Number(mq2_value),
        mq135_last: Number(mq135_value),
        flame_last: Number(flame_value),
        alert_last: Boolean(is_alert),
      })
      .where(eq(devices.id, device.id))

    // Simpan ke sensor_logs untuk grafik
    // (skip jika tabel belum ada — tidak crash)
    try {
      await db.insert(sensorLogs).values({
        device_id:      device.id,
        mq2:            Number(mq2_value),
        mq135:          Number(mq135_value),
        flame:          Number(flame_value),
        flame_detected: Boolean(flame_detected),
        is_alert:       Boolean(is_alert),
        created_at:     now,
      })
    } catch (logErr) {
      // Tabel sensor_logs belum ada → lanjut saja
      console.warn('[ingest] sensor_logs insert skipped:', logErr)
    }

    return NextResponse.json({
      ok:     true,
      status: 'online',
      device: device.name,
    })

  } catch (err) {
    console.error('[ingest] Error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
