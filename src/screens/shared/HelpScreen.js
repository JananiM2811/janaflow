import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import AppText from '../../components/AppText';
import ScreenLayout from '../../components/ScreenLayout';
import SegmentedTabs from '../../components/SegmentedTabs';
import { colors, themed } from '../../theme';

const FAQ = {
  General: [
    ['How do I add an expense?', 'Open Categories, pick a category and tap "Add Expenses", or use the + button on the Transaction screen.'],
    ['How do I edit or delete a transaction?', 'Tap any transaction in a list to open it, change the details and press Update, or press Delete.'],
    ['What do the alerts mean?', 'You get a personalised alert for every change. Orange means you have used 80% of a budget, red means you crossed it.'],
  ],
  Account: [
    ['How do I change my password?', 'Profile → Security. You need your current password.'],
    ['Where is my data stored?', 'This demo keeps all data in memory on your device — no server or database is used, so it resets when the app restarts.'],
    ['How do I change my monthly budget?', 'Open the side menu → Settings and enter a new monthly budget.'],
  ],
};

export default function HelpScreen() {
  const [tab, setTab] = useState('General');
  const [open, setOpen] = useState(0);

  return (
    <ScreenLayout title="Help & FAQs" headerContent={<AppText size={14} color={colors.onHeader} style={{ textAlign: 'center' }}>How can we help you?</AppText>}>
      <SegmentedTabs options={Object.keys(FAQ)} value={tab} onChange={(t) => { setTab(t); setOpen(0); }} style={{ marginBottom: 16 }} />
      {FAQ[tab].map(([q, a], i) => (
        <Pressable key={q} onPress={() => setOpen(open === i ? -1 : i)} style={styles.item}>
          <View style={styles.q}>
            <AppText weight="medium" size={14} style={{ flex: 1 }}>
              {q}
            </AppText>
            <MaterialCommunityIcons name={open === i ? 'chevron-up' : 'chevron-down'} size={20} color={colors.fence} />
          </View>
          {open === i && (
            <AppText size={13} color={colors.muted} style={{ marginTop: 6 }}>
              {a}
            </AppText>
          )}
        </Pressable>
      ))}
      <View style={styles.contact}>
        <MaterialCommunityIcons name="email-outline" size={20} color={colors.oceanBlue} />
        <AppText size={13}>  support@janaflow.app</AppText>
      </View>
    </ScreenLayout>
  );
}

const styles = themed(() => ({
  item: { borderBottomWidth: 1, borderColor: colors.lightGreen, paddingVertical: 12 },
  q: { flexDirection: 'row', alignItems: 'center' },
  contact: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
}));
