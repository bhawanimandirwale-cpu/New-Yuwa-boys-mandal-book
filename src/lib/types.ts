export type UserRole = 'ADMIN' | 'TREASURER' | 'VOLUNTEER' | 'MEMBER';

export interface MandalInfo {
  id: string;
  name: string;
  tagline: string;
  registrationNumber: string;
  establishedYear: number;
  address: string;
  city: string;
  logoUrl?: string;
  upiId: string;
  activeYear: number;
  cashInHand: number;
  bankBalance: number;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  presidentName: string;
  vicePresidentName?: string;
  secretaryName: string;
  treasurerName: string;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatarUrl?: string;
  mandalId: string;
}

export type PaymentMode = 'CASH' | 'UPI' | 'CHEQUE' | 'ONLINE';
export type DonationStatus = 'PAID' | 'PLEDGED';

export interface VarganiDonationItem {
  id: string;
  mandalId: string;
  donorName: string;
  donorPhone: string;
  buildingFlat: string;
  amount: number;
  paymentMode: PaymentMode;
  isInKind: boolean;
  inKindDetails?: string;
  receiptNo: string;
  collectorName: string;
  collectorId?: string;
  year: number;
  status: DonationStatus;
  pledgeDate?: string;
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory = 
  | 'MANDAP' 
  | 'IDOL' 
  | 'LIGHTING' 
  | 'SOUND_DJ' 
  | 'PRASAD' 
  | 'LEGAL_PERMIT' 
  | 'IMMERSION' 
  | 'MISC';

export interface ExpenseItem {
  id: string;
  mandalId: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  paidTo: string;
  paidBy: string;
  billUrl?: string;
  voucherNo: string;
  year: number;
  date: string;
  approvedBy?: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export type DocumentCategory = 
  | 'POLICE' 
  | 'MUNICIPAL' 
  | 'FIRE_NOC' 
  | 'ELECTRICITY' 
  | 'INSURANCE' 
  | 'OTHER';

export interface PermitDocumentItem {
  id: string;
  mandalId: string;
  title: string;
  category: DocumentCategory;
  fileUrl: string;
  year: number;
  status: 'APPROVED' | 'IN_PROCESS' | 'EXPIRED';
  officerNotes?: string;
  uploadedAt: string;
}
