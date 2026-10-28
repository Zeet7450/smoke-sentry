# 🔥 SmokeSentry v2.0

> **Enterprise IoT Fire Early Warning, Industrial Hazard Detection, and Environmental Air Quality Monitoring Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech)
[![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![Three.js](https://img.shields.io/badge/Three.js-R3F-black?style=for-the-badge&logo=three.js&logoColor=white)](https://docs.pmnd.rs/react-three-fiber)
[![ESP32](https://img.shields.io/badge/Hardware-ESP32-E7352C?style=for-the-badge&logo=espressif&logoColor=white)](https://www.espressif.com)
[![Telegram](https://img.shields.io/badge/Alerts-Telegram%20Bot%20API-24A1DE?style=for-the-badge&logo=telegram&logoColor=white)](https://core.telegram.org/bots/api)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

Live Deployment: [smokesentry.my.id](https://smokesentry.my.id)

---

## 📌 Executive Summary

**SmokeSentry v2.0** is an enterprise-ready Internet of Things (IoT) safety system engineered to bridge real-time environmental hazard monitoring with modern web architectures. Designed in compliance with industrial **K3LH / HSE (Health, Safety, and Environment)** principles, SmokeSentry combines a dedicated ESP32 edge microcontroller, multi-spectrum chemical and optical sensors, automated Telegram emergency escalations, and a 3D digital twin dashboard.

In residential, commercial, and industrial facilities, delayed fire and toxic gas detection remains a primary driver of catastrophic losses. SmokeSentry v2.0 solves this vulnerability by delivering sub-second edge threshold evaluation, multi-sensor verification to prevent false alarms, and continuous cloud telemetry synchronization.

---

## 🌟 Key Capabilities

- **Sub-Second Incident Dispatch:** Critical alerts push directly to incident response teams and building occupants via Telegram Bot API within 800 milliseconds of hazard detection.
- **Multi-Sensor Data Fusion:** Concurrently ingests analog readings from MQ-2 (smoke, LPG, propane), MQ-135 (air quality, volatile organic compounds, carbon monoxide), and high-sensitivity optical infrared flame detectors.
- **3D Digital Twin Hardware Visualizer:** Interactive 3D board rendering powered by React Three Fiber, visualizing live device pinout health, temperature states, and sensor trigger status in real time.
- **K3LH & HSE Industrial Compliance:** Pre-calibrated thresholding models aligning with workplace safety guidelines, tracking chronic air pollution levels alongside acute combustion events.
- **Multi-Tenant Access Governance:** Granular permission hierarchies enabling device owners to share live facility telemetry with family members, safety supervisors, or emergency responders.
- **Zero-Friction Bot Configuration:** Onboard new hardware modules, calibrate baseline air levels, and adjust notification thresholds directly via interactive Telegram bot commands.
- **Historical Telemetry Analytics:** High-throughput time-series logging in Neon Serverless PostgreSQL with Chart.js trend charts for compliance auditing and safety investigations.

---

## 🏗️ System Architecture

SmokeSentry v2.0 implements a decoupled, event-driven architecture spanning physical edge devices, serverless cloud processing, and client presentation layers.

### ASCII Architecture Map

```
+-------------------------------------------------------------------------+
|                           EDGE HARDWARE TIER                            |
|                                                                         |
|  +-----------------+   +-------------------+   +---------------------+  |
|  |  MQ-2 (Smoke)   |   |  MQ-135 (VOC/Air) |   | Flame Sensor (IR)   |  |
|  |   Pin GPIO 34   |   |    Pin GPIO 35    |   |     Pin GPIO 32     |  |
|  +--------+--------+   +---------+---------+   +----------+----------+  |
|           |                      |                        |             |
|           +-----------------> [ ADC IN ] <----------------+             |
|                                  |                                      |
|                       +----------v-----------+                          |
|                       |   ESP32 Controller   |                          |
|                       | (Sampling / Averaging|                          |
|                       +----------+-----------+                          |
|                                  |                                      |
|           +----------------------+-----------------------+              |
|           | [Alarm Trigger]                              | [HTTPS/JSON] |
|           v                                              v              |
|   +---------------+                       +--------------------------+  |
|   | Piezo Buzzer  |                       | Wi-Fi 802.11 b/g/n Edge  |  |
|   |  Pin GPIO 25  |                       | Secure Outbound Payload  |  |
|   +---------------+                       +-------------+------------+  |
+---------------------------------------------------------|---------------+
                                                          |
                                                          v
+-------------------------------------------------------------------------+
|                        CLOUD & INGESTION TIER                           |
|                                                                         |
|                Next.js 16 Edge API Routes / Serverless                  |
|                                                                         |
|      +----------------------------------------------------------+       |
|      |               /api/sensor (Ingestion Route)              |       |
|      |    Token Authentication, Payload Validation, Schema Check|       |
|      +----------------------------+-----------------------------+       |
|                                   |                                     |
|           +-----------------------+-----------------------+             |
|           v                                               v             |
|   +-----------------------+                       +------------------+  |
|   | Neon Serverless PG    |                       | Telegram Engine  |  |
|   | Pooler + Drizzle ORM  |                       | Bot API Webhook  |  |
|   | Timescale Telemetry   |                       | Immediate Push   |  |
|   +-----------------------+                       +------------------+  |
+-------------------------------------------------------------------------+
                                                          |
                                                          v
+-------------------------------------------------------------------------+
|                         PRESENTATION TIER                               |
|                                                                         |
|        Next.js 16 App Router + React 19 Client + Tailwind CSS           |
|                                                                         |
|   +-----------------------+   +-------------------+   +--------------+  |
|   |  React Three Fiber    |   | Chart.js Telemetry|   | Device Admin |  |
|   |  3D Model Visualizer  |   | Historical Trends |   | & RBAC Auth  |  |
|   +-----------------------+   +-------------------+   +--------------+  |
+-------------------------------------------------------------------------+
```

### Mermaid Flowchart

```mermaid
flowchart TD
    subgraph HardwareEdge["Edge Hardware Tier"]
        MQ2["MQ-2 Smoke & Gas (GPIO 34)"]
        MQ135["MQ-135 Air Quality (GPIO 35)"]
        Flame["Optical Flame Sensor (GPIO 32)"]
        ESP32["ESP32 Microcontroller"]
        Buzzer["Piezo Siren Buzzer (GPIO 25)"]

        MQ2 -->|Analog ADC| ESP32
        MQ135 -->|Analog ADC| ESP32
        Flame -->|Digital & Analog| ESP32
        ESP32 -->|Local Emergency Trigger| Buzzer
    end

    subgraph CloudBackend["Cloud Ingestion Tier (Next.js 16 + Neon)"]
        API["/api/sensor Ingestion Route"]
        AuthValidator["API Key & Device Token Validator"]
        Drizzle["Drizzle ORM Engine"]
        NeonDB[("Neon PostgreSQL Database")]
        AlertDispatcher["Telegram Alert Dispatcher"]

        ESP32 -->|HTTPS Encrypted JSON| API
        API --> AuthValidator
        AuthValidator --> Drizzle
        Drizzle --> NeonDB
        AuthValidator -->|Critical Anomaly Detected| AlertDispatcher
    end

    subgraph ExternalChannels["Alerts & Notifications"]
        Telegram["Telegram Bot API Server"]
        Recipients["First Responders & Facility Operators"]

        AlertDispatcher -->|Sub-second Webhook| Telegram
        Telegram -->|Push Notification| Recipients
    end

    subgraph ClientUI["Presentation Tier (React 19 Dashboard)"]
        Dashboard["Modern Web Dashboard"]
        ThreeTwin["React Three Fiber 3D Hardware Twin"]
        Charts["Chart.js Real-time Gas Concentration Curves"]

        NeonDB -->|Fast Read Replicas| Dashboard
        Dashboard --> ThreeTwin
        Dashboard --> Charts
    end
```

---

## 🔌 Hardware Pinout & Sensor Specifications

The hardware system operates on 3.3V logic levels with isolated sensor power delivery to ensure analog reading accuracy and noise immunity.

| Component / Sensor | Sensor Pin | ESP32 GPIO | Channel Type | Detection Spectrum / Target Gases | Normal Range | Trigger Threshold |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **MQ-2** | AOUT | **GPIO 34** | Analog In (ADC1_CH6) | Smoke, LPG, Butane, Propane, Methane, Hydrogen | 100 - 350 ppm | > 600 ppm (Warning), > 1200 ppm (Critical) |
| **MQ-135** | AOUT | **GPIO 35** | Analog In (ADC1_CH7) | Carbon Monoxide (CO), Ammonia, Benzene, Alcohol, Smoke, NOx | 10 - 200 ppm | > 350 ppm (Unhealthy), > 700 ppm (Hazardous) |
| **Flame Sensor** | DOUT / AOUT | **GPIO 32** | Digital / Analog In (ADC1_CH4) | Infrared spectrum (760 nm to 1100 nm flame light) | High (3.3V, No Flame) | Low (0V) or ADC drop below 400 mV |
| **Piezo Buzzer** | Signal (+) | **GPIO 25** | Digital Output (PWM) | Acoustic frequency: 2.4 kHz audible siren (85 dB at 10 cm) | Idle (0V LOW) | Active (PWM HIGH, 2400 Hz pulse) |
| **System Status LED** | Anode (+) | **GPIO 2** | Digital Output | Green: Healthy, Yellow: Warning, Red: Critical Incident | Solid Green | Flashing Yellow / Red Strobe |

---

## 🌿 Industrial K3LH / HSE Narrative

Occupational Health, Safety, and Environment (K3LH / HSE) compliance mandates proactive risk reduction rather than reactive mitigation. In manufacturing spaces, chemical storage warehouses, and server facilities, toxic gas accumulation frequently precedes open flame outbreaks.

SmokeSentry v2.0 enforces a multi-tier threat classification pipeline:

1. **Tier 1 (Normal Operations):** Ambient VOC and air quality indices remain within baseline thresholds. Telemetry is batched and synced to the cloud database at 60-second intervals to conserve bandwidth and power.
2. **Tier 2 (Air Quality Warning - K3LH Alert):** When MQ-135 detects sustained VOC or toxic gas concentrations exceeding 350 ppm without open flame presence, the system logs an HSE incident, updates dashboard visualizers, and issues informational advisories to facility managers.
3. **Tier 3 (Acute Combustion Emergency):** Simultaneous detection of elevated smoke particles (MQ-2) and infrared light emissions (Flame Sensor) instantly trips the hardware siren, boosts telemetry sampling to 1-second intervals, and fires priority Telegram emergency broadcasts containing device identifiers and physical zone coordinates.

This multi-sensor consensus model drastically reduces false alarms caused by temporary soldering flux, dust, or brief steam discharges, ensuring high trust in automated emergency responses.

---

## 🗄️ Database Architecture

SmokeSentry uses Drizzle ORM with Neon Serverless PostgreSQL. The relational schema is structured as follows:

```
+--------------------+       +----------------------+       +-------------------------+
|       users        |       |       devices        |       |     sensor_readings     |
+--------------------+       +----------------------+       +-------------------------+
| id (PK, UUID)      |1     *| id (PK, UUID)        |1     *| id (PK, UUID)           |
| name               +-------+ owner_id (FK)        +-------+ device_id (FK)          |
| email              |       | device_code          |       | mq2_smoke_value         |
| password_hash      |       | location_label       |       | mq135_air_value         |
| created_at         |       | is_active            |       | flame_detected (bool)   |
+---------+----------+       | last_seen_at         |       | battery_millivolts      |
          |                  +----------+-----------+       | recorded_at (timestamp) |
          |1                            |1                  +-------------------------+
          |                             |
          |                             |
          |                  +----------v-----------+       +-------------------------+
          |                  |    device_members    |       |         alerts          |
          |                  +----------------------+       +-------------------------+
          |                  | id (PK, UUID)        |      *| id (PK, UUID)           |
          +----------------->+ user_id (FK)         |       | device_id (FK)          |
                             | device_id (FK)       |<------+ severity (enum)         |
                             | role (admin, viewer) |       | alert_type (smoke, etc) |
                             | created_at           |       | message                 |
                             +----------------------+       | resolved_at (timestamp) |
                                                            +-------------------------+
```

### Relational Schema Summary

- **users:** Registered operators, security managers, and household members.
- **devices:** Physical SmokeSentry hardware units, device security tokens, and deployment locations.
- **device_members:** Granular multi-user access permissions linking users to specific devices.
- **sensor_readings:** High-resolution time-series sensor telemetry indexed by device and timestamp.
- **alerts:** Historical log of emergency events, trigger values, and resolution timestamps.
- **sessions:** Secure user authentication sessions managed via NextAuth.js.
- **notifications:** Delivery audits of outbound Telegram webhooks, delivery statuses, and response codes.

---

## 🚀 Local Installation & Quickstart

### Prerequisites

- Node.js >= 18.18.0 (LTS recommended)
- npm, pnpm, or yarn
- Neon PostgreSQL account (free tier available at [neon.tech](https://neon.tech))
- Telegram account (for bot creation via `@BotFather`)
- ESP32 Development Board (ESP-WROOM-32 or equivalent) with Arduino IDE / PlatformIO

### Step 1: Clone Repository and Install Dependencies

```bash
git clone https://github.com/Zeet7450/smoke-sentry.git
cd smoke-sentry

npm install
```

### Step 2: Configure Environment Variables

Create a local environment file by copying `.env.example`:

```bash
cp .env.example .env.local
```

Fill in the required keys in `.env.local`:

| Variable | Requirement | Description | Example |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Required** | Pooled PostgreSQL connection string from Neon | `postgresql://user:pass@ep-cool-lake.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_SECRET` | **Required** | Cryptographic random string (minimum 32 characters) | `generate with openssl rand -base64 32` |
| `NEXTAUTH_URL` | **Required** | Canonical URL of the application | `http://localhost:3000` (development) |
| `TELEGRAM_BOT_TOKEN` | **Required** | HTTP API Bot token generated by Telegram `@BotFather` | `7123456789:AAHfd8e923hd8a92d83_example` |
| `TELEGRAM_DEFAULT_CHAT_ID` | Optional | Default fallback Telegram chat or channel ID | `-100123456789` |
| `DEVICE_INGESTION_SECRET` | **Required** | Shared secret token passed in ESP32 HTTP headers | `sk_live_smokesentry_device_secret_2026` |

### Step 3: Run Database Migrations

Generate and apply Drizzle database schemas to your Neon PostgreSQL cluster:

```bash
# Generate SQL migration files from schema definition
npm run db:generate

# Push migrations directly to Neon database
npm run db:push

# (Optional) Launch interactive visual database management GUI
npm run db:studio
```

### Step 4: Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the application.

---

## 📡 Hardware Telemetry Ingestion Contract

The ESP32 firmware transmits HTTP POST payloads to `/api/sensor` on detection of changes or at scheduled heartbeat intervals.

### Ingestion Request Payload

```json
{
  "device_code": "SS-NODE-JKT-01",
  "secret_key": "sk_live_smokesentry_device_secret_2026",
  "telemetry": {
    "mq2_ppm": 248.5,
    "mq135_ppm": 85.2,
    "flame_detected": false,
    "flame_raw_adc": 3820,
    "vcc_mv": 3280
  },
  "timestamp": 1774920000
}
```

### Ingestion Response

```json
{
  "status": "success",
  "device_id": "8d3e6c0b-410a-4fb4-9c8e-32b0a1d48c90",
  "action_required": "none",
  "sync_interval_ms": 60000
}
```

If thresholds are breached, `action_required` responds with `"trigger_alarm"` and the server automatically dispatches the Telegram alert webhook.

---

## 🤝 Contribution Guidelines

We welcome community pull requests and feature expansions:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/enhanced-calibration`).
3. Commit your changes with conventional commit messages (`git commit -m "feat: add moving average filter for MQ-135 ADC readings"`).
4. Push to your branch (`git push origin feature/enhanced-calibration`).
5. Open a well-documented Pull Request.

---

## 📄 License & Intellectual Property

Distributed under the **MIT License**. Copyright (c) 2026 SmokeSentry Engineering Team.  
Engineered with precision for human life safety and environmental sustainability in Indonesia.
