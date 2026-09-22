'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useI18n } from '@/lib/i18n/context';
import { formatCurrencyINR, formatDateMarathi, toDevanagariDigits } from '@/lib/formatters';
import { 
  HandCoins, 
  Search, 
  Filter, 
  Plus, 
  Share2, 
  Gift, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MapPin, 
  UserCheck 
} from 'lucide-react';

export default function DonationsPage() {
  const { 
    donations, 
    setIsAddDonationOpen, 
    setSelectedReceiptForShare, 
    updateDonationStatus, 
    stats,
    currentRole 
  } = useApp();
  const { isMarathi } = useI18n();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PLEDGED' | 'IN_KIND'>('ALL');

  const filteredDonations = donations.filter((item) => {
    // Status filter
    if (statusFilter === 'PAID' && item.status !== 'PAID') return false;
    if (statusFilter === 'PLEDGED' && item.status !== 'PLEDGED') return false;
    if (statusFilter === 'IN_KIND' && !item.isInKind) return false;

    // Search term
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      item.donorName.toLowerCase().includes(q) ||
      (item.donorPhone && item.donorPhone.includes(q)) ||
      item.receiptNo.toLowerCase().includes(q) ||
      (item.buildingFlat && item.buildingFlat.toLowerCase().includes(q))
    );
  });

  const isPublicMember = currentRole === 'MEMBER';

  return (
    <div className="space-y-4 notranslate">
      {/* Page Title & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 text-saffron-700 flex items-center justify-center shrink-0">
            <HandCoins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 font-heading">
              जमा व वर्गणी नोंदवही (Donations)
            </h2>
            <p className="text-xs text-gray-500">
              एकूण संकलित: <b>{formatCurrencyINR(stats.totalCollected, isMarathi)}</b> • पावत्या: {isMarathi ? toDevanagariDigits(stats.donationCount) : stats.donationCount}
            </p>
          </div>
        </div>

        {!isPublicMember && (
          <button
            onClick={() => setIsAddDonationOpen(true)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-bold text-xs shadow-md shadow-saffron-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>＋ नवीन जमा नोंदवा</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="देणगीदाराचे नाव, मोबाईल क्र., पावती क्र. ने शोधा..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/30 focus:border-saffron-500 transition-all"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'ALL'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            सर्व ({isMarathi ? toDevanagariDigits(donations.length) : donations.length})
          </button>

          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'PAID'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            जमा झालेली ({isMarathi ? toDevanagariDigits(stats.donationCount) : stats.donationCount})
          </button>

          <button
            onClick={() => setStatusFilter('PLEDGED')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'PLEDGED'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            बाकी वर्गणी ({isMarathi ? toDevanagariDigits(stats.pledgedCount) : stats.pledgedCount})
          </button>

          <button
            onClick={() => setStatusFilter('IN_KIND')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === 'IN_KIND'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            वस्तुरूप देणग्या
          </button>
        </div>
      </div>

      {/* Donations List / Table */}
      <div className="festive-card overflow-hidden">
        {filteredDonations.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-xs sm:text-sm">
            कोणतीही देणगी नोंद सापडली नाही.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredDonations.map((item) => (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-orange-50/30 transition-colors"
              >
                {/* Left info */}
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm sm:text-base text-gray-900 font-heading">
                      {item.donorName}
                    </span>

                    {/* Receipt Badge */}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold">
                      {item.receiptNo}
                    </span>

                    {/* Payment Mode */}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
                      {item.paymentMode}
                    </span>

                    {/* In-Kind Badge */}
                    {item.isInKind && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        <span>वस्तुरूप: {item.inKindDetails || 'उपलब्ध'}</span>
                      </span>
                    )}

                    {/* Status Badge */}
                    {item.status === 'PLEDGED' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>बाकी वर्गणी</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>स्वीकृत</span>
                      </span>
                    )}
                  </div>

                  {/* Address, Phone, Collector */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    {item.buildingFlat && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{item.buildingFlat}</span>
                      </span>
                    )}

                    {item.donorPhone && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{item.donorPhone}</span>
                      </span>
                    )}

                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-gray-400" />
                      <span>संकलक: {item.collectorName || 'कार्यकर्ता'}</span>
                    </span>

                    <span>दिनांक: {formatDateMarathi(item.createdAt)}</span>
                  </div>

                  {item.notes && (
                    <div className="text-[11px] text-gray-400 italic">
                      टीप: {item.notes}
                    </div>
                  )}
                </div>

                {/* Right: Amount and Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                  <div className="text-left sm:text-right">
                    <div className="text-base sm:text-lg font-black text-gray-900 font-heading">
                      {formatCurrencyINR(item.amount, isMarathi)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* If Pledged and authorized, show mark as paid button */}
                    {item.status === 'PLEDGED' && !isPublicMember && (
                      <button
                        onClick={() => updateDonationStatus(item.id, 'PAID')}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors"
                        title="वर्गणी जमा झाली म्हणून नोंदवा"
                      >
                        जमा झाली
                      </button>
                    )}

                    {/* WhatsApp Digital Receipt Trigger */}
                    <button
                      onClick={() => setSelectedReceiptForShare(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs transition-colors"
                      title="पावती पहा व व्हॉट्सॲपवर पाठवा"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>पावती / WhatsApp</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
