import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { colors, themed } from '../theme';
import AppText from './AppText';

const ROLES = [
  { key: 'customer', label: 'Customer', icon: 'account-outline' },
  { key: 'admin', label: 'Admin', icon: 'shield-account-outline' },
];

export default function RoleToggle({ value, onChange, style }) {
  return (
    <View style={[styles.wrap, style]}>
      {ROLES.map((r) => {
        const active = r.key === value;
        return (
          <Pressable key={r.key} onPress={() => onChange(r.key)} style={[styles.item, active && styles.active]}>
            <MaterialCommunityIcons name={r.icon} size={18} color={active ? colors.white : colors.fence} />
            <AppText weight="medium" size={14} color={active ? colors.white : colors.fence}>
              {' '}
              {r.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = themed(() => ({
  wrap: { flexDirection: 'row', backgroundColor: colors.lightGreen, borderRadius: 24, padding: 4 },
  item: { flex: 1, height: 40, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  active: { backgroundColor: colors.primary },
}));
