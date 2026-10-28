import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import Logo from '../../components/Logo';
import { colors, themed } from '../../theme';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Welcome'), 1600);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Logo color={colors.white} ink={colors.primary} />
      <AppText size={14} color={colors.lightBlue} style={{ marginTop: 12 }}>
        Smart money, simply managed.
      </AppText>
    </View>
  );
}

const styles = themed(() => ({
  root: { flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
}));
