import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, themed } from '../theme';
import Avatar from './Avatar';
import Select from './Select';

export const ALL_CUSTOMERS = 'all';

// Admin-only customer filter; value is a customer id or ALL_CUSTOMERS
export default function CustomerSelect({ value, onChange, style }) {
  const { customers } = useApp();
  const options = [
    {
      value: ALL_CUSTOMERS,
      label: 'All customers',
      description: `${customers.length} customers`,
      left: (
        <View style={styles.allIcon}>
          <MaterialCommunityIcons name="account-group-outline" size={16} color={colors.fence} />
        </View>
      ),
    },
    ...customers.map((c) => ({
      value: c.id,
      label: c.name,
      description: `${c.email} · ID ${c.customerId}`,
      left: <Avatar name={c.name} size={28} style={{ borderWidth: 0 }} />,
    })),
  ];

  return (
    <Select
      label="Customer"
      value={value}
      options={options}
      onChange={onChange}
      searchable
      searchPlaceholder="Search customer…"
      style={style}
    />
  );
}

// Filters a transaction list by the selected customer
export const byCustomer = (list, customerId) => (customerId === ALL_CUSTOMERS ? list : list.filter((t) => t.userId === customerId));

const styles = themed(() => ({
  allIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.lightGreen, alignItems: 'center', justifyContent: 'center' },
}));
