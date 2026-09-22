import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMandal extends Document {
  name: string;
  tagline?: string;
  registrationNo?: string;
  establishedYear?: number;
  address?: string;
  city?: string;
  logoUrl?: string;
  upiId: string;
  helplinePhone: string;
  activeYear: number;
  inviteCode: string;
  cashInHand: number;
  bankBalance: number;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  presidentName?: string;
  vicePresidentName?: string;
  secretaryName?: string;
  treasurerName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MandalSchema: Schema<IMandal> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: 'न्यू युवा बॉईज - भव्य सार्वजनिक गणेशोत्सव २०२६' },
    registrationNo: { type: String, default: 'महा/केऱ्हाळे/२०२६' },
    establishedYear: { type: Number, default: 2012 },
    address: { type: String, default: 'मेन चौक, केऱ्हाळे बुद्रुक (Kerhale Bk.)' },
    city: { type: String, default: 'केऱ्हाळे बु.' },
    logoUrl: { type: String, default: '' },
    upiId: { type: String, default: process.env.NEXT_PUBLIC_DEFAULT_UPI_ID || '9923092340@ybl' },
    helplinePhone: { type: String, default: process.env.NEXT_PUBLIC_DEFAULT_PHONE || '7499085045' },
    activeYear: { type: Number, default: 2026 },
    inviteCode: { type: String, unique: true, uppercase: true, trim: true, default: 'NYB026' },
    cashInHand: { type: Number, default: 42500 },
    bankBalance: { type: Number, default: 125000 },
    bankName: { type: String, default: 'स्टेट बँक ऑफ इंडिया (केऱ्हाळे शाखा)' },
    accountNumber: { type: String, default: '३९४८२९१०३९४' },
    ifscCode: { type: String, default: 'SBIN0001234' },
    presidentName: { type: String, default: 'पार्थ पाटील (अध्यक्ष)' },
    vicePresidentName: { type: String, default: 'कुश पाटील (उपअध्यक्ष)' },
    secretaryName: { type: String, default: 'श्री. सचिन तायडे (सचिव)' },
    treasurerName: { type: String, default: 'कृष्णा महाजन (खजिनदार)' },
  },
  { timestamps: true }
);

export const Mandal: Model<IMandal> =
  mongoose.models.Mandal || mongoose.model<IMandal>('Mandal', MandalSchema);
