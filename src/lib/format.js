import { getLocale } from '../i18n';

export function formatBaht(amount) {
  const num = Number(amount);
  if (num < 0) {
    return `-฿${Math.abs(num).toLocaleString(getLocale(), { maximumFractionDigits: 2 })}`;
  }
  return `฿${num.toLocaleString(getLocale(), { maximumFractionDigits: 2 })}`;
}

export function formatAmount(amount) {
  const num = Number(amount);
  if (num < 0) {
    return `-${Math.abs(num).toLocaleString(getLocale(), { maximumFractionDigits: 2 })}`;
  }
  return num.toLocaleString(getLocale(), { maximumFractionDigits: 2 });
}

function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  if (typeof dateStr !== 'string') return new Date(dateStr);
  if (dateStr.includes('T')) return new Date(dateStr);
  const parts = dateStr.split('-').map(Number);
  if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
  return new Date(dateStr);
}

export function formatDate(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return '-';
  return d.toLocaleDateString(getLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateLong(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return '-';
  return d.toLocaleDateString(getLocale(), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Short month name (0-11) in the current language, e.g. "ม.ค." / "Jan". */
export function monthShort(monthIndex) {
  return new Date(2000, monthIndex, 1).toLocaleDateString(getLocale(), { month: 'short' });
}

/** Year as shown to the user: Buddhist era in Thai, Gregorian in English. */
export function displayYear(year) {
  return getLocale() === 'th-TH' ? year + 543 : year;
}

/** Turns the datepicker's "dd/MM/yyyy" text into the displayed year (Buddhist era in Thai). */
export function localizeDateText(text) {
  const m = /^(\d{2}\/\d{2}\/)(\d{4})$/.exec(text || '');
  return m ? `${m[1]}${displayYear(Number(m[2]))}` : text;
}

/** Today as YYYY-MM-DD in the business time zone (same day the backend uses, whatever the browser's zone is). */
export function todayBangkokISO() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Bangkok' });
}

/** Attendance for today is locked from this hour (Asia/Bangkok). Same default as the backend (18:00). */
export const ATTENDANCE_CLOSING_HOUR = 18;

export function isAttendanceClosed() {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bangkok', hour: 'numeric', hourCycle: 'h23' }).format(new Date())
  );
  return hour >= ATTENDANCE_CLOSING_HOUR;
}
