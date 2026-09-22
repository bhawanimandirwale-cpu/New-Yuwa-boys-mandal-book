'use client';

import React, { forwardRef } from 'react';
import { VarganiDonationItem, MandalInfo } from '@/lib/types';
import { formatCurrencyINR, formatDateMarathi, toDevanagariDigits } from '@/lib/formatters';
import { numberToWordsMarathi } from '@/lib/numberToWordsMarathi';
import { Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface ReceiptCardProps {
  donation: VarganiDonationItem;
  mandal: MandalInfo | null;
}

export const ReceiptCard = forwardRef<HTMLDivElement, ReceiptCardProps>(
  ({ donation, mandal }, ref) => {
    const formattedAmount = formatCurrencyINR(donation.amount, true);
    const amountInWords = numberToWordsMarathi(donation.amount);
    const formattedDate = formatDateMarathi(donation.createdAt);

    return (
      <div
        ref={ref}
        id={`receipt-${donation.receiptNo}`}
        className="w-full max-w-md mx-auto bg-gradient-to-b from-[#FFFDF9] to-white p-5 sm:p-6 rounded-3xl border-2 border-saffron-300 shadow-xl relative overflow-hidden notranslate font-body"
      >
        {/* Decorative Top Border Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-saffron-500 via-amber-400 to-saffron-600" />

        {/* Sacred Header Invocation */}
        <div className="text-center pt-1 mb-2">
          <span className="text-xs sm:text-sm font-extrabold tracking-widest text-saffron-700 font-heading">
            ॥ श्री गणेश प्रसन्न ॥
          </span>
        </div>

        {/* Mandal Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-orange-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-saffron-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-saffron-500/20 shrink-0">
            <Sparkles className="w-6 h-6 fill-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base sm:text-lg font-black text-gray-900 leading-tight font-heading">
              {mandal?.name || 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.'}
            </h2>
            <p className="text-[11px] text-gray-500 font-medium truncate">
              {mandal?.address || 'मेन चौक, केऱ्हाळे बुद्रुक (Kerhale Bk.)'}
            </p>
            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
              <span>{mandal?.registrationNumber || 'नोंदणी क्र. महा/केऱ्हाळे/२०२६'}</span>
              <span>•</span>
              <span>स्थापना {mandal?.establishedYear ? toDevanagariDigits(mandal.establishedYear) : '२०१२'}</span>
            </div>
          </div>
        </div>

        {/* Receipt Meta (No & Date) */}
        <div className="my-3 flex items-center justify-between text-xs bg-orange-50/70 p-2.5 rounded-xl border border-saffron-100">
          <div>
            <span className="text-gray-500 text-[10px] block">पावती क्रमांक</span>
            <span className="font-mono font-bold text-saffron-800">{donation.receiptNo}</span>
          </div>
          <div className="text-right">
            <span className="text-gray-500 text-[10px] block">दिनांक</span>
            <span className="font-semibold text-gray-800">{formattedDate}</span>
          </div>
        </div>

        {/* Donor Information */}
        <div className="space-y-2.5 my-3 text-xs sm:text-sm">
          <div className="flex justify-between items-baseline gap-2">
            <span className="text-gray-500 shrink-0">देणगीदार :</span>
            <span className="font-bold text-gray-900 text-right">{donation.donorName}</span>
          </div>

          {donation.buildingFlat && (
            <div className="flex justify-between items-baseline gap-2">
              <span className="text-gray-500 shrink-0">पत्ता / सदनिका :</span>
              <span className="text-gray-700 text-right">{donation.buildingFlat}</span>
            </div>
          )}

          {donation.donorPhone && (
            <div className="flex justify-between items-baseline gap-2">
              <span className="text-gray-500 shrink-0">मोबाईल :</span>
              <span className="font-mono text-gray-700 text-right">{donation.donorPhone}</span>
            </div>
          )}

          {donation.isInKind && donation.inKindDetails && (
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <span className="font-bold block">वस्तुरूप देणगी तपशील:</span>
              <span>{donation.inKindDetails}</span>
            </div>
          )}

          {donation.notes && (
            <div className="text-[11px] text-gray-500 italic">
              टीप: {donation.notes}
            </div>
          )}
        </div>

        {/* Amount Box */}
        <div className="my-4 p-3.5 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 rounded-2xl border border-saffron-200 text-center relative">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
            स्वीकारलेली एकूण देणगी
          </div>
          <div className="text-2xl sm:text-3xl font-black text-saffron-600 font-heading my-0.5">
            {formattedAmount}
          </div>
          <div className="text-xs font-medium text-gray-700 mt-1">
            (अक्षरी: {amountInWords})
          </div>
        </div>

        {/* Payment Mode & Collector Badge */}
        <div className="flex items-center justify-between text-xs pt-1 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">पेमेंट प्रकार:</span>
            <span className="px-2 py-0.5 rounded font-bold bg-green-100 text-green-800 text-[11px]">
              {donation.paymentMode === 'UPI' && 'युपीआय (UPI)'}
              {donation.paymentMode === 'CASH' && 'रोख (Cash)'}
              {donation.paymentMode === 'CHEQUE' && 'धनादेश (Cheque)'}
              {donation.paymentMode === 'ONLINE' && 'ऑनलाईन'}
            </span>
          </div>

          <div className="text-right text-[11px] text-gray-500">
            संकलक: <span className="font-semibold text-gray-800">{donation.collectorName || 'कार्यकर्ता'}</span>
          </div>
        </div>

        {/* Digital Verification & Stamp Footer */}
        <div className="mt-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">डिजिटल पडताळणीकृत पावती</span>
          </div>

          {/* Mandal Seal / Stamp Simulation */}
          <div className="text-right">
            <div className="text-[10px] text-gray-400">स्वाक्षरी / मोहर</div>
            <div className="text-xs font-bold text-saffron-800 font-heading">
              {mandal?.treasurerName ? mandal.treasurerName.replace(/\s*\(.*?\)/, '') : 'कृष्णा महाजन'} (मंडळ खजिनदार)
            </div>
          </div>
        </div>

        {/* Blessing Note */}
        <div className="mt-3 text-center text-[10px] text-gray-400">
          श्री गणरायाची कृपा आपल्या परिवारावर सदैव राहो हीच सदिच्छा! 🙏
        </div>
      </div>
    );
  }
);

ReceiptCard.displayName = 'ReceiptCard';
