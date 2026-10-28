import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { colors, themed } from '../theme';
import { DAYS_SHORT, MONTHS } from '../utils/format';
import { startOfDay } from '../utils/reports';
import AppText from './AppText';
import Button from './Button';

const sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Calendar popup for picking a single date. Works the same on Android, iOS and web.
 * ‹ › change month, « » change year; days after maxDate are disabled.
 */
export default function DatePickerModal({ visible, value, onSelect, onClose, maxDate = new Date(), title = 'Select Date' }) {
  const max = startOfDay(maxDate);
  const initial = value && !isNaN(value) ? value : max;
  const [month, setMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const [picked, setPicked] = useState(value || null);

  useEffect(() => {
    if (!visible) return;
    const start = value && !isNaN(value) ? value : max;
    setMonth(new Date(start.getFullYear(), start.getMonth(), 1));
    setPicked(value && !isNaN(value) ? startOfDay(value) : null);
  }, [visible]);

  const y = month.getFullYear();
  const m = month.getMonth();
  const shift = (months) => {
    const next = new Date(y, m + months, 1);
    setMonth(next > max ? new Date(max.getFullYear(), max.getMonth(), 1) : next);
  };
  const atMax = y === max.getFullYear() && m === max.getMonth();

  const cells = [...Array(month.getDay()).fill(null), ...Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const today = startOfDay(new Date());

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <AppText weight="semibold" size={18} style={{ textAlign: 'center', marginBottom: 12 }}>
            {title}
          </AppText>

          <View style={styles.nav}>
            <NavBtn icon="chevron-double-left" label="Previous year" onPress={() => shift(-12)} />
            <NavBtn icon="chevron-left" label="Previous month" onPress={() => shift(-1)} />
            <AppText weight="semibold" size={15} style={{ flex: 1, textAlign: 'center' }}>
              {MONTHS[m]} {y}
            </AppText>
            <NavBtn icon="chevron-right" label="Next month" onPress={() => shift(1)} disabled={atMax} />
            <NavBtn icon="chevron-double-right" label="Next year" onPress={() => shift(12)} disabled={atMax} />
          </View>

          <View style={styles.row}>
            {DAYS_SHORT.map((d) => (
              <AppText key={d} weight="medium" size={11} color={colors.muted} style={styles.weekDay}>
                {d.slice(0, 2).toUpperCase()}
              </AppText>
            ))}
          </View>
          <View style={styles.grid}>
            {cells.map((n, i) => {
              if (!n) return <View key={`e${i}`} style={styles.cell} />;
              const date = new Date(y, m, n);
              const disabled = date > max;
              const active = sameDay(date, picked);
              const isToday = sameDay(date, today);
              return (
                <Pressable key={n} style={styles.cell} disabled={disabled} onPress={() => setPicked(date)}>
                  <View style={[styles.day, isToday && styles.today, active && styles.dayActive]}>
                    <AppText weight={active ? 'semibold' : 'regular'} size={14} color={active ? colors.white : disabled ? colors.lightBlue : colors.fence}>
                      {n}
                    </AppText>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => {
                setPicked(max);
                setMonth(new Date(max.getFullYear(), max.getMonth(), 1));
              }}
            >
              <AppText weight="medium" size={13} style={{ textDecorationLine: 'underline' }}>
                {sameDay(max, today) ? 'Today' : 'Latest'}
              </AppText>
            </Pressable>
            <AppText size={13} color={colors.muted}>
              {picked ? `${picked.getDate()} ${MONTHS[picked.getMonth()].slice(0, 3)} ${picked.getFullYear()}` : 'No date selected'}
            </AppText>
          </View>

          <Button title="Select" onPress={() => picked && (onSelect(picked), onClose())} disabled={!picked} style={{ marginTop: 14 }} />
          <Button title="Cancel" variant="secondary" onPress={onClose} style={{ marginTop: 10 }} />
        </View>
      </View>
    </Modal>
  );
}

function NavBtn({ icon, label, onPress, disabled }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} hitSlop={6} accessibilityLabel={label} style={[styles.navBtn, disabled && { opacity: 0.3 }]}>
      <MaterialCommunityIcons name={icon} size={20} color={colors.fence} />
    </Pressable>
  );
}

const styles = themed(() => ({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 20 },
  dialog: { backgroundColor: colors.surface, borderRadius: 28, padding: 20 },
  nav: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  navBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.lightGreen, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', marginBottom: 4 },
  weekDay: { width: `${100 / 7}%`, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, padding: 3 },
  day: { flex: 1, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1, borderColor: colors.fence },
  dayActive: { backgroundColor: colors.primary },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingHorizontal: 4 },
}));
