import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import BalanceSummary from '../../components/BalanceSummary';
import BarChart from '../../components/BarChart';
import ProgressRing from '../../components/ProgressRing';
import ScreenLayout from '../../components/ScreenLayout';
import CustomerSelect, { ALL_CUSTOMERS, byCustomer } from '../../components/CustomerSelect';
import DateRangeFilter, { applyRange, presetRange } from '../../components/DateRangeFilter';
import { useCategoryIcon } from '../../components/TransactionRow';
import { useApp } from '../../context/AppContext';
import { colors, themed } from '../../theme';
import { formatMoney } from '../../utils/format';
import { exportReportWithToast } from '../../utils/pdf';
import { ActionLink } from '../customer/HomeScreen';
import { addDays, inRange, periodRange, rangeBuckets, startOfDay, topCategories, totals } from '../../utils/reports';

// Shared by Admin (all customers) and Customer (own data)
export default function AnalysisScreen() {
  const { currentUser, transactions, myTransactions, customers, categories, showToast } = useApp();
  const iconFor = useCategoryIcon();
  const [range, setRange] = useState(() => presetRange('Month'));
  const [customerId, setCustomerId] = useState(ALL_CUSTOMERS);
  const isAdmin = currentUser.role === 'admin';
  const allCustomers = !isAdmin || customerId === ALL_CUSTOMERS;
  const selectedCustomer = customers.find((c) => c.id === customerId);
  const list = isAdmin ? byCustomer(transactions, customerId) : myTransactions;
  const budget = !isAdmin ? currentUser.monthlyBudget : selectedCustomer ? selectedCustomer.monthlyBudget : customers.reduce((s, c) => s + c.monthlyBudget, 0);

  const data = useMemo(() => {
    // open-ended sides fall back to the first transaction / today
    const first = list.reduce((min, t) => Math.min(min, new Date(t.date).getTime()), Date.now());
    const start = range.start || startOfDay(new Date(first));
    const end = range.end || addDays(startOfDay(new Date()), 1);
    return rangeBuckets(list, start, end);
  }, [list, range]);
  const periodTotals = totals(applyRange(list, range));
  const all = totals(list);
  const monthList = inRange(list, periodRange('Monthly'));
  const month = totals(monthList);
  const targets = topCategories(monthList, 4);
  const scale = isAdmin && allCustomers ? Math.max(1, customers.length) : 1;
  const [exporting, setExporting] = useState(false);

  // exports exactly what is on screen: the selected range (and customer, for admins)
  const onExport = async () => {
    if (exporting) return;
    setExporting(true);
    await exportReportWithToast(
      {
        title: 'Income & Expense Report',
        subtitle: isAdmin ? (selectedCustomer ? `Customer: ${selectedCustomer.name}` : `All ${customers.length} customers`) : `${currentUser.name} · ID ${currentUser.customerId}`,
        periodLabel: range.label,
        list: applyRange(list, range),
        nameOf: isAdmin && allCustomers ? (id) => customers.find((c) => c.id === id)?.name || '' : undefined,
      },
      showToast,
    );
    setExporting(false);
  };

  return (
    <ScreenLayout
      title="Analysis"
      subtitle={isAdmin ? (selectedCustomer ? selectedCustomer.name : `All ${customers.length} customers`) : undefined}
      inTabs
      headerContent={<BalanceSummary leftValue={all.balance} rightValue={month.expense} rightLabel="Month Expense" spent={month.expense} limit={budget} />}
    >
      {isAdmin && <CustomerSelect value={customerId} onChange={setCustomerId} style={{ marginBottom: 14 }} />}
      <DateRangeFilter value={range} onChange={setRange} />

      <View style={styles.chartCard}>
        <View style={styles.chartHead}>
          <View style={{ flex: 1 }}>
            <AppText weight="semibold" size={15}>
              Income & Expenses
            </AppText>
            <AppText size={11} color={colors.muted} numberOfLines={1}>
              {range.label}
            </AppText>
          </View>
          <View style={styles.legend}>
            <View style={[styles.dot, { backgroundColor: colors.income }]} />
            <AppText size={11}>Income  </AppText>
            <View style={[styles.dot, { backgroundColor: colors.expense }]} />
            <AppText size={11}>Expense</AppText>
          </View>
        </View>
        <BarChart data={data} />
      </View>

      <View style={styles.totals}>
        <View style={styles.totalItem}>
          <MaterialCommunityIcons name="arrow-top-right-bold-box-outline" size={30} color={colors.income} />
          <AppText size={13}>Income</AppText>
          <AppText weight="semibold" size={17} numberOfLines={1} adjustsFontSizeToFit>
            {formatMoney(periodTotals.income)}
          </AppText>
        </View>
        <View style={styles.totalItem}>
          <MaterialCommunityIcons name="arrow-bottom-left-bold-box-outline" size={30} color={colors.expense} />
          <AppText size={13}>Expense</AppText>
          <AppText weight="semibold" size={17} color={colors.expense} numberOfLines={1} adjustsFontSizeToFit>
            {formatMoney(periodTotals.expense)}
          </AppText>
        </View>
      </View>

      <ActionLink icon="file-pdf-box" label={exporting ? 'Preparing PDF…' : 'Export This Report as PDF'} variant="outline" onPress={onExport} />

      <AppText weight="semibold" size={15} style={{ marginTop: 22, marginBottom: 12 }}>
        My Targets · This Month
      </AppText>
      <View style={styles.targets}>
        {targets.map((t) => {
          const limit = (categories.find((c) => c.key === t.category)?.budget || t.amount) * scale;
          const pct = Math.round((t.amount / limit) * 100);
          return (
            <View key={t.category} style={styles.target}>
              <ProgressRing size={64} progress={t.amount / limit} color={pct >= 100 ? colors.danger : pct >= 80 ? colors.warning : colors.income} track={colors.honeydew}>
                <MaterialCommunityIcons name={iconFor(t.category)} size={22} color={colors.fence} />
              </ProgressRing>
              <AppText weight="medium" size={13} style={{ marginTop: 6 }}>
                {t.category}
              </AppText>
              <AppText size={11} color={pct >= 100 ? colors.danger : colors.oceanBlue}>
                {pct}% of budget
              </AppText>
            </View>
          );
        })}
        {targets.length === 0 && <AppText size={13}>No expenses this month yet.</AppText>}
      </View>
    </ScreenLayout>
  );
}

const styles = themed(() => ({
  chartCard: { backgroundColor: colors.lightGreen, borderRadius: 40, padding: 20, marginTop: 20 },
  chartHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  legend: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  totals: { flexDirection: 'row', marginTop: 20 },
  totalItem: { flex: 1, alignItems: 'center' },
  targets: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  target: { width: '47%', alignItems: 'center', backgroundColor: colors.lightGreen, borderRadius: 24, paddingVertical: 14, marginBottom: 12 },
}));
