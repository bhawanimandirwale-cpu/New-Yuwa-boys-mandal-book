import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
  mandalId: mongoose.Types.ObjectId;
  voucherNo: string;
  title: string;
  category: 'MANDAP' | 'IDOL' | 'LIGHTING' | 'SOUND_DJ' | 'PRASAD' | 'LEGAL_PERMIT' | 'IMMERSION' | 'MISC';
  amount: number;
  paidTo: string;
  paidByMemberId?: mongoose.Types.ObjectId;
  paidBy: string;
  billUrl?: string;
  paymentMode: 'CASH' | 'UPI' | 'CHEQUE';
  date: Date;
  year: number;
  approvedBy?: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdAt: Date;
}

const ExpenseSchema: Schema<IExpense> = new Schema(
  {
    mandalId: { type: Schema.Types.ObjectId, ref: 'Mandal', required: true, index: true },
    voucherNo: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['MANDAP', 'IDOL', 'LIGHTING', 'SOUND_DJ', 'PRASAD', 'LEGAL_PERMIT', 'IMMERSION', 'MISC'],
      default: 'MISC',
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    paidTo: { type: String, required: true, trim: true },
    paidByMemberId: { type: Schema.Types.ObjectId, ref: 'User' },
    paidBy: { type: String, default: 'भूषण चौधरी (खजिनदार)' },
    billUrl: { type: String, default: '' },
    paymentMode: {
      type: String,
      enum: ['CASH', 'UPI', 'CHEQUE'],
      default: 'CASH',
    },
    date: { type: Date, default: Date.now },
    year: { type: Number, default: 2026, index: true },
    approvedBy: { type: String, default: 'निलेश पाटील (अध्यक्ष)' },
    status: {
      type: String,
      enum: ['APPROVED', 'PENDING', 'REJECTED'],
      default: 'APPROVED',
      index: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

ExpenseSchema.index({ mandalId: 1, voucherNo: 1 }, { unique: true });

export const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
