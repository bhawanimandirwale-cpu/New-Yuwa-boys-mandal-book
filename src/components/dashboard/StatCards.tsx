'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useI18n } from '@/lib/i18n/context';
import { formatCurrencyINR, toDevanagariDigits } from '@/lib/formatters';
import { 
  HandCoins, 
  Receipt, 
  Scale, 
  Wallet, 
  Building, 
  TrendingUp, 
  Clock, 
  Sparkles 
} from 'lucide-react';

export function StatCards() {
  const { stats, mandal } = useApp();
  const { t, isMarathi } = useI18n();

  return (
    <div className="space-y-3.5 notranslate">
      {/* Top 3 Core Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Collection (एकूण जमा) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-4 sm:p-5 rounded-3xl shadow-lg shadow-emerald-500/20 border border-emerald-400/30">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-emerald-100 tracking-wide font-heading">
              {t('total_collection')} (जमा)
            </span>
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <HandCoins className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight">
            {formatCurrencyINR(stats.totalCollected, isMarathi)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-100">
            <span className="font-bold bg-white/20 px-1.5 py-0.5 rounded">
              {isMarathi ? toDevanagariDigits(stats.donationCount) : stats.donationCount}
            </span>
            <span>पावत्या नोंदवल्या</span>
          </div>
        </div>

        {/* Total Expenses (एकूण खर्च) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-700 text-white p-4 sm:p-5 rounded-3xl shadow-lg shadow-rose-500/20 border border-rose-400/30">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-rose-100 tracking-wide font-heading">
              {t('total_expenses')} (खर्च)
            </span>
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <Receipt className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight">
            {formatCurrencyINR(stats.totalExpenses, isMarathi)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-100">
            <span className="font-bold bg-white/20 px-1.5 py-0.5 rounded">
              {isMarathi ? toDevanagariDigits(stats.expenseCount) : stats.expenseCount}
            </span>
            <span>खर्च व्हाऊचर्स मंजूर</span>
          </div>
        </div>

        {/* Net Balance (शिल्लक रक्कम) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-saffron-500 to-amber-600 text-white p-4 sm:p-5 rounded-3xl shadow-lg shadow-saffron-500/25 border border-saffron-400/30 sm:col-span-1 col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-amber-100 tracking-wide font-heading">
              {t('net_balance')} (निव्वळ शिल्लक)
            </span>
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
              <Scale className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight">
            {formatCurrencyINR(stats.netBalance, isMarathi)}
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-100">
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>सुरक्षित मंडळ निधी शिल्लक</span>
          </div>
        </div>
      </div>

      {/* Cash in Hand vs Bank Balance Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Cash in Hand */}
        <div className="festive-card p-3.5 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">
                {t('cash_in_hand')} (खजिनदाराकडील रोख)
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900 font-heading">
                {formatCurrencyINR(mandal?.cashInHand ?? stats.cashInHand, isMarathi)}
              </div>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
            रोख कॅश
          </span>
        </div>

        {/* Bank Account Balance */}
        <div className="festive-card p-3.5 sm:p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-medium">
                {t('bank_balance')} ({mandal?.bankName ? mandal.bankName.split(' ')[0] : 'बँक'})
              </div>
              <div className="text-lg sm:text-xl font-bold text-gray-900 font-heading">
                {formatCurrencyINR(mandal?.bankBalance ?? stats.bankBalance, isMarathi)}
              </div>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
            बँक खाते
          </span>
        </div>
      </div>

      {/* Pledged Alert Banner if any */}
      {stats.totalPledged > 0 && (
        <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              बाकी वर्गणी (Pledged Collection): <b>{formatCurrencyINR(stats.totalPledged, isMarathi)}</b> ({isMarathi ? toDevanagariDigits(stats.pledgedCount) : stats.pledgedCount} देणगीदार)
            </span>
          </div>
          <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
            पाठपुरावा चालू
          </span>
        </div>
      )}
    </div>
  );
}
