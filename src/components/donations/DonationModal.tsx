'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useI18n } from '@/lib/i18n/context';
import { UpiQrCode } from './UpiQrCode';
import { PaymentMode, DonationStatus } from '@/lib/types';
import { 
  X, 
  HandCoins, 
  QrCode, 
  Banknote, 
  FileCheck2, 
  Gift, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Loader2,
  CheckCircle,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

const QUICK_AMOUNTS = [101, 251, 501, 1001, 2501, 5001, 11000];

export function DonationModal() {
  const { 
    isAddDonationOpen, 
    setIsAddDonationOpen, 
    mandal, 
    addDonation, 
    setSelectedReceiptForShare,
    activeYear 
  } = useApp();
  const { t } = useI18n();

  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [buildingFlat, setBuildingFlat] = useState('');
  const [amount, setAmount] = useState<string>('501');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [isInKind, setIsInKind] = useState(false);
  const [inKindDetails, setInKindDetails] = useState('');
  const [isPledged, setIsPledged] = useState(false);
  const [pledgeDate, setPledgeDate] = useState('');
  const [collectorName, setCollectorName] = useState('ओंकार गायकवाड (कार्यकर्ता)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showUpiQr, setShowUpiQr] = useState(false);

  if (!isAddDonationOpen) return null;

  const numericAmount = parseFloat(amount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorName.trim() || numericAmount <= 0) return;

    try {
      setSubmitting(true);
      const newDonation = await addDonation({
        donorName: donorName.trim(),
        donorPhone: donorPhone.trim(),
        buildingFlat: buildingFlat.trim(),
        amount: numericAmount,
        paymentMode,
        isInKind,
        inKindDetails: isInKind ? inKindDetails.trim() : null,
        status: isPledged ? 'PLEDGED' : 'PAID',
        pledgeDate: isPledged && pledgeDate ? pledgeDate : null,
        collectorName,
        notes: notes.trim(),
        year: activeYear,
      });

      // Close this modal
      setIsAddDonationOpen(false);

      // Trigger Confetti!
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Automatically launch WhatsApp receipt modal for instant sharing!
      setSelectedReceiptForShare(newDonation);

      // Reset form
      setDonorName('');
      setDonorPhone('');
      setBuildingFlat('');
      setAmount('501');
      setIsInKind(false);
      setIsPledged(false);
      setNotes('');
    } catch (err) {
      console.error('Error saving donation:', err);
      alert('वर्गणी जतन करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto notranslate">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-4 border border-gray-100 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-saffron-500 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HandCoins className="w-6 h-6 stroke-[2.5]" />
            <h3 className="font-bold text-lg font-heading">
              ＋ जमा / वर्गणी नोंदवा (२०२६)
            </h3>
          </div>
          <button
            onClick={() => setIsAddDonationOpen(false)}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Donor Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-saffron-600" />
              <span>देणगीदाराचे नाव *</span>
            </label>
            <input
              type="text"
              required
              placeholder="उदा. श्री. रमेश विष्णू कदम"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 transition-all font-medium"
            />
          </div>

          {/* Phone & Address in 2 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-saffron-600" />
                <span>मोबाईल क्र. (WhatsApp)</span>
              </label>
              <input
                type="tel"
                placeholder="उदा. 9822012345"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-saffron-600" />
                <span>सदनिका / खोली / गल्ली</span>
              </label>
              <input
                type="text"
                placeholder="उदा. फ्लॅट ४०२, साई रेसिडेन्सी"
                value={buildingFlat}
                onChange={(e) => setBuildingFlat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 transition-all"
              />
            </div>
          </div>

          {/* Amount and Quick Amount Chips */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              रक्कम (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-lg font-bold text-gray-400">₹</span>
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-lg font-extrabold focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 transition-all text-gray-900"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    amount === amt.toString()
                      ? 'bg-saffron-600 text-white shadow-sm'
                      : 'bg-orange-50 text-saffron-700 hover:bg-orange-100 border border-saffron-200'
                  }`}
                >
                  ₹ {amt}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              पेमेंट प्रकार निवडा
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMode('CASH');
                  setShowUpiQr(false);
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                  paymentMode === 'CASH'
                    ? 'border-saffron-500 bg-orange-50 text-saffron-800 font-bold shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1 text-emerald-600" />
                <span className="text-xs">रोख (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMode('UPI');
                  setShowUpiQr(true);
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                  paymentMode === 'UPI'
                    ? 'border-saffron-500 bg-orange-50 text-saffron-800 font-bold shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1 text-saffron-600" />
                <span className="text-xs">युपीआय (UPI)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMode('CHEQUE');
                  setShowUpiQr(false);
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                  paymentMode === 'CHEQUE'
                    ? 'border-saffron-500 bg-orange-50 text-saffron-800 font-bold shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <FileCheck2 className="w-5 h-5 mb-1 text-blue-600" />
                <span className="text-xs">धनादेश (Cheque)</span>
              </button>
            </div>
          </div>

          {/* Dynamic UPI QR Code Display (Instant 0% collection) */}
          {paymentMode === 'UPI' && showUpiQr && (
            <div className="pt-1">
              <UpiQrCode
                upiId={mandal?.upiId || 'newyuwaboys@upi'}
                mandalName={mandal?.name || 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.'}
                amount={numericAmount}
                note={`वर्गणी ${donorName || ''}`}
              />
            </div>
          )}

          {/* वस्तुरूप देणगी Toggle (In-Kind items) */}
          <div className="pt-2 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isInKind}
                onChange={(e) => setIsInKind(e.target.checked)}
                className="w-4 h-4 text-saffron-600 rounded focus:ring-saffron-500"
              />
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-amber-600" />
                <span>वस्तुरूप देणगी (चांदी, मोदक, धान्य, इतर)</span>
              </span>
            </label>

            {isInKind && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="उदा. ५ किलो पेढे, चांदीचा मुकुट ५०० ग्रॅम"
                  value={inKindDetails}
                  onChange={(e) => setInKindDetails(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 bg-amber-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            )}
          </div>

          {/* बाकी वर्गणी Toggle (Pledged donation) */}
          <div className="pt-2 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPledged}
                onChange={(e) => setIsPledged(e.target.checked)}
                className="w-4 h-4 text-saffron-600 rounded focus:ring-saffron-500"
              />
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>बाकी वर्गणी (नंतर देणार / Pledged)</span>
              </span>
            </label>

            {isPledged && (
              <div className="mt-2">
                <label className="block text-[11px] text-gray-500 mb-1">
                  देण्याची तारीख (Follow-up Date):
                </label>
                <input
                  type="date"
                  value={pledgeDate}
                  onChange={(e) => setPledgeDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-blue-300 bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              टीप (पर्यायी)
            </label>
            <input
              type="text"
              placeholder="उदा. श्रींची आरती प्रायोजक"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-saffron-500/30"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-extrabold text-sm shadow-lg shadow-saffron-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>जमा नोंद होत आहे...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>जमा नोंदवा व पावती बनवा</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
