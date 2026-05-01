import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { devices } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const device = await db.select().from(devices)
      .where(eq(devices.id, id))
      .limit(1)

    if (!device[0]) {
      return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 })
    }

    if (device[0].owner_id !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, location, mq2_threshold, mq135_threshold, flame_threshold, telegramchatid } = body

    const updated = await db.update(devices)
      .set({
        ...(name && { name }),
        ...(location !== undefined && { location }),
        ...(mq2_threshold !== undefined && { mq2_threshold }),
        ...(mq135_threshold !== undefined && { mq135_threshold }),
        ...(flame_threshold !== undefined && { flame_threshold }),
        ...(telegramchatid !== undefined && { telegramchatid }),
        updated_at: Date.now(),
      })
      .where(eq(devices.id, id))
      .returning()

    return NextResponse.json({ success: true, data: updated[0] })
  } catch (error) {
    console.error('Error updating device:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update device' 
    }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('[DELETE /api/devices/[id]] deviceId:', id)
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('[DELETE] Unauthorized - no session')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[DELETE] userId from session:', session.user.id)

    const device = await db.select().from(devices)
      .where(eq(devices.id, id))
      .limit(1)

    console.log('[DELETE] Found device:', device)

    if (!device[0]) {
      console.log('[DELETE] Device not found')
      return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 })
    }

    if (device[0].owner_id !== session.user.id) {
      console.log('[DELETE] Forbidden - owner_id mismatch:', device[0].owner_id, 'vs', session.user.id)
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    await db.delete(devices)
      .where(
        and(
          eq(devices.id, id),
          eq(devices.owner_id, session.user.id)
        )
      )

    console.log('[DELETE] Device deleted successfully')
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[DELETE] Error deleting device:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to delete device' 
    }, { status: 500 })
  }
}
