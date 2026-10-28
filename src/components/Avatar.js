import { View } from 'react-native';
import { colors, themed } from '../theme';
import { initials } from '../utils/format';
import AppText from './AppText';

export default function Avatar({ name, size = 110, style }) {
  return (
    <View style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <AppText weight="semibold" size={size * 0.36} color={colors.white}>
        {initials(name)}
      </AppText>
    </View>
  );
}

const styles = themed(() => ({
  ring: {
    backgroundColor: colors.vividBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.honeydew,
  },
}));
