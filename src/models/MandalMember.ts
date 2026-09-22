import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMandalMember extends Document {
  mandalId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'ADMIN' | 'TREASURER' | 'VOLUNTEER' | 'MEMBER';
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED';
  joinedAt: Date;
}

const MandalMemberSchema: Schema<IMandalMember> = new Schema(
  {
    mandalId: { type: Schema.Types.ObjectId, ref: 'Mandal', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: {
      type: String,
      enum: ['ADMIN', 'TREASURER', 'VOLUNTEER', 'MEMBER'],
      default: 'VOLUNTEER',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INVITED', 'SUSPENDED'],
      default: 'ACTIVE',
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Prevent duplicate membership for same user in same mandal
MandalMemberSchema.index({ mandalId: 1, userId: 1 }, { unique: true });

export const MandalMember: Model<IMandalMember> =
  mongoose.models.MandalMember ||
  mongoose.model<IMandalMember>('MandalMember', MandalMemberSchema);
