import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';
import { Pressable, View } from 'react-native';
import AppText from '../../components/AppText';
import ScreenLayout from '../../components/ScreenLayout';
import { useApp } from '../../context/AppContext';
import { colors, toneColors, themed } from '../../theme';
import { relativeTime } from '../../utils/format';
import { startOfDay } from '../../utils/reports';
import { confirmAction } from '../../utils/alerts';

function sectionOf(iso) {
  const today = startOfDay(new Date());
  const d = new Date(iso);
  if (d >= today) return 'Today';
  if (d >= new Date(today.getTime() - 86400000)) return 'Yesterday';
  return 'Earlier';
}

export default function NotificationsScreen() {
  const { myNotifications, markAllRead, clearNotifications } = useApp();

  // mark as read when the user leaves the screen, so the "new" dots stay visible while reading.
  // markAllRead changes identity on every context update, so read it through a ref.
  const markRef = useRef(markAllRead);
  markRef.current = markAllRead;
  useFocusEffect(useCallback(() => () => markRef.current(), []));

  const sections = ['Today', 'Yesterday', 'Earlier']
    .map((title) => ({ title, data: myNotifications.filter((n) => sectionOf(n.date) === title) }))
    .filter((s) => s.data.length);

  return (
    <ScreenLayout title="Notification" showBell={false} headerContent={<View style={{ height: 20 }} />}>
      {myNotifications.length > 0 && (
        <Pressable onPress={() => confirmAction('Clear all', 'Remove all notifications?', clearNotifications, 'Clear')} style={{ alignSelf: 'flex-end' }}>
          <AppText size={13} color={colors.oceanBlue}>
            Clear all
          </AppText>
        </Pressable>
      )}
      {sections.length === 0 && (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="bell-sleep-outline" size={44} color={colors.lightBlue} />
          <AppText size={14} style={{ marginTop: 8 }}>
            You're all caught up!
          </AppText>
        </View>
      )}
      {sections.map((s) => (
        <View key={s.title}>
          <AppText size={13} color={colors.muted} style={{ marginTop: 12, marginBottom: 4 }}>
            {s.title}
          </AppText>
          {s.data.map((n) => (
            <View key={n.id} style={styles.item}>
              <View style={[styles.icon, { backgroundColor: toneColors[n.tone] || colors.primary }]}>
                <MaterialCommunityIcons name={n.icon || 'bell-outline'} size={22} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <AppText weight="semibold" size={14} style={{ flex: 1 }}>
                    {n.title}
                  </AppText>
                  {!n.read && <View style={styles.dot} />}
                </View>
                <AppText size={12} color={colors.muted}>
                  {n.message}
                </AppText>
                <AppText size={11} color={colors.oceanBlue} style={{ alignSelf: 'flex-end', marginTop: 2 }}>
                  {relativeTime(n.date)}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      ))}
    </ScreenLayout>
  );
}

const styles = themed(() => ({
  item: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.lightGreen },
  icon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.oceanBlue },
  empty: { alignItems: 'center', paddingVertical: 48 },
}));
