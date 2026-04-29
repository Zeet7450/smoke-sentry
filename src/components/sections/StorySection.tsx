'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

const scenes = [
  {
    label: 'Masalah Nyata',
    title: 'Asap Rokok & Vape di Sekolah',
    body: `Setiap hari, siswa terpapar asap rokok dan vape di toilet sekolah. Pelanggaran yang sulit terdeteksi — karena tidak ada yang tahu.`,
    accent: '#FF4D4D',
  },
  {
    label: 'Bahaya Tersembunyi',
    title: 'Gas LPG Bocor di Dapur',
    body: `Kebocoran gas di dapur bisa terjadi kapan saja. Dalam 5 menit tanpa deteksi, situasi bisa berubah menjadi bencana.`,
    accent: '#FF9F4D',
  },
  {
    label: 'Solusi Kami',
    title: 'SmokeSentry Mendeteksi Semuanya',
    body: `Sensor MQ-2, MQ-135, dan Flame bekerja bersama-sama. Saat ancaman terdeteksi, alarm berbunyi dan notifikasi langsung terkirim.`,
    accent: '#E8FF47',
  },
  {
    label: 'Respon Cepat',
    title: 'Notifikasi Langsung ke HP Kamu',
    body: `Dalam hitungan detik, pesan Telegram dikirim ke semua pengguna yang terdaftar. Kemanapun kamu pergi, kamu tetap tahu.`,
    accent: '#4DFFB8',
  },
  {
    label: 'Misi Kami',
    title: 'Because Five Minutes Can Save Everything',
    body: `SmokeSentry lahir dari kepedulian sederhana — bahwa keselamatan seharusnya bisa diakses semua orang, di mana saja, kapan saja.`,
    accent: '#4D9EFF',
  },
];

function SceneText({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="relative h-64">
      {scenes.map((scene, i) => {
        const start = i * 0.2;
        const mid = start + 0.1;
        const end = start + 0.2;

        const opacity = useTransform(
          progress,
          [start, start + 0.05, mid, end - 0.05, end],
          [0, 1, 1, 1, 0]
        );
        const y = useTransform(
          progress,
          [start, start + 0.08],
          [40, 0]
        );

        return (
          <motion.div
            key={i}
            style={{ opacity, y }}
            className="absolute inset-0"
          >
            <span className="text-xs font-bold tracking-widest uppercase mb-2 block" style={{ color: scene.accent }}>
              {scene.label}
            </span>
            <h3 className="text-3xl lg:text-4xl font-black text-white mb-4 leading-tight">
              {scene.title}
            </h3>
            <p className="text-[#9999AA] text-lg leading-relaxed whitespace-pre-line">
              {scene.body}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}

function SceneIllustration({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {scenes.map((scene, i) => {
        const start = i * 0.2;
        const end = start + 0.2;

        const opacity = useTransform(
          progress,
          [start, start + 0.05, end - 0.05, end],
          [0, 1, 1, 0]
        );
        const scale = useTransform(
          progress,
          [start, start + 0.1, end - 0.1, end],
          [0.8, 1, 1, 0.8]
        );

        return (
          <motion.div
            key={i}
            style={{ opacity, scale }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <svg viewBox="0 0 400 400" className="w-full h-full max-w-[400px]">
              {i === 0 && (
                <>
                  {/* Background - School Toilet */}
                  <rect x="50" y="50" width="300" height="300" fill="#1A1A2E" rx="8" />
                  {/* Tiles pattern */}
                  <g stroke="#2A2A3E" strokeWidth="1">
                    {[...Array(6)].map((_, row) =>
                      [...Array(6)].map((_, col) => (
                        <rect
                          key={`${row}-${col}`}
                          x={50 + col * 50}
                          y={50 + row * 50}
                          width="50"
                          height="50"
                          fill="none"
                        />
                      ))
                    )}
                  </g>
                  {/* Person silhouette */}
                  <ellipse cx="200" cy="280" rx="40" ry="50" fill="#0F0F17" />
                  <circle cx="200" cy="210" r="25" fill="#0F0F17" />
                  {/* Smoke rising */}
                  <g>
                    <circle cx="200" cy="180" r="15" fill="#FF4D4D" opacity="0.6">
                      <animate attributeName="cy" values="180;120;60" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0.3;0" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="190" cy="170" r="10" fill="#FF4D4D" opacity="0.5">
                      <animate attributeName="cy" values="170;110;50" dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0.25;0" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="210" cy="175" r="12" fill="#FF4D4D" opacity="0.4">
                      <animate attributeName="cy" values="175;115;55" dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0.2;0" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                  </g>
                </>
              )}
              {i === 1 && (
                <>
                  {/* Kitchen background */}
                  <rect x="50" y="50" width="300" height="300" fill="#1A1A2E" rx="8" />
                  {/* Stove */}
                  <rect x="120" y="200" width="160" height="80" fill="#2A2A3E" rx="4" />
                  <circle cx="150" cy="220" r="15" fill="#3A3A4E" />
                  <circle cx="200" cy="220" r="15" fill="#3A3A4E" />
                  <circle cx="250" cy="220" r="15" fill="#3A3A4E" />
                  {/* Gas cylinder */}
                  <rect x="170" y="260" width="60" height="80" fill="#4A4A5E" rx="4" />
                  {/* Hose */}
                  <path d="M200 260 L200 240" stroke="#5A5A6E" strokeWidth="4" />
                  {/* Gas leak particles */}
                  <g>
                    <circle cx="200" cy="240" r="8" fill="#FF9F4D" opacity="0.7">
                      <animate attributeName="cy" values="240;180;120" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="r" values="8;12;16" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0.4;0" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="190" cy="230" r="6" fill="#FF9F4D" opacity="0.6">
                      <animate attributeName="cy" values="230;170;110" dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="r" values="6;10;14" dur="1.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0.35;0" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="210" cy="235" r="7" fill="#FF9F4D" opacity="0.5">
                      <animate attributeName="cy" values="235;175;115" dur="1.6s" repeatCount="indefinite" />
                      <animate attributeName="r" values="7;11;15" dur="1.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0.3;0" dur="1.6s" repeatCount="indefinite" />
                    </circle>
                  </g>
                </>
              )}
              {i === 2 && (
                <>
                  {/* Background */}
                  <rect x="50" y="50" width="300" height="300" fill="#1A1A2E" rx="8" />
                  {/* SmokeSentry device */}
                  <rect x="140" y="150" width="120" height="120" fill="#2A2A3E" rx="12" stroke="#E8FF47" strokeWidth="2" />
                  {/* LED indicator */}
                  <circle cx="200" cy="180" r="8" fill="#E8FF47">
                    <animate attributeName="opacity" values="1;0.5;1" dur="0.5s" repeatCount="indefinite" />
                  </circle>
                  {/* Radar pulses */}
                  <g>
                    <circle cx="200" cy="210" r="30" fill="none" stroke="#E8FF47" strokeWidth="2" opacity="0.8">
                      <animate attributeName="r" values="30;60;90" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.4;0" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="200" cy="210" r="30" fill="none" stroke="#E8FF47" strokeWidth="2" opacity="0.6">
                      <animate attributeName="r" values="30;60;90" dur="2s" begin="0.7s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0.3;0" dur="2s" begin="0.7s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="200" cy="210" r="30" fill="none" stroke="#E8FF47" strokeWidth="2" opacity="0.4">
                      <animate attributeName="r" values="30;60;90" dur="2s" begin="1.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.4;0.2;0" dur="2s" begin="1.4s" repeatCount="indefinite" />
                    </circle>
                  </g>
                  {/* DETECTED badge */}
                  <rect x="150" y="120" width="100" height="20" fill="#E8FF47" rx="4" />
                  <text x="200" y="135" textAnchor="middle" fill="#0A0A10" fontSize="12" fontWeight="bold">
                    DETECTED!
                  </text>
                </>
              )}
              {i === 3 && (
                <>
                  {/* Background */}
                  <rect x="50" y="50" width="300" height="300" fill="#1A1A2E" rx="8" />
                  {/* Background HP body */}
                  <rect x="140" y="80" width="120" height="200" rx="16" fill="#1A1A2E" stroke="#4DFFB8" strokeWidth="2" />
                  {/* Layar HP */}
                  <rect x="148" y="100" width="104" height="160" rx="8" fill="#0D0D1A" />
                  {/* Status bar HP */}
                  <rect x="148" y="100" width="104" height="20" rx="8" fill="#111122" />
                  <text x="200" y="114" textAnchor="middle" fill="#666" fontSize="8">9:41</text>
                  {/* Notifikasi Card di layar */}
                  <rect x="153" y="128" width="94" height="56" rx="8" fill="#1E3A2F" stroke="#4DFFB8" strokeWidth="1" opacity="0.95" />
                  {/* Logo Telegram kecil */}
                  <circle cx="165" cy="140" r="7" fill="#2AABEE" />
                  <text x="165" y="144" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">✈</text>
                  {/* Teks notifikasi */}
                  <text x="176" y="139" fill="#4DFFB8" fontSize="7" fontWeight="bold">SmokeSentry</text>
                  <text x="176" y="150" fill="#CCCCCC" fontSize="6.5">⚠️ Asap terdeteksi!</text>
                  <text x="176" y="160" fill="#999" fontSize="6">Lokasi: Ruang Utama</text>
                  <text x="176" y="170" fill="#666" fontSize="5.5">Baru saja • Geser untuk lihat</text>
                  {/* Garis bawah notif */}
                  <line x1="158" y1="188" x2="242" y2="188" stroke="#2A2A3E" strokeWidth="1" />
                  {/* Home bar HP */}
                  <rect x="178" y="252" width="44" height="4" rx="2" fill="#333" />
                  {/* Sinyal memancar dari HP */}
                  <circle cx="200" cy="200" r="70" fill="none" stroke="#4DFFB8" strokeWidth="1" opacity="0.15">
                    <animate attributeName="r" values="70;90;70" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.15;0;0.15" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="200" cy="200" r="85" fill="none" stroke="#4DFFB8" strokeWidth="1" opacity="0.08">
                    <animate attributeName="r" values="85;110;85" dur="2s" begin="0.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.08;0;0.08" dur="2s" begin="0.5s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
              {i === 4 && (
                <>
                  {/* Background */}
                  <rect x="50" y="50" width="300" height="300" fill="#1A1A2E" rx="8" />
                  {/* House */}
                  <polygon points="200,80 120,150 280,150" fill="#2A2A3E" stroke="#4D9EFF" strokeWidth="2" />
                  <rect x="140" y="150" width="120" height="120" fill="#2A2A3E" stroke="#4D9EFF" strokeWidth="2" />
                  {/* Door */}
                  <rect x="180" y="200" width="40" height="70" fill="#3A3A4E" />
                  {/* Windows */}
                  <rect x="155" y="170" width="20" height="20" fill="#3A3A4E" />
                  <rect x="225" y="170" width="20" height="20" fill="#3A3A4E" />
                  {/* Checkmark */}
                  <circle cx="200" cy="210" r="30" fill="#4D9EFF" opacity="0.3" />
                  <path d="M185 210 L195 220 L215 190" stroke="#4D9EFF" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Stars */}
                  <g>
                    <text x="100" y="100" fontSize="16" fill="#4D9EFF">
                      <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                      ✦
                    </text>
                    <text x="280" y="120" fontSize="12" fill="#4D9EFF">
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite" />
                      ✦
                    </text>
                    <text x="90" y="180" fontSize="10" fill="#4D9EFF">
                      <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
                      ✦
                    </text>
                    <text x="300" y="200" fontSize="14" fill="#4D9EFF">
                      <animate attributeName="opacity" values="1;0.4;1" dur="1.6s" repeatCount="indefinite" />
                      ✦
                    </text>
                  </g>
                  {/* SmokeSentry logo */}
                  <text x="200" y="100" textAnchor="middle" fill="#E8FF47" fontSize="10" fontWeight="bold">
                    SS
                  </text>
                </>
              )}
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
}

function SmokeBackground({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: 40 + Math.random() * 80,
    x: Math.random() * 100,
    y: Math.random() * 100,
    color: ['#E8FF47', '#FF4D4D', '#4DFFB8'][i % 3],
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full blur-3xl"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            opacity: 0.05,
            animation: `smokeFloat ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes smokeFloat {
          0% { transform: translateY(0) scale(1); opacity: 0.05; }
          50% { transform: translateY(-60px) scale(1.1); opacity: 0.08; }
          100% { transform: translateY(-120px) scale(0.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function SceneProgressDots({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
      {scenes.map((_, i) => {
        const isActive = useTransform(progress, [i * 0.2, i * 0.2 + 0.2], [0, 1]);
        return (
          <motion.div
            key={i}
            style={{ opacity: isActive }}
            className="w-2 h-2 rounded-full bg-[#E8FF47]"
          />
        );
      })}
    </div>
  );
}

export default function StorySection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section ref={containerRef} id="about" className="relative" style={{ height: '500vh' }}>
      {/* STICKY WRAPPER */}
      <div className="sticky top-0 h-screen overflow-hidden bg-[#080810] flex items-center justify-center">
        {/* Background Smoke Particle Effect */}
        <SmokeBackground scrollYProgress={scrollYProgress} />

        {/* Scene Container */}
        <div className="relative w-full max-w-6xl mx-auto px-8 flex flex-col lg:flex-row items-center gap-12 h-full py-24">
          {/* KIRI: Ilustrasi SVG */}
          <div className="w-full lg:w-1/2 h-full flex items-center justify-center">
            <SceneIllustration progress={scrollYProgress} />
          </div>

          {/* KANAN: Teks narasi */}
          <div className="w-full lg:w-1/2">
            <SceneText progress={scrollYProgress} />
          </div>
        </div>

        {/* Progress Dots */}
        <SceneProgressDots progress={scrollYProgress} />
      </div>
    </section>
  );
}
