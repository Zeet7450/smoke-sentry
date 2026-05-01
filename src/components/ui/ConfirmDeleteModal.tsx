'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deviceName: string;
}

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, deviceName }: ConfirmDeleteModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (confirmText !== 'HAPUS') return;
    
    setIsSubmitting(true);
    await onConfirm();
    setIsSubmitting(false);
    setConfirmText('');
    onClose();
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 z-[10000] flex items-center justify-center p-4"
            onClick={handleClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0f0f1a] border border-[#E8FF47] rounded-xl p-6 w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-[#ef4444] mb-2">
                  Hapus Device?
                </h3>
                <p className="text-[#6b6b7a] text-sm">
                  Anda akan menghapus device <span className="text-white font-semibold">{deviceName}</span>.
                  Ketik <span className="text-[#E8FF47] font-mono font-bold">HAPUS</span> untuk mengkonfirmasi.
                </p>
              </div>

              {/* Input */}
              <div className="mb-6">
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Ketik HAPUS untuk konfirmasi"
                  className="w-full px-4 py-3 rounded-lg bg-[#0a0a10] border border-[#1e1e2e] text-white text-sm placeholder:text-[#3a3a4a] focus:outline-none focus:border-[#E8FF47]/50 transition-colors"
                  autoFocus
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#E8FF47] text-[#E8FF47] text-sm font-semibold hover:bg-[#E8FF47]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={confirmText !== 'HAPUS' || isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#ef4444] text-white text-sm font-semibold hover:bg-[#dc2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
