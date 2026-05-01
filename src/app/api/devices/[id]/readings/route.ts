import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { devices, sensor_readings } from '@/lib/schema'
import { eq, and, gte } from 'drizzle-orm'

export async function GET(
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

    const searchParams = req.nextUrl.searchParams
    const hours = parseInt(searchParams.get('hours') || '24')
    const startTime = Date.now() - (hours * 60 * 60 * 1000)

    const readings = await db.select()
      .from(sensor_readings)
      .where(
        and(
          eq(sensor_readings.device_id, id),
          gte(sensor_readings.recorded_at, startTime)
        )
      )
      .orderBy(sensor_readings.recorded_at)
      .limit(1000)

    return NextResponse.json({ success: true, data: readings })
  } catch (error) {
    console.error('Error fetching sensor readings:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch readings' 
    }, { status: 500 })
  }
}
