// In-memory demo data — no backend or database is used.
import { addDays, startOfDay } from '../utils/reports';

export const DEFAULT_CATEGORIES = [
  { key: 'Food', icon: 'silverware-fork-knife', budget: 9000 },
  { key: 'Transport', icon: 'bus', budget: 3500 },
  { key: 'Medicine', icon: 'pill', budget: 2000 },
  { key: 'Groceries', icon: 'shopping-outline', budget: 8000 },
  { key: 'Rent', icon: 'key-variant', budget: 15000 },
  { key: 'Gifts', icon: 'gift-outline', budget: 2500 },
  { key: 'Savings', icon: 'piggy-bank-outline', budget: 10000 },
  { key: 'Entertainment', icon: 'ticket-outline', budget: 2500 },
];

export const INCOME_CATEGORIES = [
  { key: 'Salary', icon: 'cash-multiple' },
  { key: 'Freelance', icon: 'laptop' },
  { key: 'Other Income', icon: 'hand-coin-outline' },
];

export const ADMIN_ACCESS_CODE = 'FINWISE2026';

export const SEED_USERS = [
  {
    id: 'u-admin',
    role: 'admin',
    name: 'Admin Team',
    email: 'admin@janaflow.com',
    password: 'Admin@123',
    phone: '9876500000',
    dob: '01/01/1990',
    customerId: 'ADM-0001',
    monthlyBudget: 0,
    alertsEnabled: true,
  },
  {
    id: 'u-1',
    role: 'customer',
    name: 'Priya Sharma',
    email: 'priya@janaflow.com',
    password: 'Priya@123',
    phone: '9876543210',
    dob: '14/02/2002',
    customerId: '25030024',
    monthlyBudget: 45000,
    alertsEnabled: true,
  },
  {
    id: 'u-2',
    role: 'customer',
    name: 'Arun Kumar',
    email: 'arun@janaflow.com',
    password: 'Arun@1234',
    phone: '9123456780',
    dob: '22/08/2001',
    customerId: '25030031',
    monthlyBudget: 38000,
    alertsEnabled: true,
  },
];

// Small deterministic PRNG so the demo data is the same on every launch
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TITLES = {
  Food: ['Dinner', 'Lunch', 'Breakfast', 'Snacks', 'Coffee'],
  Transport: ['Fuel', 'Metro Card', 'Cab Ride', 'Bus Pass'],
  Groceries: ['Pantry', 'Vegetables', 'Supermarket'],
  Medicine: ['Pharmacy', 'Doctor Visit'],
  Gifts: ['Birthday Gift', 'Festival Gift'],
  Entertainment: ['Movie', 'Concert', 'OTT Subscription'],
  Savings: ['Travel Fund', 'New House', 'Car', 'Wedding'],
};

function buildTransactions(userId, salary, seed) {
  const rand = mulberry32(seed);
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const between = (min, max) => Math.round((min + rand() * (max - min)) / 10) * 10;
  const today = startOfDay(new Date());
  const list = [];
  let n = 0;

  const add = (day, type, category, title, amount, hour) => {
    const date = new Date(day);
    date.setHours(hour ?? 8 + Math.floor(rand() * 13), Math.floor(rand() * 60));
    // today's entries must not land in the future, or the Daily report would be empty
    const now = new Date();
    if (date > now) date.setTime(now.getTime() - Math.floor(rand() * 90 + 5) * 60000);
    list.push({ id: `${userId}-t${n++}`, userId, type, category, title, amount, note: '', date: date.toISOString() });
  };

  for (let i = 365; i >= 0; i--) {
    const day = addDays(today, -i);
    const dom = day.getDate();
    if (dom === 1) add(day, 'income', 'Salary', 'Monthly Salary', salary, 9);
    if (dom === 3) add(day, 'expense', 'Rent', 'Rent', 12000, 10);
    if (dom === 5) add(day, 'expense', 'Savings', pick(TITLES.Savings), 5000, 11);
    if (rand() < 0.55) add(day, 'expense', 'Food', pick(TITLES.Food), between(120, 650));
    if (rand() < 0.35) add(day, 'expense', 'Transport', pick(TITLES.Transport), between(40, 320));
    if (day.getDay() === 6) add(day, 'expense', 'Groceries', pick(TITLES.Groceries), between(900, 2400));
    if (rand() < 0.04) add(day, 'expense', 'Medicine', pick(TITLES.Medicine), between(200, 1200));
    if (rand() < 0.03) add(day, 'expense', 'Gifts', pick(TITLES.Gifts), between(500, 2000));
    if (rand() < 0.08) add(day, 'expense', 'Entertainment', pick(TITLES.Entertainment), between(200, 900));
    if (rand() < 0.05) add(day, 'income', 'Freelance', 'Freelance Project', between(3000, 9000));
  }
  // always have something to show in the Daily report
  add(today, 'expense', 'Food', 'Coffee', between(80, 220));
  add(today, 'expense', 'Transport', 'Metro Card', between(40, 120));
  return list;
}

export const SEED_TRANSACTIONS = [
  ...buildTransactions('u-1', 52000, 7),
  ...buildTransactions('u-2', 41000, 21),
];

// Savings goals: money "saved" towards a goal is any Savings expense whose title matches the goal name
export const SEED_GOALS = ['u-1', 'u-2'].flatMap((userId) => [
  { id: `${userId}-g1`, userId, name: 'Travel Fund', icon: 'airplane', target: 60000 },
  { id: `${userId}-g2`, userId, name: 'Car', icon: 'car-sports', target: 150000 },
  { id: `${userId}-g3`, userId, name: 'Wedding', icon: 'ring', target: 100000 },
  { id: `${userId}-g4`, userId, name: 'New House', icon: 'home-heart', target: 250000 },
]);

export const SEED_NOTIFICATIONS = [
  {
    id: 'n-1',
    userId: 'u-1',
    tone: 'success',
    icon: 'bell-ring-outline',
    title: 'Welcome to JanaFlow, Priya!',
    message: 'Track every rupee — we will alert you whenever your transactions change.',
    date: addDays(new Date(), -1).toISOString(),
    read: false,
  },
  {
    id: 'n-2',
    userId: 'u-2',
    tone: 'success',
    icon: 'bell-ring-outline',
    title: 'Welcome to JanaFlow, Arun!',
    message: 'Track every rupee — we will alert you whenever your transactions change.',
    date: addDays(new Date(), -1).toISOString(),
    read: false,
  },
  {
    id: 'n-3',
    userId: 'u-admin',
    tone: 'info',
    icon: 'account-group-outline',
    title: 'Admin console ready',
    message: '2 customers are active. Customer transaction changes will appear here.',
    date: addDays(new Date(), -1).toISOString(),
    read: false,
  },
];
