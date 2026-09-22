import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { ReceiptCard } from '@/components/receipts/ReceiptCard';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Download, CheckCircle2 } from 'lucide-react';

interface ReceiptPageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicReceiptPage({ params }: ReceiptPageProps) {
  const { id } = await params;

  const donation = await db.varganiDonation.findFirst({
    where: {
      OR: [{ id }, { receiptNo: id }],
    },
    include: {
      mandal: true,
    },
  });

  if (!donation) {
    notFound();
  }

  // Convert dates and relations to plain JSON for client component
  const donationItem = {
    ...donation,
    createdAt: donation.createdAt.toISOString(),
    pledgeDate: donation.pledgeDate ? donation.pledgeDate.toISOString() : undefined,
  };

  const mandalItem = donation.mandal
    ? {
        ...donation.mandal,
        tagline: donation.mandal.tagline || '',
        registrationNumber: donation.mandal.registrationNumber || '',
        establishedYear: donation.mandal.establishedYear || 1984,
        address: donation.mandal.address || '',
        logoUrl: donation.mandal.logoUrl || undefined,
        upiId: donation.mandal.upiId || 'mandal@upi',
        bankName: donation.mandal.bankName || '',
        accountNumber: donation.mandal.accountNumber || '',
        ifscCode: donation.mandal.ifscCode || '',
        presidentName: donation.mandal.presidentName || '',
        secretaryName: donation.mandal.secretaryName || '',
        treasurerName: donation.mandal.treasurerName || '',
      }
    : null;

  return (
    <div className="min-h-screen py-6 px-3 flex flex-col items-center justify-center bg-gray-50/70 notranslate">
      {/* Top Banner */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-bold text-saffron-700 bg-orange-100/70 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>मुख्य डॅशबोर्ड</span>
        </Link>
        <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 text-xs font-bold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>सत्यापित पावती</span>
        </div>
      </div>

      {/* Render Receipt */}
      <ReceiptCard donation={donationItem as any} mandal={mandalItem} />

      {/* Verification explanation */}
      <div className="w-full max-w-md mt-4 p-3 bg-white rounded-2xl border border-gray-200 text-center text-xs text-gray-500 shadow-sm">
        <ShieldCheck className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
        <p className="font-semibold text-gray-800">
          ही पावती मंडळाच्या अधिकृत डिजिटल बहीखात्याशी (MandalBook) संलग्न आहे.
        </p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          पावती क्र: {donation.receiptNo} • नोंदणी वर्ष: {donation.year}
        </p>
      </div>
    </div>
  );
}
