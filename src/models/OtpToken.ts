import mongoose, { Schema, Document, Model, models, model } from 'mongoose';

export interface IOtpToken extends Document {
  phone?: string;
  email?: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
}

const OtpTokenSchema: Schema<IOtpToken> = new Schema(
  {
    phone: { type: String, sparse: true, index: true, trim: true },
    email: { type: String, sparse: true, index: true, lowercase: true, trim: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true, expires: 300 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const OtpToken: Model<IOtpToken> =
  models.OtpToken || model<IOtpToken>('OtpToken', OtpTokenSchema);

export default OtpToken;
