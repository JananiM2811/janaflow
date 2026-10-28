import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { colors, themed } from '../theme';
import AppText from './AppText';

export const TAB_BAR_HEIGHT = 78;

/**
 * Header + rounded sheet, the base layout of every JanaFlow screen.
 * left: 'menu' opens the drawer, 'back' goes back, null shows nothing.
 */
export default function ScreenLayout({
  title,
  subtitle,
  align = 'center',
  left = 'menu',
  showBell = true,
  headerContent,
  children,
  footer,
  scroll = true,
  inTabs = false,
  sheetStyle,
}) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { myNotifications, currentUser } = useApp();
  const unread = myNotifications.filter((n) => !n.read).length;
  // the bottom tab bar is absolutely positioned, so tab screens reserve room for it
  const bottomPad = insets.bottom + (inTabs ? TAB_BAR_HEIGHT + 24 : 24);

  const onLeft = () => {
    if (left === 'menu') navigation.dispatch(DrawerActions.openDrawer());
    else navigation.goBack();
  };

  const body = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.sheetContent, { paddingBottom: bottomPad }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.sheetContent, { flex: 1, paddingBottom: footer ? 0 : bottomPad }]}>{children}</View>
  );

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <View style={{ paddingTop: insets.top + 8 }}>
        <View style={styles.header}>
          <View style={styles.side}>
            {left && (
              <Pressable onPress={onLeft} hitSlop={12} style={styles.iconBtn} accessibilityLabel={left === 'menu' ? 'Open menu' : 'Go back'}>
                <MaterialCommunityIcons name={left === 'menu' ? 'menu' : 'arrow-left'} size={24} color={colors.white} />
              </Pressable>
            )}
          </View>
          <View style={[styles.titleWrap, align === 'left' && { alignItems: 'flex-start' }]}>
            <AppText weight="semibold" size={20} color={colors.white} numberOfLines={1}>
              {title}
            </AppText>
            {!!subtitle && (
              <AppText size={13} color={colors.onHeader}>
                {subtitle}
              </AppText>
            )}
          </View>
          <View style={[styles.side, { alignItems: 'flex-end' }]}>
            {showBell && currentUser && (
              <Pressable
                onPress={() => navigation.navigate(currentUser.role === 'admin' ? 'AdminRoot' : 'CustomerRoot', { screen: 'Notifications' })}
                style={styles.bell}
                accessibilityLabel="Notifications"
              >
                <MaterialCommunityIcons name="bell-outline" size={20} color={colors.white} />
                {unread > 0 && (
                  <View style={styles.badge}>
                    <AppText weight="semibold" size={9} color={colors.white}>
                      {unread > 9 ? '9+' : unread}
                    </AppText>
                  </View>
                )}
              </Pressable>
            )}
          </View>
        </View>
        {headerContent && <View style={styles.headerContent}>{headerContent}</View>}
      </View>
      <View style={[styles.sheet, sheetStyle]}>
        {body}
        {footer && <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>{footer}</View>}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = themed(() => ({
  root: { flex: 1, backgroundColor: colors.header },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, minHeight: 56 },
  side: { width: 44 },
  iconBtn: { width: 36, height: 36, justifyContent: 'center' },
  titleWrap: { flex: 1, alignItems: 'center' },
  bell: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cyprus,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: colors.expense,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: { paddingHorizontal: 32, paddingTop: 8, paddingBottom: 24 },
  sheet: {
    flex: 1,
    marginTop: 8,
    backgroundColor: colors.honeydew,
    borderTopLeftRadius: 56,
    borderTopRightRadius: 56,
    overflow: 'hidden',
  },
  sheetContent: { paddingHorizontal: 28, paddingTop: 32 },
  footer: { paddingHorizontal: 28, paddingTop: 12 },
}));
