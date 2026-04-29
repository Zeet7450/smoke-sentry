'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
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

interface SensorData {
  mq2: number;
  mq135: number;
  flame: number;
  status: string;
  logged_at: string;
}

interface DeviceStatus {
  current_status: string;
  is_online: boolean;
  last_seen: string;
  nama_lokasi: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // For demo, using a placeholder device_id
        // In production, this would come from user's devices
        const response = await fetch('/api/data?device_id=DEMO001&limit=50');
        const data = await response.json();
        setSensorData(data.sensor_data || []);
        setDeviceStatus(data.device_status);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Poll every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: sensorData.map((d) => new Date(d.logged_at).toLocaleTimeString()),
    datasets: [
      {
        label: 'MQ-2 (Gas)',
        data: sensorData.map((d) => d.mq2),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'MQ-135 (Vape)',
        data: sensorData.map((d) => d.mq135),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Flame',
        data: sensorData.map((d) => d.flame),
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

      {/* Status Cards */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
      >
        <Card glow="none">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm mb-1">Status Device</p>
              <p className="text-2xl font-bold">
                {deviceStatus?.nama_lokasi || 'Rumah'}
              </p>
            </div>
            <Badge variant={deviceStatus?.is_online ? 'safe' : 'danger'}>
              {deviceStatus?.is_online ? 'Online' : 'Offline'}
            </Badge>
          </div>
          <p className="text-text-muted text-sm mt-4">
            Terakhir dilihat: {deviceStatus?.last_seen ? new Date(deviceStatus.last_seen).toLocaleString('id-ID') : '-'}
          </p>
        </Card>

        <motion.div
          animate={
            deviceStatus?.current_status === 'BAHAYA'
              ? {
                  boxShadow: [
                    '0 0 0px #FF4D4D',
                    '0 0 20px #FF4D4D',
                    '0 0 0px #FF4D4D',
                  ],
                }
              : {}
          }
          transition={
            deviceStatus?.current_status === 'BAHAYA'
              ? { repeat: Infinity, duration: 1.5 }
              : {}
          }
        >
          <Card glow={deviceStatus?.current_status === 'BAHAYA' ? 'danger' : 'none'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm mb-1">Status Terkini</p>
                <p className="text-2xl font-bold">
                  {deviceStatus?.current_status || 'AMAN'}
                </p>
              </div>
              <Badge variant={deviceStatus?.current_status === 'BAHAYA' ? 'danger' : 'safe'}>
                {deviceStatus?.current_status === 'BAHAYA' ? '⚠️ BAHAYA' : '✅ AMAN'}
              </Badge>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Chart Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <Card>
          <h2 className="text-xl font-bold mb-4">Grafik Sensor</h2>
          {deviceStatus?.current_status === 'BAHAYA' && sensorData.length > 0 ? (
            <div className="h-80">
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <Badge variant="safe" className="mb-4">Aman</Badge>
                <p className="text-text-muted">
                  Grafik hanya menampilkan data saat status BAHAYA
                </p>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Alert History */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <h2 className="text-xl font-bold mb-4">Riwayat Kejadian</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-text-muted text-sm">Waktu</th>
                  <th className="text-left py-3 px-4 text-text-muted text-sm">Jenis</th>
                  <th className="text-left py-3 px-4 text-text-muted text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {sensorData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-text-muted">
                      Belum ada data sensor
                    </td>
                  </tr>
                ) : (
                  sensorData.slice(0, 10).map((data, index) => (
                    <tr key={index} className="border-b border-border">
                      <td className="py-3 px-4 text-sm">
                        {new Date(data.logged_at).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={data.status === 'BAHAYA' ? 'danger' : 'safe'}>
                          {data.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-text-muted">
                        {data.status === 'BAHAYA' ? 'Berlangsung' : 'Selesai'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
