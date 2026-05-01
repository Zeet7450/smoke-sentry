import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { devices, users, settings } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const { searchParams } = new URL(req.url)
    const device_code = searchParams.get('device_code')
    const api_key = searchParams.get('api_key')

    if (!device_code || !api_key) {
      return NextResponse.json({ error: 'Missing device_code or api_key' }, { status: 400 })
    }

    // Find device by device_code AND api_key
    const device = await db.select().from(devices)
      .where(
        and(
          eq(devices.device_code, device_code),
          eq(devices.apikey, api_key)
        )
      )
      .limit(1)

    if (!device[0]) {
      return NextResponse.json({ error: 'Device not found or invalid API key' }, { status: 404 })
    }

    let chat_id = device[0].telegramchatid ?? ""

    // Get bot_token from DB settings first, fallback to process.env
    const settingsRow = await db.select().from(settings)
      .where(eq(settings.key, 'telegram_bot_token'))
      .limit(1)

    const botToken = settingsRow[0]?.value
      ?? process.env.TELEGRAM_BOT_TOKEN
      ?? ""

    return NextResponse.json({
      has_config: true,
      device_name: device[0].name,
      chat_id: chat_id,
      bot_token: botToken,
      telegram_active: device[0].is_active ?? true,
    })
  } catch (err) {
    console.error('[api/esp/config] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
