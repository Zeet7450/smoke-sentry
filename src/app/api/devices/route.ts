import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { devices } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { randomBytes } from 'crypto'

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized — no session' },
        { status: 401 }
      )
    }

    const data = await db
      .select()
      .from(devices)
      .where(eq(devices.owner_id, session.user.id))

    const now = Date.now()
    const dataWithStatus = data.map(d => ({
      ...d,
      isOnline: d.last_seen ? (now - new Date(d.last_seen).getTime()) < 60_000 : false
    }))

    return NextResponse.json({ success: true, data: dataWithStatus })

  } catch (err) {
    console.error('[GET /api/devices]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized — no session' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { name, device_code, location } = body

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Nama device wajib diisi' },
        { status: 400 }
      )
    }

    const code = device_code?.trim().toUpperCase()
    if (!code || code !== 'SS-DEMO-001') {
      return NextResponse.json(
        { error: 'Hanya device code SS-DEMO-001 yang diperbolehkan' },
        { status: 400 }
      )
    }

    const [existing] = await db
      .select({ id: devices.id })
      .from(devices)
      .where(eq(devices.device_code, code))
      .limit(1)

    if (existing) {
      return NextResponse.json(
        { error: 'Device code sudah digunakan' },
        { status: 409 }
      )
    }

    const deviceId = crypto.randomUUID()
    const apiKey = randomBytes(24).toString('hex')
    const now = Date.now()

    console.log('[POST /api/devices] Inserting device with all columns')
    console.log('[POST /api/devices] API Key length:', apiKey.length)

    const [newDevice] = await db
      .insert(devices)
      .values({
        id: deviceId,
        name: name.trim(),
        device_code: code,
        location: location?.trim() || null,
        owner_id: session.user.id,
        apikey: apiKey,
        telegramchatid: null,
        status: 'offline',
        is_active: true,
        firmware_version: null,
        mq2_threshold: 400,
        mq135_threshold: 300,
        flame_threshold: 500,
        last_seen_at: null,
        created_at: now,
        updated_at: now,
      })
      .returning()

    return NextResponse.json(
      { success: true, data: newDevice },
      { status: 201 }
    )

  } catch (err) {
    console.error('[POST /api/devices] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized — no session' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const params = await Promise.resolve(searchParams)
    const id = params.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Device ID required' },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { name, location, mq2_threshold, mq135_threshold, flame_threshold } = body

    const [updated] = await db
      .update(devices)
      .set({
        ...(name && { name: name.trim() }),
        ...(location !== undefined && { location: location?.trim() || null }),
        ...(mq2_threshold !== undefined && { mq2_threshold }),
        ...(mq135_threshold !== undefined && { mq135_threshold }),
        ...(flame_threshold !== undefined && { flame_threshold }),
        updated_at: Date.now(),
      })
      .where(eq(devices.id, id))
      .returning()

    if (!updated) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: updated })

  } catch (err) {
    console.error('[PATCH /api/devices]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized — no session' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const params = await Promise.resolve(searchParams)
    const id = params.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Device ID required' },
        { status: 400 }
      )
    }

    const [deleted] = await db
      .delete(devices)
      .where(eq(devices.id, id))
      .returning()

    if (!deleted) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: deleted })

  } catch (err) {
    console.error('[DELETE /api/devices]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Server error' },
      { status: 500 }
    )
  }
}
