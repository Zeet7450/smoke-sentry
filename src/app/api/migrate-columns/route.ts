import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  try {
    // Add apikey column to devices table
    await db.execute(`
      ALTER TABLE devices ADD COLUMN IF NOT EXISTS apikey TEXT
    `)
    
    // Add telegramchatid column to devices table
    await db.execute(`
      ALTER TABLE devices ADD COLUMN IF NOT EXISTS telegramchatid TEXT
    `)

    return NextResponse.json({ 
      success: true, 
      message: 'Columns added successfully' 
    })
  } catch (error) {
    console.error('[migrate-columns] Error:', error)
    return NextResponse.json(
      { error: 'Failed to add columns', details: String(error) },
      { status: 500 }
    )
  }
}
