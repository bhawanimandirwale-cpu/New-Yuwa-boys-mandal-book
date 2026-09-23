'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { Plus, Minus, X, HandCoins, Receipt, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileFloatingActions() {
  const { setIsAddDonationOpen, setIsAddExpenseOpen, currentRole } = useApp();
  const [isOpen, setIsOpen] = useState(false);

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

  const handleOpenDonation = () => {
    triggerHaptic(35);
    setIsOpen(false);
    setIsAddDonationOpen(true);
  };

  const handleOpenExpense = () => {
    triggerHaptic(30);
    setIsOpen(false);
    setIsAddExpenseOpen(true);
  };

  const toggleOpen = () => {
    triggerHaptic(25);
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* 1. Backdrop Overlay when Popup is Active */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs sm:hidden notranslate"
          />
        )}
      </AnimatePresence>

      {/* 2. Speed-Dial Pop-up Action Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 35, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 25, scale: 0.92 }}
            transition={{ type: 'spring', damping: 24, stiffness: 340 }}
            className="fixed bottom-[136px] left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-sm flex flex-col gap-2.5 sm:hidden notranslate pointer-events-auto"
            style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl border border-gray-200/80 shadow-sm text-gray-700 dark:text-gray-200">
              <span className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 text-saffron-700">
                <Sparkles className="w-3.5 h-3.5" />
                <span>झटपट व्यवहार नोंदणी</span>
              </span>
              <span className="text-[10px] text-gray-500 font-medium">पर्याय निवडा</span>
            </div>

            {/* Option A: ＋ जमा नोंदवा (Donation) */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleOpenDonation}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-saffron-600 via-amber-500 to-saffron-500 text-white shadow-xl shadow-saffron-600/35 border-2 border-white/90 flex items-center justify-between text-left active:brightness-95 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/40 flex items-center justify-center shrink-0 shadow-inner">
                  <HandCoins className="w-6 h-6 text-white stroke-[2.5]" />
                </div>
                <div>
                  <div className="font-heading font-black text-sm text-white tracking-tight flex items-center gap-1.5">
                    <span>＋ जमा नोंदवा</span>
                    <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-md font-bold">पावती</span>
                  </div>
                  <p className="text-[11px] text-white/90 font-medium mt-0.5">
                    नवीन देणगी स्वीकारून WhatsApp पावती बनवा
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/80 shrink-0" />
            </motion.button>

            {/* Option B: － खर्च व्हाऊचर (Expense) */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleOpenExpense}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 text-white shadow-xl shadow-rose-600/35 border-2 border-white/90 flex items-center justify-between text-left active:brightness-95 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/40 flex items-center justify-center shrink-0 shadow-inner">
                  <Receipt className="w-6 h-6 text-white stroke-[2.5]" />
                </div>
                <div>
                  <div className="font-heading font-black text-sm text-white tracking-tight flex items-center gap-1.5">
                    <span>－ खर्च व्हाऊचर</span>
                    <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-md font-bold">व्हाऊचर</span>
                  </div>
                  <p className="text-[11px] text-white/90 font-medium mt-0.5">
                    मंडप, मूर्ती, सजावट किंवा इतर खर्च नोंदवा
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/80 shrink-0" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Center Floating Trigger Button (Compact & Thumb Friendly) */}
      <div
        className="fixed bottom-[72px] left-1/2 -translate-x-1/2 z-50 sm:hidden flex items-center justify-center notranslate pointer-events-auto"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <motion.button
          type="button"
          onClick={toggleOpen}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className={`group flex items-center justify-center gap-2 px-5 py-2.5 rounded-full shadow-2xl border-2 transition-all cursor-pointer ${
            isOpen
              ? 'bg-gray-900 text-white border-white/80 shadow-black/50 ring-4 ring-gray-900/30'
              : 'bg-gradient-to-r from-saffron-600 via-amber-500 to-saffron-500 text-white border-white/90 shadow-saffron-500/40 ring-4 ring-saffron-400/20'
          }`}
          title={isOpen ? 'बंद करा' : 'व्यवहार नोंदवा'}
        >
          {/* Animated Icon (Smooth Plus to Cross rotation) */}
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              isOpen ? 'bg-white/20' : 'bg-white/25'
            }`}
          >
            {isOpen ? (
              <X className="w-4 h-4 stroke-[3]" />
            ) : (
              <Plus className="w-4 h-4 stroke-[3.5]" />
            )}
          </motion.div>

          {/* Trigger Label */}
          <span className="font-heading font-black text-xs tracking-tight whitespace-nowrap">
            {isOpen ? 'बंद करा' : 'व्यवहार नोंदवा'}
          </span>
        </motion.button>
      </div>
    </>
  );
}

export default MobileFloatingActions;
