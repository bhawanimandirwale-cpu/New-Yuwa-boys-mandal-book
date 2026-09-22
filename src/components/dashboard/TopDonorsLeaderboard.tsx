'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useI18n } from '@/lib/i18n/context';
import { formatCurrencyINR, toDevanagariDigits } from '@/lib/formatters';
import { Trophy, Crown, Medal, Award, Sparkles } from 'lucide-react';

export function TopDonorsLeaderboard() {
  const { donations, mandal, setSelectedReceiptForShare } = useApp();
  const { isMarathi } = useI18n();

  // Sort paid donations by amount descending and pick top 5
  const topDonors = [...donations]
    .filter((d) => d.status === 'PAID')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 flex items-center justify-center font-bold text-xs shadow-sm">
            <Crown className="w-4 h-4 fill-amber-950" />
          </div>
        );
      case 1:
        return (
          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 flex items-center justify-center font-bold text-xs shadow-sm">
            <Medal className="w-4 h-4" />
          </div>
        );
      case 2:
        return (
          <div className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            <Award className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">
            {isMarathi ? toDevanagariDigits(index + 1) : index + 1}
          </div>
        );
    }
  };

  return (
    <div className="festive-card p-4 sm:p-5 notranslate">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100 mb-3">
        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
          <Trophy className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-bold text-sm sm:text-base text-gray-900 font-heading">
            सर्वाधिक देणगीदार (Top Donors)
          </h3>
          <p className="text-[11px] text-gray-500">
            मंडळाचे प्रमुख देणगीदार व प्रायोजक
          </p>
        </div>
      </div>

      {topDonors.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-xs">
          अद्याप देणग्या उपलब्ध नाहीत.
        </div>
      ) : (
        <div className="space-y-2.5">
          {topDonors.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => setSelectedReceiptForShare(item)}
              className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-amber-50/50 cursor-pointer border border-transparent hover:border-amber-200 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {getRankBadge(idx)}
                <div className="min-w-0">
                  <div className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                    {item.donorName}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">
                    {item.buildingFlat || mandal?.city || 'केऱ्हाळे बु.'}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-black text-xs sm:text-sm text-amber-700 font-heading">
                  {formatCurrencyINR(item.amount, isMarathi)}
                </div>
                <div className="text-[10px] text-gray-400">
                  {item.paymentMode}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
