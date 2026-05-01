'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SensorChart } from '@/components/SensorChart';

export default function DeviceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  const fetchDevice = useCallback(async () => {
    try {
      const res = await fetch(`/api/devices/${params.id}`);
      if (!res.ok) throw new Error('Failed to fetch device');
      const json = await res.json();
      setDevice(json.data);
    } catch (error) {
      console.error('Error fetching device:', error);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const fetchReadings = useCallback(async () => {
    try {
      const res = await fetch(`/api/devices/${params.id}/readings`);
      if (!res.ok) throw new Error('Failed to fetch readings');
      const json = await res.json();

      const mapped = json.map((d: any) => ({
        time: new Date(d.created_at).toLocaleTimeString('id-ID', {
          hour: '2-digit', minute: '2-digit', second: '2-digit'
        }),
        mq2: d.mq2 ?? 0,
        mq135: d.mq135 ?? 0,
        flame: d.flame ?? 0,
      }));

      setChartData(mapped);
    } catch (error) {
      console.error('Error fetching readings:', error);
    }
  }, [params.id]);

  useEffect(() => {
    fetchDevice();
    fetchReadings();
    const interval = setInterval(fetchReadings, 5000);
    return () => clearInterval(interval);
  }, [fetchDevice, fetchReadings]);

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <p style={{ color: '#888899' }}>Memuat data device...</p>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="p-6 md:p-8">
        <p style={{ color: '#888899' }}>Device tidak ditemukan</p>
      </div>
    );
  }

  const isOnline = device.last_seen 
    ? (Date.now() - new Date(device.last_seen).getTime()) < 60_000 
    : false;

  const tableData = [...chartData].reverse().slice(0, 10);

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <Button
          variant="outline"
          size="md"
          onClick={() => router.push('/dashboard/devices')}
          className="mb-4"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          ← Kembali
        </Button>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{device.name}</h1>
            <p style={{ color: '#888899', fontSize: '14px' }}>
              Device Code: <span style={{ fontFamily: 'monospace', color: '#E8FF47' }}>{device.device_code}</span>
            </p>
          </div>
          <span
            style={{
              background: isOnline ? '#C8E000' : '#ff4444',
              color: isOnline ? '#080810' : '#ffffff',
              padding: '6px 16px',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: '9999px',
              display: 'inline-block',
            }}
          >
            {isOnline ? '● Online' : '● Offline'}
          </span>
        </div>
      </div>

      {/* Device Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card glow="none" className="p-4">
          <p style={{ color: '#666688', fontSize: '12px', marginBottom: '8px' }}>MQ2 Terakhir</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#C8E000' }}>{device.mq2_last ?? 0}</p>
        </Card>
        <Card glow="none" className="p-4">
          <p style={{ color: '#666688', fontSize: '12px', marginBottom: '8px' }}>MQ135 Terakhir</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#6daa45' }}>{device.mq135_last ?? 0}</p>
        </Card>
        <Card glow="none" className="p-4">
          <p style={{ color: '#666688', fontSize: '12px', marginBottom: '8px' }}>Flame Terakhir</p>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#dd6974' }}>{device.flame_last ?? 0}</p>
        </Card>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Grafik Sensor</h2>
        <SensorChart deviceId={params.id} />
      </div>

      {/* Sensor Readings Table */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Pembacaan Sensor Terbaru</h2>
        <Card glow="none" className="p-4">
          <p style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
            ← Geser untuk melihat semua kolom
          </p>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ minWidth: '500px', width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#666688' }}>Waktu</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#666688' }}>MQ2</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#666688' }}>MQ135</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#666688' }}>Flame</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: '#666688' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#888899', fontSize: '13px' }}>
                      Belum ada data sensor
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #1e1e2e' }}>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#d0d0e0' }}>{row.time}</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#d0d0e0' }}>{row.mq2}</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#d0d0e0' }}>{row.mq135}</td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#d0d0e0' }}>{row.flame}</td>
                      <td style={{ padding: '12px', fontSize: '13px' }}>
                        {row.mq2 > 900 || row.mq135 > 900 || row.flame > 3395 ? (
                          <span style={{ color: '#ff4444', fontWeight: 600 }}>BAHAYA</span>
                        ) : row.mq2 > 680 || row.mq135 > 680 || row.flame > 2595 ? (
                          <span style={{ color: '#ffaa00', fontWeight: 600 }}>WASPADA</span>
                        ) : (
                          <span style={{ color: '#44ff44', fontWeight: 600 }}>AMAN</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Device Settings */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Pengaturan Device</h2>
        <Card glow="none" className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p style={{ color: '#666688', fontSize: '12px', marginBottom: '4px' }}>Lokasi</p>
              <p style={{ fontSize: '14px', color: '#d0d0e0' }}>{device.location || '-'}</p>
            </div>
            <div>
              <p style={{ color: '#666688', fontSize: '12px', marginBottom: '4px' }}>API Key</p>
              <p style={{ fontSize: '14px', fontFamily: 'monospace', color: '#d0d0e0' }}>{device.apikey || '-'}</p>
            </div>
            <div>
              <p style={{ color: '#666688', fontSize: '12px', marginBottom: '4px' }}>Threshold MQ2</p>
              <p style={{ fontSize: '14px', color: '#d0d0e0' }}>{device.mq2_threshold ?? 400}</p>
            </div>
            <div>
              <p style={{ color: '#666688', fontSize: '12px', marginBottom: '4px' }}>Threshold MQ135</p>
              <p style={{ fontSize: '14px', color: '#d0d0e0' }}>{device.mq135_threshold ?? 300}</p>
            </div>
            <div>
              <p style={{ color: '#666688', fontSize: '12px', marginBottom: '4px' }}>Threshold Flame</p>
              <p style={{ fontSize: '14px', color: '#d0d0e0' }}>{device.flame_threshold ?? 500}</p>
            </div>
            <div>
              <p style={{ color: '#666688', fontSize: '12px', marginBottom: '4px' }}>Telegram Chat ID</p>
              <p style={{ fontSize: '14px', color: '#d0d0e0' }}>{device.telegramchatid || '-'}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
