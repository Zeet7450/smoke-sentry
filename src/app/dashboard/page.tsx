'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Device {
  id: string;
  name: string;
  device_code: string;
  location: string;
  status: 'online' | 'offline' | 'warning' | 'alert';
  last_seen_at: string;
}

interface SensorReading {
  id: string;
  device_id: string;
  mq2_value: number;
  mq135_value: number;
  flame_value: number;
  flame_detected: boolean;
  is_alert: boolean;
  recorded_at: string;
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
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchSensorData(selectedDevice.id);
    }
  }, [selectedDevice]);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      if (data.success) {
        setDevices(data.data);
        if (data.data.length > 0) {
          setSelectedDevice(data.data[0]);
        }
        setStats({
          totalDevices: data.data.length,
          onlineDevices: data.data.filter((d: Device) => d.status === 'online').length,
          alertToday: 0, // Would fetch from alerts API
          normalSensors: data.data.filter((d: Device) => d.status === 'online').length,
        });
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSensorData = async (deviceId: string) => {
    try {
      const res = await fetch(`/api/devices/${deviceId}/readings?hours=24`);
      const data = await res.json();
      if (data.success) {
        setSensorData(data.data);
      } else {
        setSensorData(data); // Try using data directly if not wrapped
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  };

  const chartData = {
    labels: sensorData.slice(0, 50).reverse().map((d) => new Date(d.recorded_at).toLocaleTimeString()),
    datasets: [
      {
        label: 'MQ-2 (Gas)',
        data: sensorData.slice(0, 50).reverse().map((d) => d.mq2_value || 0),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'MQ-135 (Vape)',
        data: sensorData.slice(0, 50).reverse().map((d) => d.mq135_value || 0),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Flame',
        data: sensorData.slice(0, 50).reverse().map((d) => d.flame_value || 0),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#F0F0F0',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#6B6B7A',
        },
        grid: {
          color: '#1E1E2E',
        },
      },
      y: {
        ticks: {
          color: '#6B6B7A',
        },
        grid: {
          color: '#1E1E2E',
        },
      },
    },
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
                  onClick={() => setSelectedDevice(device)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    selectedDevice?.id === device.id
                      ? 'border-[#E8FF47] bg-[#E8FF47]/10'
                      : 'border-[#1E1E2E] hover:border-[#E8FF47]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        device.status === 'online' ? 'bg-green-500' : 'bg-red-500'
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
              <Badge variant={selectedDevice.status === 'online' ? 'safe' : 'danger'}>
                {selectedDevice.status.toUpperCase()}
              </Badge>
            </div>
            {sensorData.length > 0 ? (
              <div className="h-80">
                <Line data={chartData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center">
                <p className="text-text-muted">Belum ada data sensor</p>
              </div>
            )}
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
                    <th className="text-left py-3 px-4 text-text-muted text-sm">MQ-2</th>
                    <th className="text-left py-3 px-4 text-text-muted text-sm">MQ-135</th>
                    <th className="text-left py-3 px-4 text-text-muted text-sm">Flame</th>
                    <th className="text-left py-3 px-4 text-text-muted text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sensorData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-text-muted">
                        Belum ada data sensor
                      </td>
                    </tr>
                  ) : (
                    sensorData.slice(0, 10).map((reading) => (
                      <tr key={reading.id} className="border-b border-border">
                        <td className="py-3 px-4 text-sm">
                          {new Date(reading.recorded_at).toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-sm">{reading.mq2_value || '-'}</td>
                        <td className="py-3 px-4 text-sm">{reading.mq135_value || '-'}</td>
                        <td className="py-3 px-4 text-sm">{reading.flame_value || '-'}</td>
                        <td className="py-3 px-4">
                          <Badge variant={reading.is_alert ? 'danger' : 'safe'}>
                            {reading.is_alert ? 'ALERT' : 'NORMAL'}
                          </Badge>
                        </td>
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
