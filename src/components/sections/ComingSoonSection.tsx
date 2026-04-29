'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const LAUNCH_DATE = new Date('2026-06-01T00:00:00');

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const diff = Math.max(0, target.getTime() - now.getTime());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return timeLeft;
}

export default function ComingSoonSection() {
  const { days, hours, minutes, seconds } = useCountdown(LAUNCH_DATE);

  const units = [
    { label: 'Hari', value: days },
    { label: 'Jam', value: hours },
    { label: 'Menit', value: minutes },
    { label: 'Detik', value: seconds },
  ];

  return (
    <section className="py-28 px-6 bg-[#060608] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E8FF47] opacity-[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E8FF47]/30 bg-[#E8FF47]/5 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[#E8FF47] animate-pulse" />
          <span className="text-[#E8FF47] text-xs font-bold tracking-widest uppercase">
            Sedang Dikembangkan
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl lg:text-5xl font-black text-white mb-4"
        >
          SmokeSentry akan hadir
          <br />
          <span className="text-[#E8FF47]">1 Juni 2026</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-[#6B6B7A] mb-14 text-lg"
        >
          Produk sedang dalam tahap pengujian akhir. Daftarkan dirimu untuk mendapatkan akses pertama.
        </motion.p>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-4 gap-3 mb-14"
        >
          {units.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center p-5 rounded-2xl border border-[#1E1E2E] bg-[#0F0F17]"
            >
              <span className="text-4xl lg:text-5xl font-black text-[#E8FF47] tabular-nums leading-none mb-2">
                {String(value).padStart(2, '0')}
              </span>
              <span className="text-[10px] text-[#6B6B7A] uppercase tracking-widest">{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex justify-between text-xs text-[#6B6B7A] mb-2">
            <span>Progress pengembangan</span>
            <span className="text-[#E8FF47]">78%</span>
          </div>
          <div className="w-full h-1.5 bg-[#1E1E2E] rounded-full">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '78%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
              className="h-full bg-[#E8FF47] rounded-full"
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#3A3A4A] mt-1">
            <span>Mulai</span>
            <span>Hardware ✓</span>
            <span>Firmware ✓</span>
            <span>Web App ✓</span>
            <span>Launch</span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <input
            type="email"
            placeholder="Masukkan email kamu..."
            className="w-full sm:w-80 px-4 py-3 rounded-xl bg-[#0F0F17] border border-[#1E1E2E] text-white text-sm placeholder:text-[#3A3A4A] focus:outline-none focus:border-[#E8FF47]/50 transition-colors"
          />
          <button className="w-full sm:w-auto px-6 py-3 bg-[#E8FF47] text-black font-bold text-sm rounded-xl hover:bg-[#D4EB3A] transition-colors whitespace-nowrap">
            Beritahu Saya
          </button>
        </div>
      </div>
    </section>
  );
}
