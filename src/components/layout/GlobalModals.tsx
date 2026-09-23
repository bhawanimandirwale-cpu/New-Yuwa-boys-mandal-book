'use client';

import React from 'react';
import { CollectDrawer } from '@/components/vargani/CollectDrawer';
import { AddExpenseDrawer } from '@/components/expense/AddExpenseDrawer';
import { ReceiptShareModal } from '@/components/receipts/ReceiptShareModal';
import { InstallPromptModal } from '@/components/pwa/InstallPromptModal';
import { ResetAccountsModal } from '@/components/modals/ResetAccountsModal';
import { AccountProfileModal } from '@/components/modals/AccountProfileModal';
import { EditDonationModal } from '@/components/modals/EditDonationModal';
import { EditExpenseModal } from '@/components/modals/EditExpenseModal';

export function GlobalModals() {
  return (
    <>
      <CollectDrawer />
      <AddExpenseDrawer />
      <ReceiptShareModal />
      <InstallPromptModal />
      <ResetAccountsModal />
      <AccountProfileModal />
      <EditDonationModal />
      <EditExpenseModal />
    </>
  );
}
