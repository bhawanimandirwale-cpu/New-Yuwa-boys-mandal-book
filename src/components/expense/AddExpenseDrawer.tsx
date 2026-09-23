'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { ExpenseCategory } from '@/lib/types';
import { toDevanagariDigits } from '@/lib/formatters';
import { 
  X, 
  Receipt, 
  Camera, 
  UploadCloud, 
  CheckCircle2, 
  Loader2, 
  Trash2, 
  Building2, 
  Tag, 
  FileText,
  DollarSign
} from 'lucide-react';
import { RadialGlowButton } from '@/components/ui/radial-glow-button';

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

export function AddExpenseDrawer() {
  const { 
    isAddExpenseOpen, 
    setIsAddExpenseOpen, 
    addExpense, 
    activeYear,
    currentRole,
    mandal 
  } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('MANDAP');
  const [amount, setAmount] = useState<string>('');
  const [paidTo, setPaidTo] = useState('');
  const [billUrl, setBillUrl] = useState('');
  const [uploadingBill, setUploadingBill] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  if (!isAddExpenseOpen) return null;

  // Client-side image compression: max 1280px, quality 0.72 -> < 500KB
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

      // 1. Auto-compress on device (< 500KB for fast 4G upload)
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], `bill-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      // 2. Upload to Cloudinary via backend API
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('folder', 'mandalbook/expenses');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setBillUrl(data.url);

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(40);
        } catch (e) {}
      }
    } catch (err: any) {
      console.error('Bill upload failed:', err);
      alert('बिलाचा फोटो अपलोड करताना त्रुटी आली.');
    } finally {
      setUploadingBill(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numericAmount) || numericAmount <= 0) return;

    try {
      setSubmitting(true);

      await addExpense({
        title: title.trim(),
        category,
        amount: numericAmount,
        paidTo: paidTo.trim() || 'दुकानदार / सेवा पुरवठादार',
        paidBy: currentRole === 'ADMIN' ? (mandal?.presidentName || 'पार्थ पाटील (अध्यक्ष)') : (mandal?.treasurerName || 'कृष्णा महाजन (खजिनदार)'),
        billUrl: billUrl.trim() || null,
        status: 'APPROVED',
        year: activeYear,
      });

      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([60, 40, 60]);
        } catch (e) {}
      }

      // Reset and close
      setTitle('');
      setAmount('');
      setPaidTo('');
      setBillUrl('');
      setIsAddExpenseOpen(false);
    } catch (err: any) {
      console.error('Failed to add expense:', err);
      alert(err.message || 'खर्च नोंदवताना त्रुटी आली.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsAddExpenseOpen(false)}
      />

      {/* Slide-Up Bottom Sheet (Mobile) / Centered Modal (Desktop) */}
      <div 
        className="fixed bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 left-0 right-0 z-50 max-w-lg mx-auto bg-white rounded-t-[2rem] sm:rounded-3xl shadow-2xl border-t-2 sm:border-2 border-red-500 max-h-[92vh] flex flex-col notranslate animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Swipe Handle (Mobile only) */}
        <div className="pt-2.5 pb-1 flex justify-center cursor-pointer sm:hidden" onClick={() => setIsAddExpenseOpen(false)}>
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header Bar */}
        <div className="px-5 py-2 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 font-heading leading-tight">
                मंडळ खर्च व बिल नोंदणी
              </h2>
              <p className="text-[10px] font-medium text-gray-500">
                वर्ष २०२६ उत्सव खर्च व्हाऊचर
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsAddExpenseOpen(false)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto px-5 py-3.5 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* 1. Category Grid Buttons */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                खर्चाचा प्रकार निवडा (Category) *
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setCategory(cat.key)}
                      className={`p-2 rounded-xl text-center border transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-red-50 text-red-700 border-red-400 font-black shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-lg">{cat.icon}</div>
                      <div className="text-[10px] font-bold truncate mt-0.5">{cat.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Expense Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                खर्चाचा तपशील (Title) *
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="उदा. मंडप बांबू व कापड भाडे"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:outline-none text-sm font-bold text-gray-900 placeholder:text-gray-400 font-heading"
                />
              </div>
            </div>

            {/* 3. Amount Input (Large Bold) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                खर्च झालेली रक्कम (रुपये) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2 text-2xl font-black text-red-600 font-heading">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="रक्कम टाका"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border-2 border-red-300 focus:border-red-600 focus:outline-none text-2xl font-black text-red-700 font-heading bg-red-50/20"
                />
              </div>
            </div>

            {/* 4. Paid To (Vendor / Person) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                रक्कम कोणास दिली? (दुकान / व्यक्तीचे नाव)
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="उदा. श्री गणेश डेकोरेटर्स, भुसावळ"
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:border-red-500 focus:outline-none text-xs font-medium text-gray-800"
                />
              </div>
            </div>

            {/* 5. Mobile Camera Bill Trigger & Compression Scanner */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                पावती / बिलाचा फोटो (Cloudinary स्टोरेज)
              </label>

              {/* Hidden Inputs for Direct Camera and Gallery */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleCaptureFile}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCaptureFile}
              />

              {billUrl ? (
                /* Preview uploaded bill */
                <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 bg-emerald-50/30 p-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={billUrl}
                      alt="Bill Preview"
                      className="w-14 h-14 object-cover rounded-xl border border-emerald-200"
                    />
                    <div>
                      <div className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>बिल यशस्वीरित्या सेव्ह झाले</span>
                      </div>
                      <div className="text-[10px] text-gray-500">Cloudinary सुरक्षित स्टोरेज</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBillUrl('')}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl"
                    title="हटवा"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Camera & File Upload Action Triggers */
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={uploadingBill}
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-3 rounded-xl border-2 border-dashed border-red-300 bg-red-50/40 hover:bg-red-50 flex flex-col items-center justify-center text-center active:scale-95 transition-all"
                  >
                    {uploadingBill ? (
                      <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                    ) : (
                      <>
                        <Camera className="w-6 h-6 text-red-600 mb-1" />
                        <span className="text-xs font-black text-red-700 font-heading">
                          📷 कॅमेऱ्याने फोटो काढा
                        </span>
                        <span className="text-[9px] text-gray-500 mt-0.5">थेट मोबाईल कॅमेरा उघडा</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={uploadingBill}
                    onClick={() => galleryInputRef.current?.click()}
                    className="p-3 rounded-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center text-center active:scale-95 transition-all"
                  >
                    <UploadCloud className="w-6 h-6 text-gray-600 mb-1" />
                    <span className="text-xs font-bold text-gray-800">गॅलरीतून निवडा</span>
                    <span className="text-[9px] text-gray-500 mt-0.5">JPEG / PNG &lt; ५००KB</span>
                  </button>
                </div>
              )}
            </div>

            {/* Submit Trigger (Bottom Thumb Zone) */}
            <div className="pt-2">
              <RadialGlowButton
                type="submit"
                variant="rose"
                size="lg"
                fullWidth
                disabled={submitting || !amount}
                className="w-full h-13 py-3.5 rounded-2xl text-white font-black text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>खर्च जतन होत आहे...</span>
                  </>
                ) : (
                  <>
                    <Receipt className="w-5 h-5" />
                    <span>खर्च व्हाऊचर जतन करा</span>
                  </>
                )}
              </RadialGlowButton>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
