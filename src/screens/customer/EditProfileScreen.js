import { useState } from 'react';
import { Switch, View } from 'react-native';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
import ScreenLayout from '../../components/ScreenLayout';
import { useApp } from '../../context/AppContext';
import { colors, themed } from '../../theme';
import { hasErrors, validate } from '../../utils/validation';
import { ProfileHeader } from './ProfileScreen';

export function SwitchRow({ label, value, onValueChange }) {
  return (
    <View style={styles.switchRow}>
      <AppText size={15}>{label}</AppText>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.primary, false: colors.lightGreen }} thumbColor={colors.white} activeThumbColor={colors.white} />
    </View>
  );
}

export default function EditProfileScreen({ navigation }) {
  const { currentUser, updateProfile, showToast, themeMode, setThemeMode } = useApp();
  const [form, setForm] = useState({ name: currentUser.name, phone: currentUser.phone, email: currentUser.email });
  const [alertsEnabled, setAlertsEnabled] = useState(currentUser.alertsEnabled);
  const [errors, setErrors] = useState({});
  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const onUpdate = () => {
    const errs = { name: validate.name(form.name), phone: validate.phone(form.phone), email: validate.email(form.email) };
    setErrors(errs);
    if (hasErrors(errs)) return;
    const res = updateProfile({ name: form.name.trim(), phone: form.phone.trim(), email: form.email.trim().toLowerCase(), alertsEnabled });
    if (!res.ok) {
      setErrors({ [res.field]: res.error });
      return;
    }
    showToast({ tone: 'success', icon: 'account-check-outline', title: 'Profile updated', message: 'Your changes have been saved.' });
    navigation.goBack();
  };

  return (
    <ScreenLayout title="Edit My Profile" left="back" headerContent={<View style={{ height: 20 }} />}>
      <ProfileHeader user={{ ...currentUser, name: form.name || currentUser.name }} />
      <AppText weight="semibold" size={18} style={{ marginBottom: 12 }}>
        Account Settings
      </AppText>
      <FormField label="Username" value={form.name} onChangeText={set('name')} error={errors.name} />
      <FormField label="Phone" value={form.phone} onChangeText={(v) => set('phone')(v.replace(/\D/g, '').slice(0, 10))} error={errors.phone} keyboardType="phone-pad" />
      <FormField label="Email Address" value={form.email} onChangeText={set('email')} error={errors.email} autoCapitalize="none" keyboardType="email-address" />
      <SwitchRow label="Push Notifications (transaction alerts)" value={alertsEnabled} onValueChange={setAlertsEnabled} />
      <SwitchRow label="Turn Dark Theme" value={themeMode === 'dark'} onValueChange={(on) => setThemeMode(on ? 'dark' : 'light')} />
      <Button title="Update Profile" onPress={onUpdate} style={{ alignSelf: 'center', width: 220, marginTop: 16 }} />
    </ScreenLayout>
  );
}

const styles = themed(() => ({
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 4 },
}));
