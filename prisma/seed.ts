import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MandalBook database...');

  // Clean existing data
  await prisma.permitDocument.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.varganiDonation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.mandal.deleteMany();

  // Create Primary Mandal (Dedicated exclusively for New Yuwa Ganesh Mandal, Kerhale Bk.)
  const mandal = await prisma.mandal.create({
    data: {
      id: 'mandal-new-yuwa-2026',
      name: 'न्यू युवा गणेश मंडळ, केऱ्हाळे बु.',
      tagline: 'न्यू युवा बॉईज - भव्य सार्वजनिक गणेशोत्सव २०२६',
      registrationNumber: 'नोंदणी क्र. महा/केऱ्हाळे/२०२६',
      establishedYear: 2012,
      address: 'मेन चौक, केऱ्हाळे बुद्रुक (Kerhale Bk.)',
      city: 'केऱ्हाळे बु.',
      upiId: 'newyuwaboys@upi',
      activeYear: 2026,
      cashInHand: 42500,
      bankBalance: 125000,
      bankName: 'स्टेट बँक ऑफ इंडिया (केऱ्हाळे शाखा)',
      accountNumber: '३९४८२९१०३९४',
      ifscCode: 'SBIN0001234',
      presidentName: 'श्री. निलेश पाटील (अध्यक्ष)',
      secretaryName: 'श्री. सचिन तायडे (सचिव)',
      treasurerName: 'श्री. भूषण चौधरी (खजिनदार)',
    },
  });

  // Create Users with 4 Distinct Roles
  await prisma.user.createMany({
    data: [
      {
        id: 'user-admin',
        mandalId: mandal.id,
        name: 'श्री. समाधान पाटील (अध्यक्ष)',
        phone: '9822012345',
        email: 'president@mandalbook.local',
        role: 'ADMIN',
      },
      {
        id: 'user-treasurer',
        mandalId: mandal.id,
        name: 'श्री. महेश जोशी (खजिनदार)',
        phone: '9822054321',
        email: 'treasurer@mandalbook.local',
        role: 'TREASURER',
      },
      {
        id: 'user-volunteer',
        mandalId: mandal.id,
        name: 'श्री. ओंकार गायकवाड (कार्यकर्ता)',
        phone: '9822099999',
        email: 'volunteer@mandalbook.local',
        role: 'VOLUNTEER',
      },
      {
        id: 'user-member',
        mandalId: mandal.id,
        name: 'श्री. विनायक देशपांडे (भाविक सदस्य)',
        phone: '9822077777',
        email: 'member@mandalbook.local',
        role: 'MEMBER',
      },
    ],
  });

  // Seed Realistic Donations
  await prisma.varganiDonation.createMany({
    data: [
      {
        id: 'don-01',
        mandalId: mandal.id,
        donorName: 'श्री. विलासराव जगन्नाथ कदम',
        donorPhone: '9823011111',
        buildingFlat: 'फ्लॅट क्र. ४०२, सिद्धिविनायक हाइट्स',
        amount: 25000,
        paymentMode: 'UPI',
        isInKind: false,
        receiptNo: 'MB-2026-00101',
        collectorName: 'ओंकार गायकवाड',
        year: 2026,
        status: 'PAID',
        notes: 'श्रींची आरती व महाप्रसाद देणगी',
        createdAt: new Date('2026-09-15T10:30:00Z'),
      },
      {
        id: 'don-02',
        mandalId: mandal.id,
        donorName: 'सौ. सुवर्णा रमेश कुलकर्णी',
        donorPhone: '9823022222',
        buildingFlat: 'घर क्र. १८, पेठ गल्ली',
        amount: 11000,
        paymentMode: 'CASH',
        isInKind: false,
        receiptNo: 'MB-2026-00102',
        collectorName: 'ओंकार गायकवाड',
        year: 2026,
        status: 'PAID',
        notes: 'वार्षिक वर्गणी',
        createdAt: new Date('2026-09-16T11:45:00Z'),
      },
      {
        id: 'don-03',
        mandalId: mandal.id,
        donorName: 'मे. मारुती कन्स्ट्रक्शन्स प्रा. लि.',
        donorPhone: '9823033333',
        buildingFlat: 'ऑफिस १०, कमर्शियल प्लाझा',
        amount: 51000,
        paymentMode: 'CHEQUE',
        isInKind: false,
        receiptNo: 'MB-2026-00103',
        collectorName: 'महेश जोशी',
        year: 2026,
        status: 'PAID',
        notes: 'धनादेश क्र. ४५९२८१ (HDFC Bank)',
        createdAt: new Date('2026-09-17T14:15:00Z'),
      },
      {
        id: 'don-04',
        mandalId: mandal.id,
        donorName: 'श्री. सचिन बाळकृष्ण मोरे',
        donorPhone: '9823044444',
        buildingFlat: 'सदाशिव पेठ मेन रोड',
        amount: 5001,
        paymentMode: 'UPI',
        isInKind: false,
        receiptNo: 'MB-2026-00104',
        collectorName: 'ओंकार गायकवाड',
        year: 2026,
        status: 'PAID',
        createdAt: new Date('2026-09-18T16:20:00Z'),
      },
      {
        id: 'don-05',
        mandalId: mandal.id,
        donorName: 'श्री. गजानन ज्वेलर्स (संजय सराफ)',
        donorPhone: '9823055555',
        buildingFlat: 'लक्ष्मी रोड, पुणे',
        amount: 21000,
        paymentMode: 'CASH',
        isInKind: true,
        inKindDetails: 'श्रींच्या मूर्तीसाठी चांदीचा मुकुट (५०० ग्रॅम)',
        receiptNo: 'MB-2026-00105',
        collectorName: 'समाधान पाटील',
        year: 2026,
        status: 'PAID',
        notes: 'वस्तुरूप देणगी मूल्य अंदाजे ₹ २१,०००',
        createdAt: new Date('2026-09-19T12:00:00Z'),
      },
      {
        id: 'don-06',
        mandalId: mandal.id,
        donorName: 'डॉ. अनिरुद्ध श्रीकांत बापट',
        donorPhone: '9823066666',
        buildingFlat: 'फ्लॅट ७, आनंद अपार्ट.',
        amount: 15000,
        paymentMode: 'UPI',
        isInKind: false,
        receiptNo: 'MB-2026-00106',
        collectorName: 'ओंकार गायकवाड',
        year: 2026,
        status: 'PLEDGED',
        pledgeDate: new Date('2026-09-25T10:00:00Z'),
        notes: 'बाकी वर्गणी - २५ तारखेला ऑनलाईन ट्रान्सफर करणार',
        createdAt: new Date('2026-09-20T09:30:00Z'),
      },
      {
        id: 'don-07',
        mandalId: mandal.id,
        donorName: 'श्री. प्रवीण तुकाराम पवार',
        donorPhone: '9823077777',
        buildingFlat: 'रूम १२, पवार चाळ',
        amount: 2500,
        paymentMode: 'CASH',
        isInKind: false,
        receiptNo: 'MB-2026-00107',
        collectorName: 'ओंकार गायकवाड',
        year: 2026,
        status: 'PAID',
        createdAt: new Date('2026-09-21T18:40:00Z'),
      },
    ],
  });

  // Seed Realistic Expenses
  await prisma.expense.createMany({
    data: [
      {
        id: 'exp-01',
        mandalId: mandal.id,
        title: 'मंडप व स्टेज उभारणी (वाटरप्रूफ मंडप)',
        category: 'MANDAP',
        amount: 45000,
        paidTo: 'मे. रॉयल मंडप डेकोरेटर्स, पुणे',
        paidBy: 'महेश जोशी (खजिनदार)',
        voucherNo: 'VCH-2026-001',
        year: 2026,
        date: new Date('2026-09-10T11:00:00Z'),
        approvedBy: 'समाधान पाटील (अध्यक्ष)',
        status: 'APPROVED',
      },
      {
        id: 'exp-02',
        mandalId: mandal.id,
        title: 'श्रींची भव्य शाडू मातीची मूर्ती व प्रतिष्ठापना',
        category: 'IDOL',
        amount: 32000,
        paidTo: 'शिल्पकार सचिन कुंभार स्टुडिओ',
        paidBy: 'समाधान पाटील',
        voucherNo: 'VCH-2026-002',
        year: 2026,
        date: new Date('2026-09-12T14:30:00Z'),
        approvedBy: 'समाधान पाटील (अध्यक्ष)',
        status: 'APPROVED',
      },
      {
        id: 'exp-03',
        mandalId: mandal.id,
        title: 'विद्युत रोषणाई व १० केव्हीए सायलेंट जनरेटर भाडे',
        category: 'LIGHTING',
        amount: 28000,
        paidTo: 'ओम साई इलेक्ट्रिकल वर्क्स',
        paidBy: 'ओंकार गायकवाड',
        voucherNo: 'VCH-2026-003',
        year: 2026,
        date: new Date('2026-09-14T17:00:00Z'),
        approvedBy: 'महेश जोशी (खजिनदार)',
        status: 'APPROVED',
      },
      {
        id: 'exp-04',
        mandalId: mandal.id,
        title: 'महाप्रसाद बुंदी लाडू (१०० किलो) व वाटप साहित्य',
        category: 'PRASAD',
        amount: 18500,
        paidTo: 'चितळे बंधू स्वीट्स',
        paidBy: 'महेश जोशी',
        voucherNo: 'VCH-2026-004',
        year: 2026,
        date: new Date('2026-09-16T10:15:00Z'),
        approvedBy: 'समाधान पाटील (अध्यक्ष)',
        status: 'APPROVED',
      },
      {
        id: 'exp-05',
        mandalId: mandal.id,
        title: 'महापालिका मंडप फी व अग्निशामक ना हरकत शुल्क',
        category: 'LEGAL_PERMIT',
        amount: 4200,
        paidTo: 'पुणे महानगरपालिका (PMC)',
        paidBy: 'राहुल शिंदे (सचिव)',
        voucherNo: 'VCH-2026-005',
        year: 2026,
        date: new Date('2026-09-08T12:00:00Z'),
        approvedBy: 'समाधान पाटील (अध्यक्ष)',
        status: 'APPROVED',
      },
    ],
  });

  // Seed Official Permit Documents
  await prisma.permitDocument.createMany({
    data: [
      {
        id: 'doc-01',
        mandalId: mandal.id,
        title: 'विश्रामबाग पोलीस ठाणे मंडप व उत्सव परवानगी २०२६',
        category: 'POLICE',
        fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
        year: 2026,
        status: 'APPROVED',
        officerNotes: 'ध्वनी मर्यादा ५५ डेसिबल व रात्री १० नंतर लाऊडस्पीकर बंदी बंधनकारक राहील.',
      },
      {
        id: 'doc-02',
        mandalId: mandal.id,
        title: 'पुणे महानगरपालिका (PMC) रस्ता व मंडप ना हरकत प्रमाणपत्र',
        category: 'MUNICIPAL',
        fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        year: 2026,
        status: 'APPROVED',
        officerNotes: 'पादचाऱ्यांना अडथळा होणार नाही याची खबरदारी घ्यावी.',
      },
      {
        id: 'doc-03',
        mandalId: mandal.id,
        title: 'अग्निशामक दल ना हरकत प्रमाणपत्र (Fire NOC २०२६)',
        category: 'FIRE_NOC',
        fileUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=800&q=80',
        year: 2026,
        status: 'APPROVED',
        officerNotes: 'मंडपात २ अग्निरोधक सिलिंडर व पाण्याची सोय उपलब्ध असणे आवश्यक.',
      },
      {
        id: 'doc-04',
        mandalId: mandal.id,
        title: 'महावितरण तात्पुरती विद्युत जोडणी मंजुरी पत्र',
        category: 'ELECTRICITY',
        fileUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
        year: 2026,
        status: 'APPROVED',
        officerNotes: 'ग्राहकास मीटरसह तात्पुरता पुरवठा मंजूर.',
      },
      {
        id: 'doc-05',
        mandalId: mandal.id,
        title: 'द न्यू इंडिया ॲश्युरन्स मंडळ व भाविक सार्वजनिक विमा',
        category: 'INSURANCE',
        fileUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
        year: 2026,
        status: 'APPROVED',
        officerNotes: 'विमा संरक्षण रक्कम: ₹ ५० लाख (भाविकांचा अपघाती विमा समाविष्ट).',
      },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
