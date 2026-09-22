import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { User, IUser } from '@/models/User';
import { Mandal, IMandal } from '@/models/Mandal';
import { MandalMember } from '@/models/MandalMember';
import { Donation } from '@/models/Donation';
import { Expense } from '@/models/Expense';

export interface ResolveUnifiedUserParams {
  id?: string | null;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
}

export function normalizePhoneNumber(input?: string | null): string {
  if (!input) return '';
  const digits = input.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return input.startsWith('+') ? input : `+91${digits.slice(-10)}`;
}

export function getClean10Digits(input?: string | null): string {
  if (!input) return '';
  const digits = input.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

/**
 * Universal Account Resolution & Unification Engine
 * Integrates Phone number and Email together into a SINGLE unified user document in MongoDB.
 * Completely eliminates duplicate accounts across Google OAuth, Phone SMS OTP, and Email OTP login methods.
 */
export async function resolveUnifiedUser({
  id,
  email,
  phone,
  name,
  avatarUrl,
}: ResolveUnifiedUserParams) {
  await connectToDatabase();

  const normalizedEmail = email ? email.toLowerCase().trim() : '';
  const clean10 = getClean10Digits(phone);
  const formattedPhone = clean10 ? `+91${clean10}` : '';

  // 1. Identify if Adhyaksh (Parth Patil: bhawanimandirwale@gmail.com, 7499085045, 9923092340)
  const isAdhyaksh =
    normalizedEmail === 'bhawanimandirwale@gmail.com' ||
    clean10 === '7499085045' ||
    clean10 === '9923092340';

  let user = null;

  if (isAdhyaksh) {
    // Look up canonical Adhyaksh by email OR known phone numbers
    user = await User.findOne({
      $or: [
        { email: 'bhawanimandirwale@gmail.com' },
        { phone: { $in: ['7499085045', '+917499085045', '9923092340', '+919923092340', '917499085045', '919923092340'] } },
      ],
    });

    if (!user) {
      user = await User.create({
        name: 'पार्थ पाटील (अध्यक्ष)',
        email: 'bhawanimandirwale@gmail.com',
        phone: formattedPhone || '+917499085045',
        role: 'SUPER_ADMIN',
        avatarUrl: avatarUrl || '',
      });
    } else {
      user.name = 'पार्थ पाटील (अध्यक्ष)';
      user.email = 'bhawanimandirwale@gmail.com';
      if (formattedPhone) {
        user.phone = formattedPhone;
      } else if (!user.phone) {
        user.phone = '+917499085045';
      }
      user.role = 'SUPER_ADMIN';
      if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
      await user.save();

      // Merge and clean up any stray duplicate Adhyaksh records
      const duplicateAdhyakshs = await User.find({
        _id: { $ne: user._id },
        $or: [
          { email: 'bhawanimandirwale@gmail.com' },
          { phone: { $in: ['7499085045', '+917499085045', '9923092340', '+919923092340'] } },
        ],
      });

      for (const dup of duplicateAdhyakshs) {
        await Donation.updateMany({ collectorId: dup._id }, { $set: { collectorId: user._id } });
        await Expense.updateMany({ paidByMemberId: dup._id }, { $set: { paidByMemberId: user._id } });
        await MandalMember.deleteMany({ userId: dup._id });
        await User.deleteOne({ _id: dup._id });
      }
    }
  } else {
    // 2. Regular Member/Volunteer: Search by ID, Email, OR Phone
    const searchConditions: any[] = [];

    if (id && mongoose.Types.ObjectId.isValid(id)) {
      searchConditions.push({ _id: new mongoose.Types.ObjectId(id) });
    }
    if (normalizedEmail) {
      searchConditions.push({ email: normalizedEmail });
    }
    if (clean10) {
      searchConditions.push(
        { phone: clean10 },
        { phone: `+91${clean10}` },
        { phone: `91${clean10}` }
      );
    }

    if (searchConditions.length > 0) {
      const candidates = await User.find({ $or: searchConditions });

      if (candidates.length === 1) {
        user = candidates[0];
      } else if (candidates.length > 1) {
        // Multi-Account Collision: Merge multiple profiles (e.g. one had email, one had phone) into canonical
        const primary = candidates[0];
        const duplicates = candidates.slice(1);

        for (const dup of duplicates) {
          // Inherit fields if primary lacks them
          if (!primary.email && dup.email) primary.email = dup.email;
          if (!primary.phone && dup.phone) primary.phone = dup.phone;
          if ((!primary.name || primary.name === 'मंडळ कार्यकर्ता') && dup.name) primary.name = dup.name;
          if (!primary.avatarUrl && dup.avatarUrl) primary.avatarUrl = dup.avatarUrl;

          // Migrate references to primary
          await Donation.updateMany({ collectorId: dup._id }, { $set: { collectorId: primary._id } });
          await Expense.updateMany({ paidByMemberId: dup._id }, { $set: { paidByMemberId: primary._id } });
          await MandalMember.deleteMany({ userId: dup._id });
          await User.deleteOne({ _id: dup._id });
        }

        user = primary;
      }
    }

    if (!user) {
      // Create fresh unified user
      user = await User.create({
        name: name?.trim() || (normalizedEmail ? normalizedEmail.split('@')[0] : (clean10 ? `कार्यकर्ता (${clean10.slice(-4)})` : 'मंडळ कार्यकर्ता')),
        email: normalizedEmail || undefined,
        phone: formattedPhone || undefined,
        role: 'USER',
        avatarUrl: avatarUrl || '',
      });
    } else {
      let updated = false;
      // Link email if user document did not have it
      if (normalizedEmail && (!user.email || user.email === '')) {
        user.email = normalizedEmail;
        updated = true;
      }
      // Link phone if user document did not have it
      if (formattedPhone && (!user.phone || user.phone === '')) {
        user.phone = formattedPhone;
        updated = true;
      }
      // Set friendly name if unset or default
      if (name?.trim() && (!user.name || user.name === 'मंडळ कार्यकर्ता' || user.name.startsWith('कार्यकर्ता'))) {
        user.name = name.trim();
        updated = true;
      }
      if (avatarUrl && !user.avatarUrl) {
        user.avatarUrl = avatarUrl;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }
  }

  // 3. Mandal Membership Synchronization
  const mandal = await Mandal.findOne();
  let role = isAdhyaksh ? 'ADMIN' : 'PENDING';
  let status = isAdhyaksh ? 'ACTIVE' : 'PENDING';

  if (mandal) {
    let member = await MandalMember.findOne({ mandalId: mandal._id, userId: user._id });
    if (!member) {
      member = await MandalMember.create({
        mandalId: mandal._id,
        userId: user._id,
        role: isAdhyaksh ? 'ADMIN' : 'VOLUNTEER',
        status: isAdhyaksh ? 'ACTIVE' : 'ACTIVE',
      });
    } else if (isAdhyaksh && (member.role !== 'ADMIN' || member.status !== 'ACTIVE')) {
      member.role = 'ADMIN';
      member.status = 'ACTIVE';
      await member.save();
    }

    // Clean up any duplicate memberships for this mandal & user
    await MandalMember.deleteMany({
      mandalId: mandal._id,
      userId: user._id,
      _id: { $ne: member._id },
    });

    if (isAdhyaksh) {
      role = 'ADMIN';
      status = 'ACTIVE';
    } else {
      role = member.status === 'ACTIVE' ? member.role : 'PENDING';
      status = member.status;
    }
  }

  return { user, mandal, role, status };
}
