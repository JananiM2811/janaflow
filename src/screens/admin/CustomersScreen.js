import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import AppText from '../../components/AppText';
import Avatar from '../../components/Avatar';
import FormField from '../../components/FormField';
import ScreenLayout from '../../components/ScreenLayout';
import { useApp } from '../../context/AppContext';
import { colors, themed } from '../../theme';
import { formatMoney } from '../../utils/format';
import { inRange, periodRange, totals } from '../../utils/reports';

export default function CustomersScreen({ navigation }) {
  const { customers, transactions } = useApp();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const list = customers.filter((c) => !q || c.name.toLowerCase().includes(q) || c.email.includes(q) || c.customerId.includes(q));

  return (
    <ScreenLayout title="Customers" subtitle={`${customers.length} registered`} inTabs headerContent={<View style={{ height: 10 }} />}>
      <FormField placeholder="Search by name, email or ID" value={query} onChangeText={setQuery} icon="magnify" autoCapitalize="none" />
      {list.length === 0 && (
        <AppText size={13} style={{ textAlign: 'center', marginTop: 20 }}>
          No customers match "{query}".
        </AppText>
      )}
      {list.map((c) => {
        const mine = transactions.filter((t) => t.userId === c.id);
        const all = totals(mine);
        const month = totals(inRange(mine, periodRange('Monthly')));
        const pct = c.monthlyBudget ? Math.round((month.expense / c.monthlyBudget) * 100) : 0;
        return (
          <Pressable key={c.id} onPress={() => navigation.navigate('CustomerDetail', { id: c.id })} style={styles.card}>
            <Avatar name={c.name} size={52} style={{ borderWidth: 0 }} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <AppText weight="semibold" size={15}>
                {c.name}
              </AppText>
              <AppText size={12} color={colors.muted}>
                {c.email}
              </AppText>
              <AppText size={12}>
                Balance <AppText weight="semibold" size={12}>{formatMoney(all.balance, { sign: true })}</AppText>
                {'  ·  '}
                <AppText size={12} color={pct >= 100 ? colors.danger : colors.oceanBlue}>
                  {pct}% budget
                </AppText>
              </AppText>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>
        );
      })}
    </ScreenLayout>
  );
}

const styles = themed(() => ({
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.lightGreen, borderRadius: 24, padding: 14, marginBottom: 12 },
}));
