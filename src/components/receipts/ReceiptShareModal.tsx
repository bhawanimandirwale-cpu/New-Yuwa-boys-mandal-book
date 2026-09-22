'use client';

import React, { useRef, useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { ReceiptCard } from './ReceiptCard';
import { formatCurrencyINR } from '@/lib/formatters';
import { 
  X, 
  Share2, 
  Download, 
  FileText, 
  Copy, 
  Check, 
  Send,
  Loader2 
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';
import { safeCopyToClipboard } from '@/lib/clipboard';

export function ReceiptShareModal() {
  const { selectedReceiptForShare, setSelectedReceiptForShare, mandal } = useApp();
  const receiptRef = useRef<HTMLDivElement | null>(null);

  const [downloadingImg, setDownloadingImg] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!selectedReceiptForShare) return null;

  const donation = selectedReceiptForShare;
  const mandalName = mandal?.name || 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.';
  const cleanPhone = donation.donorPhone?.replace(/\D/g, '') || '';
  const formattedAmount = formatCurrencyINR(donation.amount, true);

  // Deep link to receipt verification page
  const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://mandalbook.com';
  const receiptUrl = `${appBaseUrl}/receipt/${donation.receiptNo}`;

  // Formatted Marathi WhatsApp Message
  const whatsappMessage = `॥ श्री गणेश प्रसन्न ॥ 🙏

सप्रेम नमस्कार, ${donation.donorName} जी,

*${mandalName}* सार्वजनिक गणेशोत्सवासाठी आपली *${formattedAmount}* रुपयांची वर्गणी/देणगी कृतज्ञतापूर्वक स्वीकारण्यात आली आहे.

📋 *अधिकृत पावती तपशील:*
• पावती क्र: *${donation.receiptNo}*
• पेमेंट प्रकार: *${donation.paymentMode}*
• संकलक: *${donation.collectorName || 'कार्यकर्ता'}*

🔗 *आपली डिजिटल पावती पाहण्यासाठी व डाउनलोड करण्यासाठी खालील लिंकवर क्लिक करा:*
${receiptUrl}

श्री गणेशाची कृपा आपल्या परिवारावर सदैव राहो हीच सदिच्छा!
- व्यवस्थापन समिती, ${mandalName}`;

  const encodedWhatsappUrl = `https://wa.me/${cleanPhone ? (cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone) : ''}?text=${encodeURIComponent(whatsappMessage)}`;

  // Download Receipt as PNG Image
  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;
    try {
      setDownloadingImg(true);
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3, // High DPI
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `MandalBook_Receipt_${donation.receiptNo}.png`;
      link.href = dataUrl;
      link.click();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error('Failed to capture receipt image:', err);
    } finally {
      setDownloadingImg(false);
    }
  };

  // Download Receipt as PDF
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    try {
      setDownloadingPdf(true);
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFF',
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [120, 180], // Receipt aspect ratio
      });

      pdf.addImage(imgData, 'JPEG', 5, 5, 110, 165);
      pdf.save(`MandalBook_Receipt_${donation.receiptNo}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleCopyText = async () => {
    const success = await safeCopyToClipboard(whatsappMessage);
    if (success) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto notranslate">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-saffron-500 to-amber-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            <h3 className="font-bold text-base sm:text-lg font-heading">
              डिजिटल पावती व व्हॉट्सॲप शेअर
            </h3>
          </div>
          <button
            onClick={() => setSelectedReceiptForShare(null)}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-gray-50 flex flex-col items-center">
          <ReceiptCard ref={receiptRef} donation={donation} mandal={mandal} />
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-white border-t border-gray-200 flex flex-col gap-2.5">
          {/* Main 1-Click WhatsApp Button */}
          <a
            href={encodedWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4 fill-white" />
            <span>व्हॉट्सॲपवर त्वरित पावती पाठवा (१-क्लिक)</span>
          </a>

          {/* Secondary Actions: Download PNG & PDF */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadImage}
              disabled={downloadingImg}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs transition-colors"
            >
              {downloadingImg ? (
                <Loader2 className="w-4 h-4 animate-spin text-saffron-600" />
              ) : (
                <Download className="w-4 h-4 text-saffron-600" />
              )}
              <span>फोटो डाउनलोड (PNG)</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs transition-colors"
            >
              {downloadingPdf ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              ) : (
                <FileText className="w-4 h-4 text-red-600" />
              )}
              <span>PDF डाउनलोड</span>
            </button>
          </div>

          {/* Copy Message Text */}
          <button
            onClick={handleCopyText}
            className="w-full text-center py-1.5 text-xs text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1 font-medium transition-colors"
          >
            {copiedText ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600 font-bold">मेसेज मजकूर कॉपी झाला!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>व्हॉट्सॲप मेसेज मजकूर कॉपी करा</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
