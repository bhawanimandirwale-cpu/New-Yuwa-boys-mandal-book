'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Plus, Minus } from 'lucide-react';
import { AnimatedButton } from '@/components/ui/animated-button';

export function MobileFloatingActions() {
  const { setIsAddDonationOpen, setIsAddExpenseOpen, currentRole } = useApp();

  const isPublicMember = currentRole === 'MEMBER';
  if (isPublicMember) return null;

  const triggerHaptic = (duration = 25) => {
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
      className="fixed left-1/2 -translate-x-1/2 z-40 sm:hidden flex items-center justify-center gap-2 notranslate pointer-events-auto w-auto max-w-[96vw] px-2 select-none"
      style={{
        bottom: 'calc(64px + max(env(safe-area-inset-bottom, 0px), 8px) + 16px)',
      }}
    >
      {/* 1. जमा नोंदवा (Animated Saffron Floating Action) */}
      <AnimatedButton
        type="button"
        onClick={() => {
          triggerHaptic(30);
          setIsAddDonationOpen(true);
        }}
        className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-saffron-600 via-amber-500 to-saffron-600 text-white font-black text-xs shadow-[0_8px_20px_-3px_rgba(234,88,12,0.45)] border border-white/40 active:scale-95 transition-all whitespace-nowrap cursor-pointer hover:shadow-2xl"
        title="वर्गणी जमा नोंदवा"
      >
        <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center shrink-0">
          <Plus className="w-3.5 h-3.5 stroke-[3.5]" />
        </div>
        <span className="tracking-tight font-heading font-black">जमा नोंदवा</span>
      </AnimatedButton>

      {/* 2. खर्च व्हाऊचर (Animated Rose Floating Action) */}
      <AnimatedButton
        type="button"
        onClick={() => {
          triggerHaptic(20);
          setIsAddExpenseOpen(true);
        }}
        className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 text-white font-black text-xs shadow-[0_8px_20px_-3px_rgba(225,29,72,0.45)] border border-white/40 active:scale-95 transition-all whitespace-nowrap cursor-pointer hover:shadow-2xl"
        title="खर्च व्हाऊचर नोंदवा"
      >
        <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center shrink-0">
          <Minus className="w-3.5 h-3.5 stroke-[3.5]" />
        </div>
        <span className="tracking-tight font-heading font-black">खर्च व्हाऊचर</span>
      </AnimatedButton>
    </div>
  );
}

export default MobileFloatingActions;
