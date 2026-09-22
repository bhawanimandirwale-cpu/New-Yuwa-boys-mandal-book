'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { PaymentMode, VarganiDonationItem } from '@/lib/types';
import { toDevanagariDigits, formatCurrencyINR } from '@/lib/formatters';
import { 
  X, 
  HandCoins, 
  Banknote, 
  QrCode, 
  FileCheck, 
  User, 
  Phone, 
  MapPin, 
  Loader2, 
  CheckCircle2, 
  Share2, 
  Sparkles,
  ArrowLeft,
  Maximize2
} from 'lucide-react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';

const QUICK_AMOUNTS = [101, 251, 501, 1001, 2001, 5001];

const QUICK_TAGS = [
  'फ्लॅट क्र. ',
  'ए-विंग, ',
  'बी-विंग, ',
  'चाळ क्र. ',
  'गल्ली नं. ',
  'मेन रोड'
];

export function CollectDrawer() {
  const { 
    isAddDonationOpen, 
    setIsAddDonationOpen, 
    addDonation, 
    activeYear, 
    mandal,
    currentRole 
  } = useApp();

  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [buildingFlat, setBuildingFlat] = useState('');
  const [amount, setAmount] = useState<string>('501');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Full-Screen UPI QR Modal
  const [showFullscreenQr, setShowFullscreenQr] = useState(false);
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>('');

  // Success Sheet state
  const [createdDonation, setCreatedDonation] = useState<VarganiDonationItem | null>(null);

  const phoneInputRef = useRef<HTMLInputElement>(null);

  const numericAmount = parseFloat(amount) || 0;
  const upiId = process.env.NEXT_PUBLIC_DEFAULT_UPI_ID || '9923092340@ybl';

  // Generate QR code whenever amount or UPI ID changes
  useEffect(() => {
    if (numericAmount > 0) {
      const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
        mandal?.name || 'BhawaniMandal'
      )}&am=${numericAmount}&cu=INR&tn=${encodeURIComponent('Ganesh Utsav Vargani')}`;

      QRCode.toDataURL(upiString, {
        width: 320,
        margin: 1.5,
        color: {
          dark: '#111827',
          light: '#FFFFFF',
        },
      })
        .then((url) => setUpiQrDataUrl(url))
        .catch((err) => console.error('QR Generation failed:', err));
    }
  }, [numericAmount, upiId, mandal]);

  if (!isAddDonationOpen) return null;

  // Haptic feedback & Web Audio API beep
  const triggerBeepAndHaptic = () => {
    // 1. Haptic vibration
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch (e) {}
    }

    // 2. Synthesized audio chime
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.22);
      }
    } catch (e) {}
  };

  // Phone input sanitization (support phonebook paste)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 10) {
      // If +91 or 0 prefix was pasted, take last 10 digits
      setDonorPhone(raw.slice(-10));
    } else {
      setDonorPhone(raw);
    }
  };

  // Quick tag appender
  const handleTagClick = (tag: string) => {
    if (!buildingFlat) {
      setBuildingFlat(tag);
    } else {
      setBuildingFlat((prev) => `${prev.trim()} ${tag}`);
    }
  };

  // Quick amount pill selector
  const handleSelectQuickAmount = (val: number) => {
    setAmount(val.toString());
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(30);
      } catch (e) {}
    }
  };

  // Reset for next donation (1-tap)
  const handleResetForNext = () => {
    setDonorName('');
    setDonorPhone('');
    setBuildingFlat('');
    setAmount('501');
    setPaymentMode('CASH');
    setNotes('');
    setCreatedDonation(null);
    setShowFullscreenQr(false);
  };

  const handleClose = () => {
    handleResetForNext();
    setIsAddDonationOpen(false);
  };

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
        isInKind: false,
        status: 'PAID',
        collectorName: currentRole === 'ADMIN' ? (mandal?.presidentName || 'पार्थ पाटील (अध्यक्ष)') : 'कार्यकर्ता',
        notes: notes.trim(),
        year: activeYear,
      });

      // Audio & Haptic feedback
      triggerBeepAndHaptic();

      // Confetti celebration
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.8 },
          colors: ['#F67020', '#10B981', '#F59E0B'],
        });
      } catch (e) {}

      // Show Success Screen inside drawer
      setCreatedDonation(newDonation);
    } catch (err: any) {
      console.error('Failed to add donation:', err);
      alert(err.message || 'वर्गणी नोंदवताना त्रुटी आली.');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate WhatsApp Deep Link
  const getWhatsAppDeepLink = () => {
    if (!createdDonation) return '';
    const mandalName = mandal?.name || 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.';
    const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://new-yuwa-boys-mandal-book.vercel.app';
    const receiptUrl = `${appBaseUrl}/receipt/${createdDonation.receiptNo}`;
    const cleanPhone = createdDonation.donorPhone?.replace(/\D/g, '') || '';

    const msg = `॥ श्री गणेश प्रसन्न ॥ 🙏

सप्रेम नमस्कार, *${createdDonation.donorName}* जी,

*${mandalName}* (स्थापना: २०१२) सार्वजनिक गणेशोत्सवासाठी आपली *${formatCurrencyINR(createdDonation.amount, true)}* रुपयांची वर्गणी कृतज्ञतापूर्वक स्वीकारण्यात आली आहे.

📋 *अधिकृत डिजिटल पावती तपशील:*
• पावती क्र: *${createdDonation.receiptNo}*
• वर्गणी रक्कम: *₹ ${toDevanagariDigits(createdDonation.amount)}/-*
• पेमेंट प्रकार: *${createdDonation.paymentMode === 'UPI' ? 'UPI QR (ऑनलाइन)' : 'रोख (Cash)'}*
• दिनांक: *${new Date().toLocaleDateString('mr-IN')}*

🔗 *आपली अधिकृत पावती पाहण्यासाठी खालील लिंक उघडा:*
${receiptUrl}

बाप्पा आपल्या परिवारास सुख, समृद्धी व दीर्घायुष्य देवो!
- व्यवस्थापन समिती, ${mandalName}`;

    const phoneTarget = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    return `https://wa.me/${phoneTarget}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <>
      {/* 1. Backdrop Overlay */}
      <div 
        className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={handleClose}
      />

      {/* 2. Slide-up Bottom Sheet (Thumb Zone Friendly) */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-white rounded-t-[2rem] shadow-2xl border-t-2 border-saffron-500 max-h-[92vh] flex flex-col notranslate animate-in slide-in-from-bottom-8 duration-200"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Swipe Handle Indicator */}
        <div className="pt-2.5 pb-1 flex justify-center cursor-pointer" onClick={handleClose}>
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header Bar */}
        <div className="px-5 py-2 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-saffron-100 text-saffron-700 flex items-center justify-center">
              <HandCoins className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-900 font-heading leading-tight">
                {createdDonation ? 'पावती तयार झाली!' : '१०-सेकंद घर-घर वर्गणी'}
              </h2>
              <p className="text-[10px] font-medium text-gray-500">
                {mandal?.name || 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-5 py-3.5 space-y-4">
          {createdDonation ? (
            /* ================= SUCCESS SHEET & WHATSAPP TRIGGER ================= */
            <div className="space-y-4 py-2 animate-in zoom-in-95">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-1.5">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="text-sm font-black text-emerald-900 font-heading">
                  वर्गणी यशस्वीरित्या जमा झाली!
                </div>
                <div className="text-xs text-emerald-700 font-medium">
                  अधिकृत डिजिटल पावती क्रमांक: <b className="font-mono font-bold">{createdDonation.receiptNo}</b>
                </div>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-4 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">देणगीदाराचे नाव:</span>
                  <span className="font-extrabold text-gray-900 font-heading text-sm">{createdDonation.donorName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">मोबाईल नंबर:</span>
                  <span className="font-bold text-gray-800">{createdDonation.donorPhone || 'नोंद नाही'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-medium">पत्ता / फ्लॅट क्र.:</span>
                  <span className="font-bold text-gray-800">{createdDonation.buildingFlat || 'केऱ्हाळे बु.'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-700">स्वीकारलेली रक्कम:</span>
                  <span className="text-2xl font-black text-saffron-700 font-heading">
                    ₹ {toDevanagariDigits(createdDonation.amount)}/-
                  </span>
                </div>
              </div>

              {/* Giant WhatsApp Action Button (56px) */}
              <div className="space-y-2 pt-2">
                <a
                  href={getWhatsAppDeepLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full h-14 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all text-center"
                >
                  <Share2 className="w-5 h-5" />
                  <span>🟢 WhatsApp वर पावती पाठवा</span>
                </a>

                <button
                  type="button"
                  onClick={handleResetForNext}
                  className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-saffron-600" />
                  <span>पुढील घराची वर्गणी नोंदवा (Next)</span>
                </button>
              </div>
            </div>
          ) : (
            /* ================= 10-SECOND DONATION FORM ================= */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* 1. Donor Name Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  देणगीदार / भाविकाचे नाव *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    required
                    autoCapitalize="words"
                    placeholder="उदा. ज्ञानेश्वर विठ्ठल पाटील"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-saffron-500 focus:outline-none text-sm font-bold text-gray-900 placeholder:text-gray-400 font-heading"
                  />
                </div>
              </div>

              {/* 2. 10-Digit Mobile Number Input (Phonebook Paste Support) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  WhatsApp मोबाईल नंबर (पावती पाठवण्यासाठी)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-xs font-bold text-gray-500 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>+९१</span>
                  </div>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    maxLength={10}
                    placeholder="९८७६५४३२१०"
                    value={donorPhone}
                    onChange={handlePhoneChange}
                    className="w-full pl-16 pr-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-saffron-500 focus:outline-none text-sm font-bold text-gray-900 tracking-wider placeholder:tracking-normal placeholder:font-normal"
                  />
                </div>
              </div>

              {/* 3. Quick Building / Flat Selector Tags */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">
                    पत्ता / इमारत / फ्लॅट क्र.
                  </label>
                  <span className="text-[10px] text-gray-400">१-टॅप टॅग्स:</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
                  {QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-saffron-50 hover:text-saffron-700 border border-gray-200 text-[11px] font-bold text-gray-600 whitespace-nowrap active:scale-95 transition-all"
                    >
                      +{tag.trim()}
                    </button>
                  ))}
                </div>

                <div className="relative mt-1">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="उदा. फ्लॅट ३०२, साई दर्शन अपार्टमेंट"
                    value={buildingFlat}
                    onChange={(e) => setBuildingFlat(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:border-saffron-500 focus:outline-none text-xs font-medium text-gray-800"
                  />
                </div>
              </div>

              {/* 4. Touch Amount Selector (Big Pills + Large 28px Font) */}
              <div className="pt-1">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  वर्गणी रक्कम (रुपये) *
                </label>

                {/* Big Touch Pill Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-2.5">
                  {QUICK_AMOUNTS.map((val) => {
                    const isSelected = amount === val.toString();
                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleSelectQuickAmount(val)}
                        className={`py-2 px-1 rounded-xl text-xs font-black transition-all border ${
                          isSelected
                            ? 'bg-gradient-to-r from-saffron-500 to-saffron-600 text-white border-saffron-600 shadow-md scale-102'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 active:scale-95'
                        }`}
                      >
                        ₹ {toDevanagariDigits(val)}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amount Display (Large 28px Font) */}
                <div className="relative">
                  <span className="absolute left-3.5 top-2 text-2xl font-black text-saffron-600">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="रक्कम टाका"
                    value={amount}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '' || Number(val) >= 0) {
                        setAmount(val);
                      }
                    }}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border-2 border-saffron-300 focus:border-saffron-600 focus:outline-none text-2xl font-black text-saffron-800 font-heading bg-saffron-50/20"
                  />
                </div>
              </div>

              {/* 5. Payment Mode Segmented Switch */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  पेमेंट प्रकार (Payment Mode)
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('CASH')}
                    className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      paymentMode === 'CASH'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>रोख (Cash)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMode('UPI');
                      setShowFullscreenQr(true);
                    }}
                    className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      paymentMode === 'UPI'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-blue-600" />
                    <span>UPI QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('CHEQUE')}
                    className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      paymentMode === 'CHEQUE'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <FileCheck className="w-4 h-4 text-amber-600" />
                    <span>धनादेश</span>
                  </button>
                </div>
              </div>

              {/* UPI Quick Button if UPI Selected */}
              {paymentMode === 'UPI' && (
                <button
                  type="button"
                  onClick={() => setShowFullscreenQr(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-extrabold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Maximize2 className="w-4 h-4 text-blue-600" />
                  <span>📲 दात्यासाठी फुल-स्क्रीन UPI QR कोड दाखवा (₹ {toDevanagariDigits(numericAmount)})</span>
                </button>
              )}

              {/* Submit Button (Thumb Zone bottom trigger) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || numericAmount <= 0}
                  className="w-full h-13 py-3.5 rounded-2xl bg-gradient-to-r from-saffron-600 via-amber-500 to-saffron-600 hover:from-saffron-700 hover:to-saffron-700 text-white font-black text-sm shadow-xl shadow-saffron-500/30 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>पावती तयार होत आहे...</span>
                    </>
                  ) : (
                    <>
                      <HandCoins className="w-5 h-5" />
                      <span>₹ {toDevanagariDigits(numericAmount)} वर्गणी जमा करा व पावती बनवा</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 3. Instant Full-Screen High-Contrast UPI QR Modal */}
      {showFullscreenQr && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-4 notranslate animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowFullscreenQr(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="text-xs font-bold text-saffron-700 uppercase tracking-widest font-heading">
                ॥ श्री गणेश प्रसन्न ॥
              </div>
              <h3 className="text-base font-black text-gray-900 font-heading mt-0.5">
                {mandal?.name || 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.'}
              </h3>
              <p className="text-xs text-gray-500">कोणत्याही ॲपवरून स्कॅन करून वर्गणी द्या</p>
            </div>

            {/* Crisp High-Contrast QR Code */}
            <div className="p-3 bg-white border-2 border-gray-900 rounded-2xl inline-block shadow-inner">
              {upiQrDataUrl ? (
                <img src={upiQrDataUrl} alt="UPI QR Code" className="w-64 h-64 mx-auto rounded-lg" />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-saffron-600" />
                </div>
              )}
            </div>

            {/* Amount Badge */}
            <div className="bg-saffron-50 border border-saffron-200 py-2 px-4 rounded-xl inline-block">
              <div className="text-[11px] font-bold text-gray-500">एकूण वर्गणी रक्कम</div>
              <div className="text-2xl font-black text-saffron-800 font-heading">
                ₹ {toDevanagariDigits(numericAmount)}/-
              </div>
            </div>

            <div className="text-[11px] font-mono text-gray-600">
              UPI ID: <b>{upiId}</b>
            </div>

            {/* Dismiss & Done Button */}
            <button
              type="button"
              onClick={() => setShowFullscreenQr(false)}
              className="w-full py-3 rounded-xl bg-saffron-600 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all"
            >
              ✓ पेमेंट झाले (Done)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
