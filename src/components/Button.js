import { Pressable } from 'react-native';
import { colors, themed } from '../theme';
import AppText from './AppText';

export default function Button({ title, onPress, variant = 'primary', style, disabled }) {
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.cyprus : colors.lightGreen;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.btn, { backgroundColor: bg }, (pressed || disabled) && { opacity: 0.75 }, style]}
    >
      <AppText weight="semibold" size={17} color={variant === 'secondary' ? colors.fence : colors.white}>
        {title}
      </AppText>
    </Pressable>
  );
}

const styles = themed(() => ({
  btn: { height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
}));
