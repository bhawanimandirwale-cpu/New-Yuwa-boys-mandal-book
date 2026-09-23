'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Plus, Minus } from 'lucide-react';

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
      className="fixed bottom-[74px] left-1/2 -translate-x-1/2 z-40 sm:hidden flex items-center justify-center gap-2.5 notranslate pointer-events-auto w-auto max-w-[95vw] px-2"
      style={{
        marginBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* 1. ＋ जमा नोंदवा (Floating Donation Button) */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic(35);
          setIsAddDonationOpen(true);
        }}
        className="group flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-saffron-600 via-amber-500 to-saffron-500 text-white font-black text-xs shadow-lg shadow-saffron-500/40 border-2 border-white active:scale-95 hover:shadow-xl transition-all whitespace-nowrap cursor-pointer"
        title="वर्गणी जमा नोंदवा"
      >
        <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center shrink-0">
          <Plus className="w-3.5 h-3.5 stroke-[3.5]" />
        </div>
        <span className="tracking-tight font-heading">＋ जमा नोंदवा</span>
      </button>

      {/* 2. － खर्च व्हाऊचर (Floating Expense Button) */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic(25);
          setIsAddExpenseOpen(true);
        }}
        className="group flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 text-white font-black text-xs shadow-lg shadow-rose-600/40 border-2 border-white active:scale-95 hover:shadow-xl transition-all whitespace-nowrap cursor-pointer"
        title="खर्च व्हाऊचर नोंदवा"
      >
        <div className="w-5 h-5 rounded-full bg-white/25 flex items-center justify-center shrink-0">
          <Minus className="w-3.5 h-3.5 stroke-[3.5]" />
        </div>
        <span className="tracking-tight font-heading">－ खर्च व्हाऊचर</span>
      </button>
    </div>
  );
}
