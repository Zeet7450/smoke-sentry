import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import TelegramBot from 'node-telegram-bot-api'
import { db } from '@/lib/db'
import { devices } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { deviceId } = body

    if (!deviceId) {
      return NextResponse.json({ success: false, error: 'Device ID required' }, { status: 400 })
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Telegram bot not configured' 
      }, { status: 500 })
    }

    const device = await db.select().from(devices)
      .where(eq(devices.id, deviceId))
      .limit(1)

    if (!device[0]) {
      return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 })
    }

    if (device[0].owner_id !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const chatId = device[0].telegramchatid
    if (!chatId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Telegram Chat ID not configured for this device' 
      }, { status: 400 })
    }

    const bot = new TelegramBot(botToken)
    await bot.sendMessage(chatId, `🔔 SmokeSentry Test Notification

Device: ${device[0].name}

This is a test message from your SmokeSentry dashboard. If you receive this, your notifications are working correctly.`)

    return NextResponse.json({ success: true, message: 'Test notification sent' })
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send test notification' 
    }, { status: 500 })
  }
}
