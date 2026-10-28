import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
import ProgressRing from '../../components/ProgressRing';
import ScreenLayout from '../../components/ScreenLayout';
import { useApp } from '../../context/AppContext';
import { colors, themed } from '../../theme';
import { confirmAction } from '../../utils/alerts';
import { formatMoney } from '../../utils/format';
import { validate } from '../../utils/validation';

const GOAL_ICONS = ['airplane', 'car-sports', 'ring', 'home-heart', 'school-outline', 'laptop', 'bike', 'piggy-bank-outline'];
const DAY = 86400000;

// Saved = Savings expenses whose title matches the goal name
function goalProgress(goal, list) {
  const items = list.filter((t) => t.category === 'Savings' && t.title.toLowerCase() === goal.name.toLowerCase());
  const saved = items.reduce((s, t) => s + t.amount, 0);
  const recent = items.filter((t) => Date.now() - new Date(t.date).getTime() < 180 * DAY);
  const perMonth = recent.reduce((s, t) => s + t.amount, 0) / 6;
  const left = Math.max(0, goal.target - saved);
  return { saved, left, pct: Math.min(100, Math.round((saved / goal.target) * 100)), months: perMonth > 0 ? Math.ceil(left / perMonth) : null };
}

export default function GoalsScreen({ navigation }) {
  const { myGoals, myTransactions, addGoal, deleteGoal, showToast } = useApp();
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', target: '', icon: GOAL_ICONS[0] });
  const [errors, setErrors] = useState({});

  const progress = myGoals.map((g) => ({ goal: g, ...goalProgress(g, myTransactions) }));
  const totalSaved = progress.reduce((s, p) => s + p.saved, 0);
  const totalTarget = myGoals.reduce((s, g) => s + g.target, 0);
  const overall = totalTarget ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const openModal = () => {
    setForm({ name: '', target: '', icon: GOAL_ICONS[0] });
    setErrors({});
    setModal(true);
  };

  const onSave = () => {
    const errs = {
      name: !form.name.trim() ? 'Goal name is required' : !/^[A-Za-z][A-Za-z ]{2,19}$/.test(form.name.trim()) ? 'Use 3–20 letters only' : null,
      target: validate.amount(form.target),
    };
    if (!errs.name && !errs.target) {
      const res = addGoal({ name: form.name, target: Number(form.target), icon: form.icon });
      if (!res.ok) errs.name = res.error;
      else {
        showToast({ tone: 'success', icon: form.icon, title: 'Goal created', message: `Start saving for "${form.name.trim()}" — add money any time.` });
        setModal(false);
        return;
      }
    }
    setErrors(errs);
  };

  return (
    <ScreenLayout
      title="Savings Goals"
      headerContent={
        <View>
          <AppText size={12} color={colors.onHeader}>
            Total Saved Towards Goals
          </AppText>
          <AppText weight="bold" size={26} color={colors.white}>
            {formatMoney(totalSaved)}
          </AppText>
          <View style={styles.bar}>
            <View style={[styles.fill, { width: `${Math.max(overall, 3)}%` }]} />
          </View>
          <AppText size={12} color={colors.onHeader} style={{ marginTop: 6 }}>
            {overall}% of {formatMoney(totalTarget)} across {myGoals.length} goals
          </AppText>
        </View>
      }
    >
      <View style={styles.grid}>
        {progress.map(({ goal, saved, left, pct, months }) => (
          <View key={goal.id} style={styles.cell}>
            <View style={styles.card}>
              <Pressable
                style={styles.trash}
                hitSlop={8}
                accessibilityLabel={`Delete ${goal.name}`}
                onPress={() => confirmAction('Delete Goal', `Remove "${goal.name}"? Your saved transactions stay.`, () => deleteGoal(goal.id), 'Delete')}
              >
                <MaterialCommunityIcons name="close" size={16} color={colors.muted} />
              </Pressable>
              <ProgressRing size={84} stroke={7} progress={pct / 100} color={colors.fence} track={colors.border}>
                <MaterialCommunityIcons name={goal.icon} size={28} color={colors.fence} />
              </ProgressRing>
              <AppText weight="semibold" size={15} style={{ marginTop: 8 }} numberOfLines={1}>
                {goal.name}
              </AppText>
              <AppText weight="bold" size={13}>
                {pct}%
              </AppText>
              <AppText size={11} color={colors.muted} style={{ textAlign: 'center' }}>
                {formatMoney(saved)} / {formatMoney(goal.target)}
              </AppText>
              <AppText size={11} color={colors.muted} style={{ textAlign: 'center', marginTop: 2 }}>
                {left === 0 ? 'Goal reached! 🎉' : months ? `${formatMoney(left)} to go · ~${months} mo` : `${formatMoney(left)} to go`}
              </AppText>
              <Pressable
                style={styles.addBtn}
                onPress={() => navigation.navigate('AddTransaction', { type: 'expense', category: 'Savings', title: goal.name })}
              >
                <MaterialCommunityIcons name="plus" size={16} color={colors.white} />
                <AppText weight="medium" size={12} color={colors.white}>
                  {' '}Add Money
                </AppText>
              </Pressable>
            </View>
          </View>
        ))}
        <View style={styles.cell}>
          <Pressable style={[styles.card, styles.newCard]} onPress={openModal}>
            <MaterialCommunityIcons name="plus-circle-outline" size={40} color={colors.muted} />
            <AppText weight="medium" size={14} color={colors.muted} style={{ marginTop: 8 }}>
              New Goal
            </AppText>
          </Pressable>
        </View>
      </View>

      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <AppText weight="semibold" size={20} style={{ textAlign: 'center', marginBottom: 16 }}>
              New Savings Goal
            </AppText>
            <FormField label="Goal Name" placeholder="e.g. New Laptop" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} error={errors.name} maxLength={20} />
            <FormField
              label="Target Amount (₹)"
              placeholder="e.g. 80000"
              value={form.target}
              onChangeText={(v) => setForm((f) => ({ ...f, target: v.replace(/[^0-9.]/g, '') }))}
              error={errors.target}
              keyboardType="decimal-pad"
            />
            <AppText weight="medium" size={15} style={{ marginLeft: 6, marginBottom: 8 }}>
              Icon
            </AppText>
            <View style={styles.icons}>
              {GOAL_ICONS.map((name) => {
                const active = form.icon === name;
                return (
                  <Pressable key={name} onPress={() => setForm((f) => ({ ...f, icon: name }))} style={[styles.iconOpt, active && styles.iconActive]}>
                    <MaterialCommunityIcons name={name} size={22} color={active ? colors.white : colors.fence} />
                  </Pressable>
                );
              })}
            </View>
            <Button title="Create Goal" onPress={onSave} style={{ marginTop: 16 }} />
            <Button title="Cancel" variant="secondary" onPress={() => setModal(false)} style={{ marginTop: 10 }} />
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const styles = themed(() => ({
  bar: { height: 10, borderRadius: 5, backgroundColor: colors.cyprus, marginTop: 10, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5, backgroundColor: colors.white },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  cell: { width: '50%', padding: 6 },
  card: { backgroundColor: colors.lightGreen, borderRadius: 24, padding: 14, alignItems: 'center', minHeight: 250 },
  newCard: { justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.border },
  trash: { position: 'absolute', top: 10, right: 10, zIndex: 1 },
  addBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: colors.primary, borderRadius: 14, paddingHorizontal: 12, height: 30 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  dialog: { backgroundColor: colors.surface, borderRadius: 32, padding: 24 },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  iconOpt: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lightGreen, alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: colors.primary },
}));
