import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not set in environment!');
  process.exit(1);
}

// Schemas
const MandalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tagline: String,
  registrationNo: String,
  establishedYear: Number,
  address: String,
  city: String,
  logoUrl: String,
  upiId: { type: String, default: '9923092340@ybl' },
  helplinePhone: { type: String, default: '7499085045' },
  activeYear: { type: Number, default: 2026 },
  inviteCode: { type: String, default: 'NYB026' },
  cashInHand: { type: Number, default: 42500 },
  bankBalance: { type: Number, default: 125000 },
  bankName: String,
  accountNumber: String,
  ifscCode: String,
  presidentName: String,
  secretaryName: String,
  treasurerName: String,
}, { timestamps: true });

const DonationSchema = new mongoose.Schema({
  mandalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mandal' },
  receiptNo: String,
  donorName: String,
  donorPhone: String,
  buildingFlat: String,
  amount: Number,
  amountInWords: String,
  paymentMode: String,
  isInKind: Boolean,
  inKindDetails: String,
  collectorName: String,
  year: Number,
  status: String,
  pledgeFollowUpDate: Date,
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

const ExpenseSchema = new mongoose.Schema({
  mandalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mandal' },
  voucherNo: String,
  title: String,
  category: String,
  amount: Number,
  paidTo: String,
  paidBy: String,
  billUrl: String,
  paymentMode: String,
  date: { type: Date, default: Date.now },
  year: Number,
  approvedBy: String,
  status: String,
  createdAt: { type: Date, default: Date.now },
});

const DocumentSchema = new mongoose.Schema({
  mandalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mandal' },
  title: String,
  category: String,
  fileUrl: String,
  year: Number,
  status: String,
  officerNotes: String,
  createdAt: { type: Date, default: Date.now },
});

const Mandal = mongoose.models.Mandal || mongoose.model('Mandal', MandalSchema);
const Donation = mongoose.models.Donation || mongoose.model('Donation', DonationSchema);
const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
const PermitDocument = mongoose.models.PermitDocument || mongoose.model('PermitDocument', DocumentSchema);

async function runSeed() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI as string);
  console.log('Connected to MongoDB Atlas!');

  // Clear existing collections
  await PermitDocument.deleteMany({});
  await Expense.deleteMany({});
  await Donation.deleteMany({});
  await Mandal.deleteMany({});

  // Create Primary Mandal
  const mandal = await Mandal.create({
    name: 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.',
    tagline: 'न्यू युवा बॉईज - भव्य सार्वजनिक गणेशोत्सव २०२६',
    registrationNo: 'नोंदणी क्र. महा/केऱ्हाळे/२०२६',
    establishedYear: 2012,
    address: 'मेन चौक, केऱ्हाळे बुद्रुक (Kerhale Bk.)',
    city: 'केऱ्हाळे बु.',
    upiId: process.env.NEXT_PUBLIC_DEFAULT_UPI_ID || '9923092340@ybl',
    helplinePhone: process.env.NEXT_PUBLIC_DEFAULT_PHONE || '7499085045',
    activeYear: 2026,
    inviteCode: 'NYB026',
    cashInHand: 42500,
    bankBalance: 125000,
    bankName: 'स्टेट बँक ऑफ इंडिया (केऱ्हाळे शाखा)',
    accountNumber: '३९४८२९१०३९४',
    ifscCode: 'SBIN0001234',
    presidentName: 'श्री. निलेश पाटील (अध्यक्ष)',
    secretaryName: 'श्री. सचिन तायडे (सचिव)',
    treasurerName: 'श्री. भूषण चौधरी (खजिनदार)',
  });

  console.log('Created Mandal in Atlas:', mandal._id.toString());

  // Insert initial realistic donations
  await Donation.create([
    {
      mandalId: mandal._id,
      receiptNo: 'MB-2026-00101',
      donorName: 'श्री. विलासराव जगन्नाथ कदम',
      donorPhone: '9823011111',
      buildingFlat: 'फ्लॅट क्र. ४०२, सिद्धिविनायक हाइट्स',
      amount: 25000,
      amountInWords: 'पंचवीस हजार रुपये फक्त',
      paymentMode: 'UPI',
      isInKind: false,
      collectorName: 'न्यू युवा बॉईज कार्यकर्ता',
      year: 2026,
      status: 'PAID',
      notes: 'श्रींची महाआरती व महाप्रसाद देणगी',
      createdAt: new Date('2026-09-15T10:30:00Z'),
    },
    {
      mandalId: mandal._id,
      receiptNo: 'MB-2026-00102',
      donorName: 'सौ. सुवर्णा रमेश कुलकर्णी',
      donorPhone: '9823022222',
      buildingFlat: 'घर क्र. १८, मेन गल्ली, केऱ्हाळे',
      amount: 11000,
      amountInWords: 'अकरा हजार रुपये फक्त',
      paymentMode: 'CASH',
      isInKind: false,
      collectorName: 'न्यू युवा बॉईज कार्यकर्ता',
      year: 2026,
      status: 'PAID',
      notes: 'वार्षिक वर्गणी',
      createdAt: new Date('2026-09-16T11:45:00Z'),
    },
    {
      mandalId: mandal._id,
      receiptNo: 'MB-2026-00103',
      donorName: 'मे. मारुती कन्स्ट्रक्शन्स',
      donorPhone: '9823033333',
      buildingFlat: 'ऑफिस १०, केऱ्हाळे कॉम्प्लेक्स',
      amount: 51000,
      amountInWords: 'एकावन्न हजार रुपये फक्त',
      paymentMode: 'CHEQUE',
      isInKind: false,
      collectorName: 'भूषण चौधरी (खजिनदार)',
      year: 2026,
      status: 'PAID',
      notes: 'धनादेश क्र. ४५९२८१ (SBI)',
      createdAt: new Date('2026-09-17T14:15:00Z'),
    },
    {
      mandalId: mandal._id,
      receiptNo: 'MB-2026-00104',
      donorName: 'श्री. सचिन बाळकृष्ण मोरे',
      donorPhone: '9823044444',
      buildingFlat: 'स्टेशन रोड, केऱ्हाळे बु.',
      amount: 5001,
      amountInWords: 'पाच हजार एक रुपये फक्त',
      paymentMode: 'UPI',
      isInKind: false,
      collectorName: 'न्यू युवा बॉईज कार्यकर्ता',
      year: 2026,
      status: 'PAID',
      createdAt: new Date('2026-09-18T16:20:00Z'),
    },
    {
      mandalId: mandal._id,
      receiptNo: 'MB-2026-00105',
      donorName: 'श्री. गजानन ज्वेलर्स (संजय सराफ)',
      donorPhone: '9823055555',
      buildingFlat: 'बाजार पेठ, केऱ्हाळे',
      amount: 21000,
      amountInWords: 'एकवीस हजार रुपये फक्त',
      paymentMode: 'CASH',
      isInKind: true,
      inKindDetails: 'श्रींच्या मूर्तीसाठी चांदीचा मुकुट (५०० ग्रॅम)',
      collectorName: 'निलेश पाटील (अध्यक्ष)',
      year: 2026,
      status: 'PAID',
      notes: 'वस्तुरूप देणगी अंदाजे मूल्य ₹ २१,०००',
      createdAt: new Date('2026-09-19T12:00:00Z'),
    },
    {
      mandalId: mandal._id,
      receiptNo: 'MB-2026-00106',
      donorName: 'डॉ. अनिरुद्ध श्रीकांत बापट',
      donorPhone: '9823066666',
      buildingFlat: 'बापट हॉस्पिटल, केऱ्हाळे',
      amount: 15000,
      amountInWords: 'पंधरा हजार रुपये फक्त',
      paymentMode: 'UPI',
      isInKind: false,
      collectorName: 'न्यू युवा बॉईज कार्यकर्ता',
      year: 2026,
      status: 'PLEDGED',
      pledgeFollowUpDate: new Date('2026-09-25T10:00:00Z'),
      notes: 'बाकी वर्गणी - २५ तारखेला ऑनलाईन ट्रान्सफर करणार',
      createdAt: new Date('2026-09-20T09:30:00Z'),
    },
    {
      mandalId: mandal._id,
      receiptNo: 'MB-2026-00107',
      donorName: 'श्री. प्रवीण तुकाराम पवार',
      donorPhone: '9823077777',
      buildingFlat: 'पवार गल्ली, केऱ्हाळे',
      amount: 2500,
      amountInWords: 'दोन हजार पाचशे रुपये फक्त',
      paymentMode: 'CASH',
      isInKind: false,
      collectorName: 'न्यू युवा बॉईज कार्यकर्ता',
      year: 2026,
      status: 'PAID',
      createdAt: new Date('2026-09-21T18:40:00Z'),
    },
  ]);

  // Insert initial expenses
  await Expense.create([
    {
      mandalId: mandal._id,
      voucherNo: 'VCH-2026-001',
      title: 'मंडप व स्टेज उभारणी (वाटरप्रूफ मंडप)',
      category: 'MANDAP',
      amount: 45000,
      paidTo: 'मे. रॉयल मंडप डेकोरेटर्स',
      paidBy: 'भूषण चौधरी (खजिनदार)',
      billUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      paymentMode: 'CASH',
      year: 2026,
      approvedBy: 'निलेश पाटील (अध्यक्ष)',
      status: 'APPROVED',
      date: new Date('2026-09-10T11:00:00Z'),
    },
    {
      mandalId: mandal._id,
      voucherNo: 'VCH-2026-002',
      title: 'श्रींची भव्य शाडू मातीची मूर्ती व प्रतिष्ठापना',
      category: 'IDOL',
      amount: 32000,
      paidTo: 'शिल्पकार सचिन कुंभार स्टुडिओ',
      paidBy: 'निलेश पाटील',
      billUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      paymentMode: 'UPI',
      year: 2026,
      approvedBy: 'निलेश पाटील (अध्यक्ष)',
      status: 'APPROVED',
      date: new Date('2026-09-12T14:30:00Z'),
    },
    {
      mandalId: mandal._id,
      voucherNo: 'VCH-2026-003',
      title: 'विद्युत रोषणाई व १० केव्हीए सायलेंट जनरेटर',
      category: 'LIGHTING',
      amount: 28000,
      paidTo: 'ओम साई इलेक्ट्रिकल वर्क्स',
      paidBy: 'भूषण चौधरी',
      billUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      paymentMode: 'CASH',
      year: 2026,
      approvedBy: 'निलेश पाटील (अध्यक्ष)',
      status: 'APPROVED',
      date: new Date('2026-09-14T17:00:00Z'),
    },
    {
      mandalId: mandal._id,
      voucherNo: 'VCH-2026-004',
      title: 'महाप्रसाद बुंदी लाडू (१०० किलो) व वाटप साहित्य',
      category: 'PRASAD',
      amount: 18500,
      paidTo: 'गणेश स्वीट्स, केऱ्हाळे',
      paidBy: 'सचिन तायडे (सचिव)',
      billUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      paymentMode: 'CASH',
      year: 2026,
      approvedBy: 'निलेश पाटील (अध्यक्ष)',
      status: 'APPROVED',
      date: new Date('2026-09-16T10:15:00Z'),
    },
    {
      mandalId: mandal._id,
      voucherNo: 'VCH-2026-005',
      title: 'ग्रामपंचायत मंडप फी व अग्निशामक ना हरकत शुल्क',
      category: 'LEGAL_PERMIT',
      amount: 4200,
      paidTo: 'ग्रामपंचायत कार्यालय, केऱ्हाळे बु.',
      paidBy: 'सचिन तायडे',
      billUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      paymentMode: 'UPI',
      year: 2026,
      approvedBy: 'निलेश पाटील (अध्यक्ष)',
      status: 'APPROVED',
      date: new Date('2026-09-08T12:00:00Z'),
    },
  ]);

  // Insert initial permits
  await PermitDocument.create([
    {
      mandalId: mandal._id,
      title: 'पोलीस ठाणे मंडप व ध्वनी मर्यादा परवानगी पत्र २०२६',
      category: 'POLICE',
      fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      year: 2026,
      status: 'APPROVED',
      officerNotes: 'ध्वनी मर्यादा ५५ डेसिबल व रात्री १० नंतर लाऊडस्पीकर बंदी बंधनकारक राहील.',
    },
    {
      mandalId: mandal._id,
      title: 'ग्रामपंचायत केऱ्हाळे बुद्रुक मंडप ना हरकत प्रमाणपत्र',
      category: 'MUNICIPAL',
      fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      year: 2026,
      status: 'APPROVED',
      officerNotes: 'रस्त्यावरील वाहतुकीस अडथळा होणार नाही याची दक्षता घ्यावी.',
    },
    {
      mandalId: mandal._id,
      title: 'अग्निशामक दल ना हरकत प्रमाणपत्र (Fire NOC २०२६)',
      category: 'FIRE_NOC',
      fileUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=800&q=80',
      year: 2026,
      status: 'APPROVED',
      officerNotes: 'मंडपात २ अग्निरोधक सिलिंडर व पाण्याची सोय उपलब्ध असणे आवश्यक.',
    },
    {
      mandalId: mandal._id,
      title: 'महावितरण तात्पुरती विद्युत जोडणी मंजुरी पत्र',
      category: 'ELECTRICITY',
      fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
      year: 2026,
      status: 'APPROVED',
      officerNotes: 'ग्राहकास मीटरसह तात्पुरता पुरवठा मंजूर.',
    },
    {
      mandalId: mandal._id,
      title: 'मंडळ व भाविक सार्वजनिक विमा संरक्षण पॉलिसी',
      category: 'INSURANCE',
      fileUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      year: 2026,
      status: 'APPROVED',
      officerNotes: 'विमा संरक्षण रक्कम: ₹ ५० लाख (भाविकांचा अपघाती विमा समाविष्ट).',
    },
  ]);

  console.log('MongoDB Atlas Seed Completed Successfully!');
  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error('Seed Error:', err);
  process.exit(1);
});
