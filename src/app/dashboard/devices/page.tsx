'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function DevicesPage() {
  // Placeholder data - in production, this would come from the database
  const devices = [
    {
      id: 1,
      product_id: 'DEMO001',
      nama_lokasi: 'Rumah',
      is_online: true,
      last_seen: new Date().toISOString(),
    },
  ];

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Devices</h1>
          <p className="text-text-muted">Kelola perangkat SmokeSentry kamu</p>
        </div>
        <Button variant="primary" size="md">
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
                  <h3 className="text-xl font-bold mb-2">{device.nama_lokasi}</h3>
                  <p className="text-text-muted text-sm mb-4">
                    Product ID: {device.product_id}
                  </p>
                  <Badge variant={device.is_online ? 'safe' : 'danger'}>
                    {device.is_online ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm">
                    Bagikan Akses
                  </Button>
                  <Button variant="outline" size="sm">
                    Settings
                  </Button>
                </div>
              </div>
              <p className="text-text-muted text-sm mt-4">
                Terakhir dilihat: {new Date(device.last_seen).toLocaleString('id-ID')}
              </p>
            </Card>
          ))
        )}
      </div>

      <Card glow="none" className="mt-8">
        <h3 className="font-bold text-lg mb-4">Cara Menambah Device Baru</h3>
        <ol className="list-decimal list-inside space-y-2 text-text-muted">
          <li>Pasang SmokeSentry di lokasi yang diinginkan</li>
          <li>Nyalakan device dan hubungkan ke WiFi</li>
          <li>Buka Telegram dan chat @SmokeSentryBot</li>
          <li>Kirim perintah: /aktivasi [PRODUCT_ID]</li>
          <li>Device akan muncul di dashboard ini</li>
        </ol>
      </Card>
    </div>
  );
}
