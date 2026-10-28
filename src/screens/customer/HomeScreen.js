import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import AppText from '../../components/AppText';
import BalanceSummary from '../../components/BalanceSummary';
import ProgressRing from '../../components/ProgressRing';
import ScreenLayout from '../../components/ScreenLayout';
import SegmentedTabs from '../../components/SegmentedTabs';
import TransactionRow from '../../components/TransactionRow';
import { useApp } from '../../context/AppContext';
import { colors, themed } from '../../theme';
import { DAYS_SHORT, firstName, formatMoney, greeting } from '../../utils/format';
import { exportReportWithToast } from '../../utils/pdf';
import { inRange, periodRange, sortByDateDesc, topCategories, totals } from '../../utils/reports';
import { spendingStreak } from '../../utils/streak';

export function ReportCard({ period, list }) {
  const range = periodRange(period);
  const items = inRange(list, range);
  const t = totals(items);
  const days = Math.max(1, Math.round((range.end - range.start) / 86400000));
  const top = topCategories(items, 1)[0];

  const stats = [
    { label: 'Income', value: formatMoney(t.income), icon: 'arrow-down-bold-circle-outline', color: colors.income },
    { label: 'Expense', value: `-${formatMoney(t.expense)}`, icon: 'arrow-up-bold-circle-outline', color: colors.expense },
    { label: 'Net Saved', value: formatMoney(t.balance, { sign: true }), icon: 'scale-balance', color: t.balance >= 0 ? colors.fence : colors.danger },
    { label: period === 'Daily' ? 'Transactions' : 'Avg / Day', value: period === 'Daily' ? String(items.length) : formatMoney(t.expense / days), icon: 'chart-box-outline', color: colors.fence },
  ];

  return (
    <View style={styles.report}>
      <View style={styles.reportHead}>
        <AppText weight="semibold" size={15}>
          {period} Report
        </AppText>
        <AppText size={12} color={colors.oceanBlue}>
          {range.label}
        </AppText>
      </View>
      <View style={styles.grid}>
        {stats.map((s) => (
          <View key={s.label} style={styles.stat}>
            <MaterialCommunityIcons name={s.icon} size={18} color={s.color} />
            <AppText size={11} style={{ marginTop: 2 }}>
              {s.label}
            </AppText>
            <AppText weight="semibold" size={14} color={s.color} numberOfLines={1} adjustsFontSizeToFit>
              {s.value}
            </AppText>
          </View>
        ))}
      </View>
      <AppText size={12} style={{ marginTop: 8 }}>
        {top ? `Top spend: ${top.category} (${formatMoney(top.amount)}) · ${items.length} transactions` : 'No spending recorded for this period yet.'}
      </AppText>
    </View>
  );
}

export function CalendarLink({ onPress }) {
  return <ActionLink icon="calendar-month-outline" label="Open Calendar View" onPress={onPress} />;
}

export function ActionLink({ icon, label, onPress, variant = 'solid' }) {
  const solid = variant === 'solid';
  return (
    <Pressable onPress={onPress} style={[styles.calLink, !solid && styles.outlineLink]}>
      <MaterialCommunityIcons name={icon} size={20} color={solid ? colors.white : colors.fence} />
      <AppText weight="medium" size={14} color={solid ? colors.white : colors.fence} style={{ flex: 1, marginLeft: 10 }}>
        {label}
      </AppText>
      <MaterialCommunityIcons name="chevron-right" size={20} color={solid ? colors.white : colors.fence} />
    </Pressable>
  );
}

export function StreakCard({ list, monthlyBudget }) {
  const s = spendingStreak(list, monthlyBudget);
  return (
    <View style={styles.streak}>
      <View style={styles.streakHead}>
        <View style={styles.fire}>
          <MaterialCommunityIcons name="fire" size={26} color={colors.white} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <AppText weight="medium" size={11} color={colors.muted} style={{ letterSpacing: 0.8 }}>
            SPENDING STREAK
          </AppText>
          <AppText weight="bold" size={17}>
            {s.current} {s.current === 1 ? 'day' : 'days'} in a row under budget
          </AppText>
        </View>
      </View>
      <AppText size={12} color={colors.muted} style={{ marginTop: 8 }}>
        Your daily limit is {formatMoney(s.allowance)} (monthly budget {formatMoney(monthlyBudget)} ÷ days in the month). Each day you spend less
        than this counts towards your streak. Rent & Savings are not counted.
      </AppText>
      <View style={styles.week}>
        {s.week.map((d, i) => (
          <View key={i} style={{ alignItems: 'center' }}>
            <View style={[styles.dayDot, d.under ? styles.dayUnder : styles.dayOver, i === 6 && styles.dayToday]}>
              <MaterialCommunityIcons name={d.under ? 'check' : 'close'} size={14} color={d.under ? colors.white : colors.muted} />
            </View>
            <AppText size={10} color={colors.muted} style={{ marginTop: 3 }}>
              {DAYS_SHORT[d.date.getDay()].slice(0, 2)}
            </AppText>
          </View>
        ))}
      </View>
      <AppText size={10} color={colors.muted} style={{ marginTop: 6, textAlign: 'center' }}>
        Last 7 days · ✓ under the limit · ✕ over the limit
      </AppText>
      <AppText weight="medium" size={12} style={{ marginTop: 8 }}>
        {s.current === 0
          ? `Today's spending crossed ${formatMoney(s.allowance)}. Start a new streak tomorrow!`
          : s.current >= s.best
            ? `This is your best streak in the last 90 days — keep going! 🔥`
            : `Your best was ${s.best} days. ${s.best - s.current} more ${s.best - s.current === 1 ? 'day' : 'days'} to beat it.`}
      </AppText>
    </View>
  );
}

export function downloadMonthlyReport({ user, list, showToast }) {
  const range = periodRange('Monthly');
  return exportReportWithToast(
    {
      title: 'Monthly Report',
      subtitle: `${user.name} · ID ${user.customerId}`,
      periodLabel: `${range.label} ${range.start.getFullYear()}`,
      list: inRange(list, range),
    },
    showToast,
  );
}

export default function HomeScreen({ navigation }) {
  const { currentUser, myTransactions, categories, showToast } = useApp();
  const [period, setPeriod] = useState('Monthly');

  const all = totals(myTransactions);
  const month = totals(inRange(myTransactions, periodRange('Monthly')));
  const week = inRange(myTransactions, periodRange('Weekly'));
  const weekIncome = totals(week).income;
  const weekFood = totals(week.filter((t) => t.category === 'Food')).expense;
  const savingsBudget = categories.find((c) => c.key === 'Savings')?.budget || 1;
  const savedThisMonth = totals(inRange(myTransactions, periodRange('Monthly')).filter((t) => t.category === 'Savings')).expense;

  const recent = useMemo(() => sortByDateDesc(inRange(myTransactions, periodRange(period))).slice(0, 8), [myTransactions, period]);

  return (
    <ScreenLayout
      title={`Hi, ${firstName(currentUser.name)}`}
      subtitle={greeting()}
      align="left"
      inTabs
      headerContent={<BalanceSummary leftValue={all.balance} rightValue={month.expense} rightLabel="Month Expense" spent={month.expense} limit={currentUser.monthlyBudget} />}
    >
      <View style={styles.goalCard}>
        <Pressable style={styles.goalLeft} onPress={() => navigation.navigate('Goals')} accessibilityLabel="Open savings goals">
          <ProgressRing size={78} progress={savedThisMonth / savingsBudget} color={colors.income}>
            <MaterialCommunityIcons name="car-sports" size={32} color={colors.fence} />
          </ProgressRing>
          <AppText weight="medium" size={12} style={{ textAlign: 'center', marginTop: 6 }}>
            Savings{'\n'}On Goals ›
          </AppText>
        </Pressable>
        <View style={styles.vline} />
        <View style={{ flex: 1, paddingLeft: 16 }}>
          <View style={styles.goalRow}>
            <MaterialCommunityIcons name="cash-multiple" size={30} color={colors.income} />
            <View style={{ marginLeft: 10 }}>
              <AppText size={12}>Revenue Last Week</AppText>
              <AppText weight="bold" size={15} color={colors.income}>
                {formatMoney(weekIncome)}
              </AppText>
            </View>
          </View>
          <View style={styles.hline} />
          <View style={styles.goalRow}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={28} color={colors.fence} />
            <View style={{ marginLeft: 10 }}>
              <AppText size={12}>Food Last Week</AppText>
              <AppText weight="bold" size={15} color={colors.expense}>
                -{formatMoney(weekFood)}
              </AppText>
            </View>
          </View>
        </View>
      </View>

      <StreakCard list={myTransactions} monthlyBudget={currentUser.monthlyBudget} />

      <SegmentedTabs options={['Daily', 'Weekly', 'Monthly']} value={period} onChange={setPeriod} style={{ marginTop: 24 }} />
      <ReportCard period={period} list={myTransactions} />
      <CalendarLink onPress={() => navigation.navigate('Calendar')} />
      <ActionLink
        icon="file-pdf-box"
        label="Download Monthly Report (PDF)"
        variant="outline"
        onPress={() => downloadMonthlyReport({ user: currentUser, list: myTransactions, showToast })}
      />

      <View style={styles.listHead}>
        <AppText weight="semibold" size={15}>
          Recent Transactions
        </AppText>
        <Pressable onPress={() => navigation.navigate('Transactions')}>
          <AppText size={13} color={colors.oceanBlue}>
            See all
          </AppText>
        </Pressable>
      </View>
      {recent.length === 0 ? (
        <AppText size={13} style={{ textAlign: 'center', marginVertical: 16, opacity: 0.7 }}>
          No transactions in this period.
        </AppText>
      ) : (
        recent.map((tx) => <TransactionRow key={tx.id} tx={tx} onPress={() => navigation.navigate('AddTransaction', { id: tx.id })} />)
      )}
    </ScreenLayout>
  );
}

const styles = themed(() => ({
  goalCard: { backgroundColor: colors.lightGreen, borderRadius: 31, padding: 20, flexDirection: 'row', alignItems: 'center' },
  goalLeft: { alignItems: 'center', paddingRight: 16 },
  vline: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border },
  hline: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  goalRow: { flexDirection: 'row', alignItems: 'center' },
  report: { backgroundColor: colors.lightGreen, borderRadius: 24, padding: 16, marginTop: 16 },
  reportHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  stat: { width: '48%', backgroundColor: colors.honeydew, borderRadius: 16, padding: 10, marginTop: 8 },
  calLink: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, borderRadius: 18, paddingHorizontal: 16, height: 48, marginTop: 12 },
  outlineLink: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  streak: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 24, padding: 16, marginTop: 16 },
  streakHead: { flexDirection: 'row', alignItems: 'center' },
  fire: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  week: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  dayDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dayUnder: { backgroundColor: colors.primary },
  dayOver: { backgroundColor: colors.lightGreen },
  dayToday: { borderWidth: 2, borderColor: colors.lightBlue },
  listHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 4 },
}));
