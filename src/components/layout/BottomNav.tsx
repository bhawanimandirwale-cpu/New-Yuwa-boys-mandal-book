'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { 
  Home, 
  Receipt, 
  Users, 
  FileText,
  Plus
} from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const { setIsAddDonationOpen, currentRole } = useApp();

  const isPublicMember = currentRole === 'MEMBER';

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(35);
      } catch (e) {
        // Ignore haptic error if unsupported
      }
    }
  };

  const handleCollectClick = () => {
    triggerHaptic();
    setIsAddDonationOpen(true);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-gray-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] sm:hidden notranslate"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
    >
      <div className="flex items-center justify-between px-2 h-16 max-w-md mx-auto relative">
        {/* 1. 🏠 होम (Home) */}
        <Link
          href="/"
          onClick={triggerHaptic}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            pathname === '/'
              ? 'text-saffron-600 font-extrabold scale-105'
              : 'text-gray-500 hover:text-gray-900 active:scale-95'
          }`}
        >
          <Home className={`w-5 h-5 ${pathname === '/' ? 'stroke-[2.8] text-saffron-600' : 'stroke-2'}`} />
          <span className="text-[11px] tracking-tight font-heading mt-0.5">होम</span>
        </Link>

        {/* 2. 📜 पावत्या (Receipts) */}
        <Link
          href="/donations"
          onClick={triggerHaptic}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            pathname === '/donations'
              ? 'text-saffron-600 font-extrabold scale-105'
              : 'text-gray-500 hover:text-gray-900 active:scale-95'
          }`}
        >
          <Receipt className={`w-5 h-5 ${pathname === '/donations' ? 'stroke-[2.8] text-saffron-600' : 'stroke-2'}`} />
          <span className="text-[11px] tracking-tight font-heading mt-0.5">पावत्या</span>
        </Link>

        {/* 3. ➕ जमा (Center Floating Action Button) */}
        <div className="relative -top-5 flex flex-col items-center px-1">
          <button
            type="button"
            onClick={handleCollectClick}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-saffron-600 via-amber-500 to-saffron-500 text-white flex items-center justify-center shadow-xl shadow-saffron-500/45 border-4 border-white active:scale-90 transition-all hover:shadow-saffron-500/60"
            title="१०-सेकंद वर्गणी नोंदवा"
          >
            <Plus className="w-7 h-7 stroke-[3.2]" />
          </button>
          <span className="text-[11px] font-black text-saffron-700 font-heading mt-0.5 tracking-tight">
            जमा
          </span>
        </div>

        {/* 4. 👥 कार्यकर्ते (Members) */}
        <Link
          href="/members"
          onClick={triggerHaptic}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            pathname === '/members'
              ? 'text-saffron-600 font-extrabold scale-105'
              : 'text-gray-500 hover:text-gray-900 active:scale-95'
          }`}
        >
          <Users className={`w-5 h-5 ${pathname === '/members' ? 'stroke-[2.8] text-saffron-600' : 'stroke-2'}`} />
          <span className="text-[11px] tracking-tight font-heading mt-0.5">कार्यकर्ते</span>
        </Link>

        {/* 5. 📁 कागदपत्रे (Docs) */}
        <Link
          href="/documents"
          onClick={triggerHaptic}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            pathname === '/documents'
              ? 'text-saffron-600 font-extrabold scale-105'
              : 'text-gray-500 hover:text-gray-900 active:scale-95'
          }`}
        >
          <FileText className={`w-5 h-5 ${pathname === '/documents' ? 'stroke-[2.8] text-saffron-600' : 'stroke-2'}`} />
          <span className="text-[11px] tracking-tight font-heading mt-0.5">कागदपत्रे</span>
        </Link>
      </div>
    </nav>
  );
}
