'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { SensorChart } from '@/components/SensorChart';

interface Device {
  id: string;
  name: string;
  device_code: string;
  location: string;
  isOnline: boolean;
  last_seen: string;
}

interface DashboardStats {
  totalDevices: number;
  onlineDevices: number;
  alertToday: number;
  normalSensors: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [devices, setDevices] = useState<Device[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalDevices: 0,
    onlineDevices: 0,
    alertToday: 0,
    normalSensors: 0,
  });
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedDeviceReadings, setSelectedDeviceReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      if (data.success && data.data) {
        setDevices(data.data);
        if (data.data.length > 0) {
          setSelectedDevice(data.data[0]);
          fetchDeviceReadings(data.data[0].id);
        }
        setStats({
          totalDevices: data.data.length,
          onlineDevices: data.data.filter((d: Device) => d.isOnline).length,
          alertToday: 0,
          normalSensors: data.data.filter((d: Device) => d.isOnline).length,
        });
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeviceReadings = async (deviceId: string) => {
    try {
      const res = await fetch(`/api/devices/${deviceId}/readings`);
      if (!res.ok) {
        setSelectedDeviceReadings([]);
        return;
      }
      const data = await res.json();
      setSelectedDeviceReadings(Array.isArray(data) ? data : []);
    } catch (error) {
      setSelectedDeviceReadings([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">
          Halo, {session?.user?.name || 'User'}! 👋
        </h1>
        <p className="text-text-muted">Selamat datang di dashboard SmokeSentry</p>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <Card glow="none">
          <div>
            <p className="text-text-muted text-sm mb-1">Total Devices</p>
            <p className="text-3xl font-bold">{stats.totalDevices}</p>
          </div>
        </Card>

        <Card glow="none">
          <div>
            <p className="text-text-muted text-sm mb-1">Online</p>
            <p className="text-3xl font-bold" style={{ color: '#E8FF47' }}>{stats.onlineDevices}</p>
          </div>
        </Card>

        <Card glow={stats.alertToday > 0 ? 'danger' : 'none'}>
          <div>
            <p className="text-text-muted text-sm mb-1">Alerts Today</p>
            <p className="text-3xl font-bold">{stats.alertToday}</p>
          </div>
        </Card>

        <Card glow="none">
          <div>
            <p className="text-text-muted text-sm mb-1">Normal Sensors</p>
            <p className="text-3xl font-bold" style={{ color: '#4ADE80' }}>{stats.normalSensors}</p>
          </div>
        </Card>
      </motion.div>

      {/* Device Selector */}
      {devices.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-8"
        >
          <Card glow="none">
            <h2 className="text-lg font-bold mb-4">Pilih Device</h2>
            <div className="flex flex-wrap gap-3">
              {devices.map((device) => (
                <button
                  key={device.id}
                  onClick={() => {
                    setSelectedDevice(device);
                    fetchDeviceReadings(device.id);
                  }}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedDevice?.id === device.id
                      ? 'border-[#E8FF47] bg-[#E8FF47]/10'
                      : 'border-[#1E1E2E] hover:border-[#E8FF47]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        device.isOnline ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <span className="font-medium">{device.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Chart Section */}
      {selectedDevice && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Grafik Sensor - {selectedDevice.name}</h2>
              <Badge variant={selectedDevice.isOnline ? 'safe' : 'danger'}>
                {selectedDevice.isOnline ? 'ONLINE' : 'OFFLINE'}
              </Badge>
            </div>
            <SensorChart deviceId={selectedDevice.id} initialData={selectedDeviceReadings} />
          </Card>
        </motion.div>
      )}

      {/* Recent Readings */}
      {selectedDevice && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <h2 className="text-xl font-bold mb-4">Pembacaan Sensor Terbaru</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-text-muted text-sm">Waktu</th>
                    <th className="text-left py-3 px-4 text-text-muted text-sm">MQ2</th>
                    <th className="text-left py-3 px-4 text-text-muted text-sm">MQ135</th>
                    <th className="text-left py-3 px-4 text-text-muted text-sm">Flame</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDeviceReadings.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-text-muted">
                        Belum ada data sensor
                      </td>
                    </tr>
                  ) : (
                    selectedDeviceReadings.slice(0, 10).map((reading: any, index: number) => (
                      <tr key={index} className="border-b border-border">
                        <td className="py-3 px-4 text-sm">
                          {reading.created_at ? new Date(reading.created_at).toLocaleString('id-ID') : '-'}
                        </td>
                        <td className="py-3 px-4 text-sm font-bold">{reading.mq2 ?? 0}</td>
                        <td className="py-3 px-4 text-sm font-bold">{reading.mq135 ?? 0}</td>
                        <td className="py-3 px-4 text-sm font-bold">{reading.flame ?? 0}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
