/** Strip control characters and markup so stored school records stay plain text. */
export function cleanText(value: unknown, max = 80): string {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[<>&"`]/g, '')
    .trim()
    .slice(0, max);
}

export function isPhone(value: string): boolean {
  const d = value.replace(/[\s-]/g, '');
  return /^(\+?256|0)7\d{8}$/.test(d);
}

export function isIsoDate(iso: string, minYear: number, maxYear: number): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return false;
  return y >= minYear && y <= maxYear;
}

export function isNin(value: string): boolean {
  return /^[A-Za-z]{2}\d{8}[A-Za-z0-9]{3,5}$/.test(value.replace(/\s/g, ''));
}

export function isLin(value: string): boolean {
  return /^[A-Za-z0-9]{6,20}$/.test(value);
}

export function isSchoolpay(value: string): boolean {
  return /^\d{6,12}$/.test(value);
}

export function isEmail(value: string): boolean {
  if (value.length > 80 || value.includes('..')) return false;
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
}

export function allowed(value: string, options: readonly string[]): boolean {
  return options.includes(value);
}
