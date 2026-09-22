'use client';

import React, { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  RotateCw, 
  CheckCircle2, 
  Loader2,
  ShieldCheck 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'कृपया योग्य ईमेल आयडी प्रविष्ट करा.' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'OTP पाठवण्यात अडचण आली.');
      }

      setStep('OTP');
      setResendTimer(60);
      setMessage({ type: 'success', text: data.message || 'OTP पाठवला गेला आहे.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'सर्व्हर त्रुटी आली.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setMessage({ type: 'error', text: 'कृपया ६-अंकी OTP प्रविष्ट करा.' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'अवैध OTP.');
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Save user session in localStorage
      localStorage.setItem('mandalbook_user', JSON.stringify(data.user));
      localStorage.setItem('mandalbook_role', data.user.role);

      router.push('/');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'सत्यापन अयशस्वी झाले.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-3 py-6 notranslate">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-saffron-200 overflow-hidden relative">
        {/* Festive Header Ribbon */}
        <div className="h-3 bg-gradient-to-r from-saffron-500 via-amber-400 to-saffron-600" />

        <div className="p-6 sm:p-8">
          {/* Logo & Title */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-saffron-600 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-saffron-500/25 mx-auto mb-3">
              <Sparkles className="w-7 h-7 fill-white" />
            </div>
            <div className="text-xs font-bold tracking-widest text-saffron-700 font-heading">
              ॥ श्री गणेश प्रसन्न ॥
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-heading mt-0.5">
              New Yuwa Boys Mandal Book
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              न्यू युवा गणेश मंडळ, केऱ्हाळे बु. डिजिटल बहीखाता
            </p>
          </div>

          {/* Alert Message */}
          {message && (
            <div
              className={`p-3 rounded-xl mb-4 text-xs font-medium flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Step 1: Email Form */}
          {step === 'EMAIL' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-saffron-600" />
                  <span>आपला ईमेल आयडी (Gmail)</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="उदा. name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 transition-all font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-extrabold text-sm shadow-md shadow-saffron-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>OTP पाठवला जात आहे...</span>
                  </>
                ) : (
                  <>
                    <span>Gmail ने ६-अंकी OTP मिळवा</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-gray-400 font-medium">किंवा</span>
                </div>
              </div>

              {/* Google 1-Click Sign-in */}
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="w-full py-3 px-4 rounded-2xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center justify-center gap-2.5 shadow-sm transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            </form>
          ) : (
            /* Step 2: OTP Verification Form */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-2xl text-xs text-saffron-900">
                <span>
                  <b>{email}</b> या ईमेलवर पाठवलेला ६-अंकी OTP टाका.
                </span>
                <button
                  type="button"
                  onClick={() => setStep('EMAIL')}
                  className="ml-2 underline font-bold text-saffron-700"
                >
                  बदला
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-saffron-600" />
                  <span>६-अंकी OTP कोड *</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[12px] font-mono text-2xl font-black px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 transition-all text-saffron-700"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>पडताळणी चालू आहे...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>सत्यापित करा व पुढे जा</span>
                  </>
                )}
              </button>

              {/* Resend Timer */}
              <div className="text-center pt-2">
                {resendTimer > 0 ? (
                  <span className="text-xs text-gray-400">
                    पुन्हा OTP मागवण्यासाठी थांब: <b>{resendTimer} सेकंद</b>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs font-bold text-saffron-600 hover:text-saffron-700 flex items-center justify-center gap-1 mx-auto"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>पुन्हा OTP पाठवा</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
