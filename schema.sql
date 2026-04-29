-- SmokeSentry Database Schema for Neon PostgreSQL

CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  email           VARCHAR(255) UNIQUE NOT NULL,
  name            VARCHAR(100),
  telegram_chat_id BIGINT,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS devices (
  id              SERIAL PRIMARY KEY,
  product_id      VARCHAR(20) UNIQUE NOT NULL,
  nama_lokasi     VARCHAR(100) DEFAULT 'Rumah',
  wifi_ssid       VARCHAR(100),
  is_online       BOOLEAN DEFAULT false,
  last_seen       TIMESTAMP,
  current_status  VARCHAR(20) DEFAULT 'AMAN',
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS device_users (
  id        SERIAL PRIMARY KEY,
  device_id INT REFERENCES devices(id) ON DELETE CASCADE,
  user_id   INT REFERENCES users(id) ON DELETE CASCADE,
  role      VARCHAR(20) DEFAULT 'member',
  UNIQUE(device_id, user_id)
);

CREATE TABLE IF NOT EXISTS sensor_logs (
  id        SERIAL PRIMARY KEY,
  device_id INT REFERENCES devices(id) ON DELETE CASCADE,
  mq2       INT,
  mq135     INT,
  flame     INT,
  status    VARCHAR(20),
  logged_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id              SERIAL PRIMARY KEY,
  device_id       INT REFERENCES devices(id) ON DELETE CASCADE,
  jenis           VARCHAR(50),
  waktu_mulai     TIMESTAMP DEFAULT NOW(),
  waktu_selesai   TIMESTAMP,
  is_active       BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS settings (
  id                  SERIAL PRIMARY KEY,
  device_id           INT REFERENCES devices(id) ON DELETE CASCADE UNIQUE,
  mq2_batas           INT DEFAULT 450,
  mq135_batas         INT DEFAULT 450,
  flame_batas         INT DEFAULT 3500,
  mode_tidur          BOOLEAN DEFAULT false,
  jam_tidur_mulai     TIME DEFAULT '22:00',
  jam_tidur_selesai   TIME DEFAULT '06:00',
  snooze_until        TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sensor_logs_device_id ON sensor_logs(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_logs_logged_at ON sensor_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_alerts_device_id ON alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_active ON alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_device_users_device_id ON device_users(device_id);
CREATE INDEX IF NOT EXISTS idx_device_users_user_id ON device_users(user_id);
