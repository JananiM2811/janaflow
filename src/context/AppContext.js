import { createContext, useContext, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { DEFAULT_CATEGORIES, INCOME_CATEGORIES, SEED_GOALS, SEED_NOTIFICATIONS, SEED_TRANSACTIONS, SEED_USERS } from '../data/seed';
import { applyTheme, getThemeMode } from '../theme';
import { buildTransactionAlert } from '../utils/alerts';
import { firstName, formatMoney, greeting } from '../utils/format';
import { inRange, periodRange, totals } from '../utils/reports';

const AppContext = createContext(null);

// Savings Goals read the "Savings" category, so it can't be renamed or deleted
export const LOCKED_NAME = 'Savings';

let counter = 0;
const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${counter++}`;

export function AppProvider({ children }) {
  const [users, setUsers] = useState(SEED_USERS);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [transactions, setTransactions] = useState(SEED_TRANSACTIONS);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [incomeCategories, setIncomeCategories] = useState(INCOME_CATEGORIES);
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
  const [toast, setToast] = useState(null);
  const [goals, setGoals] = useState(SEED_GOALS);
  const [themeMode, setThemeModeState] = useState(getThemeMode());
  // user id that may sign in with fingerprint / device PIN (kept in memory only)
  const [biometricUserId, setBiometricUserId] = useState(null);

  const value = useMemo(() => {
    const currentUser = users.find((u) => u.id === currentUserId) || null;
    const customers = users.filter((u) => u.role === 'customer');
    const admins = users.filter((u) => u.role === 'admin');
    const findByEmail = (email) => users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

    const showToast = (t) => setToast({ ...t, id: uid('toast') });

    const pushNotifications = (notes) =>
      setNotifications((prev) => [
        ...notes.map((n) => ({ id: uid('n'), date: new Date().toISOString(), read: false, ...n })),
        ...prev,
      ]);

    // Personalised alert for the customer + an activity note for every admin
    const announce = (action, tx, prev, nextList) => {
      const user = currentUser;
      const mine = nextList.filter((t) => t.userId === user.id);
      const month = inRange(mine, periodRange('Monthly'));
      const category = categories.find((c) => c.key === tx.category);
      const alert = buildTransactionAlert({
        user,
        action,
        tx,
        prev,
        balance: totals(mine).balance,
        categorySpent: totals(month.filter((t) => t.category === tx.category)).expense,
        categoryBudget: category?.budget,
        monthExpense: totals(month).expense,
        monthlyBudget: user.monthlyBudget,
      });
      pushNotifications([
        { userId: user.id, ...alert },
        ...admins.map((a) => ({
          userId: a.id,
          tone: alert.tone === 'danger' ? 'danger' : 'info',
          icon: 'account-switch-outline',
          title: 'Customer activity',
          message: `${user.name} ${action} ${tx.type} "${tx.title}" (${formatMoney(tx.amount)}).`,
        })),
      ]);
      if (user.alertsEnabled) {
        showToast(alert);
        if (alert.tone === 'danger' && Platform.OS !== 'web') Alert.alert(alert.title, alert.message);
      }
    };

    return {
      users,
      customers,
      currentUser,
      transactions,
      categories,
      incomeCategories,
      notifications,
      toast,
      myTransactions: currentUser ? transactions.filter((t) => t.userId === currentUser.id) : [],
      myNotifications: currentUser ? notifications.filter((n) => n.userId === currentUser.id) : [],
      findByEmail,
      showToast,
      themeMode,
      setThemeMode(next) {
        applyTheme(next);
        setThemeModeState(next);
      },
      myGoals: currentUser ? goals.filter((g) => g.userId === currentUser.id) : [],
      addGoal({ name, target, icon }) {
        const mine = goals.filter((g) => g.userId === currentUser.id);
        if (mine.some((g) => g.name.toLowerCase() === name.trim().toLowerCase())) return { ok: false, error: 'A goal with this name already exists' };
        setGoals((prev) => [...prev, { id: uid('g'), userId: currentUser.id, name: name.trim(), target, icon }]);
        return { ok: true };
      },
      deleteGoal(id) {
        setGoals((prev) => prev.filter((g) => g.id !== id));
      },
      biometricUser: users.find((u) => u.id === biometricUserId) || null,
      biometricEnabled: !!currentUser && biometricUserId === currentUser.id,
      setBiometricEnabled(on) {
        setBiometricUserId(on ? currentUser.id : null);
      },
      // used after a successful fingerprint / PIN check on the Login screen
      signInAs(userId) {
        const u = users.find((x) => x.id === userId);
        if (!u) return { ok: false };
        setCurrentUserId(u.id);
        showToast({ tone: 'success', icon: 'fingerprint', title: `${greeting()}, ${firstName(u.name)}!`, message: 'Signed in with fingerprint / PIN.' });
        return { ok: true };
      },
      hideToast: () => setToast(null),

      signIn(email, password, role) {
        const u = findByEmail(email);
        if (!u) return { ok: false, field: 'email', error: 'No account found with this email' };
        if (u.password !== password) return { ok: false, field: 'password', error: 'Incorrect password' };
        // role is optional: the single login form lets the account decide admin vs customer
        if (role && u.role !== role) {
          return { ok: false, field: 'email', error: `This account is registered as ${u.role === 'admin' ? 'an Admin' : 'a Customer'}` };
        }
        setCurrentUserId(u.id);
        showToast({ tone: 'success', icon: 'hand-wave-outline', title: `${greeting()}, ${firstName(u.name)}!`, message: 'Welcome back to JanaFlow.' });
        return { ok: true };
      },

      signUp({ name, email, phone, dob, password, role }) {
        if (findByEmail(email)) return { ok: false, field: 'email', error: 'An account with this email already exists' };
        const user = {
          id: uid('u'),
          role,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          dob,
          password,
          customerId: role === 'admin' ? `ADM-${Math.floor(1000 + Math.random() * 9000)}` : String(25030000 + Math.floor(Math.random() * 9999)),
          monthlyBudget: role === 'admin' ? 0 : 30000,
          alertsEnabled: true,
        };
        setUsers((prev) => [...prev, user]);
        pushNotifications([
          { userId: user.id, tone: 'success', icon: 'bell-ring-outline', title: `Welcome to JanaFlow, ${firstName(user.name)}!`, message: 'Your account is ready. Start by adding your first transaction.' },
          ...admins.map((a) => ({ userId: a.id, tone: 'info', icon: 'account-plus-outline', title: 'New sign up', message: `${user.name} joined as ${role === 'admin' ? 'an Admin' : 'a Customer'}.` })),
        ]);
        return { ok: true };
      },

      resetPassword(email, password) {
        const u = findByEmail(email);
        if (!u) return { ok: false, error: 'No account found with this email' };
        setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, password } : x)));
        return { ok: true };
      },

      signOut() {
        setCurrentUserId(null);
        setToast(null);
      },

      updateProfile(patch) {
        if (patch.email) {
          const other = findByEmail(patch.email);
          if (other && other.id !== currentUser.id) return { ok: false, field: 'email', error: 'This email is used by another account' };
        }
        setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, ...patch } : u)));
        return { ok: true };
      },

      changePassword(current, next) {
        if (current !== currentUser.password) return { ok: false, field: 'current', error: 'Current password is incorrect' };
        if (current === next) return { ok: false, field: 'next', error: 'New password must be different' };
        setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? { ...u, password: next } : u)));
        return { ok: true };
      },

      addTransaction(input) {
        const tx = { id: uid('t'), userId: currentUser.id, ...input };
        const next = [tx, ...transactions];
        setTransactions(next);
        announce('added', tx, null, next);
      },

      updateTransaction(id, input) {
        const prev = transactions.find((t) => t.id === id);
        const tx = { ...prev, ...input };
        const next = transactions.map((t) => (t.id === id ? tx : t));
        setTransactions(next);
        announce('updated', tx, prev, next);
      },

      deleteTransaction(id) {
        const tx = transactions.find((t) => t.id === id);
        const next = transactions.filter((t) => t.id !== id);
        setTransactions(next);
        announce('deleted', tx, null, next);
      },

      // type: 'expense' | 'income'; names must be unique across both lists
      addCategory({ key, budget, icon = 'tag-outline', type = 'expense' }) {
        const name = key.trim();
        if ([...categories, ...incomeCategories].some((c) => c.key.toLowerCase() === name.toLowerCase())) {
          return { ok: false, error: 'This category already exists' };
        }
        if (type === 'income') setIncomeCategories((prev) => [...prev, { key: name, icon }]);
        else setCategories((prev) => [...prev, { key: name, icon, budget }]);
        return { ok: true, key: name };
      },

      // Renaming also moves existing transactions to the new name
      updateCategory(oldKey, { key, budget, icon, type = 'expense' }) {
        const name = key.trim();
        if (oldKey === LOCKED_NAME && name !== oldKey) return { ok: false, error: 'Savings is used by Savings Goals and cannot be renamed' };
        const clash = [...categories, ...incomeCategories].some((c) => c.key !== oldKey && c.key.toLowerCase() === name.toLowerCase());
        if (clash) return { ok: false, error: 'This category already exists' };
        const patch = (c) => (c.key === oldKey ? { ...c, key: name, icon, ...(type === 'expense' ? { budget } : {}) } : c);
        if (type === 'income') setIncomeCategories((prev) => prev.map(patch));
        else setCategories((prev) => prev.map(patch));
        if (name !== oldKey) setTransactions((prev) => prev.map((t) => (t.category === oldKey ? { ...t, category: name } : t)));
        return { ok: true, key: name };
      },

      // Deleting moves the category's transactions to "Others" / "Other Income" so no data is lost
      deleteCategory(key, type = 'expense') {
        const fallback = type === 'income' ? 'Other Income' : 'Others';
        if (key === fallback) return { ok: false, error: `"${fallback}" is the default category and cannot be deleted` };
        if (key === LOCKED_NAME) return { ok: false, error: 'Savings is used by Savings Goals and cannot be deleted' };
        const moved = transactions.filter((t) => t.category === key).length;
        if (type === 'income') {
          setIncomeCategories((prev) => {
            const rest = prev.filter((c) => c.key !== key);
            return rest.some((c) => c.key === fallback) ? rest : [...rest, { key: fallback, icon: 'hand-coin-outline' }];
          });
        } else {
          setCategories((prev) => {
            const rest = prev.filter((c) => c.key !== key);
            return rest.some((c) => c.key === fallback) ? rest : [...rest, { key: fallback, icon: 'dots-horizontal-circle-outline', budget: 0 }];
          });
        }
        if (moved) setTransactions((prev) => prev.map((t) => (t.category === key ? { ...t, category: fallback } : t)));
        return { ok: true, moved, fallback };
      },

      markAllRead() {
        setNotifications((prev) => prev.map((n) => (n.userId === currentUser.id ? { ...n, read: true } : n)));
      },

      clearNotifications() {
        setNotifications((prev) => prev.filter((n) => n.userId !== currentUser.id));
      },
    };
  }, [users, currentUserId, transactions, categories, incomeCategories, notifications, toast, goals, themeMode, biometricUserId]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
