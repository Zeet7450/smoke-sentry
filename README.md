# 🔥 SmokeSentry

> **Because five minutes can save everything.**

SmokeSentry adalah sistem deteksi asap dan kebakaran 
berbasis IoT yang menggabungkan sensor MQ-2, MQ-135, 
dan Flame Sensor dengan notifikasi Telegram real-time 
dan dashboard web modern.

---

## ✨ Fitur

- 🔔 **Notifikasi Telegram Real-time** — Alert langsung ke HP saat bahaya terdeteksi
- 🌐 **Pantau dari Mana Saja** — Dashboard web yang bisa diakses dari browser manapun
- 🔲 **3 Sensor Sekaligus** — MQ-2, MQ-135, dan Flame Sensor untuk deteksi akurat
- 📜 **Riwayat Kejadian** — History alert tersimpan di dashboard
- 👨‍👩‍👧 **Multi-user** — Bisa dibagikan ke seluruh keluarga
- ⚡ **Setup via Bot** — Konfigurasi device hanya lewat Telegram
- 📊 **Grafik Real-time** — Visualisasi data sensor dengan Chart.js
- 🎨 **UI Modern** — Animasi smooth dengan Framer Motion dan GSAP

---

## 🛠️ Tech Stack

**Hardware**
- ESP32 (microcontroller utama)
- MQ-2 (sensor asap & gas LPG)
- MQ-135 (sensor VOC, rokok, vape)
- Flame Sensor (deteksi api infrared)
- Piezo Buzzer (alarm suara)

**Software**
- [Next.js 16](https://nextjs.org/) — Frontend & API Routes
- [React 19](https://react.dev/) — UI Library
- [TypeScript](https://www.typescriptlang.org/) — Type Safety
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Neon PostgreSQL](https://neon.tech/) — Database
- [Drizzle ORM](https://orm.drizzle.team/) — Database ORM
- [NextAuth.js](https://next-auth.js.org/) — Authentication
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) — 3D Model
- [Framer Motion](https://www.framer.com/motion/) — Animasi
- [GSAP](https://greensock.com/gsap/) — Scroll Animations
- [Chart.js](https://www.chartjs.org/) — Data Visualization
- [Telegram Bot API](https://core.telegram.org/bots/api) — Notifikasi

---

## 🚀 Cara Menjalankan Lokal

### Prerequisites
- Node.js >= 18
- npm atau yarn
- Akun Neon PostgreSQL (gratis di neon.tech)
- Akun Telegram (buat bot via @BotFather)

### Instalasi

```bash
# Clone repo
git clone https://github.com/Zeet7450/smoke-sentry.git
cd smoke-sentry

# Install dependencies
npm install

# Salin env example dan isi dengan nilai asli
cp .env.example .env.local

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Environment Variables

Salin `.env.example` menjadi `.env.local` dan isi:

| Variable | Deskripsi |
|---|---|
| `DATABASE_URL` | Connection string dari Neon PostgreSQL |
| `NEXTAUTH_SECRET` | Random string untuk NextAuth (minimal 32 karakter) |
| `NEXTAUTH_URL` | URL aplikasi (http://localhost:3000 untuk lokal) |
| `TELEGRAM_BOT_TOKEN` | Token bot dari @BotFather |
| `TELEGRAM_CHAT_ID` | Chat ID tujuan notifikasi (opsional) |

**Cara mendapatkan DATABASE_URL:**
1. Buat project di [neon.tech](https://neon.tech)
2. Pilih project → Connection Details
3. Copy "Pooled connection" string

**Cara membuat Telegram Bot:**
1. Chat @BotFather di Telegram
2. Kirim `/newbot` dan ikuti instruksi
3. Copy token yang diberikan

---

## 📁 Struktur Project
```
smoke-sentry/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   ├── login/                    # Login page
│   ├── register/                 # Register page
│   ├── dashboard/                # Dashboard pages
│   │   ├── page.tsx              # Dashboard overview
│   │   ├── devices/              # Device management
│   │   └── settings/             # User settings
│   └── api/                      # API Routes
│       ├── auth/                 # Authentication endpoints
│       ├── data/                 # Sensor data endpoint
│       ├── sensor/               # Sensor input endpoint
│       └── telegram/             # Telegram webhook
├── components/
│   ├── sections/                 # Landing page sections
│   │   ├── HeroSection.tsx
│   │   ├── ProblemSection.tsx
│   │   ├── ProductSection.tsx
│   │   ├── HowItWorksSection.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── StorySection.tsx
│   │   └── ComingSoonSection.tsx
│   ├── ui/                       # Reusable UI components
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   └── ...
│   ├── 3d/                       # Three.js components
│   │   ├── HeroScene.tsx
│   │   └── SmokeSentryModel.tsx
│   ├── Providers.tsx             # Session provider
│   ├── CustomCursor.tsx          # Custom cursor
│   └── PageTransition.tsx        # Page transition
├── lib/
│   ├── db.ts                     # Database connection
│   ├── schema.ts                 # Drizzle schema
│   ├── queries.ts                # Database queries
│   └── auth.ts                   # NextAuth config
├── public/                       # Static assets
├── .env.example                  # Environment variables template
├── drizzle.config.ts             # Drizzle configuration
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
└── README.md
```

---

## 🔌 Wiring Hardware

| Sensor | ESP32 Pin |
|---|---|
| MQ-2 (AOUT) | GPIO 34 |
| MQ-135 (AOUT) | GPIO 35 |
| Flame Sensor | GPIO 32 |
| Buzzer | GPIO 25 |

---

## �️ Database Schema

Project menggunakan Drizzle ORM dengan schema berikut:

- **users** — Data user dan profil
- **devices** — Data device SmokeSentry
- **device_members** — Multi-user access ke device
- **sensor_readings** — Data pembacaan sensor real-time
- **alerts** — Riwayat kejadian/alert
- **sessions** — Session login user
- **notifications** — Log notifikasi terkirim

Untuk setup database:
```bash
# Generate migration
npm run db:generate

# Push schema ke Neon
npm run db:push

# (Opsional) Buka Drizzle Studio
npm run db:studio
```

---

## 📸 Demo

Live demo: [smokesentry.my.id](https://smokesentry.my.id)

---

## 🤝 Kontribusi

Kontribusi sangat welcome! Silakan:
1. Fork repo ini
2. Buat branch fitur (`git checkout -b fitur-baru`)
3. Commit perubahan (`git commit -m 'Tambah fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buka Pull Request

---

## 📄 Lisensi

MIT License © 2026 SmokeSentry Team

Made with ❤️ in Indonesia 🇮🇩
