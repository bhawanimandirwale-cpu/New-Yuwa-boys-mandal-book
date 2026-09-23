'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export function MobileFloatingActions() {
  const { setIsAddDonationOpen, setIsAddExpenseOpen, currentRole } = useApp();

  const isPublicMember = currentRole === 'MEMBER';
  if (isPublicMember) return null;

  const triggerHaptic = (duration = 30) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(duration);
      } catch (e) {
        // Ignore haptic if unsupported
      }
    }
  };

  return (
    <div
      className="fixed bottom-[72px] left-1/2 -translate-x-1/2 z-40 sm:hidden flex items-center justify-center notranslate pointer-events-auto"
      style={{
        marginBottom: 'max(env(safe-area-inset-bottom, 0px), 4px)',
      }}
    >
      {/* Sleek Floating Island / Capsule Dock */}
      <div className="flex items-center gap-1.5 p-1 bg-white/85 dark:bg-black/50 backdrop-blur-xl rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.18)] border border-white/60 dark:border-white/15">
        {/* 1. ＋ जमा नोंदवा (Donation Action) */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            triggerHaptic(35);
            setIsAddDonationOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-saffron-600 via-amber-500 to-saffron-500 text-white font-black text-xs shadow-md shadow-saffron-600/30 border border-white/60 active:brightness-95 transition-all select-none cursor-pointer"
          title="वर्गणी जमा नोंदवा"
        >
          <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center shrink-0">
            <Plus className="w-3 h-3 stroke-[3.5]" />
          </div>
          <span className="font-heading tracking-tight whitespace-nowrap">जमा नोंदवा</span>
        </motion.button>

        {/* 2. － खर्च व्हाऊचर (Expense Action) */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            triggerHaptic(25);
            setIsAddExpenseOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 text-white font-black text-xs shadow-md shadow-rose-600/30 border border-white/60 active:brightness-95 transition-all select-none cursor-pointer"
          title="खर्च व्हाऊचर नोंदवा"
        >
          <div className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center shrink-0">
            <Minus className="w-3 h-3 stroke-[3.5]" />
          </div>
          <span className="font-heading tracking-tight whitespace-nowrap">खर्च व्हाऊचर</span>
        </motion.button>
      </div>
    </div>
  );
}

export default MobileFloatingActions;
