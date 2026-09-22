'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useI18n } from '@/lib/i18n/context';
import { formatCurrencyINR, formatDateMarathi } from '@/lib/formatters';
import { 
  Plus, 
  Minus, 
  FileSpreadsheet, 
  FileCheck, 
  MessageSquare, 
  Check, 
  Copy,
  ExternalLink,
  RotateCcw 
} from 'lucide-react';
import Link from 'next/link';
import { safeCopyToClipboard } from '@/lib/clipboard';

export function QuickActions() {
  const { 
    setIsAddDonationOpen, 
    setIsAddExpenseOpen, 
    setIsResetAccountsOpen,
    currentRole, 
    mandal, 
    stats 
  } = useApp();
  const { isMarathi } = useI18n();

  const [copiedBroadcast, setCopiedBroadcast] = useState(false);

  const isPublicMember = currentRole === 'MEMBER';

  // Format Daily WhatsApp Broadcast Summary for Mandal Committee Groups
  const broadcastText = `॥ श्री गणेश प्रसन्न ॥ 🙏
*${mandal?.name || 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.'} - दैनिक जमा-खर्च अहवाल*
दिनांक: ${formatDateMarathi(new Date())}

📊 *आजची आर्थिक स्थिती:*
• एकूण जमा वर्गणी: *${formatCurrencyINR(stats.totalCollected, isMarathi)}*
• एकूण झालेला खर्च: *${formatCurrencyINR(stats.totalExpenses, isMarathi)}*
• शिल्लक मंडळ निधी: *${formatCurrencyINR(stats.netBalance, isMarathi)}*
------------------------
• हातातील रोख (Cash): *${formatCurrencyINR(mandal?.cashInHand ?? stats.cashInHand, isMarathi)}*
• बँक खात्यात शिल्लक: *${formatCurrencyINR(mandal?.bankBalance ?? stats.bankBalance, isMarathi)}*

🔗 संपूर्ण डिजिटल ताळेबंद व पावत्या पाहण्यासाठी:
${typeof window !== 'undefined' ? window.location.origin : 'https://mandalbook.com'}

- व्यवस्थापक व खजिनदार मंडळ`;

  const copyBroadcastText = async () => {
    const success = await safeCopyToClipboard(broadcastText);
    if (success) {
      setCopiedBroadcast(true);
      setTimeout(() => setCopiedBroadcast(false), 2500);
    }
  };

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(broadcastText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-saffron-200 rounded-3xl p-4 sm:p-5 shadow-sm notranslate">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold text-sm sm:text-base text-gray-900 font-heading">
            झटपट कृती केंद्र (Quick Action Center)
          </h3>
          <p className="text-[11px] text-gray-500">
            कार्यकर्ते व व्यवस्थापन समितीसाठी एक-क्लिक सुविधा
          </p>
        </div>

        {/* Daily WhatsApp Broadcast Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyBroadcastText}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            title="समिती ग्रुपसाठी मेसेज कॉपी करा"
          >
            {copiedBroadcast ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span className="text-green-600 font-bold">कॉपी झाला!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>समरी कॉपी</span>
              </>
            )}
          </button>

          <button
            onClick={shareOnWhatsApp}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
            title="व्हॉट्सॲप ग्रुपवर थेट पाठवा"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-white" />
            <span>ग्रुप ब्रॉडकास्ट</span>
          </button>
        </div>
      </div>

      {/* Grid of Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {!isPublicMember && (
          <button
            onClick={() => setIsAddDonationOpen(true)}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-bold text-xs shadow-md shadow-saffron-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>＋ जमा नोंदवा</span>
          </button>
        )}

        {!isPublicMember && (
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition-all"
          >
            <Minus className="w-4 h-4 stroke-[3]" />
            <span>－ खर्च व्हाऊचर</span>
          </button>
        )}

        <Link
          href="/reports"
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs border border-gray-200 shadow-sm transition-all"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>१-क्लिक ताळेबंद (PDF)</span>
        </Link>

        <Link
          href="/documents"
          className="flex items-center justify-center gap-2 py-3 px-3 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs border border-gray-200 shadow-sm transition-all"
        >
          <FileCheck className="w-4 h-4 text-blue-600" />
          <span>सरकारी परवानग्या (NOC)</span>
        </Link>
      </div>

      {/* President Fresh Ledger Reset Trigger */}
      {currentRole === 'ADMIN' && (
        <div className="mt-3.5 pt-3 border-t border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="text-[11px] text-gray-700 font-medium flex items-center gap-1.5">
            <span className="text-rose-600 font-bold">🚩 अध्यक्ष नियंत्रण:</span>
            <span>नवीन वर्षासाठी हिशोब ₹० वरून पुन्हा नव्याने सुरू करायचा आहे का?</span>
          </div>
          <button
            type="button"
            onClick={() => setIsResetAccountsOpen(true)}
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs border border-rose-300 shadow-sm shrink-0 active:scale-95 transition-all self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>हिशोब शून्यापासून सुरू करा (Reset)</span>
          </button>
        </div>
      )}
    </div>
  );
}
