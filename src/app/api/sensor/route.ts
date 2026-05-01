import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product_id, mq2, mq135, flame, status } = body;

    if (!product_id || mq2 === undefined || mq135 === undefined || flame === undefined || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Skip database operations if DATABASE_URL not set (for landing page only)
    if (!sql) {
      return NextResponse.json(
        { error: 'Database tidak dikonfigurasi' },
        { status: 503 }
      );
    }

    // Get device ID from device_code
    const device = await sql`
      SELECT id, status FROM devices WHERE device_code = ${product_id}
    `;

    if (device.length === 0) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    const deviceId = device[0].id;
    const previousStatus = device[0].status;

    // Insert sensor reading
    await sql`
      INSERT INTO sensor_readings (device_id, mq2_value, mq135_value, flame_value, is_alert)
      VALUES (${deviceId}, ${mq2}, ${mq135}, ${flame}, ${status === 'BAHAYA'})
    `;

    // Update device status and last_seen
    await sql`
      UPDATE devices
      SET status = ${status},
          last_seen_at = NOW(),
          updated_at = NOW()
      WHERE id = ${deviceId}
    `;

    // Check if we need to trigger alert (status changed to BAHAYA)
    if (status === 'BAHAYA' && previousStatus !== 'BAHAYA') {
      // Create alert record
      const alertType = determineAlertType(mq2, mq135, flame);
      await sql`
        INSERT INTO alerts (device_id, type, severity, mq2_value, mq135_value, flame_value, message, is_resolved)
        VALUES (${deviceId}, ${alertType}, 'high', ${mq2}, ${mq135}, ${flame}, 'Alert detected', false)
      `;
    }

    // Check if status changed from BAHAYA to AMAN
    if (status === 'AMAN' && previousStatus === 'BAHAYA') {
      // Close active alerts
      await sql`
        UPDATE alerts
        SET is_resolved = true, resolved_at = NOW()
        WHERE device_id = ${deviceId} AND is_resolved = false
      `;
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in /api/sensor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function determineAlertType(mq2: number, mq135: number, flame: number): string {
  const alerts = [];
  if (mq2 > 450) alerts.push('smoke');
  if (mq135 > 450) alerts.push('vape');
  if (flame > 3500) alerts.push('flame');
  return alerts.length > 0 ? alerts.join('+') : 'unknown';
}
