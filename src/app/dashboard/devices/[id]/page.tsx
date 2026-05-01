import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { devices, sensorLogs } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import { DeviceDetailClient } from './DeviceDetailClient'

export default async function DeviceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return (
      <div className="p-6 md:p-8">
        <p style={{ color: '#888899' }}>Unauthorized</p>
      </div>
    )
  }

  const device = await db.select().from(devices)
    .where(eq(devices.id, id))
    .limit(1)

  if (!device[0]) {
    return (
      <div className="p-6 md:p-8">
        <p style={{ color: '#888899' }}>Device tidak ditemukan</p>
      </div>
    )
  }

  if (device[0].owner_id !== session.user.id) {
    return (
      <div className="p-6 md:p-8">
        <p style={{ color: '#888899' }}>Forbidden</p>
      </div>
    )
  }

  const readings = await db.select({
    device_id: sensorLogs.device_id,
    mq2: sensorLogs.mq2,
    mq135: sensorLogs.mq135,
    flame: sensorLogs.flame,
    flame_detected: sensorLogs.flame_detected,
    is_alert: sensorLogs.is_alert,
    created_at: sensorLogs.created_at,
  })
    .from(sensorLogs)
    .where(eq(sensorLogs.device_id, id))
    .orderBy(desc(sensorLogs.created_at))
    .limit(100)

  // Convert Date objects to ISO strings for serialization
  const chronologicalReadings = readings.reverse().map(r => ({
    ...r,
    created_at: r.created_at instanceof Date
      ? r.created_at.toISOString()
      : String(r.created_at)
  }))

  return <DeviceDetailClient device={device[0]} initialReadings={chronologicalReadings} />
}
