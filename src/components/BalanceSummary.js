import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { colors, themed } from '../theme';
import { formatMoney } from '../utils/format';
import AppText from './AppText';

// light grey so expense totals stay readable on the charcoal header
const EXPENSE_ON_DARK = '#D4D4D8';

export function statusMessage(pct) {
  if (pct < 50) return `${pct}% Of Your Budget, Looks Good.`;
  if (pct < 80) return `${pct}% Of Your Budget, Keep An Eye.`;
  if (pct < 100) return `${pct}% Of Your Budget, Slow Down!`;
  return `${pct}% — Budget Exceeded!`;
}

// "Total Balance | Total Expense" block with the dark budget progress bar
export default function BalanceSummary({
  leftLabel = 'Total Balance',
  leftValue,
  rightLabel = 'Total Expense',
  rightValue,
  spent,
  limit,
  message,
}) {
  const pct = limit ? Math.round((spent / limit) * 100) : 0;
  const fill = Math.min(Math.max(pct, 4), 100);
  const fillColor = colors.white;

  return (
    <View>
      <View style={styles.row}>
        <View style={styles.col}>
          <View style={styles.labelRow}>
            <MaterialCommunityIcons name="arrow-top-right-bold-box-outline" size={14} color={colors.onHeader} />
            <AppText size={12} color={colors.onHeader}> {leftLabel}</AppText>
          </View>
          <AppText weight="bold" size={22} color={colors.white} numberOfLines={1} adjustsFontSizeToFit>
            {formatMoney(leftValue, { sign: true })}
          </AppText>
        </View>
        <View style={styles.divider} />
        <View style={[styles.col, { paddingLeft: 16 }]}>
          <View style={styles.labelRow}>
            <MaterialCommunityIcons name="arrow-bottom-left-bold-box-outline" size={14} color={colors.onHeader} />
            <AppText size={12} color={colors.onHeader}> {rightLabel}</AppText>
          </View>
          <AppText weight="bold" size={22} color={EXPENSE_ON_DARK} numberOfLines={1} adjustsFontSizeToFit>
            -{formatMoney(rightValue)}
          </AppText>
        </View>
      </View>

      {!!limit && (
        <>
          <View style={styles.bar}>
            <View style={[styles.fill, { width: `${fill}%`, backgroundColor: fillColor }]}>
              <AppText weight="semibold" size={12} color={colors.header}>
                {pct}%
              </AppText>
            </View>
            <AppText weight="medium" size={13} color={colors.white} style={styles.limit}>
              {formatMoney(limit)}
            </AppText>
          </View>
          <View style={[styles.labelRow, { marginTop: 10 }]}>
            <MaterialCommunityIcons name={pct >= 80 ? 'alert-circle-outline' : 'checkbox-marked-outline'} size={16} color={fillColor} />
            <AppText size={13} color={colors.white}> {message || statusMessage(pct)}</AppText>
          </View>
        </>
      )}
    </View>
  );
}

const styles = themed(() => ({
  row: { flexDirection: 'row', alignItems: 'center' },
  col: { flex: 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  divider: { width: 1, height: 44, backgroundColor: colors.vividBlue },
  bar: {
    marginTop: 14,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.cyprus,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.fence,
    borderRadius: 14,
    justifyContent: 'center',
    paddingLeft: 14,
    minWidth: 52,
  },
  // sits on its own pill so it stays readable even when the fill runs underneath it
  limit: {
    position: 'absolute',
    right: 4,
    fontStyle: 'italic',
    backgroundColor: colors.header,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 1,
    overflow: 'hidden',
  },
}));
