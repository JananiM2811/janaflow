import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import AppText from '../../components/AppText';
import DateRangeFilter, { ALL_TIME, applyRange } from '../../components/DateRangeFilter';
import MonthSections from '../../components/MonthSections';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenLayout, { TAB_BAR_HEIGHT } from '../../components/ScreenLayout';
import { useApp } from '../../context/AppContext';
import { colors, shadow, themed } from '../../theme';
import { formatMoney } from '../../utils/format';
import { totals } from '../../utils/reports';

export default function TransactionsScreen({ navigation }) {
  const { myTransactions } = useApp();
  const [filter, setFilter] = useState(null); // null | 'income' | 'expense'
  const [range, setRange] = useState(ALL_TIME);
  const balance = totals(myTransactions).balance;
  const inPeriod = applyRange(myTransactions, range);
  const t = totals(inPeriod);
  const list = filter ? inPeriod.filter((x) => x.type === filter) : inPeriod;

  const Card = ({ type, label, value, icon }) => {
    const active = filter === type;
    return (
      <Pressable onPress={() => setFilter(active ? null : type)} style={[styles.card, active && { backgroundColor: colors.primary }]}>
        <MaterialCommunityIcons name={icon} size={26} color={active ? colors.white : type === 'income' ? colors.income : colors.expense} />
        <AppText weight="medium" size={14} color={active ? colors.white : colors.fence}>
          {label}
        </AppText>
        <AppText weight="semibold" size={16} color={active ? colors.white : type === 'income' ? colors.income : colors.expense} numberOfLines={1} adjustsFontSizeToFit>
          {formatMoney(value)}
        </AppText>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
    <ScreenLayout
      title="Transaction"
      inTabs
      headerContent={
        <>
          <View style={styles.balance}>
            <AppText weight="medium" size={14}>
              Total Balance
            </AppText>
            <AppText weight="bold" size={24}>
              {formatMoney(balance, { sign: true })}
            </AppText>
          </View>
          <View style={styles.cards}>
            <Card type="income" label="Income" value={t.income} icon="arrow-top-right-bold-box-outline" />
            <Card type="expense" label="Expense" value={t.expense} icon="arrow-bottom-left-bold-box-outline" />
          </View>
        </>
      }
    >
      <DateRangeFilter value={range} onChange={setRange} style={{ marginBottom: 12 }} />
      {filter && (
        <AppText size={12} color={colors.oceanBlue} style={{ marginBottom: 6 }}>
          Showing {filter} only · tap the card again to show all
        </AppText>
      )}
      <MonthSections key={`${filter || 'all'}-${range.label}`} list={list} onPressItem={(tx) => navigation.navigate('AddTransaction', { id: tx.id })} />
      <View style={{ height: 70 }} />
    </ScreenLayout>
    <AddFab onPress={() => navigation.navigate('AddTransaction', { type: filter || 'expense' })} />
    </View>
  );
}

export function AddFab({ onPress }) {
  const insets = useSafeAreaInsets();
  return (
    <Pressable onPress={onPress} style={[styles.fab, { bottom: TAB_BAR_HEIGHT + insets.bottom + 16 }]} accessibilityLabel="Add transaction">
      <MaterialCommunityIcons name="plus" size={30} color={colors.white} />
    </Pressable>
  );
}

const styles = themed(() => ({
  balance: { backgroundColor: colors.honeydew, borderRadius: 16, alignItems: 'center', paddingVertical: 10 },
  cards: { flexDirection: 'row', gap: 14, marginTop: 14 },
  card: { flex: 1, backgroundColor: colors.honeydew, borderRadius: 16, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8 },
  fab: {
    position: 'absolute',
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
}));
