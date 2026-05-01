import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { settings } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { getServerSession } from 'next-auth'

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated (simplified - in production add proper admin check)
    const session = await getServerSession()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Missing key or value' }, { status: 400 })
    }

    // Upsert the setting
    await db.insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value },
      })

    console.log('[admin/settings] Saved setting:', key)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[admin/settings] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
