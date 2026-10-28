import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { colors, shadow, toneColors, themed } from '../theme';
import AppText from './AppText';

// Slide-down banner used for the personalised transaction alerts
export default function Toast() {
  const { toast, hideToast } = useApp();
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    if (!toast) return undefined;
    y.setValue(-200);
    Animated.spring(y, { toValue: 0, useNativeDriver: true, friction: 8 }).start();
    const timer = setTimeout(() => {
      Animated.timing(y, { toValue: -200, duration: 250, useNativeDriver: true }).start(() => hideToast());
    }, toast.tone === 'danger' ? 6500 : 4500);
    return () => clearTimeout(timer);
  }, [toast?.id]);

  if (!toast) return null;
  const accent = toneColors[toast.tone] || colors.primary;

  return (
    <Animated.View style={[styles.wrap, { top: insets.top + 8, transform: [{ translateY: y }] }]} pointerEvents="box-none">
      <Pressable onPress={hideToast} style={[styles.card, { borderLeftColor: accent }]}>
        <View style={[styles.icon, { backgroundColor: accent }]}>
          <MaterialCommunityIcons name={toast.icon || 'bell-outline'} size={20} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText weight="semibold" size={14}>
            {toast.title}
          </AppText>
          <AppText size={12} color={colors.muted}>
            {toast.message}
          </AppText>
        </View>
        <MaterialCommunityIcons name="close" size={18} color={colors.muted} />
      </Pressable>
    </Animated.View>
  );
}

const styles = themed(() => ({
  wrap: { position: 'absolute', left: 16, right: 16, zIndex: 100 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 14,
    borderLeftWidth: 6,
    ...shadow,
  },
  icon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
}));
