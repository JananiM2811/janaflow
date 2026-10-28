import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { colors, themed } from '../theme';
import { MONTHS_SHORT } from '../utils/format';
import { addDays, periodRange, startOfDay } from '../utils/reports';
import AppText from './AppText';
import DatePickerModal from './DatePickerModal';

const PRESETS = [
  { key: 'Today', label: 'TODAY', period: 'Daily' },
  { key: 'Month', label: 'THIS MONTH', period: 'Monthly' },
  { key: 'Year', label: 'THIS YEAR', period: 'Year' },
];

export const ALL_TIME = { key: 'All', label: 'All time' };

const formatDay = (d) => `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;

// start is inclusive, end is exclusive; either may be missing for an open-ended range
export function makeRange(key, start, end) {
  if (!start && !end) return ALL_TIME;
  return { key, start, end, label: `${start ? formatDay(start) : 'Beginning'} – ${end ? formatDay(addDays(end, -1)) : 'Today'}` };
}

// key: 'Today' | 'Month' | 'Year'
export function presetRange(key) {
  const r = periodRange(PRESETS.find((p) => p.key === key).period);
  return makeRange(key, r.start, r.end);
}

export const applyRange = (list, range) =>
  list.filter((t) => {
    const d = new Date(t.date);
    return (!range.start || d >= range.start) && (!range.end || d < range.end);
  });

function DatePill({ date, placeholder, onPress, onClear }) {
  return (
    <Pressable onPress={onPress} style={styles.pill}>
      <MaterialCommunityIcons name="calendar-blank-outline" size={17} color={colors.fence} />
      <AppText weight="medium" size={13} color={date ? colors.fence : colors.muted} style={{ flex: 1, marginLeft: 8 }} numberOfLines={1}>
        {date ? formatDay(date) : placeholder}
      </AppText>
      {date && (
        <Pressable onPress={onClear} hitSlop={10} accessibilityLabel={`Clear ${placeholder}`}>
          <MaterialCommunityIcons name="close" size={16} color={colors.muted} />
        </Pressable>
      )}
    </Pressable>
  );
}

// TODAY | THIS MONTH | THIS YEAR | CUSTOM bar with editable From → To date pills
export default function DateRangeFilter({ value, onChange, style, showPresets = true }) {
  const [editing, setEditing] = useState(null); // 'from' | 'to' while the calendar is open
  const [rangeError, setRangeError] = useState(null);
  const toDay = value.end ? addDays(value.end, -1) : null;

  const selectPreset = (p) => {
    setRangeError(null);
    if (value.key === p.key) return onChange(ALL_TIME); // tap again to clear
    onChange(presetRange(p.key));
  };

  const selectCustom = () => {
    setRangeError(null);
    if (value.key === 'Custom') return onChange(ALL_TIME);
    const today = startOfDay(new Date());
    onChange(makeRange('Custom', value.start || addDays(today, -29), value.end || addDays(today, 1)));
  };

  // which: 'from' | 'to'; day: a start-of-day Date or null to clear that side
  const setBound = (which, day) => {
    const start = which === 'from' ? day : value.start;
    const end = which === 'to' ? day && addDays(day, 1) : value.end;
    if (start && end && start >= end) {
      setRangeError('"From" date must be on or before the "To" date');
      return false;
    }
    setRangeError(null);
    onChange(makeRange('Custom', start, end));
    return true;
  };

  const pick = (which) => setEditing(which);

  const isCustom = value.key === 'Custom';

  return (
    <View style={style}>
      {showPresets && (
      <View style={[styles.bar, { marginBottom: 10 }]}>
        {PRESETS.map((p) => {
          const active = value.key === p.key;
          return (
            <Pressable key={p.key} onPress={() => selectPreset(p)} style={[styles.seg, active && styles.segActive]}>
              <AppText weight="semibold" size={11} color={active ? colors.white : colors.fence} numberOfLines={1} style={styles.segText}>
                {p.label}
              </AppText>
            </Pressable>
          );
        })}
        <Pressable onPress={selectCustom} style={[styles.seg, { flex: 1.15 }, isCustom && styles.segActive]}>
          <MaterialCommunityIcons name="filter-outline" size={14} color={isCustom ? colors.white : colors.fence} />
          <AppText weight="semibold" size={11} color={isCustom ? colors.white : colors.fence} numberOfLines={1} style={styles.segText}>
            {' '}CUSTOM
          </AppText>
        </Pressable>
      </View>
      )}

      <View style={styles.dates}>
        <DatePill date={value.start} placeholder="Start date" onPress={() => pick('from')} onClear={() => setBound('from', null)} />
        <MaterialCommunityIcons name="arrow-right" size={16} color={colors.muted} style={{ marginHorizontal: 6 }} />
        <DatePill date={toDay} placeholder="End date" onPress={() => pick('to')} onClear={() => setBound('to', null)} />
      </View>
      {!!rangeError && (
        <AppText size={12} color={colors.danger} style={{ marginTop: 6, marginLeft: 4 }}>
          {rangeError}
        </AppText>
      )}

      <DatePickerModal
        visible={!!editing}
        value={editing === 'from' ? value.start : toDay}
        title={editing === 'from' ? 'From Date' : 'To Date'}
        onSelect={(d) => setBound(editing, startOfDay(d))}
        onClose={() => setEditing(null)}
      />
    </View>
  );
}

const styles = themed(() => ({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  seg: { flex: 1, flexDirection: 'row', height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
  segActive: { backgroundColor: colors.primary },
  segText: { letterSpacing: 0.4 },
  dates: { flexDirection: 'row', alignItems: 'center' },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
}));
