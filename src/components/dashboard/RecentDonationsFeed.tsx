'use client';

import React from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useI18n } from '@/lib/i18n/context';
import { formatCurrencyINR, formatDateMarathi, toDevanagariDigits } from '@/lib/formatters';
import { 
  HandCoins, 
  Share2, 
  Gift, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ArrowUpRight 
} from 'lucide-react';
import Link from 'next/link';

export function RecentDonationsFeed() {
  const { donations, setSelectedReceiptForShare } = useApp();
  const { t, isMarathi } = useI18n();

  // Show recent 6 donations
  const recentItems = donations.slice(0, 6);

  return (
    <div className="festive-card p-4 sm:p-5 notranslate">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-saffron-700 flex items-center justify-center">
            <HandCoins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-gray-900 font-heading">
              {t('recent_transactions')}
            </h3>
            <p className="text-[11px] text-gray-500">
              कार्यकर्त्यांकडून संकलित केलेल्या थेट देणग्या
            </p>
          </div>
        </div>

        <Link
          href="/donations"
          className="text-xs font-bold text-saffron-600 hover:text-saffron-700 flex items-center gap-0.5"
        >
          <span>सर्व पहा</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recentItems.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-xs">
          अद्याप कोणतीही देणगी नोंदवलेली नाही.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {recentItems.map((item) => (
            <div
              key={item.id}
              className="py-3 flex items-center justify-between gap-3 hover:bg-orange-50/40 -mx-2 px-2 rounded-xl transition-colors"
            >
              {/* Left Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                    {item.donorName}
                  </span>

                  {/* Payment Mode */}
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-green-50 text-green-700 border border-green-200 shrink-0">
                    {item.paymentMode}
                  </span>

                  {item.isInKind && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-800 flex items-center gap-0.5 shrink-0">
                      <Gift className="w-3 h-3" />
                      <span>वस्तुरूप</span>
                    </span>
                  )}

                  {item.status === 'PLEDGED' && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-blue-100 text-blue-800 shrink-0">
                      बाकी वर्गणी
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                  <span>{item.buildingFlat || 'स्थानिक भाविक'}</span>
                  <span>•</span>
                  <span>{formatDateMarathi(item.createdAt)}</span>
                </div>
              </div>

              {/* Right: Amount & WhatsApp receipt trigger */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <div className="font-black text-sm sm:text-base text-gray-900 font-heading">
                    {formatCurrencyINR(item.amount, isMarathi)}
                  </div>
                  <div className="text-[10px] font-mono text-gray-400">
                    {item.receiptNo}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedReceiptForShare(item)}
                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                  title="पावती पहा व व्हॉट्सॲपवर पाठवा"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
