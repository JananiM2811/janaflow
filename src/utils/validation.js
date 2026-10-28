import { parseDDMMYYYY } from './format';

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());

export const validate = {
  required: (v, label) => (!String(v ?? '').trim() ? `${label} is required` : null),

  email: (v) => {
    if (!String(v).trim()) return 'Email is required';
    return isEmail(v) ? null : 'Enter a valid email address';
  },

  name: (v) => {
    if (!String(v).trim()) return 'Full name is required';
    return /^[A-Za-z][A-Za-z .]{2,39}$/.test(v.trim()) ? null : 'Use 3–40 letters (no numbers)';
  },

  phone: (v) => {
    if (!String(v).trim()) return 'Mobile number is required';
    return /^[6-9]\d{9}$/.test(v.trim()) ? null : 'Enter a valid 10-digit mobile number';
  },

  password: (v) => {
    if (!v) return 'Password is required';
    if (v.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Use both letters and numbers';
    return null;
  },

  confirm: (v, original) => {
    if (!v) return 'Please confirm your password';
    return v === original ? null : 'Passwords do not match';
  },

  dob: (v) => {
    const d = parseDDMMYYYY(v);
    if (!d) return 'Enter date as DD/MM/YYYY';
    const age = (Date.now() - d.getTime()) / (365.25 * 86400000);
    if (age < 13) return 'You must be at least 13 years old';
    if (age > 100) return 'Enter a valid date of birth';
    return null;
  },

  txDate: (v) => {
    const d = parseDDMMYYYY(v);
    if (!d) return 'Enter date as DD/MM/YYYY';
    if (d > new Date()) return 'Date cannot be in the future';
    return null;
  },

  amount: (v) => {
    const s = String(v ?? '').trim();
    if (!s) return 'Amount is required';
    if (!/^\d+(\.\d{1,2})?$/.test(s)) return 'Enter a valid amount (up to 2 decimals)';
    const n = Number(s);
    if (n <= 0) return 'Amount must be greater than 0';
    if (n > 10000000) return 'Amount is too large';
    return null;
  },
};

export const hasErrors = (errors) => Object.values(errors).some(Boolean);
