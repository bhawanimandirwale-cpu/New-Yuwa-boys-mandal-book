'use client';

import React from 'react';
import { DonationModal } from '@/components/donations/DonationModal';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';
import { ReceiptShareModal } from '@/components/receipts/ReceiptShareModal';
import { InstallPromptModal } from '@/components/pwa/InstallPromptModal';

export function GlobalModals() {
  return (
    <>
      <DonationModal />
      <ExpenseModal />
      <ReceiptShareModal />
      <InstallPromptModal />
    </>
  );
}
