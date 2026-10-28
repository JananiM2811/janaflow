import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, themed } from '../theme';
import { formatMoney, formatTxDate } from '../utils/format';
import AppText from './AppText';

export function useCategoryIcon() {
  const { categories, incomeCategories } = useApp();
  return (key) => [...categories, ...incomeCategories].find((c) => c.key === key)?.icon || 'tag-outline';
}

export default function TransactionRow({ tx, onPress, caption }) {
  const iconFor = useCategoryIcon();
  const isIncome = tx.type === 'income';
  // icon tiles carry a white glyph, so they use mid/dark greys that work in both themes
  const swatches = [colors.vividBlue, colors.cyprus, colors.header];
  const swatch = isIncome ? colors.primary : swatches[tx.category.length % swatches.length];

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <View style={[styles.icon, { backgroundColor: swatch }]}>
        <MaterialCommunityIcons name={iconFor(tx.category)} size={26} color={colors.white} />
      </View>
      <View style={styles.main}>
        <AppText weight="medium" size={15} numberOfLines={1}>
          {tx.title}
        </AppText>
        <AppText weight="medium" size={11} color={colors.muted} numberOfLines={1}>
          {formatTxDate(tx.date)}
        </AppText>
      </View>
      <View style={styles.sep} />
      <AppText size={12} style={styles.cat} numberOfLines={1}>
        {caption || tx.category}
      </AppText>
      <View style={styles.sep} />
      <AppText weight="semibold" size={14} color={isIncome ? colors.income : colors.expense} style={styles.amount} numberOfLines={1}>
        {isIncome ? '+' : '-'}
        {formatMoney(tx.amount)}
      </AppText>
    </Pressable>
  );
}

const styles = themed(() => ({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  icon: { width: 54, height: 54, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  main: { flex: 1, marginLeft: 12 },
  sep: { width: 1, height: 34, backgroundColor: colors.border, marginHorizontal: 8 },
  cat: { width: 60, textAlign: 'center' },
  amount: { width: 84, textAlign: 'right' },
}));
