'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building, 
  Key, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Loader2 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OnboardingPage() {
  const router = useRouter();

  const [mode, setMode] = useState<'JOIN' | 'CREATE'>('JOIN');
  const [inviteCode, setInviteCode] = useState('');
  const [mandalName, setMandalName] = useState('');
  const [city, setCity] = useState('');
  const [upiId, setUpiId] = useState('9923092340@ybl');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/mandal/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCode.trim().toUpperCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'अवैध आमंत्रण कोड.');
      }

      confetti({ particleCount: 70, spread: 60 });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'सामील होता आले नाही.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mandalName.trim()) return;

    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/mandal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: mandalName.trim(),
          city: city.trim() || 'केऱ्हाळे बु.',
          upiId: upiId.trim() || '9923092340@ybl',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'मंडळ तयार करता आले नाही.');
      }

      confetti({ particleCount: 90, spread: 80 });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-3 py-6 notranslate">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-saffron-200 overflow-hidden">
        <div className="h-3 bg-gradient-to-r from-saffron-500 via-amber-400 to-saffron-600" />

        <div className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-heading">
              मंडळ ऑनबोर्डिंग (Mandal Onboarding)
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              आपल्या मंडळाशी जोडून घ्या किंवा नवीन मंडळ तयार करा
            </p>
          </div>

          {/* Toggle between Join and Create */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 rounded-2xl mb-6">
            <button
              onClick={() => setMode('JOIN')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'JOIN'
                  ? 'bg-white text-saffron-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              मंडळात सामील व्हा (Join)
            </button>
            <button
              onClick={() => setMode('CREATE')}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                mode === 'CREATE'
                  ? 'bg-white text-saffron-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              नवीन मंडळ तयार करा (Create)
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs mb-4">
              {error}
            </div>
          )}

          {mode === 'JOIN' ? (
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-saffron-600" />
                  <span>मंडळाचा आमंत्रण कोड (Invite Code)</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. NYB026"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full text-center uppercase tracking-[6px] font-mono text-xl font-bold px-4 py-3 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 transition-all text-gray-900"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  * हा कोड आपल्या मंडळाच्या अध्यक्षांकडून किंवा खजिनदारांकडून प्राप्त करा (उदा. <b>NYB026</b>).
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-extrabold text-sm shadow-md shadow-saffron-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>मंडळात सामील व्हा</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  मंडळाचे अधिकृत नाव *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. न्यू युवा गणेश मंडळ, केऱ्हाळे बु."
                  value={mandalName}
                  onChange={(e) => setMandalName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 text-xs focus:ring-2 focus:ring-saffron-500/30 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    गाव / शहर
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. केऱ्हाळे बु."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. 9923092340@ybl"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-300 text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>नवीन मंडळ तयार करा</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
