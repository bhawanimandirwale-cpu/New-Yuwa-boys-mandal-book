import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDonation extends Document {
  mandalId: mongoose.Types.ObjectId;
  receiptNo: string;
  donorName: string;
  donorPhone?: string;
  buildingFlat?: string;
  amount: number;
  amountInWords?: string;
  paymentMode: 'CASH' | 'UPI' | 'CHEQUE' | 'ONLINE';
  isInKind: boolean;
  inKindDetails?: string;
  collectorId?: mongoose.Types.ObjectId;
  collectorName?: string;
  year: number;
  status: 'PAID' | 'PLEDGED';
  pledgeFollowUpDate?: Date;
  notes?: string;
  createdAt: Date;
}

const DonationSchema: Schema<IDonation> = new Schema(
  {
    mandalId: { type: Schema.Types.ObjectId, ref: 'Mandal', required: true, index: true },
    receiptNo: { type: String, required: true, index: true },
    donorName: { type: String, required: true, trim: true },
    donorPhone: { type: String, default: '', trim: true },
    buildingFlat: { type: String, default: '' },
    amount: { type: Number, required: true, min: 0 },
    amountInWords: { type: String, default: '' },
    paymentMode: {
      type: String,
      enum: ['CASH', 'UPI', 'CHEQUE', 'ONLINE'],
      default: 'CASH',
    },
    isInKind: { type: Boolean, default: false },
    inKindDetails: { type: String, default: '' },
    collectorId: { type: Schema.Types.ObjectId, ref: 'User' },
    collectorName: { type: String, default: 'न्यू युवा बॉईज कार्यकर्ता' },
    year: { type: Number, default: 2026, index: true },
    status: {
      type: String,
      enum: ['PAID', 'PLEDGED'],
      default: 'PAID',
      index: true,
    },
    pledgeFollowUpDate: { type: Date },
    notes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

DonationSchema.index({ mandalId: 1, receiptNo: 1 }, { unique: true });

export const Donation: Model<IDonation> =
  mongoose.models.Donation || mongoose.model<IDonation>('Donation', DonationSchema);
