'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useI18n } from '@/lib/i18n/context';
import { formatCurrencyINR, toDevanagariDigits } from '@/lib/formatters';
import { PieChart, Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CATEGORY_NAMES: Record<string, { label: string; color: string; barColor: string }> = {
  MANDAP: { label: 'मंडप व स्टेज', color: 'text-amber-700 bg-amber-50', barColor: 'bg-amber-500' },
  IDOL: { label: 'श्रींची मूर्ती व सजावट', color: 'text-orange-700 bg-orange-50', barColor: 'bg-saffron-500' },
  LIGHTING: { label: 'विद्युत रोषणाई व जनरेटर', color: 'text-yellow-700 bg-yellow-50', barColor: 'bg-yellow-500' },
  SOUND_DJ: { label: 'ध्वनीक्षेपक / डीजे', color: 'text-purple-700 bg-purple-50', barColor: 'bg-purple-500' },
  PRASAD: { label: 'महाप्रसाद वाटप', color: 'text-rose-700 bg-rose-50', barColor: 'bg-rose-500' },
  LEGAL_PERMIT: { label: 'सरकारी परवानग्या व फी', color: 'text-blue-700 bg-blue-50', barColor: 'bg-blue-500' },
  IMMERSION: { label: 'विसर्जन मिरवणूक', color: 'text-emerald-700 bg-emerald-50', barColor: 'bg-emerald-500' },
  MISC: { label: 'इतर किरकोळ खर्च', color: 'text-gray-700 bg-gray-50', barColor: 'bg-gray-400' },
};

export function ExpenseChart() {
  const { expenses, stats } = useApp();
  const { isMarathi } = useI18n();

  // Aggregate by category
  const categoryTotals: Record<string, number> = {};
  expenses
    .filter((e) => e.status === 'APPROVED')
    .forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

  const totalExpenseAmount = stats.totalExpenses || 1;

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="festive-card p-4 sm:p-5 notranslate">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-gray-900 font-heading">
              खर्चाचे वर्गीकरण (Expense Distribution)
            </h3>
            <p className="text-[11px] text-gray-500">
              विभागनिहाय प्रत्यक्ष झालेला खर्च
            </p>
          </div>
        </div>

        <Link
          href="/expenses"
          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-0.5"
        >
          <span>सर्व व्हाऊचर्स</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-xs">
          अद्याप कोणताही खर्च नोंदवलेला नाही.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedCategories.map(([catKey, catAmt]) => {
            const percentage = Math.round((catAmt / totalExpenseAmount) * 100);
            const meta = CATEGORY_NAMES[catKey] || CATEGORY_NAMES.MISC;

            return (
              <div key={catKey} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-800">{meta.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-500 text-[11px]">
                      {isMarathi ? toDevanagariDigits(percentage) : percentage}%
                    </span>
                    <span className="font-black text-gray-900 font-heading">
                      {formatCurrencyINR(catAmt, isMarathi)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${meta.barColor}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
