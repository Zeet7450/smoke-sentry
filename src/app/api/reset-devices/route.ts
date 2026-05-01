import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { devices, sensor_readings, alerts, device_members, notifications } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  try {
    // Delete all related data first (foreign key dependencies)
    await db.delete(sensor_readings)
    await db.delete(alerts)
    await db.delete(device_members)
    await db.delete(notifications)
    
    // Delete all devices
    await db.delete(devices)

    return NextResponse.json({ 
      success: true, 
      message: 'All devices and related data have been deleted' 
    })
  } catch (error) {
    console.error('[reset-devices] Error:', error)
    return NextResponse.json(
      { error: 'Failed to reset devices' },
      { status: 500 }
    )
  }
}
