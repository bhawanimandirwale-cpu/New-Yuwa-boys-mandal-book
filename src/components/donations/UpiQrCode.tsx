'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { formatCurrencyINR, toDevanagariDigits } from '@/lib/formatters';
import { Copy, Check, QrCode as QrIcon, Smartphone } from 'lucide-react';

interface UpiQrCodeProps {
  upiId: string;
  mandalName: string;
  amount: number;
  note?: string;
}

export function UpiQrCode({ upiId, mandalName, amount, note = 'वर्गणी देणगी' }: UpiQrCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  // Construct standard UPI deep-link URL (NPCI specification)
  const encodedName = encodeURIComponent(mandalName);
  const encodedNote = encodeURIComponent(note);
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amount > 0 ? amount : ''}&cu=INR&tn=${encodedNote}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        upiUrl,
        {
          width: 220,
          margin: 1.5,
          color: {
            dark: '#111827',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
        }
      );
    }
  }, [upiUrl]);

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center p-4 bg-orange-50/60 rounded-2xl border border-saffron-200 shadow-sm notranslate">
      <div className="flex items-center gap-1.5 text-xs font-bold text-saffron-700 uppercase tracking-wide mb-2">
        <QrIcon className="w-4 h-4" />
        <span>झटपट ०% फी UPI पेमेंट (Dynamic QR)</span>
      </div>

      {/* QR Canvas */}
      <div className="relative p-2.5 bg-white rounded-2xl shadow-md border border-gray-100 flex items-center justify-center">
        <canvas ref={canvasRef} className="rounded-xl" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-9 h-9 rounded-full bg-white shadow-md border-2 border-saffron-500 flex items-center justify-center">
            <span className="text-saffron-600 font-extrabold text-sm">₹</span>
          </div>
        </div>
      </div>

      {/* Amount Display */}
      {amount > 0 && (
        <div className="mt-3 text-center">
          <div className="text-xs text-gray-500 font-medium">भरणा करावयाची रक्कम</div>
          <div className="text-2xl font-black text-gray-900 font-heading">
            {formatCurrencyINR(amount, true)}
          </div>
        </div>
      )}

      {/* UPI ID and Copy Button */}
      <div className="mt-2.5 flex items-center gap-1.5 text-xs text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-200">
        <span className="font-mono text-gray-800 font-semibold">{upiId}</span>
        <button
          onClick={copyUpiId}
          type="button"
          className="p-1 hover:text-saffron-600 transition-colors"
          title="UPI ID कॉपी करा"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Direct Mobile Deep Link Button */}
      <a
        href={upiUrl}
        className="mt-3 w-full max-w-xs flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-gradient-to-r from-saffron-500 to-saffron-600 text-white font-bold text-xs shadow-md shadow-saffron-500/20 active:scale-95 transition-all"
      >
        <Smartphone className="w-4 h-4" />
        <span>GPay / PhonePe / Paytm ने भरा</span>
      </a>
      <p className="text-[10px] text-gray-400 mt-1.5 text-center">
        मोबाईलवर थेट ॲप उघडण्यासाठी वरील बटणावर टॅप करा
      </p>
    </div>
  );
}
