import { View } from 'react-native';
import { colors, themed } from '../theme';
import { formatShort } from '../utils/format';
import AppText from './AppText';

const HEIGHT = 150;

// Paired income (green) / expense (blue) bars, as in the Figma Analysis screen
export default function BarChart({ data }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
  const ticks = [1, 0.66, 0.33, 0].map((f) => max * f);

  return (
    <View style={styles.wrap}>
      <View style={styles.axis}>
        {ticks.map((t, i) => (
          <AppText key={i} size={10} color={colors.lightBlue}>
            {formatShort(t)}
          </AppText>
        ))}
      </View>
      <View style={styles.plot}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.grid, { top: (HEIGHT / 3) * i }]} />
        ))}
        {data.map((d) => (
          <View key={d.label} style={styles.group}>
            <View style={styles.bars}>
              <View style={[styles.bar, { height: Math.max(3, (d.income / max) * HEIGHT), backgroundColor: colors.income }]} />
              <View style={[styles.bar, { height: Math.max(3, (d.expense / max) * HEIGHT), backgroundColor: colors.expense }]} />
            </View>
            <AppText size={11} style={{ marginTop: 6 }}>
              {d.label}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = themed(() => ({
  wrap: { flexDirection: 'row' },
  axis: { height: HEIGHT, justifyContent: 'space-between', marginRight: 8, marginTop: -6 },
  plot: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  grid: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1, borderColor: colors.lightBlue, borderStyle: 'dashed', opacity: 0.5 },
  group: { alignItems: 'center' },
  bars: { height: HEIGHT, flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { width: 7, borderRadius: 4 },
}));
