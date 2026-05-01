import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import TelegramBot from 'node-telegram-bot-api'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      return NextResponse.json({ 
        success: false, 
        error: 'Telegram bot not configured' 
      }, { status: 500 })
    }

    const bot = new TelegramBot(botToken)
    const chatId = process.env.TELEGRAM_CHAT_ID

    if (!chatId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Telegram chat ID not configured' 
      }, { status: 500 })
    }

    await bot.sendMessage(chatId, '🔔 SmokeSentry Test Notification\n\nThis is a test message from your SmokeSentry dashboard.')

    return NextResponse.json({ success: true, message: 'Test notification sent' })
  } catch (error) {
    console.error('Error sending test notification:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to send test notification' 
    }, { status: 500 })
  }
}
