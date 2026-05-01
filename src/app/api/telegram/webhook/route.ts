import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { devices, users, sensor_readings, alerts, settings } from '@/lib/schema';
import { eq, and, desc, lt, gt } from 'drizzle-orm';

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
        case '/stop':
          await handleStop(chatId);
          break;
        case '/on':
          await handleOn(chatId);
          break;
        case '/status':
          await handleStatus(chatId);
          break;
        case '/devices':
          await handleDevices(chatId);
          break;
        case '/alert':
        case '/alerts':
          await handleAlert(chatId);
          break;
        case '/test':
          await handleTest(chatId);
          break;
        case '/myid':
          await handleMyId(chatId);
          break;
        case '/help':
          await handleHelp(chatId);
          break;
        case '/about':
          await handleAbout(chatId);
          break;
        case '/aktivasi':
          await handleAktivasi(chatId, args[0]);
          break;
        default:
          await sendMessage(chatId, '❓ Perintah tidak dikenal.\nKetik /help untuk melihat daftar perintah.');
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error in Telegram webhook:', error);
    return NextResponse.json({ ok: true });
  }
}

async function handleStart(chatId: number) {
  if (!db) {
    await sendMessage(chatId, '❌ Database tidak dikonfigurasi');
    return;
  }

  // Find user by telegramchatid or create/update
  const user = await db.select().from(users)
    .where(eq(users.telegramchatid, String(chatId)))
    .limit(1);

  if (user[0]) {
    // Update if exists
    await db.update(users)
      .set({ telegramchatid: String(chatId) })
      .where(eq(users.id, user[0].id));
  }

  const message = `
� <b>Selamat datang di SmokeSentry!</b>
━━━━━━━━━━━━━━━━━━━━
Chat ID kamu sudah terdaftar:
<code>${chatId}</code>

📋 <b>Langkah selanjutnya:</b>
1. Buka dashboard SmokeSentry
2. Masuk ke Settings device kamu
3. Tab Notifikasi → isi Chat ID di atas
4. Centang 'Notifikasi Telegram aktif'
5. Klik 'Test Kirim Notifikasi' untuk uji coba

Ketik /help untuk panduan lengkap.
  `;
  await sendMessage(chatId, message);
}

async function handleStop(chatId: number) {
  if (!db) {
    await sendMessage(chatId, '❌ Database tidak dikonfigurasi');
    return;
  }

  // Find user by chatId
  const user = await db.select().from(users)
    .where(eq(users.telegramchatid, String(chatId)))
    .limit(1);

  if (!user[0]) {
    await sendMessage(chatId, '❌ Chat ID kamu belum terdaftar. Ketik /start untuk mendaftar.');
    return;
  }

  // Set telegram_active = false for all devices owned by this user
  await db.update(devices)
    .set({ telegram_active: false })
    .where(eq(devices.owner_id, user[0].id));

  await sendMessage(chatId, '🔕 <b>Notifikasi dinonaktifkan.</b>\nKetik /on untuk mengaktifkan kembali.');
}

async function handleOn(chatId: number) {
  if (!db) {
    await sendMessage(chatId, '❌ Database tidak dikonfigurasi');
    return;
  }

  // Find user by chatId
  const user = await db.select().from(users)
    .where(eq(users.telegramchatid, String(chatId)))
    .limit(1);

  if (!user[0]) {
    await sendMessage(chatId, '❌ Chat ID kamu belum terdaftar. Ketik /start untuk mendaftar.');
    return;
  }

  // Set telegram_active = true for all devices owned by this user
  await db.update(devices)
    .set({ telegram_active: true })
    .where(eq(devices.owner_id, user[0].id));

  await sendMessage(chatId, '🔔 <b>Notifikasi diaktifkan kembali!</b>\nKamu akan menerima alert saat sensor mendeteksi bahaya.');
}

async function handleStatus(chatId: number) {
  if (!db) {
    await sendMessage(chatId, '❌ Database tidak dikonfigurasi');
    return;
  }

  // Find user by chatId
  const user = await db.select().from(users)
    .where(eq(users.telegramchatid, String(chatId)))
    .limit(1);

  if (!user[0]) {
    await sendMessage(chatId, '❌ Chat ID kamu belum terdaftar. Ketik /start untuk mendaftar.');
    return;
  }

  // Get all devices for this user
  const userDevices = await db.select().from(devices)
    .where(eq(devices.owner_id, user[0].id));

  if (userDevices.length === 0) {
    await sendMessage(chatId, '📦 Kamu belum memiliki device.\nTambahkan device di dashboard: https://smokesentry.my.id/dashboard/devices');
    return;
  }

  let message = '📊 <b>Status Device Kamu</b>\n━━━━━━━━━━━━━━━━━━━━\n';

  for (const device of userDevices) {
    const statusEmoji = device.status === 'online' ? '🟢' : '🔴';
    const lastSeen = device.last_seen_at
      ? new Date(device.last_seen_at).toLocaleString('id-ID')
      : 'Belum pernah aktif';

    // Get latest sensor reading
    const latestReading = await db.select().from(sensor_readings)
      .where(eq(sensor_readings.device_id, device.id))
      .orderBy(desc(sensor_readings.recorded_at))
      .limit(1);

    const mq2 = latestReading[0]?.mq2_value ?? '-';
    const mq135 = latestReading[0]?.mq135_value ?? '-';
    const flame = latestReading[0]?.flame_value ?? '-';

    message += `📦 <b>${device.name}</b>\n`;
    message += `${statusEmoji} Status: ${device.status === 'online' ? 'Online' : 'Offline'}\n`;
    message += `📍 Lokasi: ${device.location || '-'}\n`;
    message += `🕒 Terakhir aktif: ${lastSeen}\n`;
    message += `MQ-2: ${mq2} | MQ-135: ${mq135} | Flame: ${flame}\n`;
    message += '━━━━━━━━━━━━━━━━━━━━\n';
  }

  await sendMessage(chatId, message);
}

async function handleDevices(chatId: number) {
  if (!db) {
    await sendMessage(chatId, '❌ Database tidak dikonfigurasi');
    return;
  }

  // Find user by chatId
  const user = await db.select().from(users)
    .where(eq(users.telegramchatid, String(chatId)))
    .limit(1);

  if (!user[0]) {
    await sendMessage(chatId, '❌ Chat ID kamu belum terdaftar. Ketik /start untuk mendaftar.');
    return;
  }

  // Get all devices for this user
  const userDevices = await db.select().from(devices)
    .where(eq(devices.owner_id, user[0].id));

  if (userDevices.length === 0) {
    await sendMessage(chatId, '📦 Kamu belum memiliki device.\nTambahkan device di dashboard: https://smokesentry.my.id/dashboard/devices');
    return;
  }

  let message = '📦 <b>Device Terdaftar</b>\n━━━━━━━━━━━━━━━━━━━━\n';

  for (const device of userDevices) {
    const statusEmoji = device.status === 'online' ? '🟢' : '🔴';
    message += `• <b>${device.name}</b> — <code>${device.device_code}</code>\n`;
    message += `  📍 ${device.location || '-'} | ${statusEmoji} ${device.status}\n`;
    message += '━━━━━━━━━━━━━━━━━━━━\n';
  }

  message += `Total: ${userDevices.length} device`;

  await sendMessage(chatId, message);
}

async function handleAlert(chatId: number) {
  if (!db) {
    await sendMessage(chatId, '❌ Database tidak dikonfigurasi');
    return;
  }

  // Find user by chatId
  const user = await db.select().from(users)
    .where(eq(users.telegramchatid, String(chatId)))
    .limit(1);

  if (!user[0]) {
    await sendMessage(chatId, '❌ Chat ID kamu belum terdaftar. Ketik /start untuk mendaftar.');
    return;
  }

  // Get all device IDs for this user
  const userDevices = await db.select().from(devices)
    .where(eq(devices.owner_id, user[0].id));

  if (userDevices.length === 0) {
    await sendMessage(chatId, '📦 Kamu belum memiliki device.');
    return;
  }

  const deviceIds = userDevices.map(d => d.id);

  // Get alerts from last 7 days
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

  const recentAlerts = await db.select().from(alerts)
    .where(
      and(
        gt(alerts.triggered_at, sevenDaysAgo),
        // Check if alert.device_id is in deviceIds - need to use OR for multiple
        // For simplicity, just get all alerts and filter
      )
    )
    .orderBy(desc(alerts.triggered_at))
    .limit(5);

  // Filter alerts to only include user's devices
  const userAlerts = recentAlerts.filter(alert => deviceIds.includes(alert.device_id));

  if (userAlerts.length === 0) {
    await sendMessage(chatId, '✅ Tidak ada alert dalam 7 hari terakhir.');
    return;
  }

  let message = '🚨 <b>5 Alert Terakhir</b>\n━━━━━━━━━━━━━━━━━━━━\n';

  for (const alert of userAlerts) {
    const device = userDevices.find(d => d.id === alert.device_id);
    const deviceName = device?.name || 'Unknown Device';
    const typeEmoji = alert.type === 'fire' ? '🔥' : alert.type === 'smoke' ? '💨' : '⚠️';
    const timeAgo = getTimeAgo(alert.triggered_at);

    message += `${typeEmoji} <b>${alert.type}</b>\n`;
    message += `📦 Device: ${deviceName}\n`;
    message += `🕒 ${timeAgo}\n`;
    message += `📊 MQ-2:${alert.mq2_value || '-'} MQ-135:${alert.mq135_value || '-'} Flame:${alert.flame_value || '-'}\n`;
    message += '━━━━━━━━━━━━━━━━━━━━\n';
  }

  await sendMessage(chatId, message);
}

async function handleTest(chatId: number) {
  await sendMessage(chatId, '🧪 Mengirim notifikasi percobaan...');

  setTimeout(async () => {
    const message = `
🧪 <b>Ini adalah notifikasi percobaan SmokeSentry</b>
━━━━━━━━━━━━━━━━━━━━
✅ Notifikasi berhasil diterima!
Jika kamu melihat pesan ini, artinya
konfigurasi Telegram kamu sudah benar.
━━━━━━━━━━━━━━━━━━━━
🕒 ${new Date().toLocaleString('id-ID')}
    `;
    await sendMessage(chatId, message);
  }, 1000);
}

async function handleMyId(chatId: number) {
  const message = `
🆔 <b>Telegram Chat ID Kamu</b>
━━━━━━━━━━━━━━━━━━━━
<code>${chatId}</code>
━━━━━━━━━━━━━━━━━━━━
Salin angka di atas dan paste ke:
Dashboard → Settings Device → Tab Notifikasi
→ field <b>Telegram Chat ID</b>
  `;
  await sendMessage(chatId, message);
}

async function handleHelp(chatId: number) {
  const message = `
❓ <b>Panduan SmokeSentry Bot</b>
━━━━━━━━━━━━━━━━━━━━
/start — Daftar & dapatkan Chat ID
/myid — Tampilkan Chat ID kamu
/status — Status semua device
/devices — Daftar device terdaftar
/alert — Riwayat 5 alert terakhir
/test — Uji coba notifikasi
/on — Aktifkan notifikasi
/stop — Nonaktifkan notifikasi
/about — Tentang SmokeSentry
/help — Tampilkan menu ini
━━━━━━━━━━━━━━━━━━━━
🌐 Dashboard: https://smokesentry.my.id
  `;
  await sendMessage(chatId, message);
}

async function handleAbout(chatId: number) {
  const message = `
ℹ️ <b>Tentang SmokeSentry</b>
━━━━━━━━━━━━━━━━━━━━
SmokeSentry adalah sistem IoT deteksi
kebakaran & vape berbasis ESP32.

🔥 Sensor: MQ-2, MQ-135, Flame Sensor
📲 Notifikasi: Telegram real-time
📊 Dashboard: smokesentry.my.id
━━━━━━━━━━━━━━━━━━━━
Dibuat dengan ❤️ untuk keamanan ruangan.
  `;
  await sendMessage(chatId, message);
}

async function handleAktivasi(chatId: number, productId: string) {
  if (!productId) {
    await sendMessage(chatId, '❌ Format salah.\nGunakan: /aktivasi SS-DEMO-001');
    return;
  }

  if (!db) {
    await sendMessage(chatId, '❌ Database tidak dikonfigurasi');
    return;
  }

  const deviceCode = productId.trim().toUpperCase();

  const device = await db.select()
    .from(devices)
    .where(eq(devices.device_code, deviceCode))
    .limit(1);

  if (!device[0]) {
    await sendMessage(chatId,
      `❌ Device <code>${deviceCode}</code> tidak ditemukan.\n\n` +
      `Pastikan kamu sudah menambahkan device ini di dashboard dulu:\n` +
      `🌐 https://smokesentry.my.id/dashboard/devices`
    );
    return;
  }

  const deviceData = device[0];

  await db.update(devices)
    .set({ telegramchatid: String(chatId) })
    .where(eq(devices.id, deviceData.id));

  const apiKey = deviceData.apikey;

  if (!apiKey) {
    await sendMessage(chatId,
      `⚠️ Device ditemukan tapi API Key belum di-generate.\n\n` +
      `Silakan refresh halaman dashboard dan buka Settings device untuk melihat API Key.`
    );
    return;
  }

  await sendMessage(chatId,
    `✅ <b>Device Ditemukan!</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📦 Device: <b>${deviceData.name}</b>\n` +
    `🆔 Code: <code>${deviceCode}</code>\n\n` +
    `🔑 <b>API Key kamu:</b>\n` +
    `<code>${apiKey}</code>\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📶 <b>Cara Setup WiFi ESP32:</b>\n` +
    `1️⃣ Nyalakan ESP32\n` +
    `2️⃣ Connect HP ke WiFi <b>"smoke sentry-Setup"</b>\n` +
    `3️⃣ Buka browser → <code>192.168.4.1</code>\n` +
    `4️⃣ Isi form:\n` +
    `   • SSID: nama WiFi rumah kamu\n` +
    `   • Password: password WiFi\n` +
    `   • Device Code: <code>${deviceCode}</code>\n` +
    `   • API Key: <code>${apiKey}</code>\n` +
    `5️⃣ Klik Save → tunggu buzzer bunyi 3x ✅\n\n` +
    `⚠️ Jika WiFi kamu ada spasi atau simbol,\n` +
    `ketik persis sama — sudah didukung!`
  );
}

async function sendMessage(chatId: number, text: string) {
  // Get bot token from DB settings first, fallback to process.env
  const settingsRow = await db?.select().from(settings)
    .where(eq(settings.key, 'telegram_bot_token'))
    .limit(1);

  const botToken = settingsRow?.[0]?.value
    ?? process.env.TELEGRAM_BOT_TOKEN
    ?? "";

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

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Baru saja';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari lalu`;
  return new Date(timestamp).toLocaleDateString('id-ID');
}
