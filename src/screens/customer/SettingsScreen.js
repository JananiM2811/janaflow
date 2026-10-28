import * as LocalAuthentication from 'expo-local-authentication';
import { useState } from 'react';
import { Platform, View } from 'react-native';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
import ScreenLayout from '../../components/ScreenLayout';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme';
import { formatMoney } from '../../utils/format';
import { validate } from '../../utils/validation';
import { SwitchRow } from './EditProfileScreen';

// Turning quick login on asks for the fingerprint / device PIN once, so we know it works
export async function enableBiometric({ setBiometricEnabled, showToast }) {
  if (Platform.OS === 'web') {
    showToast({ tone: 'info', icon: 'fingerprint-off', title: 'Not available on web', message: 'Open JanaFlow in Expo Go on your phone to use fingerprint / PIN login.' });
    return;
  }
  const [hasHardware, enrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);
  if (!hasHardware || !enrolled) {
    showToast({ tone: 'warning', icon: 'fingerprint-off', title: 'No fingerprint or screen lock', message: 'Set up a fingerprint or PIN in your phone settings first.' });
    return;
  }
  const res = await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirm to enable quick login', fallbackLabel: 'Use PIN', cancelLabel: 'Cancel' });
  if (res.success) {
    setBiometricEnabled(true);
    showToast({ tone: 'success', icon: 'fingerprint', title: 'Quick login enabled', message: 'Next time, tap "Use Fingerprint To Access" on the Login screen.' });
  }
}

export default function SettingsScreen() {
  const { currentUser, updateProfile, showToast, themeMode, setThemeMode, biometricEnabled, setBiometricEnabled } = useApp();
  const isAdmin = currentUser.role === 'admin';
  const [budget, setBudget] = useState(String(currentUser.monthlyBudget));
  const [alertsEnabled, setAlertsEnabled] = useState(currentUser.alertsEnabled);
  const [error, setError] = useState(null);

  const onSave = () => {
    const err = validate.amount(budget);
    setError(err);
    if (err) return;
    updateProfile({ monthlyBudget: Number(budget), alertsEnabled });
    showToast({ tone: 'success', icon: 'cog-outline', title: 'Settings saved', message: `Monthly budget set to ${formatMoney(Number(budget))}.` });
  };

  const onBiometric = (on) => {
    if (on) enableBiometric({ setBiometricEnabled, showToast });
    else setBiometricEnabled(false);
  };

  return (
    <ScreenLayout title="Settings" headerContent={<View style={{ height: 30 }} />}>
      <AppText weight="semibold" size={18} style={{ marginBottom: 6 }}>
        Appearance
      </AppText>
      <SwitchRow label="Dark theme" value={themeMode === 'dark'} onValueChange={(on) => setThemeMode(on ? 'dark' : 'light')} />

      <AppText weight="semibold" size={18} style={{ marginTop: 18, marginBottom: 6 }}>
        Security
      </AppText>
      <SwitchRow label="Fingerprint / PIN login" value={biometricEnabled} onValueChange={onBiometric} />
      <AppText size={12} color={colors.muted} style={{ marginBottom: 8 }}>
        Log in with your phone's fingerprint, face unlock or screen-lock PIN instead of typing your password.
      </AppText>

      {!isAdmin && (
        <>
          <AppText weight="semibold" size={18} style={{ marginTop: 18, marginBottom: 12 }}>
            Budget & Alerts
          </AppText>
          <FormField label="Monthly Budget (₹)" value={budget} onChangeText={(v) => setBudget(v.replace(/[^0-9.]/g, ''))} error={error} keyboardType="decimal-pad" />
          <SwitchRow label="Transaction alerts" value={alertsEnabled} onValueChange={setAlertsEnabled} />
          <AppText size={12} color={colors.muted} style={{ marginTop: 4, marginBottom: 16 }}>
            When on, JanaFlow shows a personalised alert every time you add, edit or delete a transaction, and warns you when a category budget is crossed.
          </AppText>
          <Button title="Save Settings" onPress={onSave} style={{ alignSelf: 'center', width: 220 }} />
        </>
      )}
    </ScreenLayout>
  );
}
