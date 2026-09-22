'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { 
  AlertTriangle, 
  X, 
  Trash2, 
  ShieldCheck, 
  Loader2, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function ResetAccountsModal() {
  const { 
    isResetAccountsOpen, 
    setIsResetAccountsOpen, 
    currentRole, 
    mandal, 
    refresh 
  } = useApp();

  const [confirmInput, setConfirmInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isResetAccountsOpen) return null;

  // Only President / Admin can execute
  const isAuthorized = currentRole === 'ADMIN';

  const handleClose = () => {
    if (submitting) return;
    setConfirmInput('');
    setError(null);
    setSuccessMsg(null);
    setIsResetAccountsOpen(false);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmInput.trim() !== 'RESET') {
      setError('कृपया पुष्टीकरणासाठी "RESET" असा शब्द टाईप करा.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch('/api/mandal/reset-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmWord: 'RESET' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'हिशोब रिसेट करताना त्रुटी आली.');
      }

      // Haptic feedback
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 100]);
        } catch (vErr) {}
      }

      // Refresh AppContext so all balances, lists, and stats drop to 0
      await refresh();

      setSuccessMsg(data.message || 'हिशोब यशस्वीरित्या शून्यापासून सुरू करण्यात आला आहे.');

      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err: any) {
      console.error('Reset accounts error:', err);
      setError(err?.message || 'हिशोब रिसेट करताना अडचण आली.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 notranslate font-body">
      <div 
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-rose-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200"
      >
        {/* Top Danger Bar */}
        <div className="h-2.5 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 flex items-start justify-between border-b border-gray-100 bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-sm border border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 font-heading">
                हिशोब शून्यापासून सुरू करा (Reset Accounts)
              </h3>
              <p className="text-[11px] font-bold text-rose-600">
                🚩 फक्त मंडळाच्या अध्यक्षांसाठी राखीव अधिकार (President Only)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="w-8 h-8 rounded-full bg-white hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {successMsg ? (
            <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-base font-black font-heading text-emerald-900">
                हिशोब यशस्वीरित्या रीसेट झाला!
              </h4>
              <p className="text-xs leading-relaxed">{successMsg}</p>
            </div>
          ) : !isAuthorized ? (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-center space-y-2">
              <p className="font-bold">आपल्याकडे हा हिशोब रिसेट करण्याचे अधिकार नाहीत.</p>
              <p className="text-[11px] text-rose-600">
                फक्त मंडळाचे अध्यक्ष <b>पार्थ पाटील</b> हा बदल करू शकतात.
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              {/* Detailed Explanation */}
              <div className="p-3.5 bg-rose-50/80 rounded-2xl border border-rose-200 text-rose-900 space-y-2 leading-relaxed">
                <div className="font-black text-xs flex items-center gap-1.5 text-rose-700">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>सावधान: हा बदल कायमस्वरूपी (Permanent) आहे!</span>
                </div>
                <p className="text-[11px] text-gray-700">
                  नवीन उत्सव किंवा वर्षासाठी हिशोब पूर्णपणे नवीन सुरू करण्यासाठी खालील डेटा पूर्ण नष्ट केला जाईल:
                </p>

                <ul className="space-y-1.5 pl-2 text-[11px] text-gray-700">
                  <li className="flex items-center gap-2 text-rose-700 font-semibold">
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span>सर्व चालू वर्गणी पावत्या व जमा नोंदी कायमच्या डिलीट होतील</span>
                  </li>
                  <li className="flex items-center gap-2 text-rose-700 font-semibold">
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span>सर्व खर्च व्हाऊचर्स व बिले कायमची डिलीट होतील</span>
                  </li>
                  <li className="flex items-center gap-2 text-rose-700 font-semibold">
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                    <span>हातातील रोख शिल्लक (Cash) आणि बँक बॅलन्स शून्य (₹०) होईल</span>
                  </li>
                </ul>
              </div>

              {/* What is Protected Box */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-1 text-[11px]">
                <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>काय सुरक्षित राहील?</span>
                </div>
                <p className="text-gray-600">
                  मंडळाचे नाव, नोंदणी, अधिकृत पदाधिकारी (<b>पार्थ पाटील</b>, <b>कुश पाटील</b>, <b>कृष्णा महाजन</b>), सर्व कार्यकर्ते व सरकारी परवानग्या सुरक्षित राहतील.
                </p>
              </div>

              {/* Type to Confirm Input */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-gray-700">
                  पुष्टी करण्यासाठी खालील बॉक्समध्ये <span className="text-rose-600 font-mono font-extrabold tracking-wider bg-rose-100 px-1.5 py-0.5 rounded">RESET</span> असा शब्द टाईप करा:
                </label>
                <input
                  type="text"
                  required
                  placeholder="RESET"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-500/20 focus:border-rose-600 text-center font-mono text-base font-black tracking-widest text-rose-700 transition-all uppercase"
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-xl bg-rose-100 text-rose-900 font-bold text-xs">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl border border-gray-300 font-bold text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  रद्द करा
                </button>

                <button
                  type="submit"
                  disabled={submitting || confirmInput.trim() !== 'RESET'}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>रीसेट होत आहे...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>होय, सर्व हिशोब रिसेट करा</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
