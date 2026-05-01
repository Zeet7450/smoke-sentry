'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip,
         ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { useEffect, useState } from 'react'

export function SensorChart({ deviceId }: { deviceId: string }) {
  const [data, setData]   = useState([])
  const [range, setRange] = useState('1h')

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/devices/${deviceId}/logs?range=${range}&limit=100`)
      const json = await res.json()
      
      if (json.logs && Array.isArray(json.logs)) {
        const chartData = json.logs.map((l: any) => ({
          time:  new Date(l.created_at).toLocaleTimeString('id-ID',
                   { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          MQ2:   l.mq2,
          MQ135: l.mq135,
          Flame: l.flame,
        }))
        setData(chartData)
      } else {
        setData([])
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error)
      setData([])
    }
  }

  useEffect(() => { fetchData() }, [deviceId, range])
  useEffect(() => {
    const t = setInterval(fetchData, 10_000)
    return () => clearInterval(t)
  }, [deviceId, range])

  return (
    <div style={{ background: '#0f0f1a', borderRadius: '14px',
                  border: '1px solid #1e1e2e', padding: '20px' }}>
      {/* Range selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['1h','6h','24h','7d'].map(r => (
          <button key={r} onClick={() => setRange(r)} style={{
            padding: '4px 12px', borderRadius: '8px', fontSize: '12px',
            fontWeight: 600, cursor: 'pointer',
            background: range === r ? '#C8E000' : '#1a1a2e',
            color:      range === r ? '#080810' : '#555577',
            border:     range === r ? 'none' : '1px solid #2a2a3d',
          }}>
            {r}
          </button>
        ))}
      </div>

      {data.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#444466',
                      padding: '40px', fontSize: '13px' }}>
          Belum ada data sensor untuk rentang ini
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a28" />
            <XAxis dataKey="time" tick={{ fill: '#555577', fontSize: 11 }} />
            <YAxis tick={{ fill: '#555577', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#0f0f1a', border: '1px solid #1e1e2e',
                              borderRadius: '8px', color: '#d0d0e0', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#888899' }} />
            <Line type="monotone" dataKey="MQ2"   stroke="#C8E000"
                  strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="MQ135" stroke="#6daa45"
                  strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Flame" stroke="#dd6974"
                  strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
