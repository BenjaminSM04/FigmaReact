const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

const pad = (n) => String(n).padStart(2, '0');

/** Convierte "YYYY-MM-DD" en una fecha local (sin desfase de zona horaria). */
export function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toISO(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export const todayISO = () => toISO(new Date());

export function addDays(iso, days) {
  const d = parseDate(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

export function nightsBetween(checkIn, checkOut) {
  return Math.round((parseDate(checkOut) - parseDate(checkIn)) / 86400000);
}

export function isValidISO(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(parseDate(value).getTime());
}

/** 12 dic 2026 */
export function formatDate(iso) {
  const d = parseDate(iso);
  return `${pad(d.getDate())} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

/** vie 12 dic 2026 */
export function formatDateLong(iso) {
  const d = parseDate(iso);
  return `${DIAS[d.getDay()]} ${pad(d.getDate())} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

/** 12–15 dic 2026  /  28 nov – 02 dic 2026 */
export function formatRange(checkIn, checkOut) {
  const a = parseDate(checkIn);
  const b = parseDate(checkOut);
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${pad(a.getDate())}–${pad(b.getDate())} ${MESES[b.getMonth()]} ${b.getFullYear()}`;
  }
  return `${pad(a.getDate())} ${MESES[a.getMonth()]} – ${formatDate(checkOut)}`;
}

/** Bs 1.140 */
export function formatBs(amount) {
  return `Bs ${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

export const pluralize = (n, one, many) => `${n} ${n === 1 ? one : many}`;
