import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const device_id = searchParams.get('device_id');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!device_id) {
      return NextResponse.json(
        { error: 'device_id parameter is required' },
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

    // Get device ID from product_id
    const device = await sql`
      SELECT id FROM devices WHERE product_id = ${device_id}
    `;

    if (device.length === 0) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    const deviceId = device[0].id;

    // Get sensor logs - only BAHAYA status + latest entry regardless of status
    const dangerLogs = await sql`
      SELECT mq2, mq135, flame, status, logged_at
      FROM sensor_logs
      WHERE device_id = ${deviceId} AND status = 'BAHAYA'
      ORDER BY logged_at DESC
      LIMIT ${limit}
    `;

    // Get the latest log regardless of status for current state
    const latestLog = await sql`
      SELECT mq2, mq135, flame, status, logged_at
      FROM sensor_logs
      WHERE device_id = ${deviceId}
      ORDER BY logged_at DESC
      LIMIT 1
    `;

    // If latest log is not AMAN and not already in dangerLogs, add it
    let result = dangerLogs;
    if (latestLog.length > 0 && latestLog[0].status !== 'BAHAYA') {
      result = [latestLog[0], ...dangerLogs];
    }

    // Get current device status
    const deviceStatus = await sql`
      SELECT current_status, is_online, last_seen, nama_lokasi
      FROM devices
      WHERE id = ${deviceId}
    `;

    return NextResponse.json({
      sensor_data: result,
      device_status: deviceStatus[0] || null,
    });
  } catch (error) {
    console.error('Error in /api/data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
