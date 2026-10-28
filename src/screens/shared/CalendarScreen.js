import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import AppText from '../../components/AppText';
import CustomerSelect, { ALL_CUSTOMERS, byCustomer } from '../../components/CustomerSelect';
import BalanceSummary from '../../components/BalanceSummary';
import Button from '../../components/Button';
import ScreenLayout from '../../components/ScreenLayout';
import TransactionRow from '../../components/TransactionRow';
import { useApp } from '../../context/AppContext';
import { colors, themed } from '../../theme';
import { DAYS_SHORT, firstName, formatMoney, formatShort, MONTHS } from '../../utils/format';
import { sortByDateDesc, startOfDay, totals } from '../../utils/reports';

const sameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// Month calendar: customers see their own transactions, admins see every customer's
export default function CalendarScreen({ navigation }) {
  const { currentUser, transactions, myTransactions, customers, users } = useApp();
  const isAdmin = currentUser.role === 'admin';
  const [customerId, setCustomerId] = useState(ALL_CUSTOMERS);
  const today = startOfDay(new Date());
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);

  const source = isAdmin ? byCustomer(transactions, customerId) : myTransactions;
  const selectedCustomer = customers.find((c) => c.id === customerId);
  const y = month.getFullYear();
  const m = month.getMonth();
  const isCurrentMonth = y === today.getFullYear() && m === today.getMonth();

  const { byDay, monthList } = useMemo(() => {
    const map = {};
    const list = [];
    for (const t of source) {
      const d = new Date(t.date);
      if (d.getFullYear() !== y || d.getMonth() !== m) continue;
      list.push(t);
      const day = (map[d.getDate()] ??= { income: 0, expense: 0, count: 0 });
      day[t.type] += t.amount;
      day.count += 1;
    }
    return { byDay: map, monthList: list };
  }, [source, y, m]);

  const monthTotals = totals(monthList);
  const maxExpense = Math.max(1, ...Object.values(byDay).map((d) => d.expense));
  const busiest = Object.entries(byDay).sort((a, b) => b[1].expense - a[1].expense)[0];

  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(month.getDay()).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const changeMonth = (delta) => {
    const next = new Date(y, m + delta, 1);
    if (next > today) return;
    setMonth(next);
    const nextIsCurrent = next.getFullYear() === today.getFullYear() && next.getMonth() === today.getMonth();
    setSelected(nextIsCurrent ? today : next);
  };

  const dayItems = sortByDateDesc(source.filter((t) => sameDay(new Date(t.date), selected)));
  const dayTotals = totals(dayItems);
  const nameOf = (id) => firstName(users.find((u) => u.id === id)?.name);

  return (
    <ScreenLayout
      title="Calendar"
      subtitle={isAdmin ? selectedCustomer?.name || 'All customers' : undefined}
      headerContent={
        <BalanceSummary leftLabel={`${MONTHS[m]} Income`} leftValue={monthTotals.income} rightLabel={`${MONTHS[m]} Expense`} rightValue={monthTotals.expense} />
      }
    >
      {isAdmin && <CustomerSelect value={customerId} onChange={setCustomerId} style={{ marginBottom: 14 }} />}

      <View style={styles.calendar}>
        <View style={styles.monthRow}>
          <Pressable onPress={() => changeMonth(-1)} hitSlop={10} style={styles.navBtn} accessibilityLabel="Previous month">
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.fence} />
          </Pressable>
          <AppText weight="semibold" size={17}>
            {MONTHS[m]} {y}
          </AppText>
          <Pressable
            onPress={() => changeMonth(1)}
            hitSlop={10}
            disabled={isCurrentMonth}
            style={[styles.navBtn, isCurrentMonth && { opacity: 0.3 }]}
            accessibilityLabel="Next month"
          >
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.fence} />
          </Pressable>
        </View>

        <View style={styles.week}>
          {DAYS_SHORT.map((d) => (
            <AppText key={d} weight="medium" size={11} color={colors.muted} style={styles.weekDay}>
              {d.toUpperCase()}
            </AppText>
          ))}
        </View>

        <View style={styles.grid}>
          {cells.map((n, i) => {
            if (!n) return <View key={`e${i}`} style={styles.cell} />;
            const date = new Date(y, m, n);
            const info = byDay[n];
            const future = date > today;
            const isSel = sameDay(date, selected);
            const isToday = sameDay(date, today);
            const heat = info ? 0.06 + (info.expense / maxExpense) * 0.32 : 0;
            return (
              <Pressable key={n} style={styles.cell} disabled={future} onPress={() => setSelected(date)}>
                <View
                  style={[
                    styles.day,
                    info && { backgroundColor: `rgba(${colors.heat},${heat.toFixed(2)})` },
                    isToday && styles.today,
                    isSel && styles.daySel,
                  ]}
                >
                  <AppText weight={isSel || isToday ? 'semibold' : 'regular'} size={13} color={isSel ? colors.white : future ? colors.lightBlue : colors.fence}>
                    {n}
                  </AppText>
                  {info?.expense > 0 && (
                    <AppText size={8} color={isSel ? colors.white : colors.fence} numberOfLines={1}>
                      {formatShort(info.expense)}
                    </AppText>
                  )}
                  {info?.income > 0 && <View style={[styles.incomeDot, isSel && { backgroundColor: colors.white }]} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.legend}>
          <View style={[styles.legendBox, { backgroundColor: `rgba(${colors.heat},0.35)` }]} />
          <AppText size={11} color={colors.muted}> More spending   </AppText>
          <View style={[styles.incomeDot, { position: 'relative', top: 0, right: 0 }]} />
          <AppText size={11} color={colors.muted}> Income received</AppText>
        </View>
        {busiest && (
          <AppText size={11} color={colors.muted} style={{ textAlign: 'center', marginTop: 4 }}>
            Highest spend: {MONTHS[m].slice(0, 3)} {busiest[0]} ({formatMoney(busiest[1].expense)})
          </AppText>
        )}
      </View>

      <View style={styles.dayHead}>
        <View>
          <AppText weight="semibold" size={16}>
            {DAYS_SHORT[selected.getDay()]}, {selected.getDate()} {MONTHS[selected.getMonth()]}
          </AppText>
          <AppText size={12} color={colors.muted}>
            In {formatMoney(dayTotals.income)} · Out {formatMoney(dayTotals.expense)} · {dayItems.length} items
          </AppText>
        </View>
        {!isAdmin && (
          <Pressable
            onPress={() => navigation.navigate('AddTransaction', { date: selected.toISOString() })}
            style={styles.addBtn}
            accessibilityLabel="Add transaction on this day"
          >
            <MaterialCommunityIcons name="plus" size={22} color={colors.white} />
          </Pressable>
        )}
      </View>

      {dayItems.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="calendar-blank-outline" size={36} color={colors.lightBlue} />
          <AppText size={13} style={{ marginTop: 6 }}>
            No transactions on this day.
          </AppText>
          {!isAdmin && (
            <Button
              title="Add Transaction"
              variant="secondary"
              onPress={() => navigation.navigate('AddTransaction', { date: selected.toISOString() })}
              style={{ marginTop: 12 }}
            />
          )}
        </View>
      ) : (
        dayItems.map((tx) => (
          <TransactionRow
            key={tx.id}
            tx={tx}
            caption={isAdmin ? nameOf(tx.userId) : undefined}
            onPress={() => (isAdmin ? navigation.navigate('CustomerDetail', { id: tx.userId }) : navigation.navigate('AddTransaction', { id: tx.id }))}
          />
        ))
      )}
    </ScreenLayout>
  );
}

const styles = themed(() => ({
  calendar: { backgroundColor: colors.surface, borderRadius: 28, padding: 14, borderWidth: 1, borderColor: colors.border },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  navBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.lightGreen, alignItems: 'center', justifyContent: 'center' },
  week: { flexDirection: 'row', marginBottom: 4 },
  weekDay: { width: `${100 / 7}%`, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 0.9, padding: 2 },
  day: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1.5, borderColor: colors.fence },
  daySel: { backgroundColor: colors.primary },
  incomeDot: { position: 'absolute', top: 5, right: 5, width: 6, height: 6, borderRadius: 3, backgroundColor: colors.income },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  legendBox: { width: 12, height: 12, borderRadius: 3 },
  dayHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 4 },
  addBtn: { width: 40, height: 40, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingVertical: 24 },
}));
