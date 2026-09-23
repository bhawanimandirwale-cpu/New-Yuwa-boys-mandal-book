'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { ExpenseCategory, PaymentMode } from '@/lib/types';
import {
  X,
  Edit3,
  Tag,
  Banknote,
  QrCode,
  FileText,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
  Camera,
  UploadCloud,
  ImageIcon,
  Calendar,
  Building2,
} from 'lucide-react';

const CATEGORIES: { key: ExpenseCategory; label: string; icon: string }[] = [
  { key: 'MANDAP', label: 'मंडप', icon: '⛺' },
  { key: 'IDOL', label: 'मूर्ती', icon: '🪔' },
  { key: 'LIGHTING', label: 'रोषणाई', icon: '💡' },
  { key: 'SOUND_DJ', label: 'ध्वनी / डीजे', icon: '🔊' },
  { key: 'PRASAD', label: 'प्रसाद', icon: '🥥' },
  { key: 'IMMERSION', label: 'विसर्जन', icon: '🌊' },
  { key: 'LEGAL_PERMIT', label: 'परवानग्या', icon: '📜' },
  { key: 'MISC', label: 'इतर', icon: '📦' },
];

export function EditExpenseModal() {
  const { expenseToEdit, setExpenseToEdit, updateExpense, deleteExpense } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('MISC');
  const [amount, setAmount] = useState<string>('');
  const [paidTo, setPaidTo] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [dateStr, setDateStr] = useState('');
  const [billUrl, setBillUrl] = useState('');
  const [uploadingBill, setUploadingBill] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expenseToEdit) {
      setTitle(expenseToEdit.title || '');
      setCategory((expenseToEdit.category as ExpenseCategory) || 'MISC');
      setAmount(expenseToEdit.amount ? String(expenseToEdit.amount) : '');
      setPaidTo(expenseToEdit.paidTo || '');
      setPaidBy(expenseToEdit.paidBy || 'कृष्णा महाजन (खजिनदार)');
      setPaymentMode((expenseToEdit.paymentMode as PaymentMode) || 'CASH');
      const d = expenseToEdit.date ? new Date(expenseToEdit.date) : new Date();
      setDateStr(d.toISOString().slice(0, 10));
      setBillUrl(expenseToEdit.billUrl || '');
      setError(null);
    }
  }, [expenseToEdit]);

  if (!expenseToEdit) return null;

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1280;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Canvas compression failed'));
            },
            'image/jpeg',
            0.72
          );
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleCaptureFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBill(true);
      setError(null);
      const compressedBlob = await compressImage(file);
      const formData = new FormData();
      formData.append('file', compressedBlob, file.name || 'expense-bill.jpg');
      formData.append('folder', 'mandal-book/bills');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('बिल फोटो अपलोड करताना त्रुटी आली.');
      }

      const data = await res.json();
      setBillUrl(data.url);
    } catch (err: any) {
      console.error('Bill upload failed:', err);
      setError(err.message || 'फोटो अपलोड अयशस्वी.');
    } finally {
      setUploadingBill(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('कृपया खर्चाचा तपशील किंवा शीर्षक प्रविष्ट करा.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('कृपया योग्य खर्च रक्कम प्रविष्ट करा.');
      return;
    }
    if (!paidTo.trim()) {
      setError('कृपया कोणास दिले / पार्टी नाव प्रविष्ट करा.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await updateExpense(expenseToEdit.id, {
        title: title.trim(),
        category,
        amount: numAmount,
        paidTo: paidTo.trim(),
        paidBy: paidBy.trim(),
        paymentMode,
        date: dateStr ? new Date(dateStr) : new Date(),
        billUrl: billUrl.trim(),
      });
      setExpenseToEdit(null);
    } catch (err: any) {
      console.error('Failed to update expense:', err);
      setError(err.message || 'खर्च अपडेट करताना त्रुटी आली.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      `⚠️ खात्री करा: तुम्ही खर्च व्हाऊचर क्रमांक "${expenseToEdit.voucherNo}" (${expenseToEdit.title} - ₹${expenseToEdit.amount}) कायमचे हटवू इच्छिता का?\n\nही रक्कम मंडळाच्या ताळेबंदात पूर्ववत जमा होईल.`
    );
    if (!isConfirmed) return;

    try {
      setDeleting(true);
      setError(null);
      await deleteExpense(expenseToEdit.id);
      setExpenseToEdit(null);
    } catch (err: any) {
      console.error('Failed to delete expense:', err);
      setError(err.message || 'खर्च हटवताना त्रुटी आली.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-heading leading-tight">
                खर्च व्हाऊचर संपादन (Edit Expense)
              </h3>
              <p className="text-[11px] text-white/90 font-mono font-bold mt-0.5">
                व्हाऊचर क्र.: {expenseToEdit.voucherNo}
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpenseToEdit(null)}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="p-5 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              खर्चाचा तपशील / शीर्षक *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 font-medium"
              placeholder="उदा. मंडप स्टेज उभारणी काम"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">खर्चाची श्रेणी (Category)</label>
            <div className="grid grid-cols-4 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                    category === cat.key
                      ? 'bg-rose-50 border-rose-500 text-rose-800 font-bold shadow-sm'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="text-[10px] leading-tight truncate w-full">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-rose-600" />
                <span>खर्च रक्कम (₹) *</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  step="1"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-base font-black text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-600" />
                <span>खर्च दिनांक</span>
              </label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 bg-white"
              />
            </div>
          </div>

          {/* Paid To & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">कोणास दिले / पार्टी नाव *</label>
              <input
                type="text"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                placeholder="दुकान / पार्टीचे नाव"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">पेमेंट प्रकार</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['CASH', 'UPI', 'CHEQUE'] as PaymentMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                      paymentMode === mode
                        ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{mode === 'CASH' ? 'रोख' : mode === 'UPI' ? 'UPI' : 'धनादेश'}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bill Photo Upload / Preview */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">बिल / पावती फोटो</label>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCaptureFile}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleCaptureFile}
              className="hidden"
            />

            {billUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 p-2 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={billUrl} alt="Expense Bill" className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-800 text-xs truncate">बिल जोडलेले आहे</div>
                  <button
                    type="button"
                    onClick={() => setBillUrl('')}
                    className="text-red-600 hover:text-red-700 text-[11px] font-bold mt-1 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>फोटो काढा</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={uploadingBill}
                  className="p-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-rose-400 bg-gray-50 hover:bg-rose-50/50 flex items-center justify-center gap-2 text-gray-700 font-bold text-xs transition-colors"
                >
                  {uploadingBill ? <Loader2 className="w-4 h-4 animate-spin text-rose-600" /> : <Camera className="w-4 h-4 text-rose-600" />}
                  <span>कॅमेराने फोटो काढा</span>
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploadingBill}
                  className="p-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-rose-400 bg-gray-50 hover:bg-rose-50/50 flex items-center justify-center gap-2 text-gray-700 font-bold text-xs transition-colors"
                >
                  {uploadingBill ? <Loader2 className="w-4 h-4 animate-spin text-rose-600" /> : <UploadCloud className="w-4 h-4 text-rose-600" />}
                  <span>गॅलरीमधून निवडा</span>
                </button>
              </div>
            )}
          </div>

          {/* Modal Actions Footer */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span>हटवा (Delete)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExpenseToEdit(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                disabled={saving || deleting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white font-black text-xs shadow-md hover:from-rose-700 hover:to-amber-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>बदल सेव्ह करा</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
