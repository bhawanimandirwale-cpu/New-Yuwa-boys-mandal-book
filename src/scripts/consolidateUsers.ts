import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI is not set');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) {
    console.error('Failed to get database handle');
    process.exit(1);
  }

  const usersColl = db.collection('users');
  const mmColl = db.collection('mandalmembers');

  console.log('--- Starting User Account Consolidation ---');

  // 1. Find or create master Parth Patil user
  let master = await usersColl.findOne({ email: 'bhawanimandirwale@gmail.com' });
  if (master) {
    console.log('Found Master Adhyaksh User:', master._id);
    await usersColl.updateOne(
      { _id: master._id },
      {
        $set: {
          phone: '+917499085045',
          name: 'पार्थ पाटील (अध्यक्ष)',
          role: 'SUPER_ADMIN',
        },
      }
    );
  }

  // 2. Find any duplicate adhyaksh users with phone 7499085045 or 9923092340
  const dups = await usersColl.find({
    ...(master ? { _id: { $ne: master._id } } : {}),
    $or: [
      { phone: '+919923092340' },
      { phone: '9923092340' },
      { phone: '+917499085045' },
      { phone: '7499085045' },
      { email: 'bhawanimandirwale@gmail.com' },
    ],
  }).toArray();

  console.log('Duplicate Adhyaksh users found:', dups.length);
  for (const d of dups) {
    console.log('Merging & removing duplicate user:', d._id, d.phone, d.email);
    if (master) {
      await mmColl.deleteMany({ userId: d._id });
      await db.collection('donations').updateMany({ collectorId: d._id }, { $set: { collectorId: master._id } });
      await db.collection('expenses').updateMany({ approvedById: d._id }, { $set: { approvedById: master._id } });
    }
    await usersColl.deleteOne({ _id: d._id });
  }

  // 3. Remove duplicate mandalmembers
  const allMm = await mmColl.find({}).toArray();
  const seen = new Set();
  for (const m of allMm) {
    const key = m.mandalId.toString() + '_' + m.userId.toString();
    if (seen.has(key)) {
      console.log('Removing duplicate MandalMember:', m._id);
      await mmColl.deleteOne({ _id: m._id });
    } else {
      seen.add(key);
    }
  }

  // 4. Print clean user state
  const cleanUsers = await usersColl.find({}).toArray();
  console.log('--- Clean Users in Database (' + cleanUsers.length + ') ---');
  cleanUsers.forEach((u) =>
    console.log('User:', { id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role })
  );

  await mongoose.disconnect();
  console.log('--- Consolidation Finished Successfully ---');
}

run().catch((err) => {
  console.error('Error during consolidation:', err);
  process.exit(1);
});
