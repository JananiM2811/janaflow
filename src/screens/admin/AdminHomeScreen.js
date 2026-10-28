import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import CustomerSelect, { ALL_CUSTOMERS, byCustomer } from '../../components/CustomerSelect';
import ScreenLayout from '../../components/ScreenLayout';
import SegmentedTabs from '../../components/SegmentedTabs';
import TransactionRow from '../../components/TransactionRow';
import { useApp } from '../../context/AppContext';
import { colors, themed } from '../../theme';
import { firstName, formatMoney, greeting } from '../../utils/format';
import { exportReportWithToast } from '../../utils/pdf';
import { inRange, periodRange, sortByDateDesc, topCategories, totals } from '../../utils/reports';
import { ActionLink, CalendarLink, ReportCard } from '../customer/HomeScreen';

export default function AdminHomeScreen({ navigation }) {
  const { currentUser, customers, transactions: allTransactions, users, showToast } = useApp();
  const [period, setPeriod] = useState('Daily');
  const [customerId, setCustomerId] = useState(ALL_CUSTOMERS);
  const selected = customers.find((c) => c.id === customerId);
  const transactions = byCustomer(allTransactions, customerId);
  const all = totals(transactions);
  const periodList = inRange(transactions, periodRange(period));
  const activeCustomers = new Set(periodList.map((t) => t.userId)).size;
  const top = topCategories(periodList, 5);
  const topMax = Math.max(1, ...top.map((t) => t.amount));
  const recent = sortByDateDesc(transactions).slice(0, 6);
  const nameOf = (id) => firstName(users.find((u) => u.id === id)?.name);

  return (
    <ScreenLayout
      title={`Hi, ${firstName(currentUser.name)}`}
      subtitle={`${greeting()} · Admin`}
      align="left"
      inTabs
      headerContent={
        <View style={styles.kpis}>
          {[
            { label: 'Customers', value: String(customers.length), icon: 'account-group-outline' },
            { label: 'Total Balance', value: formatMoney(all.balance, { sign: true }), icon: 'wallet-outline' },
          ].map((k) => (
            <View key={k.label} style={styles.kpi}>
              <MaterialCommunityIcons name={k.icon} size={22} color={colors.fence} />
              <AppText size={12}>{k.label}</AppText>
              <AppText weight="bold" size={18} numberOfLines={1} adjustsFontSizeToFit>
                {k.value}
              </AppText>
            </View>
          ))}
        </View>
      }
    >
      <CustomerSelect value={customerId} onChange={setCustomerId} style={{ marginBottom: 14 }} />
      <SegmentedTabs options={['Daily', 'Weekly', 'Monthly']} value={period} onChange={setPeriod} />
      <ReportCard period={period} list={transactions} />
      {customerId === ALL_CUSTOMERS && (
        <AppText size={12} color={colors.muted} style={{ marginTop: 6 }}>
          {activeCustomers} of {customers.length} customers were active in this period.
        </AppText>
      )}
      <CalendarLink onPress={() => navigation.navigate('Calendar')} />
      <ActionLink
        icon="file-pdf-box"
        label={`Download ${period} Report (PDF)`}
        variant="outline"
        onPress={() =>
          exportReportWithToast(
            {
              title: `${period} Report`,
              subtitle: selected ? `Customer: ${selected.name} · ID ${selected.customerId}` : `All ${customers.length} customers · Admin report`,
              periodLabel: periodRange(period).label,
              list: periodList,
              nameOf: selected ? undefined : (id) => users.find((u) => u.id === id)?.name || '',
            },
            showToast,
          )
        }
      />

      <AppText weight="semibold" size={15} style={styles.section}>
        Top Spending Categories
      </AppText>
      {top.length === 0 && <AppText size={13}>No spending in this period.</AppText>}
      {top.map((t) => (
        <View key={t.category} style={{ marginBottom: 10 }}>
          <View style={styles.barHead}>
            <AppText size={13}>{t.category}</AppText>
            <AppText weight="medium" size={13} color={colors.oceanBlue}>
              {formatMoney(t.amount)}
            </AppText>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${(t.amount / topMax) * 100}%` }]} />
          </View>
        </View>
      ))}

      <AppText weight="semibold" size={15} style={styles.section}>
        Latest Customer Activity
      </AppText>
      {recent.map((tx) => (
        <TransactionRow key={tx.id} tx={tx} caption={nameOf(tx.userId)} onPress={() => navigation.navigate('CustomerDetail', { id: tx.userId })} />
      ))}
    </ScreenLayout>
  );
}

const styles = themed(() => ({
  kpis: { flexDirection: 'row', gap: 14 },
  kpi: { flex: 1, backgroundColor: colors.honeydew, borderRadius: 20, padding: 14 },
  section: { marginTop: 22, marginBottom: 10 },
  barHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.lightGreen, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5, backgroundColor: colors.primary },
}));
