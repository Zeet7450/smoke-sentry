'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const sensors = [
  {
    id: 'mq2',
    tag: 'MQ-2',
    color: '#4D9EFF',
    title: 'Deteksi Asap & Gas LPG',
    desc: 'Sensor sensitif untuk mendeteksi asap rokok, gas LPG, dan hidrogen. Cocok untuk dapur dan ruang tertutup.',
    specs: ['Range: 300–10.000 ppm', 'Voltage: 5V DC', 'Response Time: < 2s'],
    illustration: (
      <svg viewBox="0 0 300 260" className="w-full h-full">
        {/* PCB base */}
        <rect x="60" y="80" width="180" height="120" rx="8" fill="#1A2A1A" stroke="#4D9EFF" strokeWidth="1.5" />
        {/* Sensor dome - MQ-2 khas berbentuk silinder metal */}
        <ellipse cx="150" cy="100" rx="35" ry="10" fill="#888" stroke="#AAA" strokeWidth="1" />
        <rect x="115" y="100" width="70" height="45" rx="4" fill="#999" stroke="#BBB" strokeWidth="1" />
        <ellipse cx="150" cy="145" rx="35" ry="10" fill="#888" stroke="#AAA" strokeWidth="1" />
        {/* Heating coil visible */}
        <ellipse cx="150" cy="120" rx="18" ry="18" fill="#B8860B" opacity="0.6" />
        <circle cx="150" cy="120" r="10" fill="#FF6B00" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite" />
        </circle>
        {/* Sensor pins */}
        {[125, 135, 145, 155, 165, 175].map((x, i) => (
          <rect key={i} x={x} y="200" width="4" height="20" rx="1" fill="#CCC" />
        ))}
        {/* Gas particles melayang */}
        {[
          { cx: 120, cy: 55, r: 6, delay: '0s' },
          { cx: 150, cy: 40, r: 8, delay: '0.5s' },
          { cx: 180, cy: 50, r: 5, delay: '1s' },
          { cx: 135, cy: 30, r: 4, delay: '0.3s' },
          { cx: 165, cy: 35, r: 7, delay: '0.8s' },
        ].map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#4D9EFF" opacity="0.4">
            <animate attributeName="cy" values={`${p.cy};${p.cy - 20};${p.cy}`} dur="2s" begin={p.delay} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" begin={p.delay} repeatCount="indefinite" />
          </circle>
        ))}
        {/* Label */}
        <text x="150" y="242" textAnchor="middle" fill="#4D9EFF" fontSize="12" fontWeight="bold">
          MQ-2 Gas Sensor
        </text>
      </svg>
    ),
  },
  {
    id: 'mq135',
    tag: 'MQ-135',
    color: '#A855F7',
    title: 'Deteksi Vape, Rokok, VOC',
    desc: 'Sensor kualitas udara yang mendeteksi amonia, benzena, asap rokok, dan VOC berbahaya di udara.',
    specs: ['Range: 10–1000 ppm', 'Voltage: 5V DC', 'Gas: NH3, NOx, CO2'],
    illustration: (
      <svg viewBox="0 0 300 260" className="w-full h-full">
        {/* PCB base — warna ungu untuk MQ-135 */}
        <rect x="60" y="80" width="180" height="120" rx="8" fill="#1A0A2E" stroke="#A855F7" strokeWidth="1.5" />
        {/* Sensor dome */}
        <ellipse cx="150" cy="100" rx="35" ry="10" fill="#666" stroke="#999" strokeWidth="1" />
        <rect x="115" y="100" width="70" height="45" rx="4" fill="#777" stroke="#999" strokeWidth="1" />
        <ellipse cx="150" cy="145" rx="35" ry="10" fill="#666" stroke="#999" strokeWidth="1" />
        {/* Inner heating */}
        <ellipse cx="150" cy="120" rx="18" ry="18" fill="#6B21A8" opacity="0.7" />
        <circle cx="150" cy="120" r="10" fill="#A855F7" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1.8s" repeatCount="indefinite" />
        </circle>
        {/* Pins */}
        {[125, 135, 145, 155, 165, 175].map((x, i) => (
          <rect key={i} x={x} y="200" width="4" height="20" rx="1" fill="#CCC" />
        ))}
        {/* Vape/smoke particles — ungu */}
        {[
          { cx: 115, cy: 60, r: 9, delay: '0s' },
          { cx: 145, cy: 42, r: 11, delay: '0.6s' },
          { cx: 175, cy: 55, r: 7, delay: '1.2s' },
          { cx: 130, cy: 28, r: 5, delay: '0.4s' },
          { cx: 160, cy: 32, r: 8, delay: '0.9s' },
          { cx: 185, cy: 40, r: 6, delay: '0.2s' },
        ].map((p, i) => (
          <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="#A855F7" opacity="0.35">
            <animate attributeName="cy" values={`${p.cy};${p.cy - 25};${p.cy}`} dur="2.5s" begin={p.delay} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.35;0;0.35" dur="2.5s" begin={p.delay} repeatCount="indefinite" />
          </circle>
        ))}
        <text x="150" y="242" textAnchor="middle" fill="#A855F7" fontSize="12" fontWeight="bold">
          MQ-135 Air Quality Sensor
        </text>
      </svg>
    ),
  },
  {
    id: 'flame',
    tag: 'Flame',
    color: '#FF4D4D',
    title: 'Deteksi Api Langsung',
    desc: 'Sensor infrared yang mendeteksi nyala api secara langsung dalam radius 1 meter. Respons instan.',
    specs: ['Wavelength: 760–1100nm', 'Angle: 60°', 'Response: < 0.5s'],
    illustration: (
      <svg viewBox="0 0 300 260" className="w-full h-full">
        {/* PCB base — merah */}
        <rect x="60" y="100" width="180" height="100" rx="8" fill="#2A0A0A" stroke="#FF4D4D" strokeWidth="1.5" />
        {/* IR receiver dome */}
        <ellipse cx="150" cy="100" rx="20" ry="10" fill="#1A1A1A" stroke="#FF4D4D" strokeWidth="1.5" />
        <rect x="130" y="100" width="40" height="30" rx="3" fill="#1A1A1A" stroke="#FF4D4D" strokeWidth="1.5" />
        {/* IR lens detail */}
        <ellipse cx="150" cy="115" rx="12" ry="12" fill="#0D0D0D" />
        <ellipse cx="150" cy="115" rx="6" ry="6" fill="#FF4D4D" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.3;0.8" dur="1s" repeatCount="indefinite" />
        </ellipse>
        {/* Pins */}
        {[135, 150, 165].map((x, i) => (
          <rect key={i} x={x} y="200" width="4" height="20" rx="1" fill="#CCC" />
        ))}
        {/* Api / Flame ilustrasi */}
        <path
          d="M150 75 C145 65 138 55 142 42 C138 48 132 50 133 60 C128 52 130 40 136 32 C130 38 122 45 124 58 C118 48 122 35 130 25 C122 30 114 42 116 58 C112 45 118 28 128 18 C116 26 108 42 112 60 C108 50 112 32 122 20 C108 32 102 52 108 68 C104 58 106 44 116 34 C106 44 102 62 110 76 C108 70 150 88 150 75Z"
          fill="#FF4D4D"
          opacity="0.9"
        >
          <animate
            attributeName="d"
            values="M150 75 C145 65 135 50 142 38 C138 48 130 52 133 60 C150 88 150 75 150 75Z;M150 72 C148 60 138 48 144 35 C140 46 132 50 135 58 C150 85 150 72 150 72Z;M150 75 C145 65 135 50 142 38 C138 48 130 52 133 60 C150 88 150 75 150 75Z"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </path>
        <path d="M150 72 C147 62 141 54 144 44 C142 52 138 54 139 62 C150 80 150 72 150 72Z" fill="#FFD700" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.4;0.7" dur="0.6s" repeatCount="indefinite" />
        </path>
        {/* IR detection line */}
        <line x1="150" y1="110" x2="150" y2="55" stroke="#FF4D4D" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
        <text x="150" y="242" textAnchor="middle" fill="#FF4D4D" fontSize="12" fontWeight="bold">
          Flame IR Sensor
        </text>
      </svg>
    ),
  },
  {
    id: 'buzzer',
    tag: 'Buzzer',
    color: '#E8FF47',
    title: 'Alarm Suara Keras',
    desc: 'Buzzer piezoelektrik aktif yang menghasilkan suara alarm kencang saat bahaya terdeteksi.',
    specs: ['Frequency: 2300 Hz', 'SPL: 85 dB', 'Voltage: 3.3–5V'],
    illustration: (
      <svg viewBox="0 0 300 260" className="w-full h-full">
        {/* PCB base */}
        <rect x="85" y="100" width="130" height="100" rx="8" fill="#1A1A08" stroke="#E8FF47" strokeWidth="1.5" />
        {/* Buzzer body - lingkaran hitam besar */}
        <circle cx="150" cy="130" r="40" fill="#111" stroke="#E8FF47" strokeWidth="2" />
        <circle cx="150" cy="130" r="28" fill="#1A1A00" stroke="#E8FF47" strokeWidth="1" opacity="0.5" />
        <circle cx="150" cy="130" r="8" fill="#E8FF47" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="0.5s" repeatCount="indefinite" />
        </circle>
        {/* Pins */}
        {[140, 160].map((x, i) => (
          <rect key={i} x={x} y="200" width="4" height="20" rx="1" fill="#CCC" />
        ))}
        {/* Sound waves */}
        {[55, 70, 85].map((r, i) => (
          <circle
            key={i}
            cx="150"
            cy="130"
            r={r}
            fill="none"
            stroke="#E8FF47"
            strokeWidth="1.5"
            opacity="0"
          >
            <animate attributeName="r" values={`${r};${r + 30};${r}`} dur="1.5s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.6;0;0.6" dur="1.5s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </circle>
        ))}
        <text x="150" y="242" textAnchor="middle" fill="#E8FF47" fontSize="12" fontWeight="bold">
          Piezo Buzzer
        </text>
      </svg>
    ),
  },
  {
    id: 'esp32',
    tag: 'ESP32',
    color: '#4DFFB8',
    title: 'Otak SmokeSentry',
    desc: 'Microcontroller ESP32 memproses data dari semua sensor dan mengirim notifikasi Telegram via WiFi.',
    specs: ['CPU: Dual-core 240MHz', 'WiFi: 802.11 b/g/n', 'Flash: 4MB'],
    illustration: (
      <svg viewBox="0 0 300 260" className="w-full h-full">
        {/* PCB base ESP32 — panjang */}
        <rect x="75" y="80" width="150" height="130" rx="6" fill="#0A1A10" stroke="#4DFFB8" strokeWidth="1.5" />
        {/* Chip utama ESP32 */}
        <rect x="100" y="100" width="100" height="70" rx="4" fill="#1A2A1A" stroke="#4DFFB8" strokeWidth="1" />
        <text x="150" y="132" textAnchor="middle" fill="#4DFFB8" fontSize="10" fontWeight="bold">
          ESP32
        </text>
        <text x="150" y="146" textAnchor="middle" fill="#4DFFB8" fontSize="7" opacity="0.7">
          WROOM-32
        </text>
        {/* WiFi indicator */}
        <text x="150" y="160" textAnchor="middle" fill="#4DFFB8" fontSize="9" opacity="0.8">
          WiFi ◉
        </text>
        {/* Pin rows kiri */}
        {[90, 100, 110, 120, 130, 140, 150, 160, 170, 180].map((y, i) => (
          <rect key={`l${i}`} x="60" y={y} width="15" height="3" rx="1" fill="#4DFFB8" opacity="0.5" />
        ))}
        {/* Pin rows kanan */}
        {[90, 100, 110, 120, 130, 140, 150, 160, 170, 180].map((y, i) => (
          <rect key={`r${i}`} x="225" y={y} width="15" height="3" rx="1" fill="#4DFFB8" opacity="0.5" />
        ))}
        {/* LED indicator berkedip */}
        <circle cx="188" cy="95" r="5" fill="#4DFFB8">
          <animate attributeName="opacity" values="1;0.1;1" dur="1s" repeatCount="indefinite" />
        </circle>
        {/* WiFi signal */}
        {[12, 20, 28].map((r, i) => (
          <path
            key={i}
            d={`M150 55 A${r} ${r} 0 0 1 ${150 + r} 55`}
            fill="none"
            stroke="#4DFFB8"
            strokeWidth="2"
            opacity={0.8 - i * 0.2}
            transform={`rotate(-90, 150, 55)`}
          >
            <animate
              attributeName="opacity"
              values={`${0.8 - i * 0.2};0.2;${0.8 - i * 0.2}`}
              dur="2s"
              begin={`${i * 0.3}s`}
              repeatCount="indefinite"
            />
          </path>
        ))}
        <text x="150" y="242" textAnchor="middle" fill="#4DFFB8" fontSize="12" fontWeight="bold">
          ESP32 Microcontroller
        </text>
      </svg>
    ),
  },
];

export default function SensorShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const next = useCallback(() => {
    setActiveIdx((prev) => (prev + 1) % sensors.length);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const id = setInterval(next, 3000);
    return () => clearInterval(id);
  }, [isHovered, next]);

  const active = sensors[activeIdx];

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* KIRI: Visual ilustrasi sensor aktif */}
      <div className="relative w-full h-[420px] rounded-2xl overflow-hidden border border-[#1E1E2E] bg-[#0A0A10] flex items-center justify-center p-8">
        {/* Background glow sesuai warna sensor */}
        <div
          className="absolute inset-0 opacity-10 transition-colors duration-700"
          style={{
            background: `radial-gradient(circle at center, ${active.color}, transparent 70%)`,
          }}
        />

        {/* Ilustrasi dengan AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full h-full relative z-10"
          >
            {active.illustration}
          </motion.div>
        </AnimatePresence>

        {/* Auto-slide progress bar di bawah */}
        {!isHovered && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E1E2E]">
            <motion.div
              key={activeIdx}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'linear' }}
              className="h-full"
              style={{ backgroundColor: active.color }}
            />
          </div>
        )}
      </div>

      {/* KANAN: Sensor list yang bisa diklik */}
      <div className="flex flex-col gap-2.5">
        {/* Specs aktif di atas list */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id + '-specs'}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-2 flex-wrap mb-2"
          >
            {active.specs.map((spec) => (
              <span
                key={spec}
                className="text-[10px] px-2.5 py-1 rounded-full border font-mono"
                style={{
                  color: active.color,
                  borderColor: active.color + '40',
                  backgroundColor: active.color + '10',
                }}
              >
                {spec}
              </span>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* List sensor */}
        {sensors.map((sensor, i) => (
          <motion.button
            key={sensor.id}
            onClick={() => setActiveIdx(i)}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={[
              'flex items-center gap-4 p-4 rounded-xl',
              'border text-left transition-all duration-200',
              'cursor-pointer w-full',
              activeIdx === i ? 'bg-[#0F0F17]' : 'border-[#1E1E2E] bg-[#0A0A10] hover:border-[#2E2E3E]',
            ].join(' ')}
            style={
              activeIdx === i
                ? {
                    borderColor: sensor.color + '60',
                    backgroundColor: sensor.color + '08',
                  }
                : {}
            }
          >
            {/* Badge tag */}
            <span
              className="text-[11px] font-bold px-2.5 py-1 rounded-md shrink-0 min-w-[56px] text-center transition-all duration-200"
              style={{
                backgroundColor: sensor.color + (activeIdx === i ? '25' : '15'),
                color: sensor.color,
                border: `1px solid ${sensor.color}${activeIdx === i ? '60' : '30'}`,
              }}
            >
              {sensor.tag}
            </span>

            {/* Teks */}
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-semibold leading-tight transition-colors duration-200 ${
                  activeIdx === i ? 'text-white' : 'text-[#9999AA]'
                }`}
              >
                {sensor.title}
              </p>
              <AnimatePresence>
                {activeIdx === i && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs text-[#6B6B7A] mt-1 leading-relaxed overflow-hidden"
                  >
                    {sensor.desc}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Active indicator */}
            {activeIdx === i && (
              <motion.div layoutId="activeIndicator" className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sensor.color }} />
            )}
          </motion.button>
        ))}

        {/* Hint teks */}
        <p className="text-[10px] text-[#3A3A4A] text-center mt-1">
          Klik sensor untuk melihat detail · Auto-slide tiap 3 detik
        </p>
      </div>
    </div>
  );
}
