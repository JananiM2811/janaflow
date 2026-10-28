import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import AppText from '../../components/AppText';
import BalanceSummary, { statusMessage } from '../../components/BalanceSummary';
import Button from '../../components/Button';
import DateRangeFilter, { ALL_TIME, applyRange } from '../../components/DateRangeFilter';
import MonthSections from '../../components/MonthSections';
import NewCategoryModal, { confirmDeleteCategory } from '../../components/NewCategoryModal';
import ScreenLayout from '../../components/ScreenLayout';
import { LOCKED_NAME, useApp } from '../../context/AppContext';
import { colors, themed } from '../../theme';
import { formatMoney } from '../../utils/format';
import { inRange, periodRange, totals } from '../../utils/reports';

export default function CategoryDetailsScreen({ navigation, route }) {
  const { category } = route.params;
  const { myTransactions, categories, transactions, deleteCategory, showToast } = useApp();
  const [range, setRange] = useState(ALL_TIME);
  const [editing, setEditing] = useState(false);
  const cat = categories.find((c) => c.key === category);
  const list = myTransactions.filter((t) => t.category === category);
  const monthSpent = totals(inRange(list, periodRange('Monthly'))).expense;
  const lifetime = totals(list).expense;
  const pct = cat?.budget ? Math.round((monthSpent / cat.budget) * 100) : 0;
  const canDelete = category !== LOCKED_NAME && category !== 'Others';

  const onDelete = () =>
    confirmDeleteCategory({ category, transactions, deleteCategory, showToast, onDone: () => navigation.goBack() });

  return (
    <ScreenLayout
      title={category}
      left="back"
      scroll
      headerContent={
        <BalanceSummary
          leftLabel="Budget Left"
          leftValue={(cat?.budget || 0) - monthSpent}
          rightLabel="Spent This Month"
          rightValue={monthSpent}
          spent={monthSpent}
          limit={cat?.budget}
          message={`${statusMessage(pct)} Lifetime: ${formatMoney(lifetime)}`}
        />
      }
      footer={
        <Button
          title={category === 'Savings' ? 'Add Savings' : 'Add Expenses'}
          onPress={() => navigation.navigate('AddTransaction', { category, type: 'expense' })}
          style={{ alignSelf: 'center', width: 220 }}
        />
      }
    >
      {cat && (
        <View style={styles.actions}>
          <Pressable style={styles.action} onPress={() => setEditing(true)} accessibilityLabel="Edit category">
            <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.fence} />
            <AppText weight="medium" size={14}> Edit</AppText>
          </Pressable>
          {canDelete && (
            <Pressable style={styles.action} onPress={onDelete} accessibilityLabel="Delete category">
              <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.fence} />
              <AppText weight="medium" size={14}> Delete</AppText>
            </Pressable>
          )}
        </View>
      )}
      <DateRangeFilter value={range} onChange={setRange} style={{ marginBottom: 12 }} />
      <MonthSections
        key={range.label}
        list={applyRange(list, range)}
        initiallyOpen={2}
        onPressItem={(tx) => navigation.navigate('AddTransaction', { id: tx.id })}
        caption={(tx) => tx.note || tx.category}
      />

      <NewCategoryModal
        visible={editing}
        type="expense"
        editing={cat}
        onClose={() => setEditing(false)}
        onSaved={(newKey) => newKey !== category && navigation.setParams({ category: newKey })}
        onDeleted={() => navigation.goBack()}
      />
    </ScreenLayout>
  );
}

const styles = themed(() => ({
  actions: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  action: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
}));
