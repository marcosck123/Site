
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingModalProps {
  isOpen: boolean;
  message: string;
}

export default function LoadingModal({ isOpen, message }: LoadingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] text-center"
          >
            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl">
              <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-white mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-white">{message}</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
