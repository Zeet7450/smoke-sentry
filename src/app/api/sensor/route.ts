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

    // Get device ID from product_id
    const device = await sql`
      SELECT id, current_status FROM devices WHERE product_id = ${product_id}
    `;

    if (device.length === 0) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    const deviceId = device[0].id;
    const previousStatus = device[0].current_status;

    // Insert sensor log
    await sql`
      INSERT INTO sensor_logs (device_id, mq2, mq135, flame, status)
      VALUES (${deviceId}, ${mq2}, ${mq135}, ${flame}, ${status})
    `;

    // Update device status and last_seen
    await sql`
      UPDATE devices
      SET current_status = ${status},
          last_seen = NOW(),
          is_online = true
      WHERE id = ${deviceId}
    `;

    // Check if we need to trigger alert (status changed to BAHAYA)
    if (status === 'BAHAYA' && previousStatus !== 'BAHAYA') {
      // Get all users for this device
      const users = await sql`
        SELECT u.telegram_chat_id, u.email
        FROM device_users du
        JOIN users u ON du.user_id = u.id
        WHERE du.device_id = ${deviceId}
      `;

      // Check if snooze is active
      const settings = await sql`
        SELECT snooze_until FROM settings WHERE device_id = ${deviceId}
      `;

      const isSnoozed = settings.length > 0 && settings[0].snooze_until && new Date(settings[0].snooze_until) > new Date();

      if (!isSnoozed) {
        // Create alert record
        const alertType = determineAlertType(mq2, mq135, flame);
        await sql`
          INSERT INTO alerts (device_id, jenis, is_active)
          VALUES (${deviceId}, ${alertType}, true)
        `;

        // Send Telegram alerts (placeholder - will implement with bot library)
        for (const user of users) {
          if (user.telegram_chat_id) {
            await sendTelegramAlert(user.telegram_chat_id, alertType, product_id);
          }
        }
      }
    }

    // Check if status changed from BAHAYA to AMAN
    if (status === 'AMAN' && previousStatus === 'BAHAYA') {
      // Close active alerts
      await sql`
        UPDATE alerts
        SET is_active = false, waktu_selesai = NOW()
        WHERE device_id = ${deviceId} AND is_active = true
      `;

      // Send "all clear" notification
      const users = await sql`
        SELECT u.telegram_chat_id FROM device_users du
        JOIN users u ON du.user_id = u.id
        WHERE du.device_id = ${deviceId}
      `;

      for (const user of users) {
        if (user.telegram_chat_id) {
          await sendTelegramAllClear(user.telegram_chat_id, product_id);
        }
      }
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
  if (mq2 > 450) alerts.push('GAS');
  if (mq135 > 450) alerts.push('VAPE');
  if (flame > 3500) alerts.push('API');
  return alerts.length > 0 ? alerts.join('+') : 'UNKNOWN';
}

async function sendTelegramAlert(chatId: number, alertType: string, productId: string) {
  // Placeholder for Telegram bot implementation
  // Will be implemented with node-telegram-bot-api
  console.log(`Sending alert to ${chatId}: ${alertType} detected on device ${productId}`);
}

async function sendTelegramAllClear(chatId: number, productId: string) {
  // Placeholder for Telegram bot implementation
  console.log(`Sending all clear to ${chatId} for device ${productId}`);
}
