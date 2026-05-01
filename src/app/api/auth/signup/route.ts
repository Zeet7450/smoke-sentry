import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return Response.json({ error: 'Semua field harus diisi' }, { status: 400 })
    }

    if (password.length < 8) {
      return Response.json({ error: 'Password minimal 8 karakter' }, { status: 400 })
    }

    const existing = await db.select().from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existing[0]) {
      return Response.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 10)
    await db.insert(users).values({
      id: nanoid(),
      name,
      email,
      password: hashed,
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Signup error:', error)
    return Response.json({ error: 'Terjadi kesalahan saat mendaftar' }, { status: 500 })
  }
}
