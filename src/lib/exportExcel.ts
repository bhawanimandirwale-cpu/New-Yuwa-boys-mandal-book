import * as XLSX from 'xlsx';
import { VarganiDonationItem, ExpenseItem, MandalInfo } from '@/lib/types';
import { formatDateShort } from '@/lib/formatters';

export function exportDonationsExcel(donations: VarganiDonationItem[], mandalName: string, year: number) {
  const rows = donations.map((d, idx) => ({
    'अ.क्र.': idx + 1,
    'पावती क्र.': d.receiptNo,
    'दिनांक': formatDateShort(d.createdAt),
    'देणगीदाराचे नाव': d.donorName,
    'मोबाईल क्र.': d.donorPhone || '-',
    'सदनिका / पत्ता': d.buildingFlat || '-',
    'रक्कम (₹)': d.amount,
    'पेमेंट प्रकार': d.paymentMode,
    'वस्तुरूप देणगी': d.isInKind ? (d.inKindDetails || 'होय') : 'नाही',
    'स्थिती': d.status === 'PAID' ? 'जमा' : 'बाकी (Pledged)',
    'संकलक कार्यकर्ता': d.collectorName || 'कार्यकर्ता',
    'टीप': d.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'देणगी नोंदवही');
  XLSX.writeFile(workbook, `${mandalName}_वर्गणी_नोंदवही_${year}.xlsx`);
}

export function exportExpensesExcel(expenses: ExpenseItem[], mandalName: string, year: number) {
  const rows = expenses.map((e, idx) => ({
    'अ.क्र.': idx + 1,
    'व्हाऊचर क्र.': e.voucherNo,
    'दिनांक': formatDateShort(e.date),
    'खर्चाचा तपशील': e.title,
    'खर्च वर्ग (Category)': e.category,
    'रक्कम (₹)': e.amount,
    'Vendor / कोणास दिले': e.paidTo,
    'खर्च प्रतिनिधी': e.paidBy,
    'मंजूरकर्ता': e.approvedBy || 'खजिनदार',
    'स्थिती': e.status === 'APPROVED' ? 'मंजूर' : 'प्रलंबित',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'खर्च नोंदवही');
  XLSX.writeFile(workbook, `${mandalName}_खर्च_नोंदवही_${year}.xlsx`);
}
