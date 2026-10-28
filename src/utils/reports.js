import { DAYS_SHORT, MONTHS, MONTHS_SHORT } from './format';

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function periodRange(period, now = new Date()) {
  const today = startOfDay(now);
  const tomorrow = addDays(today, 1);
  switch (period) {
    case 'Daily':
      return { start: today, end: tomorrow, label: 'Today' };
    case 'Weekly':
      return { start: addDays(today, -6), end: tomorrow, label: 'Last 7 days' };
    case 'Year':
      return { start: new Date(now.getFullYear(), 0, 1), end: tomorrow, label: String(now.getFullYear()) };
    case 'Monthly':
    default:
      return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: tomorrow, label: MONTHS[now.getMonth()] };
  }
}

export const inRange = (list, { start, end }) =>
  list.filter((t) => {
    const d = new Date(t.date);
    return d >= start && d < end;
  });

export function totals(list) {
  const sum = list.reduce(
    (acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 },
  );
  return { ...sum, balance: sum.income - sum.expense };
}

export const sortByDateDesc = (list) => [...list].sort((a, b) => new Date(b.date) - new Date(a.date));

// Buckets used by the Income & Expenses chart on the Analysis screen
export function chartBuckets(list, period, now = new Date()) {
  const today = startOfDay(now);
  const buckets = [];
  if (period === 'Daily') {
    for (let i = 6; i >= 0; i--) {
      const start = addDays(today, -i);
      buckets.push({ start, end: addDays(start, 1), label: DAYS_SHORT[start.getDay()] });
    }
  } else if (period === 'Weekly') {
    for (let i = 3; i >= 0; i--) {
      const end = addDays(today, 1 - i * 7);
      buckets.push({ start: addDays(end, -7), end, label: `Wk ${4 - i}` });
    }
  } else if (period === 'Monthly') {
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      buckets.push({ start, end, label: MONTHS_SHORT[start.getMonth()] });
    }
  } else {
    for (let i = 2; i >= 0; i--) {
      const y = now.getFullYear() - i;
      buckets.push({ start: new Date(y, 0, 1), end: new Date(y + 1, 0, 1), label: String(y) });
    }
  }
  return buckets.map((b) => ({ label: b.label, ...totals(inRange(list, b)) }));
}

// Chart buckets for an arbitrary [start, end) range; bucket size grows with the range so the chart stays readable
export function rangeBuckets(list, start, end) {
  const days = Math.max(1, Math.round((end - start) / 86400000));
  const buckets = [];
  if (days === 1) {
    // a single day is split into 4-hour blocks
    for (let h = 0; h < 24; h += 4) {
      const s = new Date(start.getFullYear(), start.getMonth(), start.getDate(), h);
      buckets.push({ start: s, end: new Date(s.getTime() + 4 * 3600000), label: `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}` });
    }
  } else if (days <= 7) {
    for (let i = 0; i < days; i++) {
      const s = addDays(start, i);
      buckets.push({ start: s, end: addDays(s, 1), label: DAYS_SHORT[s.getDay()] });
    }
  } else if (days <= 62) {
    const size = Math.ceil(days / 6);
    for (let s = new Date(start); s < end; s = addDays(s, size)) {
      const e = addDays(s, size);
      buckets.push({ start: s, end: e < end ? e : end, label: `${s.getDate()} ${MONTHS_SHORT[s.getMonth()]}` });
    }
  } else if ((end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() < 12) {
    for (let s = new Date(start.getFullYear(), start.getMonth(), 1); s < end; s = new Date(s.getFullYear(), s.getMonth() + 1, 1)) {
      buckets.push({ start: s < start ? start : s, end: new Date(s.getFullYear(), s.getMonth() + 1, 1), label: MONTHS_SHORT[s.getMonth()] });
    }
  } else {
    for (let y = start.getFullYear(); y <= addDays(end, -1).getFullYear(); y++) {
      buckets.push({ start: new Date(y, 0, 1), end: new Date(y + 1, 0, 1), label: String(y) });
    }
  }
  return buckets.map((b) => ({ label: b.label, ...totals(inRange(list, { start: b.start < start ? start : b.start, end: b.end > end ? end : b.end })) }));
}

export function groupByMonth(list) {
  const groups = [];
  const byKey = {};
  const thisYear = new Date().getFullYear();
  for (const t of sortByDateDesc(list)) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!byKey[key]) {
      byKey[key] = {
        key,
        title: d.getFullYear() === thisYear ? MONTHS[d.getMonth()] : `${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
        data: [],
      };
      groups.push(byKey[key]);
    }
    byKey[key].data.push(t);
  }
  return groups;
}

export function topCategories(list, limit = 4) {
  const map = {};
  for (const t of list) {
    if (t.type !== 'expense') continue;
    map[t.category] = (map[t.category] || 0) + t.amount;
  }
  return Object.entries(map)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}
