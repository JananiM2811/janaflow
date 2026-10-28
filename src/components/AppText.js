import { Text } from 'react-native';
import { colors, fonts } from '../theme';

export default function AppText({ weight = 'regular', size = 14, color = colors.fence, style, ...props }) {
  return <Text {...props} style={[{ fontFamily: fonts[weight], fontSize: size, color }, style]} />;
}
