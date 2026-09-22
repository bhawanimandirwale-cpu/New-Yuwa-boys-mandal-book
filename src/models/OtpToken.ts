import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOtpToken extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
}

const OtpTokenSchema: Schema<IOtpToken> = new Schema(
  {
    email: { type: String, required: true, index: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: '10m' } },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const OtpToken: Model<IOtpToken> =
  mongoose.models.OtpToken || mongoose.model<IOtpToken>('OtpToken', OtpTokenSchema);
