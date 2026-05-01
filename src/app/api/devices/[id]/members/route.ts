import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { devices, users, device_members } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export async function POST(
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
    const { email, role, receive_notifications } = body

    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email is required' 
      }, { status: 400 })
    }

    // Find user by email
    const user = await db.select().from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user[0]) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    // Check if already a member
    const existingMember = await db.select().from(device_members)
      .where(
        eq(device_members.device_id, id)
      )
      .limit(1)

    if (existingMember[0]) {
      return NextResponse.json({ 
        success: false, 
        error: 'User is already a member' 
      }, { status: 409 })
    }

    // Add member
    const [member] = await db.insert(device_members)
      .values({
        id: crypto.randomUUID(),
        device_id: id,
        user_id: user[0].id,
        role: role || 'viewer',
        receive_notifications: receive_notifications !== false,
        invited_at: Date.now(),
      })
      .returning()

    return NextResponse.json({ success: true, data: member })
  } catch (error) {
    console.error('Error adding device member:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to add member' 
    }, { status: 500 })
  }
}
