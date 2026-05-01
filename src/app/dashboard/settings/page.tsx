'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    mq2_batas: 450,
    mq135_batas: 450,
    flame_batas: 3500,
    mode_tidur: false,
    jam_tidur_mulai: '22:00',
    jam_tidur_selesai: '06:00',
    nama_lokasi: 'Rumah',
    telegram_chat_id: '',
  });
  const [botToken, setBotToken] = useState('');

  const handleSave = () => {
    // In production, this would save to the database
    console.log('Saving settings:', settings);
    alert('Pengaturan berhasil disimpan!');
  };

  const handleSaveBotToken = async () => {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'telegram_bot_token', value: botToken }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Bot token berhasil disimpan!');
      } else {
        alert('Gagal menyimpan bot token: ' + data.error);
      }
    } catch (err) {
      alert('Gagal menyimpan bot token');
    }
  };

  const handleDeleteDevice = () => {
    if (confirm('Apakah Anda yakin ingin menghapus device ini? Tindakan ini tidak dapat dibatalkan.')) {
      // In production, this would delete from the database
      console.log('Deleting device');
      alert('Device berhasil dihapus');
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-text-muted">Konfigurasi perangkat smoke sentry</p>
      </div>

      <div className="space-y-6">
        {/* Location Name */}
        <Card glow="none">
          <h3 className="font-bold text-lg mb-4">Nama Lokasi</h3>
          <div>
            <label className="block text-text-muted text-sm mb-2">
              Nama lokasi device
            </label>
            <input
              type="text"
              value={settings.nama_lokasi}
              onChange={(e) => setSettings({ ...settings, nama_lokasi: e.target.value })}
              className="w-full bg-surface border border-border rounded-8px px-4 py-3 text-text focus:outline-none focus:border-primary"
              placeholder="Contoh: Rumah, Kamar, Dapur"
            />
          </div>
        </Card>

        {/* Telegram Bot Token Configuration */}
        <Card glow="none">
          <h3 className="font-bold text-lg mb-4">Konfigurasi Telegram Bot</h3>
          <p className="text-text-muted text-sm mb-4">
            Bot token digunakan untuk semua device smoke sentry. Simpan token @smokeSentrybot di sini.
          </p>
          <div>
            <label className="block text-text-muted text-sm mb-2">
              Bot Token
            </label>
            <input
              type="password"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              className="w-full bg-surface border border-border rounded-8px px-4 py-3 text-text focus:outline-none focus:border-primary"
              placeholder="Masukkan token dari @BotFather"
            />
            <p className="text-text-muted text-xs mt-2">
              Token tersimpan di environment variable server, tidak ditampilkan ke user lain.
            </p>
          </div>
          <Button variant="primary" size="md" className="mt-4" onClick={handleSaveBotToken}>
            Simpan Token
          </Button>
        </Card>

        {/* Telegram Chat ID */}
        <Card glow="none">
          <h3 className="font-bold text-lg mb-4">Telegram Chat ID</h3>
          <div>
            <label className="block text-text-muted text-sm mb-2">
              Telegram Chat ID untuk notifikasi
            </label>
            <input
              type="text"
              value={settings.telegram_chat_id}
              onChange={(e) => setSettings({ ...settings, telegram_chat_id: e.target.value })}
              className="w-full bg-surface border border-border rounded-8px px-4 py-3 text-text focus:outline-none focus:border-primary"
              placeholder="Contoh: 123456789"
            />
            <p className="text-text-muted text-xs mt-2">
              Chat ID ini akan digunakan untuk semua device Anda secara otomatis.
            </p>
          </div>

          {/* Panduan Chat ID */}
          <div style={{
            background: '#0a0a14',
            border: '1px solid #1e1e2e',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginTop: '1rem'
          }}>
            <p style={{
              fontSize: '11px',
              color: '#E8FF47',
              fontWeight: 600,
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              marginBottom: '10px'
            }}>
              💬 Cara Dapat Chat ID Kamu
            </p>

            <ol style={{ paddingLeft: '1.1rem', color: '#888899', fontSize: '13px', lineHeight: 1.8 }}>
              <li>
                Buka Telegram → cari{' '}
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#E8FF47', textDecoration: 'none', fontWeight: 600 }}
                >
                  @userinfobot
                </a>
              </li>
              <li>Kirim sembarang pesan (misalnya: <code style={{ background: '#1a1a2e', padding: '1px 6px', borderRadius: '4px', color: '#ffffff' }}>hi</code>)</li>
              <li>Bot akan balas dengan info akunmu, salin angka di baris <b style={{ color: '#ffffff' }}>Id:</b></li>
              <li>Paste angka tersebut ke field di atas</li>
            </ol>

            <a
              href="https://t.me/userinfobot"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                textAlign: 'center',
                background: 'transparent',
                border: '1px solid #2a2a3d',
                borderRadius: '8px',
                color: '#888899',
                fontSize: '12px',
                padding: '8px',
                textDecoration: 'none',
                marginTop: '12px',
                transition: 'border-color .15s, color .15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#E8FF47'; e.currentTarget.style.color='#E8FF47' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#2a2a3d'; e.currentTarget.style.color='#888899' }}
            >
              🔍 Buka @userinfobot
            </a>
          </div>
        </Card>

        {/* Sensor Thresholds */}
        <Card glow="none">
          <h3 className="font-bold text-lg mb-4">Threshold Sensor</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-text-muted text-sm mb-2">
                MQ-2 Batas: {settings.mq2_batas}
              </label>
              <input
                type="range"
                min="0"
                max="1000"
                value={settings.mq2_batas}
                onChange={(e) => setSettings({ ...settings, mq2_batas: parseInt(e.target.value) })}
                className="w-full"
              />
              <p className="text-text-muted text-xs mt-1">
                Nilai sensor MQ-2 yang memicu alert
              </p>
            </div>
            <div>
              <label className="block text-text-muted text-sm mb-2">
                MQ-135 Batas: {settings.mq135_batas}
              </label>
              <input
                type="range"
                min="0"
                max="1000"
                value={settings.mq135_batas}
                onChange={(e) => setSettings({ ...settings, mq135_batas: parseInt(e.target.value) })}
                className="w-full"
              />
              <p className="text-text-muted text-xs mt-1">
                Nilai sensor MQ-135 yang memicu alert
              </p>
            </div>
            <div>
              <label className="block text-text-muted text-sm mb-2">
                Flame Batas: {settings.flame_batas}
              </label>
              <input
                type="range"
                min="0"
                max="5000"
                value={settings.flame_batas}
                onChange={(e) => setSettings({ ...settings, flame_batas: parseInt(e.target.value) })}
                className="w-full"
              />
              <p className="text-text-muted text-xs mt-1">
                Nilai sensor Flame yang memicu alert
              </p>
            </div>
          </div>
        </Card>

        {/* Sleep Mode */}
        <Card glow="none">
          <h3 className="font-bold text-lg mb-4">Mode Tidur</h3>
          <div className="flex items-center gap-4 mb-4">
            <input
              type="checkbox"
              id="mode_tidur"
              checked={settings.mode_tidur}
              onChange={(e) => setSettings({ ...settings, mode_tidur: e.target.checked })}
              className="w-5 h-5"
            />
            <label htmlFor="mode_tidur" className="text-text">
              Aktifkan mode tidur
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-text-muted text-sm mb-2">
                Jam Mulai
              </label>
              <input
                type="time"
                value={settings.jam_tidur_mulai}
                onChange={(e) => setSettings({ ...settings, jam_tidur_mulai: e.target.value })}
                className="w-full bg-surface border border-border rounded-8px px-4 py-3 text-text focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-text-muted text-sm mb-2">
                Jam Selesai
              </label>
              <input
                type="time"
                value={settings.jam_tidur_selesai}
                onChange={(e) => setSettings({ ...settings, jam_tidur_selesai: e.target.value })}
                className="w-full bg-surface border border-border rounded-8px px-4 py-3 text-text focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <p className="text-text-muted text-xs mt-4">
            Selama mode tidur, notifikasi akan dimatikan
          </p>
        </Card>

        {/* Save Button */}
        <Button variant="primary" size="lg" className="w-full" onClick={handleSave}>
          Simpan Pengaturan
        </Button>

        {/* Delete Device */}
        <Card glow="danger" className="border-danger/30">
          <h3 className="font-bold text-lg mb-2 text-danger">Hapus Device</h3>
          <p className="text-text-muted text-sm mb-4">
            Tindakan ini akan menghapus device dari akun Anda secara permanen.
          </p>
          <Button variant="danger" size="md" onClick={handleDeleteDevice}>
            Hapus Device
          </Button>
        </Card>
      </div>
    </div>
  );
}
