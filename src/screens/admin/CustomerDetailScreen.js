import { useState } from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import BalanceSummary from '../../components/BalanceSummary';
import DateRangeFilter, { applyRange, presetRange } from '../../components/DateRangeFilter';
import MonthSections from '../../components/MonthSections';
import ScreenLayout from '../../components/ScreenLayout';
import { useApp } from '../../context/AppContext';
import { colors, themed } from '../../theme';
import { firstName, formatMoney } from '../../utils/format';
import { exportReportWithToast } from '../../utils/pdf';
import { ActionLink } from '../customer/HomeScreen';
import { inRange, periodRange, totals } from '../../utils/reports';

// Read-only view of one customer for the Admin
export default function CustomerDetailScreen({ route }) {
  const { users, transactions, showToast } = useApp();
  const [range, setRange] = useState(() => presetRange('Month'));
  const customer = users.find((u) => u.id === route.params.id);
  const mine = transactions.filter((t) => t.userId === customer.id);
  const shown = applyRange(mine, range);
  const all = totals(mine);
  const month = totals(inRange(mine, periodRange('Monthly')));

  const info = [
    ['Customer ID', customer.customerId],
    ['Email', customer.email],
    ['Phone', customer.phone],
    ['Date of Birth', customer.dob],
    ['Monthly Budget', formatMoney(customer.monthlyBudget)],
    ['Transactions', String(mine.length)],
  ];

  return (
    <ScreenLayout
      title={customer.name}
      left="back"
      headerContent={<BalanceSummary leftValue={all.balance} rightValue={month.expense} rightLabel="Month Expense" spent={month.expense} limit={customer.monthlyBudget} />}
    >
      <View style={styles.info}>
        {info.map(([k, v]) => (
          <View key={k} style={styles.row}>
            <AppText size={13} color={colors.muted}>
              {k}
            </AppText>
            <AppText weight="medium" size={13}>
              {v}
            </AppText>
          </View>
        ))}
      </View>
      <AppText weight="semibold" size={15} style={{ marginTop: 18, marginBottom: 10 }}>
        Transactions
      </AppText>
      <DateRangeFilter value={range} onChange={setRange} />
      <ActionLink
        icon="file-pdf-box"
        label={`Download ${firstName(customer.name)}'s Report (PDF)`}
        variant="outline"
        onPress={() =>
          exportReportWithToast(
            {
              title: 'Customer Report',
              subtitle: `Customer: ${customer.name} · ID ${customer.customerId} · ${customer.email}`,
              periodLabel: range.label,
              list: shown,
            },
            showToast,
          )
        }
      />
      <View style={{ height: 8 }} />
      <MonthSections key={range.label} list={shown} />
    </ScreenLayout>
  );
}

const styles = themed(() => ({
  info: { backgroundColor: colors.lightGreen, borderRadius: 24, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
}));
