import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sensorLogs, devices } from '@/lib/schema'
import { eq, desc, and, gte } from 'drizzle-orm'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Ambil ?range=1h / 6h / 24h / 7d (default: 1h)
  const range  = req.nextUrl.searchParams.get('range') ?? '1h'
  const limit  = parseInt(req.nextUrl.searchParams.get('limit') ?? '100')

  const rangeMap: Record<string, number> = {
    '1h':  60 * 60 * 1000,
    '6h':  6  * 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d':  7  * 24 * 60 * 60 * 1000,
  }
  const since = new Date(Date.now() - (rangeMap[range] ?? rangeMap['1h']))

  // Pastikan device milik user ini
  const device = await db.select().from(devices)
    .where(
      and(
        eq(devices.id, params.id),
        eq(devices.owner_id, session.user.id)
      )
    ).limit(1)

  if (!device[0]) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const logs = await db.select().from(sensorLogs)
    .where(
      and(
        eq(sensorLogs.device_id, params.id),
        gte(sensorLogs.created_at, since)
      )
    )
    .orderBy(desc(sensorLogs.created_at))
    .limit(limit)

  return NextResponse.json({
    device: {
      id:     device[0].id,
      name:   device[0].name,
      status: device[0].status,
    },
    range,
    count: logs.length,
    logs:  logs.reverse(), // chronological order untuk chart
  })
}
