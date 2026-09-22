'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { useI18n, Language } from '@/lib/i18n/context';
import { toDevanagariDigits } from '@/lib/formatters';
import { UserRole } from '@/lib/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldAlert, 
  Wallet, 
  Users, 
  UserCheck, 
  Globe, 
  Calendar, 
  ChevronDown, 
  Sparkles,
  Flame,
  LayoutDashboard,
  HandCoins,
  Receipt,
  FileSpreadsheet,
  FileCheck,
  Plus,
  LogOut,
  Download
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

const roleLabels: Record<UserRole, { title: string; icon: any; color: string }> = {
  ADMIN: { title: 'अध्यक्ष', icon: ShieldAlert, color: 'bg-red-50 text-red-700 border-red-200' },
  TREASURER: { title: 'खजिनदार', icon: Wallet, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  VOLUNTEER: { title: 'कार्यकर्ता', icon: Flame, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  MEMBER: { title: 'सदस्य / भाविक', icon: Users, color: 'bg-blue-50 text-blue-700 border-blue-200' },
};

export function AppHeader() {
  const pathname = usePathname();
  const { mandal, currentRole, setRole, activeYear, setYear, setIsAddDonationOpen } = useApp();
  const { language, setLanguage, isMarathi, t } = useI18n();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [yearMenuOpen, setYearMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const CurrentRoleIcon = roleLabels[currentRole].icon;

  const navLinks = [
    { label: t('dashboard'), href: '/', icon: LayoutDashboard },
    { label: t('donations'), href: '/donations', icon: HandCoins },
    { label: t('expenses'), href: '/expenses', icon: Receipt },
    { label: 'कार्यकर्ते', href: '/members', icon: Users },
    { label: t('reports'), href: '/reports', icon: FileSpreadsheet },
    { label: t('documents'), href: '/documents', icon: FileCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm notranslate">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Left: Mandal Identity */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-saffron-600 to-amber-400 p-0.5 flex items-center justify-center text-white shadow-md shadow-saffron-500/20 shrink-0 overflow-hidden">
              <img
                src="/mandal-logo.png"
                alt="न्यू युवा गणेश मंडळ, केऱ्हाळे बु."
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-saffron-100 text-saffron-800 shrink-0">
                  {mandal?.city || 'केऱ्हाळे बु.'}
                </span>
                <span className="text-[10px] text-gray-400 truncate hidden xl:inline">
                  {mandal?.registrationNumber || 'नोंदणी क्र. महा/केऱ्हाळे/२०२६'}
                </span>
              </div>
              <h1 className="text-xs sm:text-sm xl:text-base font-bold text-gray-900 truncate leading-tight font-heading max-w-[160px] sm:max-w-[220px] xl:max-w-none">
                {mandal?.name || 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.'}
              </h1>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-2 xl:px-3 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-orange-50 text-saffron-600 font-bold shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Controls (Quick Action, Role Switcher, Year, Language) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {currentRole !== 'MEMBER' && (
            <button
              onClick={() => setIsAddDonationOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg bg-gradient-to-r from-saffron-500 to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="whitespace-nowrap">{t('add_donation')}</span>
            </button>
          )}
          {/* Year Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setYearMenuOpen(!yearMenuOpen);
                setRoleMenuOpen(false);
                setLangMenuOpen(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-orange-50 text-saffron-700 border border-saffron-200 hover:bg-saffron-100 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isMarathi ? toDevanagariDigits(activeYear) : activeYear}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {yearMenuOpen && (
              <div className="absolute right-0 mt-1 w-28 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 text-xs">
                {[2026, 2025, 2024].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => {
                      setYear(yr);
                      setYearMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-orange-50 font-medium ${
                      activeYear === yr ? 'text-saffron-600 bg-orange-50/50 font-bold' : 'text-gray-700'
                    }`}
                  >
                    {isMarathi ? `वर्ष ${toDevanagariDigits(yr)}` : `Year ${yr}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Switcher - Only Admin can change role */}
          {currentRole === 'ADMIN' ? (
            <div className="relative">
              <button
                onClick={() => {
                  setRoleMenuOpen(!roleMenuOpen);
                  setYearMenuOpen(false);
                  setLangMenuOpen(false);
                }}
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${roleLabels[currentRole].color}`}
                title="भूमिका निवडा (Role Switch) - केवळ ॲडमिन"
              >
                <CurrentRoleIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{roleLabels[currentRole].title}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400">
                    भूमिका निवडा (केवळ ॲडमिन)
                  </div>
                  {(['ADMIN', 'TREASURER', 'VOLUNTEER', 'MEMBER'] as UserRole[]).map((role) => {
                    const ItemIcon = roleLabels[role].icon;
                    return (
                      <button
                        key={role}
                        onClick={() => {
                          setRole(role);
                          setRoleMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                          currentRole === role ? 'bg-orange-50/70 text-saffron-700 font-bold' : 'text-gray-700'
                        }`}
                      >
                        <ItemIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>{roleLabels[role].title}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-semibold rounded-lg border ${roleLabels[currentRole].color}`}
              title={`आपली भूमिका: ${roleLabels[currentRole].title}`}
            >
              <CurrentRoleIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{roleLabels[currentRole].title}</span>
            </div>
          )}

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setLangMenuOpen(!langMenuOpen);
                setRoleMenuOpen(false);
                setYearMenuOpen(false);
              }}
              className="p-1.5 text-xs font-medium rounded-lg text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-gray-700" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-1 w-28 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 text-xs">
                <button
                  onClick={() => {
                    setLanguage('mr');
                    setLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-orange-50 ${
                    language === 'mr' ? 'text-saffron-600 font-bold bg-orange-50/50' : 'text-gray-700'
                  }`}
                >
                  मराठी (MR)
                </button>
                <button
                  onClick={() => {
                    setLanguage('hi');
                    setLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-orange-50 ${
                    language === 'hi' ? 'text-saffron-600 font-bold bg-orange-50/50' : 'text-gray-700'
                  }`}
                >
                  हिंदी (HI)
                </button>
                <button
                  onClick={() => {
                    setLanguage('en');
                    setLangMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-orange-50 ${
                    language === 'en' ? 'text-saffron-600 font-bold bg-orange-50/50' : 'text-gray-700'
                  }`}
                >
                  English (EN)
                </button>
              </div>
            )}
          </div>

          {/* PWA Install Button */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-pwa-install'));
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-extrabold rounded-lg bg-gradient-to-r from-saffron-500 to-amber-500 text-white hover:from-saffron-600 hover:to-amber-600 shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            title="मोबाईलच्या होम स्क्रीनवर ॲप इन्स्टॉल करा"
          >
            <Download className="w-3.5 h-3.5 animate-bounce" />
            <span className="hidden md:inline">ॲप इन्स्टॉल करा</span>
            <span className="md:hidden">इन्स्टॉल</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.removeItem('mandalbook_user');
              localStorage.removeItem('mandalbook_role');
              signOut({ callbackUrl: '/login' });
            }}
            className="p-1.5 text-xs font-medium rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-colors"
            title="बाहेर पडा (Logout)"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
