'use client';

import React from 'react';
import { DonationModal } from '@/components/donations/DonationModal';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';
import { ReceiptShareModal } from '@/components/receipts/ReceiptShareModal';

export function GlobalModals() {
  return (
    <>
      <DonationModal />
      <ExpenseModal />
      <ReceiptShareModal />
    </>
  );
}
