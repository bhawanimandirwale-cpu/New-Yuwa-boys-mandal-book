import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDocument extends Document {
  mandalId: mongoose.Types.ObjectId;
  title: string;
  category: 'POLICE' | 'MUNICIPAL' | 'FIRE_NOC' | 'ELECTRICITY' | 'INSURANCE' | 'OTHER';
  fileUrl: string;
  year: number;
  uploadedBy?: mongoose.Types.ObjectId;
  status: 'APPROVED' | 'IN_PROCESS' | 'EXPIRED';
  officerNotes?: string;
  createdAt: Date;
}

const DocumentSchema: Schema<IDocument> = new Schema(
  {
    mandalId: { type: Schema.Types.ObjectId, ref: 'Mandal', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['POLICE', 'MUNICIPAL', 'FIRE_NOC', 'ELECTRICITY', 'INSURANCE', 'OTHER'],
      default: 'OTHER',
      index: true,
    },
    fileUrl: { type: String, required: true },
    year: { type: Number, default: 2026, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['APPROVED', 'IN_PROCESS', 'EXPIRED'],
      default: 'APPROVED',
    },
    officerNotes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const PermitDocument: Model<IDocument> =
  mongoose.models.PermitDocument || mongoose.model<IDocument>('PermitDocument', DocumentSchema);
