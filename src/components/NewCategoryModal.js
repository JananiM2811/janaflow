import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { LOCKED_NAME, useApp } from '../context/AppContext';
import { colors, themed } from '../theme';
import { confirmAction } from '../utils/alerts';
import { validate } from '../utils/validation';
import AppText from './AppText';
import Button from './Button';
import FormField from './FormField';

const ICONS = {
  expense: ['tag-outline', 'cart-outline', 'school-outline', 'dumbbell', 'paw', 'airplane', 'cellphone', 'lightning-bolt-outline', 'tshirt-crew-outline', 'car-wrench'],
  income: ['tag-outline', 'briefcase-outline', 'chart-line', 'home-city-outline', 'gift-outline', 'trophy-outline', 'bank-outline', 'storefront-outline', 'cash-refund', 'hand-coin-outline'],
};

// Asks for confirmation, then deletes; its transactions move to "Others" / "Other Income"
export function confirmDeleteCategory({ category, type = 'expense', transactions, deleteCategory, showToast, onDone }) {
  const count = transactions.filter((t) => t.category === category).length;
  const fallback = type === 'income' ? 'Other Income' : 'Others';
  confirmAction(
    'Delete Category',
    count ? `Delete "${category}"? Its ${count} transaction${count === 1 ? '' : 's'} will move to "${fallback}".` : `Delete "${category}"?`,
    () => {
      const res = deleteCategory(category, type);
      if (!res.ok) {
        showToast({ tone: 'warning', icon: 'lock-outline', title: 'Cannot delete', message: res.error });
        return;
      }
      showToast({
        tone: 'info',
        icon: 'trash-can-outline',
        title: 'Category deleted',
        message: res.moved ? `${res.moved} transactions moved to "${res.fallback}".` : `"${category}" was removed.`,
      });
      onDone?.(res.fallback);
    },
    'Delete',
  );
}

/**
 * Add a new category, or edit / delete an existing one when `editing` is passed
 * ({ key, icon, budget }). onCreated / onSaved receive the (new) category name.
 */
export default function NewCategoryModal({ visible, type = 'expense', editing, onClose, onCreated, onSaved, onDeleted }) {
  const { addCategory, updateCategory, deleteCategory, transactions, showToast } = useApp();
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [icon, setIcon] = useState(ICONS[type][0]);
  const [errors, setErrors] = useState({});
  const nameLocked = editing?.key === LOCKED_NAME;
  const icons = editing && !ICONS[type].includes(editing.icon) ? [editing.icon, ...ICONS[type]] : ICONS[type];

  useEffect(() => {
    if (!visible) return;
    setName(editing?.key || '');
    setBudget(editing?.budget ? String(editing.budget) : '');
    setIcon(editing?.icon || ICONS[type][0]);
    setErrors({});
  }, [visible, type, editing?.key]);

  const onSave = () => {
    const errs = {
      name: !name.trim() ? 'Category name is required' : !/^[A-Za-z][A-Za-z ]{2,14}$/.test(name.trim()) ? 'Use 3–15 letters only' : null,
      budget: type === 'expense' ? validate.amount(budget) : null,
    };
    if (!errs.name && !errs.budget) {
      const payload = { key: name, budget: Number(budget || 0), icon, type };
      const res = editing ? updateCategory(editing.key, payload) : addCategory(payload);
      if (!res.ok) errs.name = res.error;
      else {
        if (editing) {
          showToast({ tone: 'success', icon, title: 'Category updated', message: `"${res.key}" has been saved.` });
          onSaved?.(res.key);
        } else {
          showToast({ tone: 'success', icon, title: 'Category added', message: `"${res.key}" is ready for your ${type === 'income' ? 'income' : 'expenses'}.` });
          onCreated?.(res.key);
        }
        onClose();
        return;
      }
    }
    setErrors(errs);
  };

  const onDelete = () =>
    confirmDeleteCategory({
      category: editing.key,
      type,
      transactions,
      deleteCategory,
      showToast,
      onDone: (fallback) => {
        onClose();
        onDeleted?.(fallback);
      },
    });

  const title = `${editing ? 'Edit' : 'New'} ${type === 'income' ? 'Income' : 'Expense'} Category`;
  const protectedCategory = editing && (nameLocked || editing.key === 'Others' || editing.key === 'Other Income');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.dialog}>
            <AppText weight="semibold" size={20} style={{ textAlign: 'center' }}>
              {title}
            </AppText>
            <AppText size={12} color={colors.muted} style={{ textAlign: 'center', marginBottom: 16 }}>
              {editing
                ? 'Renaming also updates the existing transactions.'
                : type === 'income'
                  ? 'e.g. Bonus, Rental, Interest'
                  : 'e.g. Education, Fitness, Pets'}
            </AppText>

            <FormField
              label="Category Name"
              placeholder="Write..."
              value={name}
              onChangeText={setName}
              error={errors.name || (nameLocked ? 'Used by Savings Goals — name cannot change' : null)}
              editable={!nameLocked}
              maxLength={15}
            />
            {type === 'expense' && (
              <FormField
                label="Monthly Budget (₹)"
                placeholder="e.g. 3000"
                value={budget}
                onChangeText={(v) => setBudget(v.replace(/[^0-9.]/g, ''))}
                error={errors.budget}
                keyboardType="decimal-pad"
              />
            )}

            <AppText weight="medium" size={15} style={{ marginLeft: 6, marginBottom: 8 }}>
              Icon
            </AppText>
            <View style={styles.icons}>
              {icons.map((n) => {
                const active = icon === n;
                return (
                  <Pressable key={n} onPress={() => setIcon(n)} style={[styles.icon, active && styles.iconActive]} accessibilityLabel={`Icon ${n}`}>
                    <MaterialCommunityIcons name={n} size={22} color={active ? colors.white : colors.fence} />
                  </Pressable>
                );
              })}
            </View>

            <Button title={editing ? 'Save Changes' : 'Save'} onPress={onSave} style={{ marginTop: 16 }} />
            {editing && !protectedCategory && (
              <Pressable onPress={onDelete} style={styles.delete} accessibilityLabel="Delete category">
                <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.fence} />
                <AppText weight="semibold" size={15}>
                  {' '}Delete Category
                </AppText>
              </Pressable>
            )}
            <Button title="Cancel" variant="secondary" onPress={onClose} style={{ marginTop: 10 }} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = themed(() => ({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  dialog: { backgroundColor: colors.surface, borderRadius: 32, padding: 24 },
  icons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.lightGreen, alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: colors.primary },
  delete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 10,
  },
}));
