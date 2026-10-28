import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { colors, themed } from '../theme';
import { formatMoney } from '../utils/format';
import { groupByMonth, totals } from '../utils/reports';
import AppText from './AppText';
import TransactionRow from './TransactionRow';

// Month-wise transaction list; only expanded months are rendered to keep long lists fast
export default function MonthSections({ list, onPressItem, caption, initiallyOpen = 1 }) {
  const groups = groupByMonth(list);
  const [open, setOpen] = useState(() => new Set(groups.slice(0, initiallyOpen).map((g) => g.key)));

  const toggle = (key) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  if (groups.length === 0) {
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons name="receipt-text-outline" size={40} color={colors.lightBlue} />
        <AppText size={13} style={{ marginTop: 8 }}>
          No transactions found for this period.
        </AppText>
      </View>
    );
  }

  return groups.map((g) => {
    const t = totals(g.data);
    const isOpen = open.has(g.key);
    return (
      <View key={g.key} style={{ marginBottom: 6 }}>
        <Pressable onPress={() => toggle(g.key)} style={styles.head}>
          <View>
            <AppText weight="semibold" size={16}>
              {g.title}
            </AppText>
            <AppText size={11} color={colors.muted}>
              In {formatMoney(t.income)} · Out {formatMoney(t.expense)} · {g.data.length} items
            </AppText>
          </View>
          <View style={styles.cal}>
            <MaterialCommunityIcons name={isOpen ? 'chevron-up' : 'calendar-month-outline'} size={20} color={colors.fence} />
          </View>
        </Pressable>
        {isOpen && g.data.map((tx) => <TransactionRow key={tx.id} tx={tx} caption={caption?.(tx)} onPress={onPressItem && (() => onPressItem(tx))} />)}
      </View>
    );
  });
}

const styles = themed(() => ({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  cal: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.lightGreen, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 32 },
}));
