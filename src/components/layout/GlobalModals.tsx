'use client';

import React from 'react';
import { CollectDrawer } from '@/components/vargani/CollectDrawer';
import { AddExpenseDrawer } from '@/components/expense/AddExpenseDrawer';
import { ReceiptShareModal } from '@/components/receipts/ReceiptShareModal';
import { InstallPromptModal } from '@/components/pwa/InstallPromptModal';

export function GlobalModals() {
  return (
    <>
      <CollectDrawer />
      <AddExpenseDrawer />
      <ReceiptShareModal />
      <InstallPromptModal />
    </>
  );
}
