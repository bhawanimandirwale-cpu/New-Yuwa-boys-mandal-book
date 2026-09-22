'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useApp } from '@/lib/context/AppContext';
import { toDevanagariDigits } from '@/lib/formatters';
import { 
  Bell, 
  ChevronDown, 
  LogOut, 
  ShieldAlert, 
  Sparkles, 
  User, 
  X,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export function MobileTopBar() {
  const { mandal, activeYear, setYear, currentRole } = useApp();
  const { data: session } = useSession();

  const [yearOpen, setYearOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const userName = session?.user?.name || 'कार्यकर्ता';
  const userInitial = userName.substring(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-sm sm:hidden notranslate">
      <div className="flex items-center justify-between px-3 py-2 h-14">
        {/* Left: Mandal Logo Avatar + Active Mandal Name */}
        <Link href="/" className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-saffron-600 to-amber-400 p-0.5 shadow-md shadow-saffron-500/20 shrink-0 overflow-hidden flex items-center justify-center">
            <img
              src="/mandal-logo.png"
              alt="Mandal Logo"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-saffron-700 tracking-wider font-heading leading-tight truncate">
              ॥ श्री गणेश प्रसन्न ॥
            </div>
            <h1 className="text-xs font-black text-gray-900 truncate font-heading leading-tight">
              {mandal?.name || 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.'}
            </h1>
          </div>
        </Link>

        {/* Center: Festival Year Selector Pill (२०२६ ▼) */}
        <div className="relative shrink-0 mr-2">
          <button
            type="button"
            onClick={() => setYearOpen(!yearOpen)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-saffron-50 border border-saffron-200 text-saffron-800 font-extrabold text-xs shadow-xs active:scale-95 transition-all"
          >
            <span>{toDevanagariDigits(activeYear)}</span>
            <ChevronDown className="w-3 h-3 text-saffron-600" />
          </button>

          {yearOpen && (
            <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 w-28 bg-white rounded-2xl shadow-xl border border-gray-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                उत्सव वर्ष
              </div>
              {[2026, 2025, 2024].map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => {
                    setYear(yr);
                    setYearOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-bold transition-colors ${
                    activeYear === yr
                      ? 'bg-saffron-50 text-saffron-700 font-black'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  वर्ष {toDevanagariDigits(yr)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Notification Bell + Profile Avatar */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 relative active:scale-95 transition-all"
              title="सूचना"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-saffron-600 rounded-full animate-ping" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-saffron-600 rounded-full" />
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className="text-xs font-extrabold text-gray-900 font-heading">
                    मंडळ सूचना व अपडेट्स
                  </span>
                  <button
                    type="button"
                    onClick={() => setNotificationOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="py-2 space-y-2 text-xs">
                  <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-emerald-900">डिजिटल पावती सिस्टिम सक्रिय</div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">
                        वर्गणी जमा करताच दात्यास थेट WhatsApp पावती पाठवता येईल.
                      </div>
                    </div>
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-amber-900">घर-घर वर्गणी मोहीम</div>
                      <div className="text-[11px] text-amber-700 mt-0.5">
                        मध्यभागी असलेल्या <b>"+ जमा"</b> बटनावरून १० सेकंदात पावती बनवा.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-saffron-600 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-sm border border-white active:scale-95 transition-all overflow-hidden"
            >
              {session?.user?.image ? (
                <img src={session.user.image} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userInitial
              )}
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-saffron-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-gray-900 truncate font-heading">{userName}</div>
                    <div className="text-[10px] text-saffron-700 font-extrabold mt-0.5">
                      {currentRole === 'ADMIN' ? '🚩 अध्यक्ष' : currentRole === 'TREASURER' ? '💰 खजिनदार' : '🚩 कार्यकर्ता'}
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-1">
                  <div className="px-2 py-1 text-[10px] text-gray-400 font-medium truncate">
                    {session?.user?.email || 'मंडळ युझर'}
                  </div>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>लॉगआउट (Sign Out)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div 
      className="min-h-screen flex flex-col notranslate"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}
    >
      <MobileTopBar />
      <div className="flex-1 w-full">{children}</div>
    </div>
  );
}
