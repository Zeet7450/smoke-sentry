import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { devices } from '@/lib/schema'
import { eq, and, lt } from 'drizzle-orm'

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const now = Date.now()
    const thirtySecondsAgo = now - 30000

    // Set devices to offline if they haven't been seen in 30 seconds
    const result = await db.update(devices)
      .set({ status: 'offline', updated_at: now })
      .where(
        and(
          eq(devices.status, 'online'),
          lt(devices.last_seen_at, thirtySecondsAgo)
        )
      )
      .returning()

    console.log('[cron/offline-devices] Set', result.length, 'devices to offline')

    return NextResponse.json({ success: true, updated: result.length })
  } catch (err) {
    console.error('[cron/offline-devices] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
