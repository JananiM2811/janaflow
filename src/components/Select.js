import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { colors, fonts, themed } from '../theme';
import AppText from './AppText';

const ITEM_HEIGHT = 48;

/**
 * shadcn/ui-style Select (combobox): bordered trigger + floating popover list with
 * optional search and a check mark on the selected option.
 * options: [{ value, label, description?, left? }]
 */
export default function Select({ label, value, options, onChange, placeholder = 'Select…', searchable = false, searchPlaceholder = 'Search…', style }) {
  const trigger = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const [query, setQuery] = useState('');
  const selected = options.find((o) => o.value === value);

  const q = query.trim().toLowerCase();
  const visible = options.filter((o) => !q || o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q));

  const openMenu = () => {
    trigger.current?.measureInWindow((x, y, width, height) => {
      const listHeight = Math.min(options.length * ITEM_HEIGHT + 12, 280) + (searchable ? 50 : 0);
      const { height: screenH } = Dimensions.get('window');
      const below = y + height + 6;
      setPos({ left: x, width, top: below + listHeight > screenH - 16 ? Math.max(16, y - listHeight - 6) : below });
      setQuery('');
      setOpen(true);
    });
  };

  const choose = (v) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <View style={style}>
      {!!label && (
        <AppText weight="medium" size={13} style={{ marginBottom: 6 }}>
          {label}
        </AppText>
      )}
      <Pressable ref={trigger} onPress={openMenu} style={[styles.trigger, open && styles.triggerOpen]} accessibilityRole="button" accessibilityLabel={label || placeholder}>
        {selected?.left}
        <AppText size={14} color={selected ? colors.fence : colors.muted} numberOfLines={1} style={{ flex: 1 }}>
          {selected ? selected.label : placeholder}
        </AppText>
        <MaterialCommunityIcons name="unfold-more-horizontal" size={18} color={colors.muted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setOpen(false)}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
        {pos && (
          <View style={[styles.popover, { top: pos.top, left: pos.left, width: pos.width }]}>
            {searchable && (
              <View style={styles.search}>
                <MaterialCommunityIcons name="magnify" size={18} color={colors.muted} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={colors.lightBlue}
                  style={styles.searchInput}
                  autoCapitalize="none"
                />
              </View>
            )}
            <ScrollView style={{ maxHeight: 280 }} keyboardShouldPersistTaps="handled">
              {visible.length === 0 && (
                <AppText size={13} color={colors.muted} style={{ textAlign: 'center', paddingVertical: 14 }}>
                  No results found.
                </AppText>
              )}
              {visible.map((o) => {
                const active = o.value === value;
                return (
                  <Pressable key={o.value} onPress={() => choose(o.value)} style={({ pressed }) => [styles.item, (pressed || active) && styles.itemActive]}>
                    {o.left}
                    <View style={{ flex: 1 }}>
                      <AppText size={14} weight={active ? 'medium' : 'regular'} numberOfLines={1}>
                        {o.label}
                      </AppText>
                      {!!o.description && (
                        <AppText size={11} color={colors.muted} numberOfLines={1}>
                          {o.description}
                        </AppText>
                      )}
                    </View>
                    {active && <MaterialCommunityIcons name="check" size={18} color={colors.fence} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = themed(() => ({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 42,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  triggerOpen: { borderColor: colors.fence },
  popover: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    height: 42,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: 4,
  },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.fence, paddingVertical: 6 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: ITEM_HEIGHT - 4, paddingHorizontal: 8, borderRadius: 6, marginVertical: 1 },
  itemActive: { backgroundColor: colors.lightGreen },
}));
