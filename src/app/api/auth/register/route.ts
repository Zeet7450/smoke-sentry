import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Skip database operations if DATABASE_URL not set (for landing page only)
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database tidak dikonfigurasi' },
        { status: 503 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Check if user already exists
    const existingUsers = await db.select()
      .from(users)
      .where(eq(users.email, emailLower))
      .limit(1);

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];

      // If user exists but has no password (Google account), add password (account linking)
      if (!existingUser.password) {
        const hashed = await bcrypt.hash(password, 12);
        await db.update(users)
          .set({ 
            password: hashed, 
            name: name || existingUser.name 
          })
          .where(eq(users.email, emailLower));

        return NextResponse.json(
          { success: true, linked: true, message: 'Password ditambahkan ke akun Google yang sudah ada' },
          { status: 200 }
        );
      }

      // User already has password (form account)
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 }
      );
    }

    // Create new user with hashed password
    const hashed = await bcrypt.hash(password, 12);
    await db.insert(users).values({
      id: nanoid(),
      name: name || emailLower.split('@')[0],
      email: emailLower,
      password: hashed,
    });

    return NextResponse.json(
      { success: true, message: 'Registrasi berhasil' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
