import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
import ScreenLayout from '../../components/ScreenLayout';
import { useApp } from '../../context/AppContext';
import { colors, themed } from '../../theme';
import { useBiometricLogin } from '../../utils/biometric';
import { hasErrors, validate } from '../../utils/validation';

export default function LoginScreen({ navigation, route }) {
  const { signIn } = useApp();
  const { biometricUser, login: onFingerprint } = useBiometricLogin();

  // open the fingerprint prompt straight away when quick login is enabled
  useEffect(() => {
    if (biometricUser && !route.params?.email) {
      const t = setTimeout(() => onFingerprint({ quiet: true }), 400);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);

  const [email, setEmail] = useState(route.params?.email || '');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  // one form for everyone: the account itself decides whether the Admin or Customer app opens
  const onSubmit = () => {
    const errs = {
      email: validate.email(email),
      password: password ? null : 'Password is required',
    };
    setErrors(errs);
    if (hasErrors(errs)) return;
    const res = signIn(email, password);
    if (!res.ok) setErrors({ [res.field]: res.error });
  };

  return (
    <ScreenLayout title="Welcome" left="back" showBell={false} headerContent={<View style={{ height: 40 }} />}>
      <FormField
        label="Username Or Email"
        placeholder="example@example.com"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <FormField label="Password" placeholder="● ● ● ● ● ● ● ●" value={password} onChangeText={setPassword} error={errors.password} secure />

      <Button title="Log In" onPress={onSubmit} style={styles.btn} />
      <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
        <AppText weight="semibold" size={14} style={styles.center}>
          Forgot Password?
        </AppText>
      </Pressable>
      <Button title="Sign Up" variant="secondary" onPress={() => navigation.navigate('SignUp')} style={[styles.btn, { marginTop: 16 }]} />

      <Pressable onPress={() => onFingerprint()} style={styles.finger} accessibilityLabel="Use fingerprint to access">
        <View style={[styles.fingerIcon, biometricUser && styles.fingerIconOn]}>
          <MaterialCommunityIcons name="fingerprint" size={30} color={biometricUser ? colors.white : colors.fence} />
        </View>
        <View style={{ marginLeft: 12 }}>
          <AppText size={14}>
            Use <AppText weight="semibold" size={14}>Fingerprint</AppText> To Access
          </AppText>
          <AppText size={11} color={colors.muted}>
            {biometricUser ? `Quick login as ${biometricUser.name}` : 'Enable it in Settings after you log in'}
          </AppText>
        </View>
      </Pressable>
    </ScreenLayout>
  );
}

const styles = themed(() => ({
  btn: { width: 210, alignSelf: 'center', marginTop: 10, marginBottom: 10 },
  center: { textAlign: 'center' },
  finger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  fingerIcon: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  fingerIconOn: { backgroundColor: colors.primary, borderColor: colors.primary },
}));
