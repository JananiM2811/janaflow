import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import Logo from '../../components/Logo';
import { colors, getThemeMode, themed } from '../../theme';
import { useBiometricLogin } from '../../utils/biometric';

// Home screen with Sign In & Sign Up for both Admin and Customer
export default function WelcomeScreen({ navigation }) {
  const { biometricUser, login } = useBiometricLogin();
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style={getThemeMode() === "dark" ? "light" : "dark"} />
      <View style={styles.center}>
        <Logo />
        <AppText size={14} style={styles.tagline}>
          Track spending, set budgets and get personal alerts — all in one place.
        </AppText>
      </View>

      <View style={styles.actions}>
        {biometricUser && (
          <Pressable onPress={() => login()} style={styles.quick} accessibilityLabel="Quick login with fingerprint">
            <MaterialCommunityIcons name="fingerprint" size={26} color={colors.white} />
            <View style={{ marginLeft: 10 }}>
              <AppText weight="semibold" size={15} color={colors.white}>
                Quick Login
              </AppText>
              <AppText size={11} color={colors.onHeader}>
                as {biometricUser.name} · fingerprint / PIN
              </AppText>
            </View>
          </Pressable>
        )}
        <Button title="Log In" onPress={() => navigation.navigate('Login')} style={styles.btn} />
        <Button title="Sign Up" variant="secondary" onPress={() => navigation.navigate('SignUp')} style={styles.btn} />
        <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
          <AppText weight="semibold" size={14} style={{ textAlign: 'center', marginTop: 4 }}>
            Forgot Password?
          </AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = themed(() => ({
  root: { flex: 1, backgroundColor: colors.honeydew, paddingHorizontal: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tagline: { textAlign: 'center', marginTop: 14, opacity: 0.8 },
  actions: { paddingBottom: 32 },
  btn: { marginBottom: 12, width: 230, alignSelf: 'center' },
  quick: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    width: 230,
    paddingHorizontal: 16,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.header,
    marginBottom: 12,
  },
}));
