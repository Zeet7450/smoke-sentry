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
  });

  const handleSave = () => {
    // In production, this would save to the database
    console.log('Saving settings:', settings);
    alert('Pengaturan berhasil disimpan!');
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
        <p className="text-text-muted">Konfigurasi perangkat SmokeSentry</p>
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
