'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { useI18n } from '@/lib/i18n/context';
import { 
  LayoutDashboard, 
  HandCoins, 
  Receipt, 
  FileSpreadsheet, 
  FileCheck,
  Plus
} from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const { setIsAddDonationOpen, currentRole } = useApp();
  const { t } = useI18n();

  const isPublicMember = currentRole === 'MEMBER';

  const navItems = [
    { label: t('dashboard'), href: '/', icon: LayoutDashboard },
    { label: t('donations'), href: '/donations', icon: HandCoins },
    { label: t('expenses'), href: '/expenses', icon: Receipt },
    { label: t('reports'), href: '/reports', icon: FileSpreadsheet },
    { label: t('documents'), href: '/documents', icon: FileCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-lg sm:hidden notranslate safe-area-pb">
      <div className="flex items-center justify-around px-1 py-1.5 max-w-md mx-auto relative">
        {navItems.map((item, idx) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          // Insert center FAB before index 2 (between Donations and Expenses)
          if (idx === 2 && !isPublicMember) {
            return (
              <React.Fragment key="center-fab">
                {/* Center Quick Action Button: "＋ जमा नोंदवा" */}
                <div className="relative -top-5 flex flex-col items-center">
                  <button
                    onClick={() => setIsAddDonationOpen(true)}
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-saffron-500 to-saffron-600 text-white flex items-center justify-center shadow-lg shadow-saffron-500/40 border-4 border-white active:scale-95 transition-transform"
                    title="＋ जमा नोंदवा"
                  >
                    <Plus className="w-6 h-6 stroke-[3]" />
                  </button>
                  <span className="text-[10px] font-bold text-saffron-700 mt-0.5">
                    + जमा
                  </span>
                </div>

                {/* Normal Expense Item */}
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                    isActive ? 'text-saffron-600 font-bold' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
                </Link>
              </React.Fragment>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-saffron-600 font-bold' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
