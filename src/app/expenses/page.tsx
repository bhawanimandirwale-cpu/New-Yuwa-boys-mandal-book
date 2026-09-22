'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useI18n } from '@/lib/i18n/context';
import { formatCurrencyINR, formatDateMarathi, toDevanagariDigits } from '@/lib/formatters';
import { ExpenseCategory } from '@/lib/types';
import { 
  Receipt, 
  Plus, 
  Minus, 
  Tag, 
  Building2, 
  UserCheck, 
  Calendar, 
  Image as ImageIcon, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  X 
} from 'lucide-react';

const CATEGORIES: { key: string; label: string }[] = [
  { key: 'ALL', label: 'सर्व खर्च' },
  { key: 'MANDAP', label: 'मंडप व स्टेज' },
  { key: 'IDOL', label: 'श्रींची मूर्ती' },
  { key: 'LIGHTING', label: 'विद्युत रोषणाई' },
  { key: 'SOUND_DJ', label: 'ध्वनी / डीजे' },
  { key: 'PRASAD', label: 'महाप्रसाद' },
  { key: 'LEGAL_PERMIT', label: 'परवानग्या' },
  { key: 'IMMERSION', label: 'विसर्जन' },
  { key: 'MISC', label: 'इतर' },
];

export default function ExpensesPage() {
  const { 
    expenses, 
    setIsAddExpenseOpen, 
    stats, 
    currentRole 
  } = useApp();
  const { isMarathi } = useI18n();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [previewBillUrl, setPreviewBillUrl] = useState<string | null>(null);

  const filteredExpenses = expenses.filter((e) => {
    if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
    return true;
  });

  const isPublicMember = currentRole === 'MEMBER';

  return (
    <div className="space-y-4 notranslate">
      {/* Page Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 font-heading">
              खर्च व व्हाऊचर नोंदवही (Expenses)
            </h2>
            <p className="text-xs text-gray-500">
              एकूण खर्च: <b>{formatCurrencyINR(stats.totalExpenses, isMarathi)}</b> • मंजूर व्हाऊचर्स: {isMarathi ? toDevanagariDigits(stats.expenseCount) : stats.expenseCount}
            </p>
          </div>
        </div>

        {!isPublicMember && (
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 active:scale-95 transition-all"
          >
            <Minus className="w-4 h-4 stroke-[3]" />
            <span>－ नवीन खर्च नोंदवा</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.key
                ? 'bg-rose-700 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Expenses List */}
      <div className="festive-card overflow-hidden">
        {filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs sm:text-sm">
            कोणताही खर्च सापडला नाही.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredExpenses.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-red-50/20 transition-colors"
              >
                {/* Left info */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm sm:text-base text-gray-900 font-heading">
                      {item.title}
                    </span>

                    {/* Voucher Badge */}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold">
                      {item.voucherNo}
                    </span>

                    {/* Status */}
                    {item.status === 'APPROVED' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>मंजूर</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>प्रलंबित मंजुरी</span>
                      </span>
                    )}
                  </div>

                  {/* Vendor, Paid By, Date */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-gray-400" />
                      <span>Vendor: <b>{item.paidTo}</b></span>
                    </span>

                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-gray-400" />
                      <span>प्रतिनिधी: {item.paidBy}</span>
                    </span>

                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      <span>{formatDateMarathi(item.date)}</span>
                    </span>

                    {item.approvedBy && (
                      <span className="text-emerald-700 font-medium">
                        मंजूरकर्ता: {item.approvedBy}
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Amount and Bill preview */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                  <div className="text-left sm:text-right">
                    <div className="text-base sm:text-lg font-black text-rose-700 font-heading">
                      {formatCurrencyINR(item.amount, isMarathi)}
                    </div>
                  </div>

                  {item.billUrl && (
                    <button
                      onClick={() => setPreviewBillUrl(item.billUrl || null)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                      title="बिल / पावती फोटो पहा"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-rose-600" />
                      <span>बिल पहा</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bill Preview Modal */}
      {previewBillUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="font-bold text-sm text-gray-900 font-heading">
                अधिकृत बिल / पावती फोटो
              </h4>
              <button
                onClick={() => setPreviewBillUrl(null)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="my-3 max-h-[70vh] overflow-y-auto rounded-xl flex items-center justify-center bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewBillUrl}
                alt="Bill Voucher"
                className="max-w-full h-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
