import { Pressable, View } from 'react-native';
import { colors, themed } from '../theme';
import AppText from './AppText';

export default function SegmentedTabs({ options, value, onChange, style, size = 14 }) {
  return (
    <View style={[styles.wrap, style]}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable key={opt} onPress={() => onChange(opt)} style={[styles.tab, active && styles.active]}>
            <AppText size={size} weight={active ? 'medium' : 'regular'} color={active ? colors.white : colors.fence} numberOfLines={1}>
              {opt}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = themed(() => ({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.lightGreen,
    borderRadius: 22,
    padding: 5,
  },
  tab: { flex: 1, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  active: { backgroundColor: colors.primary },
}));
