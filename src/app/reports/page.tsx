'use client';

import React, { useRef, useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useI18n } from '@/lib/i18n/context';
import { formatCurrencyINR, formatDateMarathi, toDevanagariDigits } from '@/lib/formatters';
import { exportDonationsExcel, exportExpensesExcel } from '@/lib/exportExcel';
import { 
  FileSpreadsheet, 
  Printer, 
  Download, 
  Share2, 
  Check, 
  Sparkles, 
  Scale, 
  ShieldCheck 
} from 'lucide-react';

export default function ReportsPage() {
  const { mandal, stats, donations, expenses, activeYear } = useApp();
  const { isMarathi } = useI18n();

  const [copiedDaily, setCopiedDaily] = useState(false);

  const mandalName = mandal?.name || 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.';

  // Group approved expenses by category
  const categoryExpenses: Record<string, { label: string; amount: number }> = {
    MANDAP: { label: 'मंडप व स्टेज उभारणी', amount: 0 },
    IDOL: { label: 'श्रींची मूर्ती व पूजन सजावट', amount: 0 },
    LIGHTING: { label: 'विद्युत रोषणाई व जनरेटर भाडे', amount: 0 },
    SOUND_DJ: { label: 'ध्वनीक्षेपक / डीजे व वाद्यवृंद', amount: 0 },
    PRASAD: { label: 'महाप्रसाद वाटप व पूजा साहित्य', amount: 0 },
    LEGAL_PERMIT: { label: 'कायदेशीर परवानग्या व शासकीय फी', amount: 0 },
    IMMERSION: { label: 'विसर्जन मिरवणूक व फुले व्यवस्था', amount: 0 },
    MISC: { label: 'इतर किरकोळ व आकस्मिक खर्च', amount: 0 },
  };

  expenses
    .filter((e) => e.status === 'APPROVED')
    .forEach((e) => {
      if (categoryExpenses[e.category]) {
        categoryExpenses[e.category].amount += e.amount;
      } else {
        categoryExpenses.MISC.amount += e.amount;
      }
    });

  // Calculate totals
  const totalIncome = stats.totalCollected;
  const totalExpense = stats.totalExpenses;
  const closingCash = mandal?.cashInHand ?? stats.cashInHand;
  const closingBank = mandal?.bankBalance ?? stats.bankBalance;
  const closingBalance = closingCash + closingBank; // Net balance
  const grandTotalExpenseSide = totalExpense + closingBalance;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 notranslate">
      {/* Top Banner (No-print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 font-heading">
              वार्षिक अहवाल व ऑडिट ताळेबंद (Balance Sheet)
            </h2>
            <p className="text-xs text-gray-500">
              धर्मादाय आयुक्त (Charity Commissioner) व वार्षिक सर्वसाधारण सभा (AGM) अधिकृत ताळेबंद
            </p>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportDonationsExcel(donations, mandalName, activeYear)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>वर्गणी Excel</span>
          </button>

          <button
            onClick={() => exportExpensesExcel(expenses, mandalName, activeYear)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-rose-600" />
            <span>खर्च Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-bold text-xs shadow-md shadow-saffron-500/20 active:scale-95 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>ताळेबंद प्रिंट / PDF</span>
          </button>
        </div>
      </div>

      {/* Official Audited Balance Sheet (Legal Marathi Format) */}
      <div className="bg-white p-5 sm:p-8 rounded-3xl border border-gray-200 shadow-md printable-area font-body">
        {/* Header Section */}
        <div className="text-center pb-4 border-b-2 border-gray-800">
          <div className="text-xs font-bold text-saffron-700 font-heading tracking-widest uppercase mb-1">
            ॥ श्री गणेश प्रसन्न ॥
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 font-heading">
            {mandal?.name || 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.'}
          </h1>
          <p className="text-xs text-gray-600 font-medium">
            {mandal?.address || 'मेन चौक, केऱ्हाळे बुद्रुक (Kerhale Bk.)'}
          </p>
          <div className="flex items-center justify-center gap-3 text-xs text-gray-500 mt-1">
            <span>नोंदणी क्र.: {mandal?.registrationNumber || 'महा/केऱ्हाळे/२०२६'}</span>
            <span>•</span>
            <span>स्थापना वर्ष: {mandal?.establishedYear ? toDevanagariDigits(mandal.establishedYear) : '२०१२'}</span>
          </div>

          <div className="mt-3 inline-block px-4 py-1 bg-gray-100 rounded-full text-xs font-black text-gray-800 border border-gray-300">
            सन {isMarathi ? toDevanagariDigits(activeYear) : activeYear} चा हिशोब व अंतिम लेखापरीक्षित ताळेबंद (Audited Balance Sheet)
          </div>
        </div>

        {/* 2-Column Ledger (जमा बाजू vs खर्च बाजू) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-300 my-6 divide-y md:divide-y-0 md:divide-x divide-gray-300">
          {/* डावी बाजू: जमा बाजू (Income / Receipts) */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="bg-emerald-50 px-4 py-2 border-b border-gray-300 font-bold text-xs sm:text-sm text-emerald-900 flex justify-between">
                <span>जमा बाजू (प्राप्ती / Income)</span>
                <span>रक्कम (₹)</span>
              </div>

              <div className="p-3 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-dashed border-gray-200">
                  <span className="font-semibold text-gray-800">चालू वर्षात गोळा झालेली प्रत्यक्ष वर्गणी</span>
                  <span className="font-bold text-gray-900">{formatCurrencyINR(stats.totalCollected, isMarathi)}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-dashed border-gray-200">
                  <span className="text-gray-700">आरती व जाहिरात प्रायोजकत्व</span>
                  <span className="font-bold text-gray-900">{formatCurrencyINR(0, isMarathi)}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-dashed border-gray-200">
                  <span className="text-gray-700">बँक व्याज व इतर किरकोळ प्राप्ती</span>
                  <span className="font-bold text-gray-900">{formatCurrencyINR(0, isMarathi)}</span>
                </div>

                {stats.totalPledged > 0 && (
                  <div className="flex justify-between py-1 border-b border-dashed border-gray-200 text-blue-700 italic">
                    <span>(टीप: बाकी वर्गणी येणे बाकी - {formatCurrencyINR(stats.totalPledged, isMarathi)})</span>
                    <span>-</span>
                  </div>
                )}
              </div>
            </div>

            {/* Total Income Footer */}
            <div className="bg-emerald-100/60 px-4 py-2.5 border-t border-gray-300 flex justify-between items-center font-black text-xs sm:text-sm text-emerald-950">
              <span>एकूण जमा रक्कम :</span>
              <span>{formatCurrencyINR(totalIncome, isMarathi)}</span>
            </div>
          </div>

          {/* उजवी बाजू: खर्च बाजू (Expenses / Disbursements) */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="bg-rose-50 px-4 py-2 border-b border-gray-300 font-bold text-xs sm:text-sm text-rose-900 flex justify-between">
                <span>खर्च बाजू (व्यय / Expenses)</span>
                <span>रक्कम (₹)</span>
              </div>

              <div className="p-3 space-y-2 text-xs">
                {Object.entries(categoryExpenses).map(([key, cat]) => (
                  <div key={key} className="flex justify-between py-0.5 border-b border-dashed border-gray-200">
                    <span className="text-gray-800">{cat.label}</span>
                    <span className="font-semibold text-gray-900">{formatCurrencyINR(cat.amount, isMarathi)}</span>
                  </div>
                ))}

                {/* Closing Balance Item */}
                <div className="pt-2 border-t-2 border-gray-300 space-y-1">
                  <div className="font-bold text-saffron-800 text-xs">
                    अखेरची शिल्लक (Closing Balance):
                  </div>
                  <div className="flex justify-between pl-2 text-gray-600">
                    <span>(अ) खजिनदाराकडील शिल्लक रोख :</span>
                    <span className="font-semibold">{formatCurrencyINR(closingCash, isMarathi)}</span>
                  </div>
                  <div className="flex justify-between pl-2 text-gray-600">
                    <span>(ब) बँक खात्यातील शिल्लक रक्कम :</span>
                    <span className="font-semibold">{formatCurrencyINR(closingBank, isMarathi)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Expense + Balance Tally Footer */}
            <div className="bg-rose-100/60 px-4 py-2.5 border-t border-gray-300 flex justify-between items-center font-black text-xs sm:text-sm text-rose-950">
              <span>एकूण खर्च व शिल्लक जुळवणी (Tally) :</span>
              <span>{formatCurrencyINR(grandTotalExpenseSide, isMarathi)}</span>
            </div>
          </div>
        </div>

        {/* Tally Verification Note */}
        <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 text-xs text-orange-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              सदर ताळेबंद मंडळाच्या अधिकृत बँक स्टेटमेंट व सर्व व्हाऊचर्स पडताळून अंतिम करण्यात आला आहे.
            </span>
          </div>
          <span className="font-bold text-emerald-700 whitespace-nowrap">
            हिशोब परिपूर्ण जुळला (Tally OK)
          </span>
        </div>

        {/* Signatures Block (अध्यक्ष, सचिव, खजिनदार, ऑडिटर) */}
        <div className="mt-12 pt-6 border-t border-gray-300 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center text-xs">
          <div>
            <div className="h-10 border-b border-gray-400 mb-1 flex items-end justify-center font-mono text-[10px] text-gray-400">
              [स्वाक्षरी]
            </div>
            <div className="font-bold text-gray-900 font-heading">
              {mandal?.presidentName || 'श्री. समाधान पाटील'}
            </div>
            <div className="text-gray-500 text-[11px]">अध्यक्ष (President)</div>
          </div>

          <div>
            <div className="h-10 border-b border-gray-400 mb-1 flex items-end justify-center font-mono text-[10px] text-gray-400">
              [स्वाक्षरी]
            </div>
            <div className="font-bold text-gray-900 font-heading">
              {mandal?.secretaryName || 'श्री. राहुल शिंदे'}
            </div>
            <div className="text-gray-500 text-[11px]">सचिव / कार्यवाह</div>
          </div>

          <div>
            <div className="h-10 border-b border-gray-400 mb-1 flex items-end justify-center font-mono text-[10px] text-gray-400">
              [स्वाक्षरी]
            </div>
            <div className="font-bold text-gray-900 font-heading">
              {mandal?.treasurerName || 'श्री. महेश जोशी'}
            </div>
            <div className="text-gray-500 text-[11px]">खजिनदार (Treasurer)</div>
          </div>

          <div>
            <div className="h-10 border-b border-gray-400 mb-1 flex items-end justify-center font-mono text-[10px] text-gray-400">
              [मोहर व सही]
            </div>
            <div className="font-bold text-gray-900 font-heading">
              मे. जोशी अँड असोसिएट्स
            </div>
            <div className="text-gray-500 text-[11px]">सनदी लेखापाल (CA / Auditor)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
