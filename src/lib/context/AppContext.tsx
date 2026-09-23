'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  MandalInfo,
  UserRole,
  VarganiDonationItem,
  ExpenseItem,
  PermitDocumentItem,
  DonationStatus,
} from '@/lib/types';
import { useSession } from 'next-auth/react';

interface MandalStats {
  totalCollected: number;
  totalPledged: number;
  totalExpenses: number;
  netBalance: number;
  cashInHand: number;
  bankBalance: number;
  donationCount: number;
  pledgedCount: number;
  expenseCount: number;
}

interface AppContextType {
  mandal: MandalInfo | null;
  stats: MandalStats;
  donations: VarganiDonationItem[];
  expenses: ExpenseItem[];
  documents: PermitDocumentItem[];
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  activeYear: number;
  setYear: (year: number) => void;
  loading: boolean;
  refresh: () => Promise<void>;
  addDonation: (donationData: any) => Promise<VarganiDonationItem>;
  addExpense: (expenseData: any) => Promise<ExpenseItem>;
  addDocument: (docData: any) => Promise<PermitDocumentItem>;
  updateDonationStatus: (id: string, status: DonationStatus) => Promise<void>;
  updateDonation: (id: string, donationData: any) => Promise<VarganiDonationItem>;
  deleteDonation: (id: string) => Promise<boolean>;
  updateExpense: (id: string, expenseData: any) => Promise<ExpenseItem>;
  deleteExpense: (id: string) => Promise<boolean>;
  isAddDonationOpen: boolean;
  setIsAddDonationOpen: (open: boolean) => void;
  isAddExpenseOpen: boolean;
  setIsAddExpenseOpen: (open: boolean) => void;
  isResetAccountsOpen: boolean;
  setIsResetAccountsOpen: (open: boolean) => void;
  isAccountProfileOpen: boolean;
  setIsAccountProfileOpen: (open: boolean) => void;
  selectedReceiptForShare: VarganiDonationItem | null;
  setSelectedReceiptForShare: (item: VarganiDonationItem | null) => void;
  donationToEdit: VarganiDonationItem | null;
  setDonationToEdit: (item: VarganiDonationItem | null) => void;
  expenseToEdit: ExpenseItem | null;
  setExpenseToEdit: (item: ExpenseItem | null) => void;
}

const defaultStats: MandalStats = {
  totalCollected: 0,
  totalPledged: 0,
  totalExpenses: 0,
  netBalance: 0,
  cashInHand: 0,
  bankBalance: 0,
  donationCount: 0,
  pledgedCount: 0,
  expenseCount: 0,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppContextProvider({ children }: { children: React.ReactNode }) {
  const [mandal, setMandal] = useState<MandalInfo | null>(null);
  const [stats, setStats] = useState<MandalStats>(defaultStats);
  const [donations, setDonations] = useState<VarganiDonationItem[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [documents, setDocuments] = useState<PermitDocumentItem[]>([]);
  const [currentRole, setCurrentRole] = useState<UserRole>('ADMIN');
  const [activeYear, setActiveYear] = useState<number>(2026);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [isAddDonationOpen, setIsAddDonationOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isResetAccountsOpen, setIsResetAccountsOpen] = useState(false);
  const [isAccountProfileOpen, setIsAccountProfileOpen] = useState(false);
  const [selectedReceiptForShare, setSelectedReceiptForShare] = useState<VarganiDonationItem | null>(null);
  const [donationToEdit, setDonationToEdit] = useState<VarganiDonationItem | null>(null);
  const [expenseToEdit, setExpenseToEdit] = useState<ExpenseItem | null>(null);

  const { data: session } = useSession();

  useEffect(() => {
    const sessionRole = (session?.user as any)?.role as UserRole;
    if (sessionRole && ['ADMIN', 'TREASURER', 'VOLUNTEER', 'MEMBER'].includes(sessionRole)) {
      setCurrentRole(sessionRole);
      localStorage.setItem('mandalbook_role', sessionRole);
    } else {
      const savedRole = localStorage.getItem('mandalbook_role') as UserRole;
      if (savedRole && ['ADMIN', 'TREASURER', 'VOLUNTEER', 'MEMBER'].includes(savedRole)) {
        setCurrentRole(savedRole);
      }
    }
  }, [session]);

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('mandalbook_role', role);
  };

  const setYear = (year: number) => {
    setActiveYear(year);
  };

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const [mandalRes, donationsRes, expensesRes, docsRes] = await Promise.all([
        fetch('/api/mandal'),
        fetch(`/api/donations?year=${activeYear}`),
        fetch(`/api/expenses?year=${activeYear}`),
        fetch(`/api/documents?year=${activeYear}`),
      ]);

      if (mandalRes.ok) {
        const mandalData = await mandalRes.json();
        setMandal(mandalData.mandal);
        setStats(mandalData.stats);
      }

      if (donationsRes.ok) {
        const donData = await donationsRes.json();
        setDonations(donData);
      }

      if (expensesRes.ok) {
        const expData = await expensesRes.json();
        setExpenses(expData);
      }

      if (docsRes.ok) {
        const docData = await docsRes.json();
        setDocuments(docData);
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeYear]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addDonation = async (donationData: any) => {
    const res = await fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...donationData, year: activeYear }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to create donation');
    }
    const created = await res.json();
    await refresh();
    return created;
  };

  const addExpense = async (expenseData: any) => {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...expenseData, year: activeYear }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to create expense');
    }
    const created = await res.json();
    await refresh();
    return created;
  };

  const addDocument = async (docData: any) => {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...docData, year: activeYear }),
    });
    if (!res.ok) throw new Error('Failed to create document');
    const created = await res.json();
    await refresh();
    return created;
  };

  const updateDonationStatus = async (id: string, status: DonationStatus) => {
    const res = await fetch(`/api/donations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update donation status');
    await refresh();
  };

  const updateDonation = async (id: string, donationData: any) => {
    const res = await fetch(`/api/donations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donationData),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'वर्गणी अद्यतन करताना त्रुटी आली.');
    }
    const updated = await res.json();
    await refresh();
    return updated;
  };

  const deleteDonation = async (id: string) => {
    const res = await fetch(`/api/donations/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'वर्गणी हटवताना त्रुटी आली.');
    }
    await refresh();
    return true;
  };

  const updateExpense = async (id: string, expenseData: any) => {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'खर्च अद्यतन करताना त्रुटी आली.');
    }
    const updated = await res.json();
    await refresh();
    return updated;
  };

  const deleteExpense = async (id: string) => {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'खर्च हटवताना त्रुटी आली.');
    }
    await refresh();
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        mandal,
        stats,
        donations,
        expenses,
        documents,
        currentRole,
        setRole,
        activeYear,
        setYear,
        loading,
        refresh,
        addDonation,
        addExpense,
        addDocument,
        updateDonationStatus,
        updateDonation,
        deleteDonation,
        updateExpense,
        deleteExpense,
        isAddDonationOpen,
        setIsAddDonationOpen,
        isAddExpenseOpen,
        setIsAddExpenseOpen,
        isResetAccountsOpen,
        setIsResetAccountsOpen,
        isAccountProfileOpen,
        setIsAccountProfileOpen,
        selectedReceiptForShare,
        setSelectedReceiptForShare,
        donationToEdit,
        setDonationToEdit,
        expenseToEdit,
        setExpenseToEdit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppContextProvider');
  }
  return context;
}
