'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { createContext, useContext, useState, useCallback } from 'react'

type ToastType = 'success' | 'warning' | 'danger' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message: string
  autoDismiss?: boolean
  actionLabel?: string
  actionHref?: string
}

const toastConfig = {
  success: { border: '#E8FF47', icon: '✓',  glow: 'rgba(232,255,71,0.15)'  },
  warning: { border: '#FFA500', icon: '⚠',  glow: 'rgba(255,165,0,0.15)'   },
  danger:  { border: '#FF4444', icon: '🔥', glow: 'rgba(255,68,68,0.2)'    },
  info:    { border: '#FFFFFF', icon: 'ℹ',  glow: 'rgba(255,255,255,0.1)'  },
}

// Context untuk dipakai di seluruh app
export const ToastContext = createContext<{
  showToast: (toast: Omit<Toast, 'id'>) => void
}>({ showToast: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const newToast = { ...toast, id }
    setToasts(prev => [...prev.slice(-2), newToast]) // max 3

    if (toast.autoDismiss !== false && toast.type !== 'danger') {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 5000)
    }
  }, [])

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[10000] 
                      flex flex-col gap-3 w-80 max-w-[90vw] pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const cfg = toastConfig[toast.type]
            return (
              <motion.div
                key={toast.id}
                className="pointer-events-auto"
                initial={{ x: 400, opacity: 0 }}
                animate={
                  toast.type === 'danger'
                    ? { x: 0, opacity: 1,
                        transition: {
                          type: 'spring', stiffness: 500, damping: 30
                        }}
                    : { x: 0, opacity: 1 }
                }
                exit={{ x: 400, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: '#0A0A0A',
                  borderLeft: `4px solid ${cfg.border}`,
                  border: `1px solid ${cfg.glow}`,
                  borderLeftColor: cfg.border,
                  borderRadius: '8px',
                  padding: '14px 16px',
                  minWidth: '280px',
                  maxWidth: '360px',
                  boxShadow: `0 0 20px ${cfg.glow}`,
                }}
              >
                {/* Pulse border untuk danger */}
                {toast.type === 'danger' && (
                  <motion.div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    style={{ 
                      border: '1px solid #FF4444',
                      borderRadius: '8px'
                    }}
                  />
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-lg mt-0.5">{cfg.icon}</span>
                    <div>
                      <p className="font-bold text-sm"
                         style={{ color: cfg.border }}>
                        {toast.title}
                      </p>
                      <p className="text-gray-300 text-xs mt-1 leading-relaxed break-words">
                        {toast.message}
                      </p>
                      {toast.actionLabel && toast.actionHref && (
                        <a
                          href={toast.actionHref}
                          className="inline-block mt-2 text-xs font-bold
                                     underline underline-offset-2"
                          style={{ color: cfg.border }}
                        >
                          {toast.actionLabel} →
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => dismiss(toast.id)}
                    className="text-gray-500 hover:text-white text-xs
                               mt-0.5 flex-shrink-0 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
