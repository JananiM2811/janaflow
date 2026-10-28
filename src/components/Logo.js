import { View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '../theme';
import AppText from './AppText';

/**
 * JanaFlow mark: a "J" whose stem flows upward into an arrow (money flowing and growing),
 * with a small wave for "flow". Drawn on a rounded tile so it also works as the app icon.
 */
export function LogoMark({ size = 72, tile = colors.fence, ink = colors.honeydew }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="0" y="0" width="100" height="100" rx="26" fill={tile} />
      {/* flow wave */}
      <Path d="M14 52 Q22 44 30 52 T46 52" stroke={ink} strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.55" />
      {/* J hook + rising stem */}
      <Path d="M30 66 C30 82 64 84 64 62 L64 26" stroke={ink} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* arrow head */}
      <Path d="M51 38 L64 24 L77 38" stroke={ink} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export default function Logo({ color = colors.fence, size = 44, tile, ink, direction = 'column' }) {
  const row = direction === 'row';
  return (
    <View style={{ alignItems: 'center', flexDirection: row ? 'row' : 'column' }}>
      <LogoMark size={row ? size * 1.3 : size * 2.1} tile={tile || color} ink={ink || colors.honeydew} />
      <AppText size={size} color={color} style={{ marginTop: row ? 0 : 12, marginLeft: row ? 12 : 0, letterSpacing: 0.3 }}>
        <AppText weight="bold" size={size} color={color}>
          Jana
        </AppText>
        <AppText weight="light" size={size} color={color}>
          Flow
        </AppText>
      </AppText>
    </View>
  );
}
