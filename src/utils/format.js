export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));
export const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const pad = (n) => String(n).padStart(2, '0');

// Indian digit grouping (₹1,23,456.00) without relying on Intl support
export function formatMoney(value, { sign = false } = {}) {
  const n = Math.abs(Number(value) || 0);
  const [int, dec] = n.toFixed(2).split('.');
  let head = int.slice(0, -3);
  let tail = int.slice(-3);
  if (head) {
    head = head.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    tail = ',' + tail;
  }
  const text = `₹${head}${tail}.${dec}`;
  return sign && value < 0 ? `-${text}` : text;
}

export function formatShort(n) {
  if (n >= 100000) return `${(n / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(Math.round(n));
}

export const formatTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function formatTxDate(iso) {
  const d = new Date(iso);
  return `${formatTime(d)} - ${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}`;
}

export const toDDMMYYYY = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

export function parseDDMMYYYY(text) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(text).trim());
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  if (d.getDate() !== Number(m[1]) || d.getMonth() !== Number(m[2]) - 1) return null;
  return d;
}

// e.g. JanaFlow-Monthly-Report-October-28-10-2026.pdf
export const reportFileName = (title, periodLabel) =>
  `JanaFlow-${title}-${periodLabel}-${toDDMMYYYY(new Date())}`.replace(/[^A-Za-z0-9]+/g, '-').replace(/-+$/, '') + '.pdf';

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export const firstName = (name) => (name || '').trim().split(/\s+/)[0] || 'there';

export const initials = (name) =>
  (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

export function relativeTime(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  return formatTxDate(iso);
}
