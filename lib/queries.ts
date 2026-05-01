import { db } from './db'
import { users, devices, device_members, sensor_readings, alerts } from './schema'
import { eq, and, desc, gte, lte } from 'drizzle-orm'

// ─── USER QUERIES ───────────────────────────────
export async function getUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1)
  return result[0] || null
}

export async function createUser(data: {
  id: string
  email: string
  name: string
}) {
  const result = await db.insert(users).values(data).returning()
  return result[0]
}

// ─── DEVICE QUERIES ─────────────────────────────
export async function getDevicesByOwner(ownerId: string) {
  return db.select().from(devices).where(eq(devices.owner_id, ownerId)).orderBy(desc(devices.created_at))
}

export async function getDeviceById(deviceId: string) {
  const result = await db.select().from(devices).where(eq(devices.id, deviceId)).limit(1)
  return result[0] || null
}

export async function getDeviceByCode(deviceCode: string) {
  const result = await db.select().from(devices).where(eq(devices.device_code, deviceCode)).limit(1)
  return result[0] || null
}

export async function createDevice(data: {
  owner_id: string
  device_code: string
  name: string
  location?: string
}) {
  const result = await db.insert(devices).values(data).returning()
  return result[0]
}

export async function updateDevice(deviceId: string, data: Partial<typeof devices.$inferInsert>) {
  const result = await db.update(devices).set(data).where(eq(devices.id, deviceId)).returning()
  return result[0]
}

export async function deleteDevice(deviceId: string) {
  await db.delete(devices).where(eq(devices.id, deviceId))
}

// ─── DEVICE MEMBERS ─────────────────────────────
export async function getDeviceMembers(deviceId: string) {
  return db.select({
    id: device_members.id,
    role: device_members.role,
    receive_notifications: device_members.receive_notifications,
    invited_at: device_members.invited_at,
    user_id: device_members.user_id,
    user_name: users.name,
    user_email: users.email,
  }).from(device_members)
    .innerJoin(users, eq(device_members.user_id, users.id))
    .where(eq(device_members.device_id, deviceId))
}

export async function addDeviceMember(data: {
  device_id: string
  user_id: string
  role: string
  receive_notifications: boolean
}) {
  const result = await db.insert(device_members).values(data).returning()
  return result[0]
}

// ─── SENSOR READINGS ────────────────────────────
export async function getSensorReadings(deviceId: string, hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)
  return db.select().from(sensor_readings)
    .where(and(
      eq(sensor_readings.device_id, deviceId),
      gte(sensor_readings.recorded_at, since)
    ))
    .orderBy(desc(sensor_readings.recorded_at))
}

export async function createSensorReading(data: {
  device_id: string
  mq2_value?: number
  mq135_value?: number
  flame_value?: number
  mq2_ppm?: number
  mq135_ppm?: number
  flame_detected?: boolean
  is_alert?: boolean
}) {
  const result = await db.insert(sensor_readings).values(data).returning()
  return result[0]
}

// ─── ALERTS ─────────────────────────────────────
export async function getAlerts(deviceId: string, limit: number = 50) {
  return db.select().from(alerts)
    .where(eq(alerts.device_id, deviceId))
    .orderBy(desc(alerts.triggered_at))
    .limit(limit)
}

export async function createAlert(data: {
  device_id: string
  type: string
  severity: string
  mq2_value?: number
  mq135_value?: number
  flame_value?: number
  flame_detected?: boolean
  message?: string
  telegram_sent?: boolean
}) {
  const result = await db.insert(alerts).values(data).returning()
  return result[0]
}

export async function resolveAlert(alertId: string, resolvedBy: string) {
  const result = await db.update(alerts)
    .set({ 
      is_resolved: true, 
      resolved_at: new Date(), 
      resolved_by: resolvedBy 
    })
    .where(eq(alerts.id, alertId))
    .returning()
  return result[0]
}

// ─── STATS ─────────────────────────────────────
export async function getDashboardStats(userId: string) {
  const userDevices = await getDevicesByOwner(userId)
  const deviceIds = userDevices.map(d => d.id)
  
  if (deviceIds.length === 0) {
    return {
      totalDevices: 0,
      onlineDevices: 0,
      alertToday: 0,
      normalSensors: 0,
    }
  }
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const [alertsResult, readingsResult] = await Promise.all([
    db.select().from(alerts)
      .where(and(
        gte(alerts.triggered_at, today),
        eq(alerts.is_resolved, false)
      )),
    db.select().from(sensor_readings)
      .where(and(
        gte(sensor_readings.recorded_at, new Date(Date.now() - 5 * 60 * 1000)),
        eq(sensor_readings.is_alert, false)
      ))
  ])
  
  return {
    totalDevices: userDevices.length,
    onlineDevices: userDevices.filter(d => d.status === 'online').length,
    alertToday: alertsResult.length,
    normalSensors: readingsResult.length,
  }
}
