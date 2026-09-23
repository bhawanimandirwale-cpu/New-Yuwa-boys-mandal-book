'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { PaymentMode, DonationStatus } from '@/lib/types';
import {
  X,
  Edit3,
  User,
  Phone,
  MapPin,
  Banknote,
  QrCode,
  FileText,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  Gift,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

export function EditDonationModal() {
  const { donationToEdit, setDonationToEdit, updateDonation, deleteDonation } = useApp();

  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [buildingFlat, setBuildingFlat] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [status, setStatus] = useState<DonationStatus>('PAID');
  const [notes, setNotes] = useState('');
  const [isInKind, setIsInKind] = useState(false);
  const [inKindDetails, setInKindDetails] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (donationToEdit) {
      setDonorName(donationToEdit.donorName || '');
      setDonorPhone(donationToEdit.donorPhone || '');
      setBuildingFlat(donationToEdit.buildingFlat || '');
      setAmount(donationToEdit.amount ? String(donationToEdit.amount) : '');
      setPaymentMode((donationToEdit.paymentMode as PaymentMode) || 'CASH');
      setStatus((donationToEdit.status as DonationStatus) || 'PAID');
      setNotes(donationToEdit.notes || '');
      setIsInKind(Boolean(donationToEdit.isInKind));
      setInKindDetails(donationToEdit.inKindDetails || '');
      setError(null);
    }
  }, [donationToEdit]);

  if (!donationToEdit) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim()) {
      setError('कृपया देणगीदाराचे नाव प्रविष्ट करा.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('कृपया योग्य वर्गणी रक्कम प्रविष्ट करा.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await updateDonation(donationToEdit.id, {
        donorName: donorName.trim(),
        donorPhone: donorPhone.trim(),
        buildingFlat: buildingFlat.trim(),
        amount: numAmount,
        paymentMode,
        status,
        notes: notes.trim(),
        isInKind,
        inKindDetails: isInKind ? inKindDetails.trim() : '',
      });
      setDonationToEdit(null);
    } catch (err: any) {
      console.error('Failed to update donation:', err);
      setError(err.message || 'वर्गणी अपडेट करताना त्रुटी आली.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm(
      `⚠️ खात्री करा: तुम्ही पावती क्रमांक "${donationToEdit.receiptNo}" (${donationToEdit.donorName} - ₹${donationToEdit.amount}) कायमची हटवू इच्छिता का?\n\nही रक्कम मंडळाच्या ताळेबंदातून आपोआप वजा होईल.`
    );
    if (!isConfirmed) return;

    try {
      setDeleting(true);
      setError(null);
      await deleteDonation(donationToEdit.id);
      setDonationToEdit(null);
    } catch (err: any) {
      console.error('Failed to delete donation:', err);
      setError(err.message || 'वर्गणी हटवताना त्रुटी आली.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-saffron-600 via-saffron-500 to-amber-500 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black font-heading leading-tight">
                वर्गणी पावती संपादन (Edit Donation)
              </h3>
              <p className="text-[11px] text-white/90 font-mono font-bold mt-0.5">
                पावती क्र.: {donationToEdit.receiptNo}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDonationToEdit(null)}
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

          {/* Donor Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-saffron-600" />
              <span>देणगीदार / भाविकाचे नाव *</span>
            </label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 font-medium"
              placeholder="देणगीदाराचे पूर्ण नाव"
            />
          </div>

          {/* Phone & Flat/Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-saffron-600" />
                <span>मोबाईल नंबर (WhatsApp)</span>
              </label>
              <input
                type="tel"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 font-mono"
                placeholder="उदा. 9822012345"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-saffron-600" />
                <span>सदनिका / खोली / गल्ली</span>
              </label>
              <input
                type="text"
                value={buildingFlat}
                onChange={(e) => setBuildingFlat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500"
                placeholder="उदा. घर क्र. १२"
              />
            </div>
          </div>

          {/* Amount & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-saffron-600" />
                <span>वर्गणी रक्कम (₹) *</span>
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
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-base font-black text-gray-900 focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-saffron-600" />
                <span>पावती स्थिती</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DonationStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 bg-white"
              >
                <option value="PAID">स्वीकृत (Paid / Received)</option>
                <option value="PLEDGED">बाकी वर्गणी (Pledged / Pending)</option>
              </select>
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">पेमेंट प्रकार (Payment Mode)</label>
            <div className="grid grid-cols-3 gap-2">
              {(['CASH', 'UPI', 'CHEQUE'] as PaymentMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    paymentMode === mode
                      ? 'bg-saffron-50 border-saffron-500 text-saffron-700 shadow-sm'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {mode === 'CASH' && <Banknote className="w-3.5 h-3.5" />}
                  {mode === 'UPI' && <QrCode className="w-3.5 h-3.5" />}
                  {mode === 'CHEQUE' && <FileText className="w-3.5 h-3.5" />}
                  <span>{mode === 'CASH' ? 'रोख (Cash)' : mode === 'UPI' ? 'UPI QR' : 'धनादेश (Cheque)'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* In Kind Checkbox */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isInKind}
                onChange={(e) => setIsInKind(e.target.checked)}
                className="w-4 h-4 rounded text-saffron-600 focus:ring-saffron-500"
              />
              <span className="font-bold text-amber-900 flex items-center gap-1">
                <Gift className="w-3.5 h-3.5 text-amber-700" />
                <span>वस्तुरूप देणगी (उदा. हार, फुले, मिठाई, नारळ)</span>
              </span>
            </label>
            {isInKind && (
              <input
                type="text"
                value={inKindDetails}
                onChange={(e) => setInKindDetails(e.target.value)}
                placeholder="वस्तूचा तपशील प्रविष्ट करा"
                className="w-full px-3 py-2 rounded-lg border border-amber-300 text-xs bg-white"
              />
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">टीप / शेरा (Notes)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="पर्यायी माहिती..."
              className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs"
            />
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
                onClick={() => setDonationToEdit(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors"
              >
                रद्द करा
              </button>
              <button
                type="submit"
                disabled={saving || deleting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-saffron-600 to-amber-600 text-white font-black text-xs shadow-md hover:from-saffron-700 hover:to-amber-700 transition-all flex items-center gap-1.5 disabled:opacity-50"
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
