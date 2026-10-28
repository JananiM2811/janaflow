import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import DatePickerModal from '../../components/DatePickerModal';
import FormField from '../../components/FormField';
import { parseDDMMYYYY, toDDMMYYYY } from '../../utils/format';
import RoleToggle from '../../components/RoleToggle';
import ScreenLayout from '../../components/ScreenLayout';
import { useApp } from '../../context/AppContext';
import { ADMIN_ACCESS_CODE } from '../../data/seed';
import { colors, themed } from '../../theme';
import { hasErrors, validate } from '../../utils/validation';

export default function SignUpScreen({ navigation, route }) {
  const { signUp, showToast } = useApp();
  const [role, setRole] = useState(route.params?.role || 'customer');
  const [form, setForm] = useState({ name: '', email: '', phone: '', dob: '', password: '', confirm: '', code: '' });
  const [agreed, setAgreed] = useState(false);
  const [pickingDob, setPickingDob] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const onSubmit = () => {
    const errs = {
      name: validate.name(form.name),
      email: validate.email(form.email),
      phone: validate.phone(form.phone),
      dob: validate.dob(form.dob),
      password: validate.password(form.password),
      confirm: validate.confirm(form.confirm, form.password),
      code: role === 'admin' && form.code.trim() !== ADMIN_ACCESS_CODE ? 'Invalid admin access code' : null,
      terms: agreed ? null : 'Please accept the Terms of Use',
    };
    setErrors(errs);
    if (hasErrors(errs)) return;
    const res = signUp({ ...form, role });
    if (!res.ok) {
      setErrors({ [res.field]: res.error });
      return;
    }
    showToast({ tone: 'success', icon: 'account-check-outline', title: 'Account created!', message: 'Log in with your new credentials.' });
    navigation.replace('Login', { role, email: form.email.trim() });
  };

  return (
    <ScreenLayout title="Create Account" left="back" showBell={false} headerContent={<View style={{ height: 12 }} />}>
      <RoleToggle value={role} onChange={setRole} style={{ marginBottom: 18 }} />
      <FormField label="Full Name" placeholder="Priya Sharma" value={form.name} onChangeText={set('name')} error={errors.name} />
      <FormField
        label="Email"
        placeholder="example@example.com"
        value={form.email}
        onChangeText={set('email')}
        error={errors.email}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <FormField
        label="Mobile Number"
        placeholder="98765 43210"
        value={form.phone}
        onChangeText={(v) => set('phone')(v.replace(/\D/g, '').slice(0, 10))}
        error={errors.phone}
        keyboardType="phone-pad"
      />
      <FormField
        label="Date Of Birth"
        placeholder="DD/MM/YYYY"
        value={form.dob}
        onChangeText={set('dob')}
        error={errors.dob}
        icon="calendar-month-outline"
        onIconPress={() => setPickingDob(true)}
        iconLabel="Pick date of birth"
        maxLength={10}
      />
      <DatePickerModal
        visible={pickingDob}
        value={parseDDMMYYYY(form.dob)}
        maxDate={new Date(new Date().getFullYear() - 13, new Date().getMonth(), new Date().getDate())}
        onSelect={(d) => set('dob')(toDDMMYYYY(d))}
        onClose={() => setPickingDob(false)}
        title="Date Of Birth"
      />
      <FormField label="Password" placeholder="Min 8 chars, letters + numbers" value={form.password} onChangeText={set('password')} error={errors.password} secure />
      <FormField label="Confirm Password" placeholder="Re-enter password" value={form.confirm} onChangeText={set('confirm')} error={errors.confirm} secure />
      {role === 'admin' && (
        <FormField label="Admin Access Code" placeholder="Provided by your organisation" value={form.code} onChangeText={set('code')} error={errors.code} autoCapitalize="characters" />
      )}

      <Pressable style={styles.terms} onPress={() => setAgreed((a) => !a)}>
        <MaterialCommunityIcons name={agreed ? 'checkbox-marked' : 'checkbox-blank-outline'} size={20} color={errors.terms ? colors.danger : colors.primary} />
        <AppText size={12} style={{ flex: 1, marginLeft: 8 }}>
          By continuing, you agree to the <AppText weight="semibold" size={12}>Terms of Use</AppText> and{' '}
          <AppText weight="semibold" size={12}>Privacy Policy.</AppText>
        </AppText>
      </Pressable>
      {!!errors.terms && (
        <AppText size={12} color={colors.danger} style={{ textAlign: 'center' }}>
          {errors.terms}
        </AppText>
      )}

      <Button title="Sign Up" onPress={onSubmit} style={styles.btn} />
      <Pressable onPress={() => navigation.replace('Login', { role })}>
        <AppText size={13} style={{ textAlign: 'center' }}>
          Already have an account? <AppText weight="semibold" size={13} color={colors.oceanBlue}>Log In</AppText>
        </AppText>
      </Pressable>
    </ScreenLayout>
  );
}

const styles = themed(() => ({
  terms: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, paddingHorizontal: 8 },
  btn: { width: 210, alignSelf: 'center', marginVertical: 14 },
}));
