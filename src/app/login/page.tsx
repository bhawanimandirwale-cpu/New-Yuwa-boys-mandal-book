'use client';

import React, { useState, useEffect, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Smartphone, 
  Mail, 
  ArrowRight, 
  RotateCw, 
  CheckCircle2, 
  Loader2,
  ShieldCheck,
  Check,
  Lock,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toDevanagariDigits } from '@/lib/formatters';

export const dynamic = 'force-dynamic';

type AuthTab = 'PHONE' | 'GOOGLE' | 'EMAIL';

export default function LoginPage() {
  const router = useRouter();

  // Active Tab: PHONE is default per specification
  const [activeTab, setActiveTab] = useState<AuthTab>('PHONE');

  // Phone Auth State (Server-Side SMS via OTP.dev)
  const [phone, setPhone] = useState('');
  const [phoneStep, setPhoneStep] = useState<'INPUT' | 'OTP'>('INPUT');
  const [phoneOtp, setPhoneOtp] = useState<string[]>(['', '', '', '', '', '']);

  // Email Auth State
  const [email, setEmail] = useState('');
  const [emailStep, setEmailStep] = useState<'INPUT' | 'OTP'>('INPUT');
  const [emailOtp, setEmailOtp] = useState<string[]>(['', '', '', '', '', '']);

  // Shared UX State
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Refs for 6-box OTP inputs
  const phoneInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 60-Second Cooldown Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Clear messages on tab change
  const handleTabSwitch = (tab: AuthTab) => {
    setActiveTab(tab);
    setMessage(null);
  };

  // Helper to get redirect URL
  const getCallbackUrl = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('callbackUrl') || '/';
    }
    return '/';
  };

  // ==========================================
  // 1. PHONE SMS OTP HANDLERS (OTP.dev Gateway)
  // ==========================================
  const handleSendPhoneOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setMessage({ type: 'error', text: 'कृपया योग्य १०-अंकी भारतीय मोबाईल नंबर प्रविष्ट करा.' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch('/api/auth/send-sms-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'SMS पाठवण्यात अडचण आली.');
      }

      setPhoneStep('OTP');
      setResendTimer(60);
      setPhoneOtp(['', '', '', '', '', '']);
      setMessage({
        type: 'success',
        text: `+91 ${cleanPhone} वर SMS द्वारे ६-अंकी OTP पाठवला आहे.`,
      });

      // Auto-focus first digit box
      setTimeout(() => {
        phoneInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      console.error('OTP.dev Send Error:', err);
      setMessage({ type: 'error', text: err.message || 'OTP पाठवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpCode = phoneOtp.join('');
    if (otpCode.length !== 6) {
      setMessage({ type: 'error', text: 'कृपया ६-अंकी SMS OTP टाका.' });
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');

    try {
      setLoading(true);
      setMessage(null);

      // 1. Verify SMS OTP via server API
      const verifyRes = await fetch('/api/auth/verify-sms-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp: otpCode }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'अवैध किंवा कालबाह्य झालेला OTP.');
      }

      // 2. Authorize NextAuth session via phone-otp provider
      const result = await signIn('phone-otp', {
        phone: cleanPhone,
        otp: otpCode,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('लॉगिन सत्र तयार करताना त्रुटी आली.');
      }

      // Success celebration
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
      });

      // Save client info for instant offline access
      const userObj = {
        phone: verifyData.user?.phone || `+91${cleanPhone}`,
        name: verifyData.user?.name || 'मंडळ कार्यकर्ता',
        role: verifyData.user?.role || 'VOLUNTEER',
      };
      localStorage.setItem('mandalbook_user', JSON.stringify(userObj));
      localStorage.setItem('mandalbook_role', userObj.role);

      const target = getCallbackUrl();
      router.push(target);
      router.refresh();
    } catch (err: any) {
      console.error('Verify Phone OTP error:', err);
      setMessage({ type: 'error', text: err.message || 'चुकीचा OTP कोड टाकला आहे. कृपया पुन्हा तपासा.' });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 2. EMAIL OTP HANDLERS (Nodemailer)
  // ==========================================
  const handleSendEmailOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'कृपया योग्य ईमेल आयडी प्रविष्ट करा.' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      const res = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'OTP पाठवण्यात अडचण आली.');
      }

      setEmailStep('OTP');
      setResendTimer(60);
      setEmailOtp(['', '', '', '', '', '']);
      setMessage({ type: 'success', text: data.message || 'आपल्या ईमेलवर ६-अंकी OTP पाठवला आहे.' });

      setTimeout(() => {
        emailInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'सर्व्हर त्रुटी आली.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpCode = emailOtp.join('');
    if (otpCode.length !== 6) {
      setMessage({ type: 'error', text: 'कृपया ६-अंकी ईमेल OTP प्रविष्ट करा.' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const result = await signIn('credentials', {
        email,
        otp: otpCode,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('अवैध किंवा कालबाह्य झालेला OTP. कृपया पुन्हा प्रयत्न करा.');
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      const userObj = { email, name: email.split('@')[0], role: 'VOLUNTEER' };
      localStorage.setItem('mandalbook_user', JSON.stringify(userObj));
      localStorage.setItem('mandalbook_role', 'VOLUNTEER');

      const target = getCallbackUrl();
      router.push(target);
      router.refresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'सत्यापन अयशस्वी झाले.' });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // OTP 6-BOX DIGIT INPUT HANDLERS
  // ==========================================
  const handleDigitChange = (
    index: number,
    value: string,
    mode: 'PHONE' | 'EMAIL'
  ) => {
    const isPhone = mode === 'PHONE';
    const otpArray = isPhone ? [...phoneOtp] : [...emailOtp];
    const setOtpArray = isPhone ? setPhoneOtp : setEmailOtp;
    const inputRefs = isPhone ? phoneInputRefs : emailInputRefs;

    // Handle paste of complete 6-digit OTP
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const nextArray = ['', '', '', '', '', ''];
        for (let i = 0; i < pasted.length; i++) {
          nextArray[i] = pasted[i];
        }
        setOtpArray(nextArray);
        const nextFocus = Math.min(pasted.length, 5);
        inputRefs.current[nextFocus]?.focus();

        if (pasted.length === 6) {
          setTimeout(() => {
            if (isPhone) handleVerifyPhoneOtp();
            else handleVerifyEmailOtp();
          }, 200);
        }
      }
      return;
    }

    const singleDigit = value.replace(/\D/g, '').slice(-1);
    otpArray[index] = singleDigit;
    setOtpArray(otpArray);

    // Auto-advance to next input
    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (singleDigit && index === 5) {
      const fullCode = otpArray.join('');
      if (fullCode.length === 6) {
        setTimeout(() => {
          if (isPhone) handleVerifyPhoneOtp();
          else handleVerifyEmailOtp();
        }, 150);
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    mode: 'PHONE' | 'EMAIL'
  ) => {
    const isPhone = mode === 'PHONE';
    const otpArray = isPhone ? phoneOtp : emailOtp;
    const inputRefs = isPhone ? phoneInputRefs : emailInputRefs;

    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-3 py-6 notranslate font-body">
      {/* Invisible Firebase Recaptcha Anchor */}
      <div id="recaptcha-container" className="hidden" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-saffron-200 overflow-hidden relative">
        {/* Festive Header Ribbon */}
        <div className="h-3 bg-gradient-to-r from-saffron-500 via-amber-400 to-saffron-600" />

        <div className="p-5 sm:p-7">
          {/* Header & Logo */}
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-saffron-600 via-amber-500 to-saffron-500 flex items-center justify-center text-white shadow-lg shadow-saffron-500/25 mx-auto mb-2.5">
              <Sparkles className="w-7 h-7 fill-white" />
            </div>
            <div className="text-xs font-black tracking-widest text-saffron-700 font-heading uppercase">
              ॥ श्री गणेश प्रसन्न ॥
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-heading mt-0.5">
              MandalBook
            </h1>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              मंडळाचा हिशोब, सोपा आणि पारदर्शक
            </p>
          </div>

          {/* 3 Authentic Tab Options */}
          <div className="grid grid-cols-3 gap-1 bg-orange-50/80 p-1 rounded-2xl border border-orange-200 mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleTabSwitch('PHONE')}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'PHONE'
                  ? 'bg-white text-saffron-800 shadow-sm border border-orange-200/80'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-saffron-600" />
                <span className="text-[11px]">मोबाईल OTP</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.2 bg-saffron-100 text-saffron-800 rounded-full font-bold">
                शिफारस
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('GOOGLE')}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'GOOGLE'
                  ? 'bg-white text-gray-900 shadow-sm border border-orange-200/80'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span className="text-[11px]">Google</span>
              </div>
              <span className="text-[9px] text-gray-400">१-क्लिक</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch('EMAIL')}
              className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'EMAIL'
                  ? 'bg-white text-saffron-800 shadow-sm border border-orange-200/80'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px]">Gmail OTP</span>
              </div>
              <span className="text-[9px] text-gray-400">पर्यायी</span>
            </button>
          </div>

          {/* Feedback Alert */}
          {message && (
            <div
              className={`p-3 rounded-2xl mb-4 text-xs font-semibold flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 1: मोबाईल नंबरने लॉगिन (PRIMARY - Firebase SMS) */}
          {/* ==================================================== */}
          {activeTab === 'PHONE' && (
            <div>
              {phoneStep === 'INPUT' ? (
                <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-saffron-600" />
                        <span>मोबाईल नंबर (१० अंकी)</span>
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">मोफत SMS OTP</span>
                    </label>

                    {/* Indian Flag +91 Prefix Input */}
                    <div className="relative flex items-center">
                      <div className="absolute left-3.5 flex items-center gap-1.5 pointer-events-none select-none border-r border-gray-300 pr-2.5">
                        <span className="text-base leading-none">🇮🇳</span>
                        <span className="text-xs font-black text-gray-700">+91</span>
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        required
                        maxLength={10}
                        placeholder="९८२३० ९२३४०"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full pl-24 pr-4 py-3 rounded-2xl border-2 border-gray-200 text-base font-mono font-bold tracking-wider text-gray-900 focus:outline-none focus:border-saffron-500 focus:ring-4 focus:ring-saffron-500/15 transition-all placeholder:text-gray-300 placeholder:font-normal"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phone.length !== 10}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-saffron-500 via-saffron-600 to-amber-600 hover:from-saffron-600 hover:to-amber-700 text-white font-extrabold text-sm shadow-md shadow-saffron-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>SMS OTP पाठवला जात आहे...</span>
                      </>
                    ) : (
                      <>
                        <span>SMS OTP मिळवा</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: 6-Box Individual Phone OTP */
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                  <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-2xl text-xs text-saffron-950 flex items-center justify-between">
                    <div>
                      <span className="text-gray-500 block text-[10px]">OTP पाठवलेला नंबर:</span>
                      <span className="font-mono font-bold text-gray-900">+91 {phone}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPhoneStep('INPUT')}
                      className="text-xs font-bold text-saffron-700 hover:underline"
                    >
                      नंबर बदला
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 text-center">
                      एसएमएसवर आलेला ६-अंकी OTP टाका
                    </label>

                    {/* 6 Individual Digit Boxes */}
                    <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                      {phoneOtp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            phoneInputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handleDigitChange(index, e.target.value, 'PHONE')}
                          onKeyDown={(e) => handleKeyDown(index, e, 'PHONE')}
                          className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-black text-saffron-800 bg-white border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-saffron-600 focus:ring-4 focus:ring-saffron-500/20 transition-all shadow-sm"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phoneOtp.join('').length !== 6}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>सत्यापित होत आहे...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>सत्यापित करा व डॅशबोर्ड उघडा</span>
                      </>
                    )}
                  </button>

                  {/* 60s Resend Cooldown Countdown */}
                  <div className="text-center pt-1">
                    {resendTimer > 0 ? (
                      <span className="text-xs text-gray-400">
                        पुन्हा OTP पाठवा (<b>{toDevanagariDigits(resendTimer)} सेकंद</b>)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        className="text-xs font-bold text-saffron-700 hover:text-saffron-800 flex items-center justify-center gap-1.5 mx-auto transition-colors"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>पुन्हा SMS OTP पाठवा</span>
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: GOOGLE 1-CLICK AUTH                           */}
          {/* ==================================================== */}
          {activeTab === 'GOOGLE' && (
            <div className="space-y-4 py-2">
              <div className="text-center text-xs text-gray-500 leading-relaxed mb-3">
                आपल्या अधिकृत Google खात्याद्वारे एका क्लिकमध्ये सुरक्षितपणे लॉगिन करा.
              </div>

              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: getCallbackUrl() })}
                className="w-full py-3.5 px-4 rounded-2xl border-2 border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-800 font-extrabold text-sm flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Google ने त्वरित लॉगिन करा</span>
              </button>

              <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 text-[11px] text-gray-500 text-center">
                अध्यक्ष ईमेल: <b>bhawanimandirwale@gmail.com</b>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: GMAIL EMAIL OTP AUTH                          */}
          {/* ==================================================== */}
          {activeTab === 'EMAIL' && (
            <div>
              {emailStep === 'INPUT' ? (
                <form onSubmit={handleSendEmailOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span>ईमेल आयडी (Gmail)</span>
                      </span>
                      <span className="text-[10px] text-gray-400">Nodemailer OTP</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="उदा. karyakarta@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 text-sm font-medium text-gray-900 focus:outline-none focus:border-saffron-500 focus:ring-4 focus:ring-saffron-500/15 transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email.includes('@')}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>ईमेल पाठवला जात आहे...</span>
                      </>
                    ) : (
                      <>
                        <span>Gmail ने ६-अंकी OTP मिळवा</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: 6-Box Individual Email OTP */
                <form onSubmit={handleVerifyEmailOtp} className="space-y-4">
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-950 flex items-center justify-between">
                    <div>
                      <span className="text-gray-500 block text-[10px]">OTP पाठवलेला ईमेल:</span>
                      <span className="font-semibold text-gray-900 truncate max-w-[200px] block">{email}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEmailStep('INPUT')}
                      className="text-xs font-bold text-blue-700 hover:underline"
                    >
                      ईमेल बदला
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 text-center">
                      ईमेलवर आलेला ६-अंकी OTP टाका
                    </label>

                    {/* 6 Individual Digit Boxes */}
                    <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                      {emailOtp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            emailInputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={digit}
                          onChange={(e) => handleDigitChange(index, e.target.value, 'EMAIL')}
                          onKeyDown={(e) => handleKeyDown(index, e, 'EMAIL')}
                          className="w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-black text-blue-900 bg-white border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-sm"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || emailOtp.join('').length !== 6}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>सत्यापित होत आहे...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>सत्यापित करा व पुढे जा</span>
                      </>
                    )}
                  </button>

                  <div className="text-center pt-1">
                    {resendTimer > 0 ? (
                      <span className="text-xs text-gray-400">
                        पुन्हा OTP पाठवा (<b>{toDevanagariDigits(resendTimer)} सेकंद</b>)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center justify-center gap-1.5 mx-auto transition-colors"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>पुन्हा ईमेल OTP पाठवा</span>
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Secure Footer Badge */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-3 text-[11px] font-semibold text-gray-400">
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>सुरक्षित</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>१००% मोफत</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-saffron-600" />
              <span>डेटा सुरक्षित</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
