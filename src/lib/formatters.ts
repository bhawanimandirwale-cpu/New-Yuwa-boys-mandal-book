/**
 * Devanagari and Indian Currency Formatters for MandalBook
 */

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export function toDevanagariDigits(input: number | string | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = input.toString();
  return str.replace(/[0-9]/g, (digit) => DEVANAGARI_DIGITS[parseInt(digit, 10)]);
}

export function toEnglishDigits(input: string): string {
  if (!input) return '';
  const devanagariMap: { [key: string]: string } = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  };
  return input.replace(/[०-९]/g, (digit) => devanagariMap[digit] || digit);
}

/**
 * Formats a number into Indian Lakhs & Crores format (e.g. 1,51,116)
 */
export function formatIndianNumber(num: number): string {
  if (isNaN(num)) return '0';
  const isNegative = num < 0;
  const absNum = Math.abs(Math.round(num));
  const numStr = absNum.toString();

  if (numStr.length <= 3) {
    return (isNegative ? '-' : '') + numStr;
  }

  const lastThree = numStr.substring(numStr.length - 3);
  const otherNumbers = numStr.substring(0, numStr.length - 3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

  return (isNegative ? '-' : '') + formattedOther + ',' + lastThree;
}

/**
 * Returns formatted currency like: ₹ १,५१,११६ or ₹ 1,51,116
 */
export function formatCurrencyINR(amount: number | null | undefined, useDevanagari: boolean = true): string {
  const val = Number(amount) || 0;
  const indianFormatted = formatIndianNumber(val);
  
  if (useDevanagari) {
    return `₹ ${toDevanagariDigits(indianFormatted)}`;
  }
  return `₹ ${indianFormatted}`;
}

/**
 * Marathi Month Names
 */
const MARATHI_MONTHS = [
  'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
  'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
];

/**
 * Formats a Date object into Devanagari Marathi representation: उदा. २२ सप्टेंबर २०२६
 */
export function formatDateMarathi(dateInput: Date | string | null | undefined, includeTime: boolean = false): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const day = date.getDate();
  const month = MARATHI_MONTHS[date.getMonth()];
  const year = date.getFullYear();

  let formatted = `${toDevanagariDigits(day)} ${month} ${toDevanagariDigits(year)}`;

  if (includeTime) {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'दुपारी/संध्या.' : 'सकाळी';
    hours = hours % 12 || 12;
    formatted += ` (${ampm} ${toDevanagariDigits(hours)}:${toDevanagariDigits(minutes)})`;
  }

  return formatted;
}

/**
 * Quick short date format: उदा. २२/०९/२०२६
 */
export function formatDateShort(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${toDevanagariDigits(day)}/${toDevanagariDigits(month)}/${toDevanagariDigits(year)}`;
}
