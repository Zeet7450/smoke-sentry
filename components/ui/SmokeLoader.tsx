'use client'
import { motion, AnimatePresence } from 'framer-motion'

interface SmokeParticle {
  id: number
  x: number
  delay: number
  scale: number
}

export default function SmokeLoader({ 
  isLoading 
}: { 
  isLoading: boolean 
}) {
  const particles: SmokeParticle[] = [
    { id: 1, x: 45, delay: 0,   scale: 1    },
    { id: 2, x: 50, delay: 0.4, scale: 1.3  },
    { id: 3, x: 55, delay: 0.8, scale: 0.9  },
    { id: 4, x: 48, delay: 1.2, scale: 1.1  },
    { id: 5, x: 52, delay: 1.6, scale: 0.8  },
  ]

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col
                     items-center justify-center overflow-hidden"
        >
          {/* SVG Filter untuk efek asap */}
          <svg width="0" height="0" className="absolute">
            <defs>
              <filter id="smoke-filter">
                <feTurbulence
                  type="turbulence"
                  baseFrequency="0.015"
                  numOctaves="4"
                  seed="2"
                  result="turbulence"
                >
                  <animate
                    attributeName="baseFrequency"
                    values="0.015;0.025;0.015"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </feTurbulence>
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="turbulence"
                  scale="25"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
          </svg>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-black tracking-tight mb-8 z-10"
          >
            <span className="text-white">Smoke</span>
            <span style={{ color: '#E8FF47' }}>Sentry</span>
          </motion.div>

          {/* Partikel asap */}
          <div className="relative w-48 h-32 mb-4">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute bottom-0 rounded-full"
                style={{
                  left: `${p.x}%`,
                  width: `${40 * p.scale}px`,
                  height: `${50 * p.scale}px`,
                  background:
                    'radial-gradient(ellipse, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 70%)',
                  filter: 'url(#smoke-filter)',
                  transform: 'translateX(-50%)',
                }}
                animate={{
                  y: [-10, -90, -140],
                  opacity: [0, 0.6, 0],
                  scale: [0.8, 1.4, 2],
                  x: [0, p.id % 2 === 0 ? 10 : -10, 0],
                }}
                transition={{
                  duration: 2.5,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          {/* Teks status */}
          <motion.p
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="text-sm font-medium mb-8"
            style={{ color: '#E8FF47' }}
          >
            Menginisialisasi sistem...
          </motion.p>

          {/* Loading bar */}
          <div className="absolute bottom-0 left-0 w-full h-0.5"
               style={{ background: 'rgba(232,255,71,0.2)' }}>
            <motion.div
              className="h-full"
              style={{ background: '#E8FF47' }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
