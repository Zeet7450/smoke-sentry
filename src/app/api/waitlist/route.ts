import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { db } from '@/lib/db';
import { waitlist } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email tidak valid' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Skip database operations if DATABASE_URL not set (for landing page only)
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database tidak dikonfigurasi' },
        { status: 503 }
      );
    }

    // Check if email already exists
    const existing = await db.select()
      .from(waitlist)
      .where(eq(waitlist.email, emailLower))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 }
      );
    }

    // Save email to database
    await db.insert(waitlist).values({
      email: emailLower,
    });

    // Send email notification to owner
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      try {
        await resend.emails.send({
          from: 'SmokeSentry <noreply@smokesentry.my.id>',
          to: process.env.WAITLIST_OWNER_EMAIL || 'owner@smokesentry.my.id',
          subject: 'SmokeSentry — Ada pendaftar baru! 🎉',
          html: `
            <h2>Ada pendaftar waitlist baru!</h2>
            <p><strong>Email:</strong> ${emailLower}</p>
            <p><strong>Waktu:</strong> ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</p>
            <p><em>Dari: SmokeSentry Waitlist</em></p>
          `,
        });
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Don't fail the request if email sending fails
      }
    }

    return NextResponse.json(
      { success: true, message: 'Berhasil! Kami akan menghubungi kamu saat SmokeSentry tersedia.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Waitlist signup error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
