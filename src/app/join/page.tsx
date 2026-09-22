'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Sparkles, ShieldCheck, KeyRound, MessageCircle, LogOut, ArrowRight, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

function JoinContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: authStatus } = useSession();

  const [inviteCode, setInviteCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isPendingParam = searchParams.get('pending') === 'true';

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  const handleVerifyAndEnter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setError('कृपया मंडळ कोड प्रविष्ट करा.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/mandal/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviteCode: inviteCode.trim().toUpperCase(),
          name: name.trim() || session?.user?.name,
          phone: phone.trim(),
          userEmail: session?.user?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'मंडळ कोड पडताळणी अयशस्वी.');
      }

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'काहीतरी त्रुटी आली. पुन्हा प्रयत्न करा.');
    } finally {
      setLoading(false);
    }
  };

  const helpline = '7499085045';
  const whatsappMsg = encodeURIComponent(
    `॥ श्री गणेश प्रसन्न ॥\n\nनमस्कार अध्यक्ष महोदय (श्री. निलेश पाटील),\nमला 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.' च्या डिजिटल बहीखात्यामध्ये सामील होण्यासाठी मंडळ प्रवेश कोड / मंजुरी हवी आहे.\n\nमाझे नाव: ${session?.user?.name || ''}\nईमेल: ${session?.user?.email || ''}`
  );

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 notranslate">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-saffron-200 overflow-hidden">
        {/* Top saffron decorative bar */}
        <div className="h-3 bg-gradient-to-r from-saffron-500 via-amber-400 to-saffron-600" />

        <div className="p-6 sm:p-8 text-center">
          {/* Saffron Icon Badge */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-saffron-600 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-saffron-500/25 mx-auto mb-4">
            <KeyRound className="w-8 h-8" />
          </div>

          <div className="text-xs font-bold tracking-widest text-saffron-700 font-heading">
            ॥ श्री गणेश प्रसन्न ॥
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-heading mt-1">
            न्यू युवा गणेश मंडळ, केऱ्हाळे बु.
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            डिजिटल बहीखाता मंडळ प्रवेश पडताळणी
          </p>

          {/* Pending Alert banner if redirected */}
          {isPendingParam && !success && (
            <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-left flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-amber-900">
                  प्रवेश मंजुरी आवश्यक (Access Required)
                </div>
                <div className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                  मंडळात प्रवेश करण्यासाठी अधिकृत <strong>मंडळ कोड</strong> आवश्यक आहे किंवा <strong>अध्यक्षांची (Adhyaksh)</strong> पूर्व-परवानगी आवश्यक आहे.
                </div>
              </div>
            </div>
          )}

          {/* Logged in User Badge */}
          {session?.user && (
            <div className="mt-4 p-3 bg-gray-50 rounded-2xl border border-gray-200 text-left flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] text-gray-400 font-bold uppercase">लॉगिन खाते</div>
                <div className="text-xs font-extrabold text-gray-900 truncate">
                  {session.user.name || 'युझर'}
                </div>
                <div className="text-[11px] text-gray-500 truncate">
                  {session.user.email}
                </div>
              </div>
              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-lg shrink-0">
                मंजुरी बाकी
              </span>
            </div>
          )}

          {success ? (
            <div className="mt-6 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2.5">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h2 className="text-base font-black text-emerald-900 font-heading">
                अभिनंदन! मंडळात प्रवेश मिळाला आहे!
              </h2>
              <p className="text-xs text-emerald-700">
                मुख्य डॅशबोर्ड उघडत आहे, कृपया प्रतीक्षा करा...
              </p>
              <div className="flex justify-center pt-2">
                <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerifyAndEnter} className="mt-5 space-y-4 text-left">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">
                  {error}
                </div>
              )}

              {/* Mandal Code Input */}
              <div>
                <label className="block text-xs font-extrabold text-gray-700 mb-1">
                  अधिकृत मंडळ कोड (Mandal Code) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="उदा. NYB026"
                    className="w-full px-4 py-3 rounded-xl border-2 border-saffron-300 focus:border-saffron-500 focus:outline-none focus:ring-4 focus:ring-saffron-500/20 text-sm font-mono tracking-widest font-black uppercase text-gray-900 text-center placeholder:font-sans placeholder:tracking-normal placeholder:font-normal"
                  />
                  <KeyRound className="w-4 h-4 text-saffron-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 text-center">
                  मंडळाच्या व्हॉट्सॲप ग्रुपमधील किंवा अध्यक्षांनी दिलेला ६-अंकी कोड टाका
                </p>
              </div>

              {!session?.user && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      आपले पूर्ण नाव *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="उदा. राहुल पाटील"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-saffron-500/30 text-xs text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      WhatsApp मोबाईल नंबर
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="उदा. ९८२३XXXXXX"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-saffron-500/30 text-xs text-gray-900"
                    />
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-saffron-600 via-amber-500 to-saffron-700 hover:from-saffron-700 hover:to-saffron-800 text-white font-black text-sm shadow-lg shadow-saffron-500/30 hover:shadow-saffron-500/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>पडताळणी होत आहे...</span>
                  </>
                ) : (
                  <>
                    <span>मंडळात प्रवेश करा</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Helper section: WhatsApp Request to Adhyaksh */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-left space-y-3">
            <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-saffron-600" />
              <span>मंडळ कोड नाही का? अध्यक्षांची मंजुरी मिळवा</span>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              मंडळाचे अध्यक्ष <strong>श्री. निलेश पाटील</strong> (bhawanimandirwale@gmail.com) यांच्याकडून मंडळ कोड किंवा प्रवेश मंजुरी मिळवण्यासाठी खालील बटनावर क्लिक करा:
            </p>

            <a
              href={`https://wa.me/91${helpline}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>अध्यक्षांशी WhatsApp वर संपर्क साधा</span>
            </a>

            {session?.user && (
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full py-2 px-3 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 font-bold text-xs flex items-center justify-center gap-2 transition-all mt-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>दुसऱ्या खात्याने लॉगिन करा (बाहेर पडा)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center text-saffron-600">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}
