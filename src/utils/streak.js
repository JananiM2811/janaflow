import { addDays, startOfDay } from './reports';

// Fixed commitments don't count as day-to-day spending
export const STREAK_EXCLUDED = ['Rent', 'Savings'];

/**
 * A day is "under budget" when its day-to-day spending is at most monthlyBudget / days-in-month.
 * current: consecutive under-budget days ending today; best: longest run in the last 90 days.
 */
export function spendingStreak(list, monthlyBudget, now = new Date()) {
  const today = startOfDay(now);
  const allowance = monthlyBudget / new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  const daily = {};
  for (const t of list) {
    if (t.type !== 'expense' || STREAK_EXCLUDED.includes(t.category)) continue;
    const key = startOfDay(new Date(t.date)).getTime();
    daily[key] = (daily[key] || 0) + t.amount;
  }
  const spentOn = (d) => daily[d.getTime()] || 0;
  const under = (d) => spentOn(d) <= allowance;

  let current = 0;
  while (current < 365 && under(addDays(today, -current))) current++;

  let best = 0;
  let run = 0;
  for (let i = 89; i >= 0; i--) {
    run = under(addDays(today, -i)) ? run + 1 : 0;
    best = Math.max(best, run);
  }

  const week = Array.from({ length: 7 }, (_, k) => {
    const date = addDays(today, k - 6);
    return { date, spent: spentOn(date), under: under(date) };
  });

  return { current, best, allowance, week };
}
