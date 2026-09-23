'use client';

import React, { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useApp } from '@/lib/context/AppContext';
import { toDevanagariDigits } from '@/lib/numberToWordsMarathi';
import {
  X,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Building2,
  KeyRound,
  CheckCircle2,
  LogOut,
  RotateCcw,
  Sparkles,
  Smartphone,
  Copy,
  Check
} from 'lucide-react';

export function AccountProfileModal() {
  const {
    isAccountProfileOpen,
    setIsAccountProfileOpen,
    currentRole,
    mandal,
    setIsResetAccountsOpen,
  } = useApp();
  const { data: session } = useSession();

  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (isAccountProfileOpen) {
      setLoading(true);
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data?.authenticated && data?.user) {
            setDbUser(data.user);
          }
        })
        .catch((err) => console.warn('Failed to fetch /api/auth/me:', err))
        .finally(() => setLoading(false));
    }
  }, [isAccountProfileOpen]);

  if (!isAccountProfileOpen) return null;

  // Local storage fallback if session not ready
  let localUser: any = null;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('mandalbook_user');
      if (stored) localUser = JSON.parse(stored);
    } catch (e) {}
  }

  const name = dbUser?.name || session?.user?.name || localUser?.name || 'मंडळ कार्यकर्ता';
  const email = dbUser?.email || session?.user?.email || localUser?.email || '';
  const phone = dbUser?.phone || (session?.user as any)?.phone || localUser?.phone || '';
  const role = dbUser?.role || (session?.user as any)?.role || currentRole || 'MEMBER';

  const isAdhyaksh =
    role === 'SUPER_ADMIN' ||
    role === 'ADMIN' ||
    email.toLowerCase().trim() === 'bhawanimandirwale@gmail.com' ||
    phone.includes('7499085045') ||
    phone.includes('9923092340');

  const avatarUrl = dbUser?.avatarUrl || session?.user?.image || '';
  const initial = name.substring(0, 1).toUpperCase();

  const handleCopyCode = () => {
    const code = mandal?.inviteCode || 'NYB026';
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleClose = () => {
    setIsAccountProfileOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 notranslate">
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-saffron-600 via-amber-600 to-saffron-700 p-4 sm:p-5 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors active:scale-95"
            title="बंद करा"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-0.5 shadow-xl shrink-0 overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover rounded-[14px]" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-saffron-600 to-amber-500 rounded-[14px] flex items-center justify-center text-white text-xl sm:text-2xl font-black font-heading">
                  {initial}
                </div>
              )}
            </div>

            <div className="min-w-0 pr-8">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-xs mb-1">
                <Sparkles className="w-3 h-3 text-amber-200" />
                <span>{isAdhyaksh ? '🚩 अधिकृत मंडळ अध्यक्ष' : '🚩 मंडळ सदस्य / कार्यकर्ता'}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white truncate font-heading leading-tight">
                {name}
              </h2>
              <div className="text-xs text-amber-100 font-semibold truncate mt-0.5">
                {mandal?.name || 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.'}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-gray-800">
          {/* Card: Unified Account Credentials */}
          <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white rounded-2xl p-3.5 sm:p-4 border border-amber-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-amber-200/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-black text-gray-900 font-heading">
                  🔐 एकत्रित व सुरक्षित खाते (Unified Account)
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                सक्रिय (Active)
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {/* Phone Detail */}
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-200/80 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-saffron-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-gray-500 font-medium">मोबाईल नंबर (SMS OTP)</div>
                    <div className="font-extrabold text-gray-900 text-xs sm:text-sm tracking-wide font-mono truncate">
                      {phone || '+91 7499085045'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>सत्यापित</span>
                </div>
              </div>

              {/* Email Detail */}
              <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-gray-200/80 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-gray-500 font-medium">ईमेल आयडी (Google / Gmail)</div>
                    <div className="font-bold text-gray-900 text-xs truncate">
                      {email || 'bhawanimandirwale@gmail.com'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>सत्यापित</span>
                </div>
              </div>
            </div>

            {/* Integration Banner */}
            <div className="mt-3 flex items-start gap-2 bg-emerald-50/80 border border-emerald-200 p-2.5 rounded-xl text-[11px] text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <b>मोबाईल आणि ईमेल लिंक आहेत:</b> तुम्ही Google, मोबाईल SMS OTP किंवा Gmail OTP पैकी कोणत्याही मार्गाने लॉगिन केले तरी थेट हेच एक अधिकृत खाते उघडेल.
              </div>
            </div>
          </div>

          {/* Card: Mandal Details */}
          <div className="bg-gray-50 rounded-2xl p-3.5 sm:p-4 border border-gray-200 space-y-2 text-xs">
            <div className="text-xs font-black text-gray-900 font-heading flex items-center gap-1.5 pb-2 border-b border-gray-200">
              <Building2 className="w-4 h-4 text-saffron-600" />
              <span>अधिकृत मंडळ माहिती</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-white p-2 rounded-xl border border-gray-200/70">
                <div className="text-[10px] text-gray-500 font-medium">मंडळ शहर / गाव</div>
                <div className="font-bold text-gray-800 text-xs mt-0.5">{mandal?.city || 'केऱ्हाळे बु.'}</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-gray-200/70">
                <div className="text-[10px] text-gray-500 font-medium">स्थापना वर्ष</div>
                <div className="font-bold text-gray-800 text-xs mt-0.5">
                  {toDevanagariDigits(mandal?.establishedYear || 1991)} ({toDevanagariDigits((mandal?.activeYear || 2026) - (mandal?.establishedYear || 1991) + 1)} वे वर्ष)
                </div>
              </div>
            </div>

            {/* Invite Code */}
            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-saffron-200">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-saffron-600 shrink-0" />
                <div>
                  <div className="text-[10px] text-gray-500 font-medium">मंडळ सिक्रेट आमंत्रण कोड</div>
                  <div className="font-mono font-black text-saffron-800 text-sm tracking-wider">
                    {mandal?.inviteCode || 'NYB026'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-saffron-50 text-saffron-700 hover:bg-saffron-100 text-xs font-bold border border-saffron-200 transition-colors active:scale-95"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'कॉपी झाले!' : 'कॉपी करा'}</span>
              </button>
            </div>
          </div>

          {/* President Only Ledger Reset Action */}
          {isAdhyaksh && (
            <div className="bg-rose-50/60 rounded-2xl p-3 border border-rose-200 space-y-1.5">
              <div className="text-[11px] font-bold text-rose-800 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>अध्यक्षीय विशेष अधिकार (President Ledger Reset)</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-snug">
                हिशोब व व्यवहार नव्याने सुरू करण्यासाठी खालील बटण वापरा.
              </p>
              <button
                type="button"
                onClick={() => {
                  handleClose();
                  setIsResetAccountsOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white hover:bg-rose-100/70 border border-rose-300 text-rose-700 font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>हिशोब नव्याने सुरू करा (Reset Transactions)</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold border border-gray-300 transition-colors active:scale-95"
          >
            बंद करा (Close)
          </button>

          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('mandalbook_user');
              localStorage.removeItem('mandalbook_role');
              signOut({ callbackUrl: '/login' });
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>लॉगआउट (Sign Out)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
