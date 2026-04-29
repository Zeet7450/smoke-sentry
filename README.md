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

---

## 🛠️ Tech Stack

**Hardware**
- ESP32 (microcontroller utama)
- MQ-2 (sensor asap & gas LPG)
- MQ-135 (sensor VOC, rokok, vape)
- Flame Sensor (deteksi api infrared)
- Piezo Buzzer (alarm suara)

**Software**
- [Next.js 14](https://nextjs.org/) — Frontend & API Routes
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) — 3D Model
- [Framer Motion](https://www.framer.com/motion/) — Animasi
- [AWS DynamoDB](https://aws.amazon.com/dynamodb/) — Database
- [AWS Lambda](https://aws.amazon.com/lambda/) — Serverless backend
- [Telegram Bot API](https://core.telegram.org/bots/api) — Notifikasi
- [WebSocket (API Gateway)](https://aws.amazon.com/api-gateway/) — Real-time

---

## 🚀 Cara Menjalankan Lokal

### Prerequisites
- Node.js >= 18
- npm atau yarn
- Akun AWS (opsional untuk testing lokal)

### Instalasi

```bash
# Clone repo
git clone https://github.com/USERNAME/smoke-sentry.git
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
| `NEXT_PUBLIC_API_URL` | URL API backend / Lambda |
| `TELEGRAM_BOT_TOKEN` | Token bot dari @BotFather |
| `TELEGRAM_CHAT_ID` | Chat ID tujuan notifikasi |
| `AWS_REGION` | Region AWS (misal: ap-southeast-1) |
| `AWS_ACCESS_KEY_ID` | AWS Access Key |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key |
| `DYNAMODB_TABLE_NAME` | Nama tabel DynamoDB |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL dari API Gateway |

---

## 📁 Struktur Project
smoke-sentry/
├── app/ # Next.js App Router
│ ├── page.tsx # Landing page
│ └── dashboard/ # Dashboard halaman
├── components/
│ ├── sections/ # Section komponen landing
│ │ ├── HeroSection.tsx
│ │ ├── FeaturesSection.tsx
│ │ ├── HowItWorksSection.tsx
│ │ ├── StorySection.tsx
│ │ └── ComingSoonSection.tsx
│ ├── 3d/ # Three.js components
│ └── ui/ # UI components
├── lib/ # Utilities & helpers
├── public/ # Static assets
├── .env.example # Template environment variables
└── README.md


---

## 🔌 Wiring Hardware

Lihat diagram wiring lengkap di [`docs/wiring.svg`](docs/wiring.svg)

| Sensor | ESP32 Pin |
|---|---|
| MQ-2 (AOUT) | GPIO 34 |
| MQ-135 (AOUT) | GPIO 35 |
| Flame Sensor | GPIO 32 |
| Buzzer | GPIO 25 |

---

## 📸 Screenshot

<!-- Tambahkan screenshot setelah deploy -->

---

## 📄 Lisensi

MIT License © 2026 SmokeSentry Team

Made with ❤️ in Indonesia 🇮🇩
