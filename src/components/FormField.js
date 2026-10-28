import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { colors, fonts, themed } from '../theme';
import AppText from './AppText';

export default function FormField({ label, error, secure, icon, onIconPress, iconLabel, multiline, style, ...inputProps }) {
  const [hidden, setHidden] = useState(true);

  return (
    <View style={[styles.wrap, style]}>
      {!!label && (
        <AppText weight="medium" size={15} style={styles.label}>
          {label}
        </AppText>
      )}
      <View style={[styles.box, multiline && styles.multiline, !!error && styles.boxError]}>
        <TextInput
          placeholderTextColor={colors.muted}
          secureTextEntry={secure && hidden}
          multiline={multiline}
          style={[styles.input, multiline && { textAlignVertical: 'top', paddingTop: 14 }]}
          {...inputProps}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityLabel="Toggle password visibility">
            <MaterialCommunityIcons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.fence} />
          </Pressable>
        ) : onIconPress ? (
          <Pressable onPress={onIconPress} hitSlop={12} style={styles.iconBtn} accessibilityLabel={iconLabel || label}>
            <MaterialCommunityIcons name={icon} size={20} color={colors.white} />
          </Pressable>
        ) : (
          !!icon && <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
        )}
      </View>
      {!!error && (
        <AppText size={12} color={colors.danger} style={styles.error}>
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = themed(() => ({
  wrap: { marginBottom: 14 },
  label: { marginBottom: 6, marginLeft: 6 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGreen,
    borderRadius: 18,
    paddingHorizontal: 18,
    minHeight: 46,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  multiline: { minHeight: 110, alignItems: 'flex-start' },
  boxError: { borderColor: colors.danger },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.fence, paddingVertical: 10 },
  error: { marginTop: 4, marginLeft: 8 },
  iconBtn: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: -10 },
}));
