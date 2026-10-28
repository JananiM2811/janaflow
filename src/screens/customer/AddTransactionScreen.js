import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import DatePickerModal from '../../components/DatePickerModal';
import FormField from '../../components/FormField';
import NewCategoryModal from '../../components/NewCategoryModal';
import ScreenLayout from '../../components/ScreenLayout';
import SegmentedTabs from '../../components/SegmentedTabs';
import { useApp } from '../../context/AppContext';
import { colors, themed } from '../../theme';
import { confirmAction } from '../../utils/alerts';
import { parseDDMMYYYY, toDDMMYYYY } from '../../utils/format';
import { addDays } from '../../utils/reports';
import { hasErrors, validate } from '../../utils/validation';

// Add Expenses / Add Income, and edit or delete an existing transaction
export default function AddTransactionScreen({ navigation, route }) {
  const { myTransactions, categories, incomeCategories, addTransaction, updateTransaction, deleteTransaction } = useApp();
  const editing = route.params?.id ? myTransactions.find((t) => t.id === route.params.id) : null;

  const [type, setType] = useState(editing?.type || route.params?.type || 'expense');
  const [form, setForm] = useState(() => ({
    date: toDDMMYYYY(new Date(editing?.date || route.params?.date || Date.now())),
    category: editing?.category || route.params?.category || '',
    amount: editing ? String(editing.amount) : '',
    title: editing?.title || route.params?.title || '',
    note: editing?.note || '',
  }));
  const [errors, setErrors] = useState({});
  const [newCategory, setNewCategory] = useState(false);
  const [pickingDate, setPickingDate] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // long-pressed chip
  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  // keep the selected chip valid after its category is renamed or deleted
  const followCategory = (oldKey) => (nextKey) => setForm((f) => (f.category === oldKey ? { ...f, category: nextKey } : f));
  const options = type === 'expense' ? categories : incomeCategories;

  const switchType = (label) => {
    const next = label === 'Expense' ? 'expense' : 'income';
    setType(next);
    if (!(next === 'expense' ? categories : incomeCategories).some((c) => c.key === form.category)) set('category')('');
  };

  const onSave = () => {
    const errs = {
      date: validate.txDate(form.date),
      category: form.category ? null : 'Select a category',
      amount: validate.amount(form.amount),
      title: !form.title.trim() ? 'Title is required' : form.title.trim().length < 3 ? 'Title must be at least 3 characters' : null,
      note: form.note.length > 120 ? 'Message must be under 120 characters' : null,
    };
    setErrors(errs);
    if (hasErrors(errs)) return;

    // keep the original time of day when editing, otherwise use "now"
    const date = parseDDMMYYYY(form.date);
    const time = editing ? new Date(editing.date) : new Date();
    date.setHours(time.getHours(), time.getMinutes());

    const payload = {
      type,
      date: date.toISOString(),
      category: form.category,
      amount: Number(form.amount),
      title: form.title.trim(),
      note: form.note.trim(),
    };
    if (editing) updateTransaction(editing.id, payload);
    else addTransaction(payload);
    navigation.goBack();
  };

  const onDelete = () =>
    confirmAction('Delete Transaction', `Are you sure you want to delete "${editing.title}"?`, () => {
      deleteTransaction(editing.id);
      navigation.goBack();
    }, 'Delete');

  const heading = editing ? 'Edit Transaction' : type === 'expense' ? 'Add Expenses' : 'Add Income';

  return (
    <ScreenLayout title={heading} left="back" headerContent={<View style={{ height: 20 }} />}>
      <SegmentedTabs options={['Expense', 'Income']} value={type === 'expense' ? 'Expense' : 'Income'} onChange={switchType} style={{ marginBottom: 18 }} />

      <FormField
        label="Date"
        placeholder="DD/MM/YYYY"
        value={form.date}
        onChangeText={set('date')}
        error={errors.date}
        icon="calendar-month-outline"
        onIconPress={() => setPickingDate(true)}
        iconLabel="Pick date from calendar"
        maxLength={10}
      />
      <DatePickerModal
        visible={pickingDate}
        value={parseDDMMYYYY(form.date)}
        onSelect={(d) => {
          set('date')(toDDMMYYYY(d));
          setErrors((e) => ({ ...e, date: null }));
        }}
        onClose={() => setPickingDate(false)}
        title={type === 'expense' ? 'Expense Date' : 'Income Date'}
      />
      <View style={styles.quick}>
        {[['Today', 0], ['Yesterday', -1]].map(([label, offset]) => (
          <Pressable key={label} style={styles.quickChip} onPress={() => set('date')(toDDMMYYYY(addDays(new Date(), offset)))}>
            <AppText size={12}>{label}</AppText>
          </Pressable>
        ))}
        <Pressable style={[styles.quickChip, styles.calendarChip]} onPress={() => setPickingDate(true)} accessibilityLabel="Open calendar">
          <MaterialCommunityIcons name="calendar-month-outline" size={14} color={colors.white} />
          <AppText size={12} color={colors.white}> Calendar</AppText>
        </Pressable>
      </View>

      <AppText weight="medium" size={15} style={{ marginLeft: 6, marginBottom: 6 }}>
        Category
      </AppText>
      <View style={styles.chips}>
        {options.map((c) => {
          const active = form.category === c.key;
          return (
            <Pressable
              key={c.key}
              onPress={() => set('category')(c.key)}
              onLongPress={() => setEditingCategory(c)}
              delayLongPress={350}
              style={[styles.chip, active && styles.chipActive]}
            >
              <MaterialCommunityIcons name={c.icon} size={16} color={active ? colors.white : colors.fence} />
              <AppText size={13} color={active ? colors.white : colors.fence}>
                {' '}
                {c.key}
              </AppText>
            </Pressable>
          );
        })}
        <Pressable onPress={() => setNewCategory(true)} style={[styles.chip, styles.newChip]} accessibilityLabel="New category">
          <MaterialCommunityIcons name="plus" size={16} color={colors.fence} />
          <AppText size={13}> New</AppText>
        </Pressable>
      </View>
      <NewCategoryModal visible={newCategory} type={type} onClose={() => setNewCategory(false)} onCreated={set('category')} />
      <NewCategoryModal
        visible={!!editingCategory}
        type={type}
        editing={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSaved={editingCategory ? followCategory(editingCategory.key) : undefined}
        onDeleted={editingCategory ? followCategory(editingCategory.key) : undefined}
      />
      <AppText size={11} color={colors.muted} style={{ marginLeft: 6, marginTop: 6 }}>
        Long-press a category to edit or delete it
      </AppText>
      {!!errors.category && (
        <AppText size={12} color={colors.danger} style={{ marginLeft: 8, marginTop: 4 }}>
          {errors.category}
        </AppText>
      )}

      <FormField
        label="Amount (₹)"
        placeholder="₹0.00"
        value={form.amount}
        onChangeText={(v) => set('amount')(v.replace(/[^0-9.]/g, ''))}
        error={errors.amount}
        keyboardType="decimal-pad"
        style={{ marginTop: 14 }}
      />
      <FormField label={type === 'expense' ? 'Expense Title' : 'Income Title'} placeholder={type === 'expense' ? 'Dinner' : 'Monthly Salary'} value={form.title} onChangeText={set('title')} error={errors.title} maxLength={40} />
      <FormField label="Enter Message" placeholder="Optional note..." value={form.note} onChangeText={set('note')} error={errors.note} multiline />
      <AppText size={11} color={colors.muted} style={{ textAlign: 'right', marginTop: -10, marginBottom: 10 }}>
        {form.note.length}/120
      </AppText>

      <Button title={editing ? 'Update' : 'Save'} onPress={onSave} style={styles.btn} />
      {editing && <Button title="Delete" variant="danger" onPress={onDelete} style={[styles.btn, { marginTop: 12 }]} />}
    </ScreenLayout>
  );
}

const styles = themed(() => ({
  quick: { flexDirection: 'row', gap: 8, marginTop: -6, marginBottom: 14, marginLeft: 6 },
  quickChip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, backgroundColor: colors.lightGreen },
  calendarChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 36, borderRadius: 18, backgroundColor: colors.lightGreen },
  chipActive: { backgroundColor: colors.primary },
  newChip: { backgroundColor: colors.surface, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.lightBlue },
  btn: { width: 200, alignSelf: 'center' },
}));
