import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import AppText from '../../components/AppText';
import BalanceSummary from '../../components/BalanceSummary';
import NewCategoryModal from '../../components/NewCategoryModal';
import ScreenLayout from '../../components/ScreenLayout';
import { useApp } from '../../context/AppContext';
import { colors, themed } from '../../theme';
import { inRange, periodRange, totals } from '../../utils/reports';

export default function CategoriesScreen({ navigation }) {
  const { currentUser, myTransactions, categories } = useApp();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null); // category being edited (long-press)

  const all = totals(myTransactions);
  const monthList = inRange(myTransactions, periodRange('Monthly'));
  const month = totals(monthList);

  return (
    <ScreenLayout
      title="Categories"
      inTabs
      headerContent={<BalanceSummary leftValue={all.balance} rightValue={month.expense} rightLabel="Month Expense" spent={month.expense} limit={currentUser.monthlyBudget} />}
    >
      <View style={styles.hint}>
        <MaterialCommunityIcons name="gesture-tap-hold" size={16} color={colors.muted} />
        <AppText size={12} color={colors.muted}>
          {' '}Tap to open · long-press to edit or delete
        </AppText>
      </View>
      <View style={styles.grid}>
        {categories.map((c, i) => {
          const spent = totals(monthList.filter((t) => t.category === c.key)).expense;
          const over = !!c.budget && spent > c.budget;
          return (
            <Pressable
              key={c.key}
              style={styles.cell}
              onPress={() => navigation.navigate('CategoryDetails', { category: c.key })}
              onLongPress={() => setEditing(c)}
              delayLongPress={350}
              accessibilityHint="Long-press to edit or delete"
            >
              <View style={[styles.tile, { backgroundColor: i % 3 === 0 ? colors.primary : colors.vividBlue }]}>
                <MaterialCommunityIcons name={c.icon} size={40} color={colors.white} />
                {over && (
                  <View style={styles.alertDot}>
                    <MaterialCommunityIcons name="exclamation" size={12} color={colors.header} />
                  </View>
                )}
              </View>
              <AppText size={14} numberOfLines={1}>
                {c.key}
              </AppText>
            </Pressable>
          );
        })}
        <Pressable style={styles.cell} onPress={() => setModal(true)}>
          <View style={[styles.tile, { backgroundColor: colors.vividBlue }]}>
            <MaterialCommunityIcons name="plus" size={40} color={colors.white} />
          </View>
          <AppText size={14}>More</AppText>
        </Pressable>
      </View>

      <NewCategoryModal visible={modal} type="expense" onClose={() => setModal(false)} />
      <NewCategoryModal visible={!!editing} type="expense" editing={editing} onClose={() => setEditing(null)} />
    </ScreenLayout>
  );
}

const styles = themed(() => ({
  hint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: -12, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  cell: { width: '33.333%', paddingHorizontal: 6, alignItems: 'center', marginBottom: 18 },
  tile: { width: '100%', aspectRatio: 1.07, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  alertDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
