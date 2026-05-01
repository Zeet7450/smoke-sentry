'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip,
         ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { useEffect, useState, useCallback } from 'react'

export function SensorChart({ deviceId, initialData }: { deviceId: string; initialData?: any[] }) {
  const mapToChartFormat = (data: any[]) =>
    data.map((d) => {
      // Handle semua kemungkinan format: Date object, string ISO, timestamp number
      let dateObj: Date
      if (d.created_at instanceof Date) {
        dateObj = d.created_at
      } else if (typeof d.created_at === 'string' || typeof d.created_at === 'number') {
        dateObj = new Date(d.created_at)
      } else {
        dateObj = new Date()
      }

      const isValid = !isNaN(dateObj.getTime())

      return {
        time: isValid
          ? dateObj.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })
          : '--:--:--',
        mq2:   Number(d.mq2)   || 0,
        mq135: Number(d.mq135) || 0,
        flame: Number(d.flame) || 0,
      }
    })

  const [chartData, setChartData] = useState(() => {
    if (!initialData || initialData.length === 0) return []
    return mapToChartFormat(initialData)
  });
  const [loading, setLoading] = useState(false);

  const fetchReadings = useCallback(async () => {
    try {
      const res = await fetch(`/api/devices/${deviceId}/readings`)
      if (!res.ok) return;
      const json = await res.json();

      if (json && json.length > 0) {
        const mapped = mapToChartFormat(json);
        setChartData(mapped);
      }
    } catch (err) {
      console.error('Chart refresh error:', err);
    }
  }, [deviceId]);

  useEffect(() => {
    if (!deviceId) return;
    
    // Start auto-refresh after 5 seconds (not immediately)
    // because initialData is already provided
    const interval = setInterval(fetchReadings, 5000);
    return () => clearInterval(interval);
  }, [deviceId, fetchReadings]);

  const chartHeight = typeof window !== 'undefined' && window.innerWidth < 768 ? 250 : 350

  if (loading && chartData.length === 0) {
    return (
      <div style={{ background: '#0f0f1a', borderRadius: '14px',
                    border: '1px solid #1e1e2e', padding: '20px', height: chartHeight,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888899', fontSize: '13px' }}>Memuat data sensor...</p>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div style={{ background: '#0f0f1a', borderRadius: '14px',
                    border: '1px solid #1e1e2e', padding: '20px', height: chartHeight,
                    display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888899', fontSize: '13px' }}>
          Belum ada data sensor. Device akan mulai mengirim data setelah terhubung ke WiFi.
        </p>
      </div>
    )
  }

  return (
    <div style={{ background: '#0f0f1a', borderRadius: '14px',
                  border: '1px solid #1e1e2e', padding: '20px' }}>
      {/* Range selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['1h','6h','24h','7d'].map(r => (
          <button key={r} onClick={() => {}} style={{
            padding: '4px 12px', borderRadius: '8px', fontSize: '12px',
            fontWeight: 600, cursor: 'pointer',
            background: '#C8E000',
            color: '#080810',
            border: 'none',
          }}>
            {r}
          </button>
        ))}
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <div style={{ minWidth: '500px' }}>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a28" />
              <XAxis
                dataKey="time"
                tick={{ fill: '#888899', fontSize: 10 }}
                interval={Math.floor(chartData.length / 8)}
                angle={-30}
                textAnchor="end"
                height={45}
              />
              <YAxis
                domain={[0, 'auto']}
                tick={{ fill: '#888899', fontSize: 11 }}
                width={45}
              />
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${value ?? 0} ppm`, name
                ]}
                contentStyle={{
                  background: '#0f0f1a',
                  border: '1px solid #1e1e2e',
                  borderRadius: '8px',
                  color: '#d0d0e0',
                  fontSize: 12
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: '#888899' }} />
              <Line type="monotone" dataKey="mq2" stroke="#C8E000"
                    strokeWidth={2} dot={false} name="MQ2" />
              <Line type="monotone" dataKey="mq135" stroke="#6daa45"
                    strokeWidth={2} dot={false} name="MQ135" />
              <Line type="monotone" dataKey="flame" stroke="#dd6974"
                    strokeWidth={2} dot={false} name="Flame" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
