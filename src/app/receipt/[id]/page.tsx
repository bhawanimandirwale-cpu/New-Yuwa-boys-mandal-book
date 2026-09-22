import { connectToDatabase } from '@/lib/mongodb';
import { Donation } from '@/models/Donation';
import { Mandal } from '@/models/Mandal';
import mongoose from 'mongoose';
import { notFound } from 'next/navigation';
import { ReceiptCard } from '@/components/receipts/ReceiptCard';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ReceiptPageProps {
  params: Promise<{ id: string }>;
}

export default async function PublicReceiptPage({ params }: ReceiptPageProps) {
  const { id } = await params;

  await connectToDatabase();

  const query: any = {};
  if (mongoose.Types.ObjectId.isValid(id)) {
    query.$or = [{ _id: id }, { receiptNo: id }];
  } else {
    query.receiptNo = id;
  }

  const donation = await Donation.findOne(query).populate('mandalId');

  if (!donation) {
    notFound();
  }

  const mandal = (donation.mandalId as any) || (await Mandal.findOne());

  const donationItem = {
    id: donation._id.toString(),
    donorName: donation.donorName,
    donorPhone: donation.donorPhone,
    buildingFlat: donation.buildingFlat,
    amount: donation.amount,
    amountInWords: donation.amountInWords,
    paymentMode: donation.paymentMode,
    isInKind: donation.isInKind,
    inKindDetails: donation.inKindDetails,
    receiptNo: donation.receiptNo,
    collectorName: donation.collectorName,
    year: donation.year,
    status: donation.status,
    notes: donation.notes,
    createdAt: donation.createdAt.toISOString(),
  };

  const mandalItem = mandal
    ? {
        id: mandal._id ? mandal._id.toString() : 'mandal-1',
        name: mandal.name,
        tagline: mandal.tagline || 'न्यू युवा बॉईज - भव्य सार्वजनिक गणेशोत्सव २०२६',
        registrationNumber: mandal.registrationNo || 'महा/केऱ्हाळे/२०२६',
        establishedYear: mandal.establishedYear || 2012,
        address: mandal.address || 'मेन चौक, केऱ्हाळे बुद्रुक (Kerhale Bk.)',
        city: mandal.city || 'केऱ्हाळे बु.',
        logoUrl: mandal.logoUrl || undefined,
        upiId: mandal.upiId || '9923092340@ybl',
        activeYear: mandal.activeYear || 2026,
        cashInHand: mandal.cashInHand || 0,
        bankBalance: mandal.bankBalance || 0,
        bankName: mandal.bankName || 'स्टेट बँक ऑफ इंडिया (केऱ्हाळे शाखा)',
        accountNumber: mandal.accountNumber || '३९४८२९१०३९४',
        ifscCode: mandal.ifscCode || 'SBIN0001234',
        presidentName: mandal.presidentName || 'श्री. निलेश पाटील (अध्यक्ष)',
        secretaryName: mandal.secretaryName || 'श्री. सचिन तायडे (सचिव)',
        treasurerName: mandal.treasurerName || 'श्री. भूषण चौधरी (खजिनदार)',
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
