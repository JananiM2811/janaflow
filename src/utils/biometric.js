import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { useApp } from '../context/AppContext';

/**
 * Fingerprint / device-PIN login for the account that enabled it in Settings.
 * The phone only reads the sensor while its prompt is open, so login() must be
 * called (on a tap, or automatically when the Login screen opens).
 */
export function useBiometricLogin() {
  const { biometricUser, signInAs, showToast } = useApp();
  const busy = useRef(false);

  const login = useCallback(
    async ({ quiet = false } = {}) => {
      if (!biometricUser) {
        if (!quiet) showToast({ tone: 'info', icon: 'fingerprint', title: 'Quick login is off', message: 'Log in once, then turn on "Fingerprint / PIN login" in Settings.' });
        return;
      }
      if (Platform.OS === 'web') {
        if (!quiet) showToast({ tone: 'info', icon: 'fingerprint-off', title: 'Not available on web', message: 'Use the Expo Go app on your phone for fingerprint login.' });
        return;
      }
      if (busy.current) return;
      busy.current = true;
      try {
        const res = await LocalAuthentication.authenticateAsync({
          promptMessage: `Log in as ${biometricUser.name}`,
          fallbackLabel: 'Use PIN',
          cancelLabel: 'Use password',
        });
        if (res.success) signInAs(biometricUser.id);
        else if (!['user_cancel', 'system_cancel', 'app_cancel'].includes(res.error)) {
          showToast({ tone: 'warning', icon: 'fingerprint-off', title: 'Not recognised', message: 'Try again, or log in with your password.' });
        }
      } catch (e) {
        showToast({ tone: 'warning', icon: 'fingerprint-off', title: 'Fingerprint unavailable', message: String(e?.message || e) });
      } finally {
        busy.current = false;
      }
    },
    [biometricUser, signInAs, showToast],
  );

  return { biometricUser, login };
}
