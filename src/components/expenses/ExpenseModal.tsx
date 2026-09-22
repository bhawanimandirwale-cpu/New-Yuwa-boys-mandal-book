'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useI18n } from '@/lib/i18n/context';
import { ExpenseCategory } from '@/lib/types';
import { 
  X, 
  Receipt, 
  Tag, 
  Building2, 
  UserCheck, 
  Calendar, 
  Camera, 
  CheckCircle, 
  Loader2 
} from 'lucide-react';

const CATEGORIES: { key: ExpenseCategory; label: string }[] = [
  { key: 'MANDAP', label: 'मंडप व स्टेज उभारणी' },
  { key: 'IDOL', label: 'श्रींची मूर्ती व सजावट' },
  { key: 'LIGHTING', label: 'विद्युत रोषणाई व जनरेटर' },
  { key: 'SOUND_DJ', label: 'ध्वनीक्षेपक / डीजे / वाद्यवृंद' },
  { key: 'PRASAD', label: 'महाप्रसाद व पूजा साहित्य' },
  { key: 'LEGAL_PERMIT', label: 'कायदेशीर परवानग्या व फी' },
  { key: 'IMMERSION', label: 'विसर्जन मिरवणूक व फुले' },
  { key: 'MISC', label: 'इतर किरकोळ कार्यालयीन खर्च' },
];

export function ExpenseModal() {
  const { 
    isAddExpenseOpen, 
    setIsAddExpenseOpen, 
    addExpense, 
    activeYear,
    currentRole 
  } = useApp();
  const { t } = useI18n();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('MANDAP');
  const [amount, setAmount] = useState<string>('');
  const [paidTo, setPaidTo] = useState('');
  const [paidBy, setPaidBy] = useState('भूषण चौधरी (खजिनदार)');
  const [billUrl, setBillUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingBill, setUploadingBill] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingBill(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'mandalbook/expenses');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setBillUrl(data.url);
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert('फोटो अपलोड करताना त्रुटी आली.');
    } finally {
      setUploadingBill(false);
    }
  };

  if (!isAddExpenseOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    try {
      setSubmitting(true);
      await addExpense({
        title: title.trim(),
        category,
        amount: numAmount,
        paidTo: paidTo.trim(),
        paidBy: paidBy.trim(),
        billUrl: billUrl.trim() || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        status: currentRole === 'VOLUNTEER' ? 'PENDING' : 'APPROVED',
        approvedBy: currentRole === 'ADMIN' ? 'श्री. निलेश पाटील (अध्यक्ष)' : 'श्री. भूषण चौधरी (खजिनदार)',
        year: activeYear,
      });

      setIsAddExpenseOpen(false);
      setTitle('');
      setAmount('');
      setPaidTo('');
      setBillUrl('');
    } catch (err) {
      console.error('Error saving expense:', err);
      alert('खर्च नोंदवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto notranslate">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-4 border border-gray-100 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-red-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6 stroke-[2.5]" />
            <h3 className="font-bold text-lg font-heading">
              － खर्च / व्हाऊचर नोंदवा (२०२६)
            </h3>
          </div>
          <button
            onClick={() => setIsAddExpenseOpen(false)}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              खर्चाचे नाव / तपशील *
            </label>
            <input
              type="text"
              required
              placeholder="उदा. मंडप उभारणी व बांबू स्टेज"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all font-medium"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-red-600" />
              <span>खर्चाचा वर्ग (Category) *</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all font-medium bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              खर्च रक्कम (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-lg font-bold text-gray-400">₹</span>
              <input
                type="number"
                min="1"
                required
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-lg font-extrabold focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all text-gray-900"
              />
            </div>
          </div>

          {/* Paid To & Paid By */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-red-600" />
                <span>कोणाला दिले (Vendor / व्यक्ती) *</span>
              </label>
              <input
                type="text"
                required
                placeholder="उदा. रॉयल डेकोरेटर्स"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-red-600" />
                <span>खर्च देणारा प्रतिनिधी *</span>
              </label>
              <input
                type="text"
                required
                placeholder="उदा. महेश जोशी (खजिनदार)"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Bill / Receipt Attachment (Cloudinary) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-red-600" />
              <span>बिलाचा फोटो (Cloudinary Direct Camera / File Upload)</span>
            </label>
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-dashed border-red-300 hover:border-red-500 bg-red-50/50 hover:bg-red-50 transition-colors text-xs font-bold text-red-700">
                  <Camera className="w-4 h-4" />
                  <span>{uploadingBill ? 'क्लाउडवर अपलोड होत आहे...' : billUrl ? '✅ फोटो निवडला गेला (बदला)' : '📷 कॅमेरा / गॅलरीतून बिल निवडा'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    disabled={uploadingBill}
                    className="hidden"
                  />
                </label>
                {billUrl && (
                  <button
                    type="button"
                    onClick={() => setBillUrl('')}
                    className="px-2.5 py-2 text-xs text-gray-500 hover:text-red-600"
                  >
                    काढून टाका
                  </button>
                )}
              </div>

              {billUrl && (
                <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span className="truncate">Cloudinary सुरक्षित URL: {billUrl}</span>
                </div>
              )}
            </div>
          </div>

          {/* Role Status Note */}
          <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-xs text-red-800">
            {currentRole === 'VOLUNTEER' ? (
              <span>
                ⚠️ आपण कार्यकर्ता म्हणून नोंदवत असल्याने हा खर्च <b>प्रलंबित (Pending)</b> स्थितीत राहील. अध्यक्ष किंवा खजिनदार यांच्या मंजुरीनंतर ताळेबंदात समाविष्ट होईल.
              </span>
            ) : (
              <span>
                ✅ आपण {currentRole === 'ADMIN' ? 'अध्यक्ष' : 'खजिनदार'} म्हणून नोंदवत असल्याने हा खर्च त्वरित <b>मंजूर (Approved)</b> होऊन ताळेबंदात जमा-खर्च जुळवला जाईल.
              </span>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-extrabold text-sm shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>खर्च नोंद होत आहे...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>खर्च नोंदवा व व्हाऊचर बनवा</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
