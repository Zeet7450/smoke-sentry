import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text;

    if (!text) {
      return NextResponse.json({ ok: true });
    }

    // Handle commands
    if (text.startsWith('/')) {
      const command = text.split(' ')[0].toLowerCase();
      const args = text.split(' ').slice(1);

      switch (command) {
        case '/start':
          await handleStart(chatId);
          break;
        case '/aktivasi':
          await handleAktivasi(chatId, args[0]);
          break;
        case '/status':
          await handleStatus(chatId);
          break;
        case '/riwayat':
          await handleRiwayat(chatId);
          break;
        case '/matikan':
          await handleMatikan(chatId);
          break;
        case '/bagikan':
          await handleBagikan(chatId, args[0]);
          break;
        default:
          await sendMessage(chatId, 'Perintah tidak dikenali. Gunakan /start untuk melihat daftar perintah.');
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in Telegram webhook:', error);
    return NextResponse.json({ ok: true });
  }
}

async function handleStart(chatId: number) {
  const message = `
🔥 Selamat datang di SmokeSentry Bot!

SmokeSentry adalah detektor asap & api pintar yang langsung ngabarin kamu lewat Telegram.

📋 Perintah yang tersedia:
/aktivasi [PRODUCT_ID] - Hubungkan device ke akunmu
/status - Cek status device terakhir
/riwayat - Lihat 5 kejadian terakhir
/matikan - Snooze alarm selama 10 menit
/bagikan [email] - Bagikan akses device ke user lain

Mulai dengan menghubungkan device menggunakan perintah /aktivasi
  `;
  await sendMessage(chatId, message);
}

async function handleAktivasi(chatId: number, productId: string) {
  if (!productId) {
    await sendMessage(chatId, '❌ Format salah. Gunakan: /aktivasi [PRODUCT_ID]');
    return;
  }

  // Skip database operations if DATABASE_URL not set (for landing page only)
  if (!sql) {
    await sendMessage(chatId, '❌ Database tidak dikonfigurasi');
    return;
  }

  // Check if device exists
  const device = await sql`
    SELECT id, nama_lokasi FROM devices WHERE product_id = ${productId}
  `;

  if (device.length === 0) {
    await sendMessage(chatId, '❌ Device tidak ditemukan. Pastikan PRODUCT_ID benar.');
    return;
  }

  const deviceId = device[0].id;

  // Check if user exists with this chat_id
  const user = await sql`
    SELECT id, email FROM users WHERE telegram_chat_id = ${chatId}
  `;

  let userId: number;

  if (user.length === 0) {
    // Create new user
    const newUser = await sql`
      INSERT INTO users (telegram_chat_id, email)
      VALUES (${chatId}, 'telegram_user_${chatId}@temp.com')
      RETURNING id
    `;
    userId = newUser[0].id;
    await sendMessage(chatId, '📝 Akun baru dibuat. Silakan login di website untuk melengkapi profil.');
  } else {
    userId = user[0].id;
  }

  // Check if already linked
  const existingLink = await sql`
    SELECT id FROM device_users WHERE device_id = ${deviceId} AND user_id = ${userId}
  `;

  if (existingLink.length > 0) {
    await sendMessage(chatId, '⚠️ Device sudah terhubung ke akunmu.');
    return;
  }

  // Link device to user
  await sql`
    INSERT INTO device_users (device_id, user_id, role)
    VALUES (${deviceId}, ${userId}, 'owner')
  `;

  await sendMessage(chatId, `✅ Device "${device[0].nama_lokasi}" berhasil dihubungkan ke akunmu!`);
}

async function handleStatus(chatId: number) {
  if (!sql) {
    await sendMessage(chatId, '❌ Database tidak dikonfigurasi');
    return;
  }

  const user = await sql`
    SELECT id FROM users WHERE telegram_chat_id = ${chatId}
  `;

  if (user.length === 0) {
    await sendMessage(chatId, '❌ Akun tidak ditemukan. Gunakan /aktivasi terlebih dahulu.');
    return;
  }

  const devices = await sql`
    SELECT d.product_id, d.nama_lokasi, d.current_status, d.is_online, d.last_seen
    FROM devices d
    JOIN device_users du ON d.id = du.device_id
    WHERE du.user_id = ${user[0].id}
  `;

  if (devices.length === 0) {
    await sendMessage(chatId, '❌ Tidak ada device yang terhubung.');
    return;
  }

  let message = '📊 Status Device:\n\n';
  for (const device of devices) {
    const statusEmoji = device.current_status === 'AMAN' ? '✅' : '🔴';
    const onlineEmoji = device.is_online ? '🟢' : '⚫';
    message += `${statusEmoji} ${device.nama_lokasi} (${device.product_id})\n`;
    message += `   ${onlineEmoji} ${device.current_status}\n`;
    message += `   Terakhir dilihat: ${new Date(device.last_seen).toLocaleString('id-ID')}\n\n`;
  }

  await sendMessage(chatId, message);
}

async function handleRiwayat(chatId: number) {
  if (!sql) {
    await sendMessage(chatId, '❌ Database tidak dikonfigurasi');
    return;
  }

  const user = await sql`
    SELECT id FROM users WHERE telegram_chat_id = ${chatId}
  `;

  if (user.length === 0) {
    await sendMessage(chatId, '❌ Akun tidak ditemukan. Gunakan /aktivasi terlebih dahulu.');
    return;
  }

  const alerts = await sql`
    SELECT a.jenis, a.waktu_mulai, a.waktu_selesai, d.nama_lokasi
    FROM alerts a
    JOIN devices d ON a.device_id = d.id
    JOIN device_users du ON d.id = du.device_id
    WHERE du.user_id = ${user[0].id}
    ORDER BY a.waktu_mulai DESC
    LIMIT 5
  `;

  if (alerts.length === 0) {
    await sendMessage(chatId, '✅ Tidak ada riwayat kejadian.');
    return;
  }

  let message = '📜 5 Kejadian Terakhir:\n\n';
  for (const alert of alerts) {
    const status = alert.waktu_selesai ? 'Selesai' : 'Berlangsung';
    message += `🔴 ${alert.jenis} - ${alert.nama_lokasi}\n`;
    message += `   ${new Date(alert.waktu_mulai).toLocaleString('id-ID')}\n`;
    message += `   Status: ${status}\n\n`;
  }

  await sendMessage(chatId, message);
}

async function handleMatikan(chatId: number) {
  if (!sql) {
    await sendMessage(chatId, '❌ Database tidak dikonfigurasi');
    return;
  }

  const user = await sql`
    SELECT id FROM users WHERE telegram_chat_id = ${chatId}
  `;

  if (user.length === 0) {
    await sendMessage(chatId, '❌ Akun tidak ditemukan. Gunakan /aktivasi terlebih dahulu.');
    return;
  }

  const devices = await sql`
    SELECT d.id FROM devices d
    JOIN device_users du ON d.id = du.device_id
    WHERE du.user_id = ${user[0].id}
  `;

  if (devices.length === 0) {
    await sendMessage(chatId, '❌ Tidak ada device yang terhubung.');
    return;
  }

  // Snooze all devices for 10 minutes
  const snoozeUntil = new Date(Date.now() + 10 * 60 * 1000);
  for (const device of devices) {
    await sql`
      INSERT INTO settings (device_id, snooze_until)
      VALUES (${device.id}, ${snoozeUntil.toISOString()})
      ON CONFLICT (device_id) DO UPDATE SET snooze_until = ${snoozeUntil.toISOString()}
    `;
  }

  await sendMessage(chatId, '🔕 Alarm disnooze selama 10 menit.');
}

async function handleBagikan(chatId: number, email: string) {
  if (!email) {
    await sendMessage(chatId, '❌ Format salah. Gunakan: /bagikan [email]');
    return;
  }

  await sendMessage(chatId, '📧 Fitur ini akan segera tersedia. Untuk sementara, silakan login di website untuk membagikan akses device.');
}

async function sendMessage(chatId: number, text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error('TELEGRAM_BOT_TOKEN not set');
    return;
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
    }),
  });
}
