import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { devices, sensorLogs } from '@/lib/schema'
import { eq, and, gte, desc } from 'drizzle-orm'

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

    const readings = await db.select()
      .from(sensorLogs)
      .where(eq(sensorLogs.device_id, id))
      .orderBy(desc(sensorLogs.created_at))
      .limit(100)

    // Return in chronological order for chart
    return NextResponse.json(readings.reverse())
  } catch (error) {
    console.error('Error fetching sensor readings:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch readings' 
    }, { status: 500 })
  }
}
