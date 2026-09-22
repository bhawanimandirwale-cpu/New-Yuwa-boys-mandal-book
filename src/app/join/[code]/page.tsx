'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sparkles, Users, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function JoinMandalPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params?.code as string) || 'NYB026';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          role: 'VOLUNTEER',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'सामील होताना त्रुटी आली.');

      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });

      setJoined(true);
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-3 py-6 notranslate">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-saffron-200 overflow-hidden">
        <div className="h-3 bg-gradient-to-r from-saffron-500 via-amber-400 to-saffron-600" />

        <div className="p-6 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-saffron-600 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-saffron-500/25 mx-auto mb-3">
            <Sparkles className="w-7 h-7 fill-white" />
          </div>

          <div className="text-xs font-bold tracking-widest text-saffron-700 font-heading">
            ॥ श्री गणेश प्रसन्न ॥
          </div>
          <h1 className="text-xl font-black text-gray-900 font-heading mt-1">
            न्यू युवा गणेश मंडळ, केऱ्हाळे बु.
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            कार्यकर्ता अधिकृत डिजिटल बहीखाता आमंत्रण
          </p>

          <div className="mt-4 p-3 bg-saffron-50/70 border border-saffron-200 rounded-2xl text-xs font-bold text-saffron-900">
            आमंत्रण कोड: <span className="font-mono text-saffron-800 tracking-wider font-extrabold">{code}</span>
          </div>

          {joined ? (
            <div className="mt-6 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h2 className="text-base font-extrabold text-emerald-800">
                अभिनंदन! तुम्ही मंडळात सामील झाला आहात!
              </h2>
              <p className="text-xs text-emerald-700">
                लॉगिन पानाकडे रीडायरेक्ट केले जात आहे...
              </p>
            </div>
          ) : (
            <form onSubmit={handleJoin} className="mt-5 space-y-3.5 text-left">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  आपले पूर्ण नाव (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. राहुल दीपक शिंदे"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  WhatsApp मोबाईल नंबर *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="उदा. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ईमेल आयडी (Gmail)
                </label>
                <input
                  type="email"
                  placeholder="उदा. name@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-saffron-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>सामील होत आहे...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>कार्यकर्ता म्हणून सामील व्हा</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
