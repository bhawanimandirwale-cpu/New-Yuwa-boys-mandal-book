import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  role: 'SUPER_ADMIN' | 'USER';
  createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    role: { type: String, enum: ['SUPER_ADMIN', 'USER'], default: 'USER' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
