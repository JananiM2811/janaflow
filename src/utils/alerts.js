import { Alert, Platform } from 'react-native';
import { firstName, formatMoney } from './format';

function budgetNote({ tx, categorySpent, categoryBudget, monthExpense, monthlyBudget }) {
  if (tx.type !== 'expense') return null;
  if (categoryBudget) {
    const pct = Math.round((categorySpent / categoryBudget) * 100);
    if (pct >= 100) {
      return {
        tone: 'danger',
        text: `You've spent ${formatMoney(categorySpent)} on ${tx.category} this month — ${formatMoney(
          categorySpent - categoryBudget,
        )} over your ${formatMoney(categoryBudget)} limit.`,
      };
    }
    if (pct >= 80) return { tone: 'warning', text: `${pct}% of your ${tx.category} budget is used this month.` };
  }
  if (monthlyBudget) {
    const pct = Math.round((monthExpense / monthlyBudget) * 100);
    if (pct >= 90) return { tone: 'warning', text: `Total spending is at ${pct}% of your monthly budget.` };
  }
  if (categoryBudget) {
    const pct = Math.round((categorySpent / categoryBudget) * 100);
    return { tone: 'success', text: `${pct}% of your ${tx.category} budget used — looking good.` };
  }
  return null;
}

// Builds the personalised alert shown whenever a customer's transactions change
export function buildTransactionAlert({ user, action, tx, prev, balance, ...stats }) {
  const name = firstName(user.name);
  const amount = formatMoney(tx.amount);

  if (action === 'deleted') {
    return {
      tone: 'info',
      icon: 'trash-can-outline',
      title: 'Transaction removed',
      message: `${name}, "${tx.title}" of ${amount} was deleted. Your balance is now ${formatMoney(balance, { sign: true })}.`,
    };
  }

  const note = budgetNote({ tx, ...stats });

  if (action === 'updated') {
    const changes = [];
    if (prev.amount !== tx.amount) changes.push(`amount ${formatMoney(prev.amount)} → ${amount}`);
    if (prev.category !== tx.category) changes.push(`category ${prev.category} → ${tx.category}`);
    if (prev.title !== tx.title) changes.push(`title "${prev.title}" → "${tx.title}"`);
    if (prev.date !== tx.date) changes.push('date changed');
    return {
      tone: note && note.tone !== 'success' ? note.tone : 'info',
      icon: 'pencil-outline',
      title: `Transaction updated, ${name}`,
      message: `${changes.length ? `You changed the ${changes.join(', ')}` : 'Details saved'}.${note ? ' ' + note.text : ''}`,
    };
  }

  if (tx.type === 'income') {
    return {
      tone: 'success',
      icon: 'cash-plus',
      title: `Money in, ${name}! 🎉`,
      message: `${amount} received from "${tx.title}". Your balance is now ${formatMoney(balance, { sign: true })}.`,
    };
  }

  if (note && note.tone === 'danger') {
    return {
      tone: 'danger',
      icon: 'alert-octagon-outline',
      title: `${tx.category} budget exceeded!`,
      message: `${name}, ${note.text[0].toLowerCase()}${note.text.slice(1)}`,
    };
  }
  if (tx.amount >= 10000 && tx.category !== 'Rent') {
    return {
      tone: 'warning',
      icon: 'alert-outline',
      title: `Big spend alert, ${name}`,
      message: `${amount} on "${tx.title}" is one of your largest expenses.${note ? ' ' + note.text : ''}`,
    };
  }
  return {
    tone: note ? note.tone : 'success',
    icon: note && note.tone === 'warning' ? 'alert-outline' : 'check-circle-outline',
    title: note && note.tone === 'warning' ? `Heads up, ${name}` : `Expense added, ${name}`,
    message: `${amount} spent on "${tx.title}" (${tx.category}).${note ? ' ' + note.text : ''}`,
  };
}

// Alert.alert with buttons is not supported on web, so fall back to window.confirm
export function confirmAction(title, message, onConfirm, confirmText = 'Yes') {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: confirmText, style: 'destructive', onPress: onConfirm },
  ]);
}
