'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/SmokeToast';
import { ConfirmDeleteModal } from '@/components/ui/ConfirmDeleteModal';
import { SensorChart } from '@/components/SensorChart';

export default function DevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', device_code: '', location: '' });
  const [shareFormData, setShareFormData] = useState({ email: '', role: 'viewer', receive_notifications: true });
  const [settingsFormData, setSettingsFormData] = useState({ 
    name: '', 
    location: '', 
    mq2_threshold: 400, 
    mq135_threshold: 300, 
    flame_threshold: 500,
    telegramchatid: ''
  });
  const [settingsTab, setSettingsTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setIsShareModalOpen(false);
        setIsSettingsModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      if (data.success) {
        setDevices(data.data);
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend validation
    if (!formData.name.trim()) {
      showToast({
        type: 'warning',
        title: 'Form Tidak Lengkap',
        message: 'Nama device wajib diisi',
        autoDismiss: true,
      });
      return;
    }
    
    if (!formData.device_code.trim()) {
      showToast({
        type: 'warning',
        title: 'Form Tidak Lengkap',
        message: 'Device code wajib diisi',
        autoDismiss: true,
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          device_code: formData.device_code.trim().toUpperCase(),
          location: formData.location.trim() || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast({
          type: 'danger',
          title: 'Gagal Menambah Device',
          message: data.error || 'Terjadi kesalahan, coba lagi.',
          autoDismiss: true,
        });
        return;
      }

      if (data.success) {
        showToast({
          type: 'success',
          title: 'Device Berhasil Ditambahkan!',
          message: `${formData.name} (${formData.device_code.toUpperCase()}) sudah terhubung.`,
          autoDismiss: true,
        });
        setIsModalOpen(false);
        setFormData({ name: '', device_code: '', location: '' });
        fetchDevices();
      }
    } catch (error) {
      showToast({
        type: 'danger',
        title: 'Koneksi Bermasalah',
        message: 'Tidak bisa menghubungi server. Cek koneksi internet.',
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/devices/${selectedDevice.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shareFormData),
      });
      const data = await res.json();

      if (data.success) {
        showToast({
          type: 'success',
          title: 'Akses Dibagikan',
          message: `Akses device berhasil dibagikan ke ${shareFormData.email}.`,
          autoDismiss: true,
        });
        setIsShareModalOpen(false);
        setShareFormData({ email: '', role: 'viewer', receive_notifications: true });
      } else {
        showToast({
          type: 'danger',
          title: 'Gagal Membagikan Akses',
          message: data.error || 'Terjadi kesalahan saat membagikan akses.',
          autoDismiss: true,
        });
      }
    } catch (error) {
      showToast({
        type: 'danger',
        title: 'Gagal Membagikan Akses',
        message: 'Terjadi kesalahan koneksi.',
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/devices/${selectedDevice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsFormData),
      });
      const data = await res.json();

      if (data.success) {
        showToast({
          type: 'success',
          title: 'Pengaturan Disimpan',
          message: 'Pengaturan device berhasil diperbarui.',
          autoDismiss: true,
        });
        setIsSettingsModalOpen(false);
        fetchDevices();
      } else {
        showToast({
          type: 'danger',
          title: 'Gagal Menyimpan',
          message: data.error || 'Terjadi kesalahan saat menyimpan pengaturan.',
          autoDismiss: true,
        });
      }
    } catch (error) {
      showToast({
        type: 'danger',
        title: 'Gagal Menyimpan',
        message: 'Terjadi kesalahan koneksi.',
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteDevice = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/devices/${selectedDevice.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        showToast({
          type: 'success',
          title: 'Device Dihapus',
          message: 'Device berhasil dihapus.',
          autoDismiss: true,
        });
        setIsSettingsModalOpen(false);
        setIsDeleteModalOpen(false);
        fetchDevices();
      } else {
        showToast({
          type: 'danger',
          title: 'Gagal Menghapus',
          message: data.error || 'Terjadi kesalahan saat menghapus device.',
          autoDismiss: true,
        });
      }
    } catch (error) {
      showToast({
        type: 'danger',
        title: 'Gagal Menghapus',
        message: 'Terjadi kesalahan koneksi.',
        autoDismiss: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const openSettingsModal = (device: any) => {
    setSelectedDevice(device);
    setSettingsFormData({
      name: device.name,
      location: device.location || '',
      mq2_threshold: device.mq2_threshold || 400,
      mq135_threshold: device.mq135_threshold || 300,
      flame_threshold: device.flame_threshold || 500,
      telegramchatid: device.telegramchatid || '',
    });
    setSettingsTab('info');
    setIsSettingsModalOpen(true);
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Devices</h1>
          <p className="text-text-muted">Kelola perangkat SmokeSentry kamu</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          + Tambah Device
        </Button>
      </div>

      <div className="grid gap-6">
        {devices.length === 0 ? (
          <Card glow="none">
            <div className="text-center py-12">
              <p className="text-text-muted mb-4">Belum ada device yang terhubung</p>
              <p className="text-text-muted text-sm">
                Hubungkan device pertamamu lewat Telegram Bot @SmokeSentryBot
              </p>
            </div>
          </Card>
        ) : (
          devices.map((device) => (
            <Card key={device.id} glow="none">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">{device.name}</h3>
                  <p className="text-text-muted text-sm mb-4">
                    Device Code: {device.device_code}
                  </p>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: device.isOnline ? 'rgba(232,255,71,0.15)' : 'rgba(239,68,68,0.15)',
                      color: device.isOnline ? '#E8FF47' : '#ef4444',
                      border: `1px solid ${device.isOnline ? '#E8FF47' : '#ef4444'}`
                    }}
                  >
                    {device.isOnline ? '● Online' : '● Offline'}
                  </span>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedDevice(device);
                      setIsShareModalOpen(true);
                    }}
                  >
                    Bagikan Akses
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openSettingsModal(device)}
                  >
                    Settings
                  </Button>
                </div>
              </div>
              {device.location && (
                <p className="text-text-muted text-sm mt-4">
                  Lokasi: {device.location}
                </p>
              )}
            </Card>
          ))
        )}
      </div>

      <Card glow="none" className="mt-8">
        <h3 className="font-bold text-lg mb-4">Cara Menghubungkan Device</h3>
        <ol className="list-decimal list-inside space-y-3 text-text-muted">
          <li className="pl-2">
            Nyalakan ESP32 SmokeSentry
            <p className="text-text-muted text-sm mt-1 ml-4">→ Tunggu buzzer bunyi 1x panjang, artinya ESP32 siap masuk mode setup</p>
          </li>
          <li className="pl-2">
            Hubungkan HP/laptop ke WiFi hotspot bernama "SmokeSentry"
            <p className="text-text-muted text-sm mt-1 ml-4">→ Tidak ada password, langsung connect</p>
            <p className="text-text-muted text-sm mt-1 ml-4">→ Browser akan otomatis membuka halaman setup</p>
            <p className="text-text-muted text-sm mt-1 ml-4">→ Jika tidak otomatis, buka manual: http://192.168.4.1</p>
          </li>
          <li className="pl-2">
            Di halaman setup, klik "Configure WiFi"
            <p className="text-text-muted text-sm mt-1 ml-4">→ Pilih nama WiFi rumah/kantor dari daftar yang muncul</p>
            <p className="text-text-muted text-sm mt-1 ml-4">→ Masukkan password WiFi tersebut</p>
          </li>
          <li className="pl-2">
            Isi Device Code dan API Key
            <p className="text-text-muted text-sm mt-1 ml-4">→ Device Code & API Key bisa dilihat di halaman ini (tab Informasi Umum)</p>
            <p className="text-text-muted text-sm mt-1 ml-4">→ Pastikan tidak ada spasi di awal/akhir</p>
          </li>
          <li className="pl-2">
            Klik Save
            <p className="text-text-muted text-sm mt-1 ml-4">→ Buzzer bunyi 3x pendek = berhasil terhubung ✅</p>
            <p className="text-text-muted text-sm mt-1 ml-4">→ Device akan muncul Online di dashboard dalam beberapa detik</p>
            <p className="text-text-muted text-sm mt-1 ml-4">→ Notifikasi Telegram pertama akan dikirim otomatis</p>
          </li>
        </ol>
        <div className="mt-4 p-4 rounded-lg" style={{ background: '#0a0a14', border: '1px solid #1e1e2e' }}>
          <p className="font-bold text-sm mb-2" style={{ color: '#E8FF47' }}>CATATAN PENTING:</p>
          <ul className="list-disc list-inside space-y-1 text-text-muted text-sm">
            <li>Untuk ganti WiFi: tekan tombol BOOT di ESP32 saat menyala, lepas setelah buzzer bunyi → ulangi dari langkah 2</li>
            <li>Jika device tidak muncul Online setelah 30 detik, cek kembali Device Code dan API Key yang dimasukkan</li>
            <li>Device bisa diakses lokal via: http://smokesentry.local (hanya dari jaringan WiFi yang sama)</li>
          </ul>
        </div>
      </Card>

      {/* Add Device Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={(e: React.MouseEvent) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false)
            }
          }}
        >
          <div
            className="relative w-full max-w-md mx-4 rounded-xl p-6 pt-10"
            style={{ background: '#111', border: '2px solid #E8FF47' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* X BUTTON — di dalam kotak, pojok kanan atas */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 w-8 h-8
                         flex items-center justify-center
                         rounded-full border border-gray-700
                         text-gray-400 hover:text-white
                         hover:border-white transition-all"
              aria-label="Tutup"
            >
              ✕
            </button>

            <h2 className="text-xl font-black text-white mb-6">
              Tambah Device Baru
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nama Device *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-[#E8FF47] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8FF47]"
                  placeholder="Contoh: Dapur Rumah"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Device Code / Product ID *</label>
                <input
                  type="text"
                  value={formData.device_code.toUpperCase()}
                  onChange={(e) => setFormData({ ...formData, device_code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 bg-black border border-[#E8FF47] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8FF47]"
                  style={{ textTransform: 'uppercase' }}
                  placeholder="SS-DEMO-001"
                  required
                />
                <p className="text-xs text-text-muted mt-1">Format: SS-XXXX-XXX (contoh: SS-DEMO-001)</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Lokasi (opsional)</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-[#E8FF47] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8FF47]"
                  placeholder="Contoh: Lantai 1 - Dapur"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Menambahkan...' : 'Tambah Device'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Access Modal */}
      {isShareModalOpen && selectedDevice && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
          <Card glow="primary" className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-6">Bagikan Akses Device</h2>
            <p className="text-text-muted text-sm mb-4">
              Device: <span className="text-white font-medium">{selectedDevice.name}</span>
            </p>
            <form onSubmit={handleShareSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email User *</label>
                <input
                  type="email"
                  value={shareFormData.email}
                  onChange={(e) => setShareFormData({ ...shareFormData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-[#E8FF47] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8FF47]"
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={shareFormData.role}
                  onChange={(e) => setShareFormData({ ...shareFormData, role: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-[#E8FF47] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8FF47]"
                >
                  <option value="viewer">Viewer - Hanya lihat</option>
                  <option value="admin">Admin - Bisa edit</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={shareFormData.receive_notifications}
                  onChange={(e) => setShareFormData({ ...shareFormData, receive_notifications: e.target.checked })}
                  className="w-4 h-4 accent-[#E8FF47]"
                />
                <label htmlFor="notifications" className="text-sm">
                  Terima notifikasi dari device ini
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsShareModalOpen(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Mengirim...' : 'Kirim Undangan'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && selectedDevice && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 overflow-y-auto py-8">
          <Card glow="primary" className="w-full max-w-2xl p-6 my-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Pengaturan Device</h2>
              <Button variant="outline" size="sm" onClick={() => setIsSettingsModalOpen(false)}>
                ✕
              </Button>
            </div>
            <p className="text-text-muted text-sm mb-6">
              Device: <span className="text-white font-medium">{selectedDevice.name}</span>
            </p>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-[#1E1E2E]">
              <button
                onClick={() => setSettingsTab('info')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  settingsTab === 'info' 
                    ? 'border-[#E8FF47] text-[#E8FF47]' 
                    : 'border-transparent text-text-muted hover:text-white'
                }`}
              >
                Informasi Umum
              </button>
              <button
                onClick={() => setSettingsTab('threshold')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  settingsTab === 'threshold' 
                    ? 'border-[#E8FF47] text-[#E8FF47]' 
                    : 'border-transparent text-text-muted hover:text-white'
                }`}
              >
                Threshold Sensor
              </button>
              <button
                onClick={() => setSettingsTab('notifications')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  settingsTab === 'notifications' 
                    ? 'border-[#E8FF47] text-[#E8FF47]' 
                    : 'border-transparent text-text-muted hover:text-white'
                }`}
              >
                Notifikasi
              </button>
              <button
                onClick={() => setSettingsTab('chart')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  settingsTab === 'chart' 
                    ? 'border-[#E8FF47] text-[#E8FF47]' 
                    : 'border-transparent text-text-muted hover:text-white'
                }`}
              >
                Grafik Sensor
              </button>
            </div>

            <form onSubmit={handleSettingsSubmit} className="space-y-6">
              {/* Tab 1: Informasi Umum */}
              {settingsTab === 'info' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nama Device</label>
                    <input
                      type="text"
                      value={settingsFormData.name}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-black border border-[#E8FF47] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8FF47]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Lokasi</label>
                    <input
                      type="text"
                      value={settingsFormData.location}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, location: e.target.value })}
                      className="w-full px-4 py-2 bg-black border border-[#E8FF47] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8FF47]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Device Code</label>
                    <input
                      type="text"
                      value={selectedDevice.device_code}
                      disabled
                      className="w-full px-4 py-2 bg-[#080810] border border-[#1E1E2E] rounded-lg text-text-muted"
                    />
                  </div>
                  <div className="mt-6 p-4 rounded-lg" style={{ background: '#080810', border: '1px solid #2d2d4e' }}>
                    <p className="text-sm font-medium mb-4" style={{ color: '#8888bb' }}>
                      🔧 KONFIGURASI ESP32 — isi di portal 192.168.4.1
                    </p>

                    <div className="mb-4">
                      <p className="text-xs mb-2" style={{ color: '#6666aa' }}>Device Code</p>
                      <div className="flex gap-2 items-center">
                        <code className="flex-1 px-3 py-2 rounded text-sm break-all" style={{ background: '#0a0a14', color: '#E8FF47' }}>
                          {selectedDevice.device_code}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedDevice.device_code)
                            showToast({ type: 'success', title: 'Copied!', message: 'Device Code copied to clipboard', autoDismiss: true })
                          }}
                          className="px-3 py-2 rounded text-xs"
                          style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', color: '#ffffff' }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs mb-2" style={{ color: '#6666aa' }}>API Key</p>
                      <div className="flex gap-2 items-center">
                        <code className="flex-1 px-3 py-2 rounded text-xs break-all" style={{ background: '#0a0a14', color: '#E8FF47', letterSpacing: '0.05em' }}>
                          {selectedDevice.apikey || 'Generating...'}
                        </code>
                        {selectedDevice.apikey && (
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(selectedDevice.apikey)
                              showToast({ type: 'success', title: 'Copied!', message: 'API Key copied to clipboard', autoDismiss: true })
                            }}
                            className="px-3 py-2 rounded text-xs"
                            style={{ background: '#1a1a2e', border: '1px solid #2d2d4e', color: '#ffffff' }}
                          >
                            Copy
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs mt-4 leading-relaxed" style={{ color: '#444466' }}>
                      1. Nyalakan ESP32 → connect ke WiFi "SmokeSentry-Setup"<br/>
                      2. Buka browser → 192.168.4.1<br/>
                      3. Isi SSID, Password WiFi, Device Code, dan API Key di atas<br/>
                      4. Klik Save → tunggu buzzer bunyi 3x ✅
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#1E1E2E]">
                    <Button
                      type="button"
                      variant="danger"
                      size="md"
                      onClick={handleDeleteDevice}
                      disabled={loading}
                      className="w-full"
                    >
                      Hapus Device
                    </Button>
                  </div>
                </div>
              )}

              {/* Tab 2: Threshold Sensor */}
              {settingsTab === 'threshold' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      MQ-2 Threshold (Asap/LPG): {settingsFormData.mq2_threshold}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="4095"
                      value={settingsFormData.mq2_threshold}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, mq2_threshold: parseInt(e.target.value) })}
                      className="w-full accent-[#E8FF47]"
                    />
                    <p className="text-xs text-text-muted mt-1">Nilai lebih rendah = lebih sensitif</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      MQ-135 Threshold (VOC/Vape): {settingsFormData.mq135_threshold}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="4095"
                      value={settingsFormData.mq135_threshold}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, mq135_threshold: parseInt(e.target.value) })}
                      className="w-full accent-[#E8FF47]"
                    />
                    <p className="text-xs text-text-muted mt-1">Nilai lebih rendah = lebih sensitif</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Flame Threshold (Sensor Api): {settingsFormData.flame_threshold}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1023"
                      value={settingsFormData.flame_threshold}
                      onChange={(e) => setSettingsFormData({ ...settingsFormData, flame_threshold: parseInt(e.target.value) })}
                      className="w-full accent-[#E8FF47]"
                    />
                    <p className="text-xs text-text-muted mt-1">Nilai lebih rendah = lebih sensitif</p>
                  </div>
                </div>
              )}

              {/* Tab 3: Notifikasi */}
              {settingsTab === 'notifications' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="telegram_enabled"
                      checked={true}
                      disabled
                      className="w-4 h-4 accent-[#E8FF47]"
                    />
                    <label htmlFor="telegram_enabled" className="text-sm">
                      Notifikasi Telegram aktif
                    </label>
                  </div>

                  {/* ── Info Bot Telegram SmokeSentry ── */}
                  <div style={{
                    background: '#0a0a14',
                    border: '1px solid #1e1e2e',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <p style={{
                      fontSize: '11px', color: '#C8E000', fontWeight: 600,
                      letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '10px'
                    }}>
                      🤖 Bot Telegram smoke sentry
                    </p>
                    <p style={{ fontSize: '13px', color: '#888899', lineHeight: 1.7, marginBottom: '10px' }}>
                      Notifikasi dikirim otomatis oleh{' '}
                      <a href="https://t.me/smokeSentrybot" target="_blank" rel="noopener noreferrer"
                        style={{ color: '#C8E000', textDecoration: 'none', fontWeight: 600 }}>
                        @smokeSentrybot
                      </a>
                      {' '}ke Chat ID yang kamu daftarkan.
                    </p>
                    <ol style={{ paddingLeft: '1.1rem', color: '#888899', fontSize: '13px', lineHeight: 1.9 }}>
                      <li>Buka Telegram → cari <a href="https://t.me/smokeSentrybot" target="_blank"
                        rel="noopener noreferrer" style={{ color: '#C8E000', textDecoration: 'none', fontWeight: 600 }}>
                        @smokeSentrybot</a></li>
                      <li>Kirim perintah <code style={{ background:'#1a1a2e', padding:'1px 7px',
                        borderRadius:'4px', color:'#fff' }}>/start</code></li>
                      <li>Bot akan balas & mendaftarkan Chat ID kamu otomatis</li>
                      <li>Atau isi Chat ID manual di field di bawah ini</li>
                    </ol>
                    <a href="https://t.me/smokeSentrybot" target="_blank" rel="noopener noreferrer"
                      style={{
                        display:'block', textAlign:'center', marginTop:'12px',
                        background:'#C8E000', color:'#080810', borderRadius:'8px',
                        padding:'9px', fontSize:'13px', fontWeight:700, textDecoration:'none'
                      }}>
                      Buka @smokeSentrybot di Telegram
                    </a>
                  </div>

                  {/* ── Field Telegram Chat ID ── */}
                  <label style={{ fontSize: '11px', color: '#666688', letterSpacing: '0.8px', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                    Telegram Chat ID
                  </label>
                  <input
                    type="text"
                    value={settingsFormData.telegramchatid}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, telegramchatid: e.target.value })}
                    autoComplete="off"
                    className="w-full px-4 py-2 bg-black border border-[#E8FF47] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8FF47]"
                    placeholder="Contoh: 123456789"
                  />
                  <p style={{ fontSize: '11px', color: '#444466', marginTop: '4px', marginBottom: '8px' }}>
                    Chat ID untuk kirim notifikasi Telegram ke device ini
                  </p>
                  
                  {/* ── Panduan Singkat Chat ID ── */}
                  <div style={{
                    background: '#0a0a14',
                    border: '1px solid #1e1e2e',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    marginBottom: '1rem'
                  }}>
                    <p style={{ fontSize: '11px', color: '#E8FF47', fontWeight: 600, marginBottom: '6px' }}>
                      Cara dapat Chat ID kamu:
                    </p>
                    <ul style={{ paddingLeft: '1rem', color: '#888899', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
                      <li>Buka Telegram → cari <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" style={{ color: '#E8FF47', textDecoration: 'none', fontWeight: 600 }}>@userinfobot</a></li>
                      <li>Kirim sembarang pesan (misalnya: hi)</li>
                      <li>Bot akan balas dengan info akunmu, salin angka di baris Id:</li>
                    </ul>
                  </div>

                  {/* ── Panduan Chat ID ── */}
                  <div style={{
                    background: '#0a0a14',
                    border: '1px solid #1e1e2e',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    marginTop: '12px',
                    marginBottom: '1rem'
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
                      <li>Paste angka tersebut ke field <b style={{ color: '#ffffff' }}>Telegram Chat ID</b> di atas</li>
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

                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={async () => {
                      const res = await fetch('/api/test-notification', { method: 'POST' });
                      const data = await res.json();
                      if (data.success) {
                        showToast({
                          type: 'info',
                          title: 'Test Dikirim',
                          message: 'Pesan test dikirim ke Telegram.',
                          autoDismiss: true,
                        });
                      }
                    }}
                    className="w-full"
                  >
                    Test Kirim Notifikasi
                  </Button>
                </div>
              )}

              {/* Tab 4: Grafik Sensor */}
              {settingsTab === 'chart' && (
                <div className="space-y-4">
                  <SensorChart deviceId={selectedDevice.id} />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-[#1E1E2E]">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteDevice}
        deviceName={selectedDevice?.name || ''}
      />
    </div>
  );
}
