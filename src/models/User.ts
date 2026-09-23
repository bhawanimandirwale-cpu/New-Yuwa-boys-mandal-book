import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
  role: 'SUPER_ADMIN' | 'USER';
  activeMandalId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, default: 'मंडळ कार्यकर्ता', trim: true },
    phone: { type: String, unique: true, sparse: true, index: true, trim: true },
    email: { type: String, unique: true, sparse: true, index: true, lowercase: true, trim: true },
    avatarUrl: { type: String, default: '' },
    role: { type: String, enum: ['SUPER_ADMIN', 'USER'], default: 'USER' },
    activeMandalId: { type: Schema.Types.ObjectId, ref: 'Mandal' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

// Ensure empty strings don't trigger sparse index collisions
UserSchema.pre('save', function () {
  if (this.phone === '') {
    this.phone = undefined;
  }
  if (this.email === '') {
    this.email = undefined;
  }
});

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
