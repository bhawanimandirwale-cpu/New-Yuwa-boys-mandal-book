'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  ShieldCheck,
  Phone,
  Mail,
  User,
  KeyRound,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RotateCw,
  LogOut,
  Building2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toDevanagariDigits } from '@/lib/formatters';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();

  const [loadingUser, setLoadingUser] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mandalInfo, setMandalInfo] = useState<any>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [inviteCode, setInviteCode] = useState('NYB026');

  // OTP Verification States
  const [otpStep, setOtpStep] = useState<'DETAILS' | 'VERIFY_OTP'>('DETAILS');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 1. Fetch live user details
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setCurrentUser(data.user);
          setName(data.user.name || '');
          if (data.user.phone) {
            setPhone(data.user.phone.replace(/\D/g, '').slice(-10));
          }
          if (data.user.email) {
            setEmail(data.user.email);
          }
          // If already has both, redirect to dashboard
          if (data.user.phone && data.user.email && data.user.status === 'ACTIVE') {
            router.replace('/');
          }
        }
        if (data?.mandal) {
          setMandalInfo(data.mandal);
          if (data.mandal.inviteCode) {
            setInviteCode(data.mandal.inviteCode);
          }
        }
      })
      .catch((err) => console.warn('Fetch /api/auth/me error:', err))
      .finally(() => setLoadingUser(false));
  }, [router]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  // Determine what credential needs verification
  const hasVerifiedEmail = Boolean(currentUser?.email);
  const hasVerifiedPhone = Boolean(currentUser?.phone);

  // Mode: if user logged in via Google/Email, they need phone verification;
  // if logged in via Phone, they need email verification.
  const isPhoneVerificationNeeded = !hasVerifiedPhone || hasVerifiedEmail;
  const isEmailVerificationNeeded = hasVerifiedPhone && !hasVerifiedEmail;

  // Handle 6-digit OTP input
  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];

    if (clean.length > 1) {
      // Handle paste
      const pasted = clean.slice(0, 6).split('');
      pasted.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      const nextIdx = Math.min(pasted.length, 5);
      otpRefs.current[nextIdx]?.focus();
      return;
    }

    newDigits[index] = clean;
    setOtpDigits(newDigits);

    if (clean && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Step 1: Send OTP (SMS or Email)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);

      if (isPhoneVerificationNeeded) {
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        if (cleanPhone.length !== 10) {
          throw new Error('कृपया योग्य १०-अंकी भारतीय मोबाईल नंबर प्रविष्ट करा.');
        }

        // Send SMS OTP via OTP.dev with availability check
        const res = await fetch('/api/auth/send-sms-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone, checkAvailable: true }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'SMS OTP पाठवण्यात अडचण आली.');
        }

        setOtpStep('VERIFY_OTP');
        setResendTimer(60);
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      } else {
        // Email verification needed
        const normalizedEmail = email.toLowerCase().trim();
        if (!normalizedEmail.includes('@')) {
          throw new Error('कृपया वैध Gmail ईमेल आयडी प्रविष्ट करा.');
        }

        // Send Email OTP via Nodemailer with availability check
        const res = await fetch('/api/auth/send-email-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, checkAvailable: true }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'ईमेल OTP पाठवण्यात अडचण आली.');
        }

        setOtpStep('VERIFY_OTP');
        setResendTimer(60);
        setOtpDigits(['', '', '', '', '', '']);
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      }
    } catch (err: any) {
      setError(err.message || 'OTP पाठवताना त्रुटी आली.');
    } finally {
      setSubmitting(false);
    }
  };

  // Step 2: Verify OTP and complete profile
  const handleVerifyAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setError('कृपया ६-अंकी OTP कोड प्रविष्ट करा.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload: any = {
        name: name.trim() || session?.user?.name,
        inviteCode: inviteCode.trim().toUpperCase(),
      };

      if (isPhoneVerificationNeeded) {
        payload.phone = phone.replace(/\D/g, '').slice(-10);
        payload.smsOtp = otpCode;
      } else {
        payload.email = email.toLowerCase().trim();
        payload.emailOtp = otpCode;
      }

      const res = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'पडताळणी अयशस्वी झाली.');
      }

      confetti({
        particleCount: 100,
        spread: 75,
        origin: { y: 0.6 },
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'पडताळणी करताना त्रुटी आली. कृपया पुन्हा तपासा.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser || authStatus === 'loading') {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4 notranslate">
        <div className="text-center space-y-3">
          <Loader2 className="w-9 h-9 text-saffron-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-600">खाते माहिती लोड होत आहे...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-3 py-6 notranslate">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-saffron-200/90 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top saffron header bar */}
        <div className="h-3 bg-gradient-to-r from-saffron-500 via-amber-400 to-saffron-600" />

        <div className="p-5 sm:p-7">
          {/* Saffron Icon & Header */}
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-saffron-600 via-amber-500 to-saffron-500 flex items-center justify-center text-white shadow-lg shadow-saffron-500/25 mx-auto mb-3">
              <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
            </div>

            <div className="text-[11px] font-bold tracking-wider text-saffron-700 font-heading">
              ॥ श्री गणेश प्रसन्न ॥
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-heading mt-0.5">
              खाते पडताळणी व ऑनबोर्डिंग
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {mandalInfo?.name || 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.'}
            </p>
          </div>

          {/* Rule Reminder Banner */}
          <div className="mb-5 p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <b>सुरक्षा नियम (१ Gmail = १ मोबाईल):</b> मंडळाच्या सुरक्षिततेसाठी प्रत्येक खात्याला स्वतःचा मोबाईल नंबर आणि ईमेल आयडी जोडणे अनिवार्य आहे.
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="font-bold">
                अभिनंदन! आपले खाते यशस्वीरित्या पूर्ण व लिंक झाले आहे. डॅशबोर्ड उघडत आहे...
              </div>
            </div>
          )}

          {/* FORM: Step 1 - Enter Credentials */}
          {otpStep === 'DETAILS' && !success && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-saffron-600" />
                  <span>आपले पूर्ण नाव (Full Name)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. राहुल पाटील"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 text-xs sm:text-sm font-medium text-gray-900"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>Gmail ईमेल आयडी</span>
                  </span>
                  {hasVerifiedEmail && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                      ✓ Google सत्यापित
                    </span>
                  )}
                </label>
                <input
                  type="email"
                  required
                  readOnly={hasVerifiedEmail}
                  placeholder="उदा. rahul@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium ${
                    hasVerifiedEmail
                      ? 'bg-gray-100 text-gray-600 border-gray-200 cursor-not-allowed'
                      : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 text-gray-900'
                  }`}
                />
              </div>

              {/* Mobile Phone Field */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-saffron-600" />
                    <span>मोबाईल नंबर (SMS पडताळणी)</span>
                  </span>
                  {hasVerifiedPhone && (
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                      ✓ SMS सत्यापित
                    </span>
                  )}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-gray-500">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    readOnly={hasVerifiedPhone}
                    maxLength={10}
                    placeholder="९९२३० ९२३४०"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className={`w-full pl-11 pr-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-bold tracking-wider ${
                      hasVerifiedPhone
                        ? 'bg-gray-100 text-gray-600 border-gray-200 cursor-not-allowed'
                        : 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 text-gray-900'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  * हा नंबर आधी कोणत्याही इतर Gmail खात्याशी जोडलेला नसावा.
                </p>
              </div>

              {/* Mandal Invite Code */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-saffron-600" />
                  <span>मंडळाचा अधिकृत कोड (Mandal Code)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="NYB026"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full text-center uppercase tracking-widest font-mono font-bold text-sm px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 text-gray-900"
                />
              </div>

              {/* Submit / Send OTP Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-saffron-600 via-amber-500 to-saffron-600 hover:from-saffron-700 hover:to-amber-600 text-white font-black text-xs sm:text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>OTP पाठवत आहे...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {isPhoneVerificationNeeded
                        ? 'SMS द्वारे OTP मिळवा'
                        : 'Gmail वर OTP मिळवा'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORM: Step 2 - Verify OTP */}
          {otpStep === 'VERIFY_OTP' && !success && (
            <form onSubmit={handleVerifyAndComplete} className="space-y-4">
              <div className="text-center p-3 rounded-2xl bg-saffron-50/70 border border-saffron-200">
                <div className="text-xs text-gray-600">
                  {isPhoneVerificationNeeded ? (
                    <>
                      <b>+91 {phone}</b> वर SMS द्वारे ६-अंकी OTP पाठवला आहे.
                    </>
                  ) : (
                    <>
                      <b>{email}</b> वर ईमेल द्वारे ६-अंकी OTP पाठवला आहे.
                    </>
                  )}
                </div>
              </div>

              {/* 6-box OTP digits */}
              <div>
                <label className="block text-center text-xs font-bold text-gray-700 mb-2">
                  ६-अंकी पडताळणी कोड प्रविष्ट करा
                </label>
                <div className="flex items-center justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                      className="w-11 h-12 text-center text-lg font-black font-mono rounded-xl border-2 border-gray-300 focus:border-saffron-600 focus:bg-saffron-50/30 focus:outline-none transition-all text-gray-900"
                    />
                  ))}
                </div>
              </div>

              {/* Resend OTP Timer */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <span className="text-[11px] text-gray-500 font-medium">
                    पुन्हा OTP मागवण्यासाठी थांबण्याची वेळ:{' '}
                    <b>{toDevanagariDigits(resendTimer)} सेकंद</b>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={submitting}
                    className="inline-flex items-center gap-1 text-xs font-bold text-saffron-700 hover:text-saffron-800 underline cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>पुन्हा OTP पाठवा (Resend OTP)</span>
                  </button>
                )}
              </div>

              {/* Verify and Finish Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>सत्यापित करत आहे...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>सत्यापित करा व मंडळात प्रवेश करा</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setOtpStep('DETAILS')}
                className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-800 text-center"
              >
                ← माहिती बदला (Edit Details)
              </button>
            </form>
          )}

          {/* Bottom Sign Out / Switch Account */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>दुसऱ्या खात्याने लॉगिन करायचे आहे?</span>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('mandalbook_user');
                localStorage.removeItem('mandalbook_role');
                signOut({ callbackUrl: '/login' });
              }}
              className="inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-700 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>लॉगआउट करा</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
