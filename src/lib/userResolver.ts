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

export function maskEmail(email?: string | null): string {
  if (!email || !email.includes('@')) return '';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

export function maskPhone(phone?: string | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length >= 10) {
    const last10 = digits.slice(-10);
    return `+91 ${last10.slice(0, 4)}***${last10.slice(-3)}`;
  }
  return phone;
}

/**
 * Checks whether a given mobile phone number is available or already owned by another user.
 */
export async function isPhoneAvailable(
  phone: string,
  excludeUserId?: string | mongoose.Types.ObjectId
): Promise<{ available: boolean; ownerEmail?: string }> {
  await connectToDatabase();
  const clean10 = getClean10Digits(phone);
  if (!clean10) return { available: false };

  // Adhyaksh official numbers (7499085045, 9923092340) are strictly reserved
  const isAdhyakshNumber = clean10 === '7499085045' || clean10 === '9923092340';
  if (isAdhyakshNumber) {
    const adhyaksh = await User.findOne({ email: 'bhawanimandirwale@gmail.com' });
    if (!excludeUserId || (adhyaksh && excludeUserId.toString() !== adhyaksh._id.toString())) {
      return {
        available: false,
        ownerEmail: maskEmail('bhawanimandirwale@gmail.com'),
      };
    }
  }

  const query: any = {
    $or: [
      { phone: clean10 },
      { phone: `+91${clean10}` },
      { phone: `91${clean10}` },
    ],
  };

  if (excludeUserId && mongoose.Types.ObjectId.isValid(excludeUserId.toString())) {
    query._id = { $ne: new mongoose.Types.ObjectId(excludeUserId.toString()) };
  }

  const existing = await User.findOne(query);
  if (existing) {
    return {
      available: false,
      ownerEmail: existing.email ? maskEmail(existing.email) : undefined,
    };
  }
  return { available: true };
}

/**
 * Checks whether a given email address is available or already owned by another user.
 */
export async function isEmailAvailable(
  email: string,
  excludeUserId?: string | mongoose.Types.ObjectId
): Promise<{ available: boolean; ownerPhone?: string }> {
  await connectToDatabase();
  const normalized = email.toLowerCase().trim();
  if (!normalized) return { available: false };

  // Adhyaksh official email is strictly reserved
  if (normalized === 'bhawanimandirwale@gmail.com') {
    const adhyaksh = await User.findOne({ email: 'bhawanimandirwale@gmail.com' });
    if (!excludeUserId || (adhyaksh && excludeUserId.toString() !== adhyaksh._id.toString())) {
      return {
        available: false,
        ownerPhone: maskPhone('+917499085045'),
      };
    }
  }

  const query: any = { email: normalized };
  if (excludeUserId && mongoose.Types.ObjectId.isValid(excludeUserId.toString())) {
    query._id = { $ne: new mongoose.Types.ObjectId(excludeUserId.toString()) };
  }

  const existing = await User.findOne(query);
  if (existing) {
    return {
      available: false,
      ownerPhone: existing.phone ? maskPhone(existing.phone) : undefined,
    };
  }
  return { available: true };
}

/**
 * Universal Account Resolution & Unification Engine
 * Integrates Phone number and Email together into a SINGLE unified user document in MongoDB.
 * Enforces strict 1:1 unique mapping (1 Phone = 1 Email). No sharing across different accounts.
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
        // Check if collision between two DIFFERENT users with both phone and email
        const userWithEmail = candidates.find((c) => c.email === normalizedEmail);
        const userWithPhone = candidates.find(
          (c) => c.phone && getClean10Digits(c.phone) === clean10
        );

        if (
          userWithEmail &&
          userWithPhone &&
          userWithEmail._id.toString() !== userWithPhone._id.toString()
        ) {
          // If both users already have their own distinct identities, do NOT silently hijack!
          if (userWithPhone.email && userWithPhone.email !== normalizedEmail) {
            throw new Error(
              `हा मोबाईल नंबर (+91 ${clean10}) आधीच दुसऱ्या खात्याशी (${maskEmail(
                userWithPhone.email
              )}) जोडलेला आहे. कृपया आपला नवीन नंबर वापरा.`
            );
          }
          if (userWithEmail.phone && getClean10Digits(userWithEmail.phone) !== clean10) {
            throw new Error(
              `हा ईमेल (${normalizedEmail}) आधीच दुसऱ्या मोबाईल नंबरशी जोडलेला आहे.`
            );
          }

          // Otherwise merge incomplete profile
          const primary = userWithEmail;
          const duplicate = userWithPhone;

          if (!primary.phone && duplicate.phone) primary.phone = duplicate.phone;
          if ((!primary.name || primary.name === 'मंडळ कार्यकर्ता') && duplicate.name) {
            primary.name = duplicate.name;
          }
          if (!primary.avatarUrl && duplicate.avatarUrl) primary.avatarUrl = duplicate.avatarUrl;

          await Donation.updateMany({ collectorId: duplicate._id }, { $set: { collectorId: primary._id } });
          await Expense.updateMany({ paidByMemberId: duplicate._id }, { $set: { paidByMemberId: primary._id } });
          await MandalMember.deleteMany({ userId: duplicate._id });
          await User.deleteOne({ _id: duplicate._id });

          user = primary;
        } else {
          user = candidates[0];
        }
      }
    }

    if (!user) {
      // Check availability before creating new user
      if (formattedPhone) {
        const phoneCheck = await isPhoneAvailable(formattedPhone);
        if (!phoneCheck.available) {
          throw new Error(
            `हा मोबाईल नंबर (+91 ${clean10}) आधीच दुसऱ्या खात्याशी जोडलेला आहे.`
          );
        }
      }
      if (normalizedEmail) {
        const emailCheck = await isEmailAvailable(normalizedEmail);
        if (!emailCheck.available) {
          throw new Error(`हा ईमेल (${normalizedEmail}) आधीच दुसऱ्या खात्याशी जोडलेला आहे.`);
        }
      }

      // Create fresh user
      user = await User.create({
        name:
          name?.trim() ||
          (normalizedEmail
            ? normalizedEmail.split('@')[0]
            : clean10
            ? `कार्यकर्ता (${clean10.slice(-4)})`
            : 'मंडळ कार्यकर्ता'),
        email: normalizedEmail || undefined,
        phone: formattedPhone || undefined,
        role: 'USER',
        avatarUrl: avatarUrl || '',
      });
    } else {
      let updated = false;

      // Link email if user document did not have it
      if (normalizedEmail && (!user.email || user.email === '')) {
        const emailCheck = await isEmailAvailable(normalizedEmail, user._id);
        if (!emailCheck.available) {
          throw new Error(
            `हा ईमेल (${normalizedEmail}) आधीच दुसऱ्या खात्याशी जोडलेला आहे. कृपया स्वतःचा वेगळा ईमेल वापरा.`
          );
        }
        user.email = normalizedEmail;
        updated = true;
      }

      // Link phone if user document did not have it
      if (formattedPhone && (!user.phone || user.phone === '')) {
        const phoneCheck = await isPhoneAvailable(formattedPhone, user._id);
        if (!phoneCheck.available) {
          throw new Error(
            `हा मोबाईल नंबर (+91 ${clean10}) आधीच दुसऱ्या खात्याशी जोडलेला आहे. कृपया आपला नवीन नंबर वापरा.`
          );
        }
        user.phone = formattedPhone;
        updated = true;
      }

      // Set friendly name if unset or default
      if (
        name?.trim() &&
        (!user.name || user.name === 'मंडळ कार्यकर्ता' || user.name.startsWith('कार्यकर्ता'))
      ) {
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
