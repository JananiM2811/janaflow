import { useState } from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
import ScreenLayout from '../../components/ScreenLayout';
import { useApp } from '../../context/AppContext';
import { hasErrors, validate } from '../../utils/validation';
import { themed } from '../../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const { findByEmail, resetPassword, showToast } = useApp();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});

  const onNext = () => {
    let err = validate.email(email);
    if (!err && !findByEmail(email)) err = 'No account found with this email';
    setErrors({ email: err });
    if (!err) setStep(2);
  };

  const onReset = () => {
    const errs = { password: validate.password(password), confirm: validate.confirm(confirm, password) };
    setErrors(errs);
    if (hasErrors(errs)) return;
    resetPassword(email, password);
    const user = findByEmail(email);
    showToast({ tone: 'success', icon: 'lock-reset', title: 'Password changed', message: 'You can now log in with your new password.' });
    navigation.replace('Login', { role: user.role, email: email.trim() });
  };

  return (
    <ScreenLayout title="Forgot Password" left="back" showBell={false} headerContent={<View style={{ height: 40 }} />}>
      <AppText weight="semibold" size={18} style={{ marginBottom: 6 }}>
        {step === 1 ? 'Reset Password?' : 'New Password'}
      </AppText>
      <AppText size={13} style={{ marginBottom: 24, opacity: 0.8 }}>
        {step === 1
          ? 'Enter the email linked to your JanaFlow account and we will help you set a new password.'
          : `Set a new password for ${email.trim()}.`}
      </AppText>

      {step === 1 ? (
        <>
          <FormField
            label="Enter Email Address"
            placeholder="example@example.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Button title="Next Step" onPress={onNext} style={styles.btn} />
        </>
      ) : (
        <>
          <FormField label="New Password" value={password} onChangeText={setPassword} error={errors.password} secure placeholder="Min 8 chars, letters + numbers" />
          <FormField label="Confirm New Password" value={confirm} onChangeText={setConfirm} error={errors.confirm} secure placeholder="Re-enter password" />
          <Button title="Change Password" onPress={onReset} style={styles.btn} />
        </>
      )}
      <Button title="Back To Log In" variant="secondary" onPress={() => navigation.goBack()} style={styles.btn} />
    </ScreenLayout>
  );
}

const styles = themed(() => ({
  btn: { width: 230, alignSelf: 'center', marginTop: 14 },
}));
