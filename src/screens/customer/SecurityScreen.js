import { useState } from 'react';
import { View } from 'react-native';
import AppText from '../../components/AppText';
import Button from '../../components/Button';
import FormField from '../../components/FormField';
import ScreenLayout from '../../components/ScreenLayout';
import { useApp } from '../../context/AppContext';
import { hasErrors, validate } from '../../utils/validation';

export default function SecurityScreen({ navigation }) {
  const { changePassword, showToast } = useApp();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});

  const onSubmit = () => {
    const errs = {
      current: current ? null : 'Current password is required',
      next: validate.password(next),
      confirm: validate.confirm(confirm, next),
    };
    setErrors(errs);
    if (hasErrors(errs)) return;
    const res = changePassword(current, next);
    if (!res.ok) {
      setErrors({ [res.field]: res.error });
      return;
    }
    showToast({ tone: 'success', icon: 'lock-check-outline', title: 'Password changed', message: 'Use your new password next time you log in.' });
    navigation.goBack();
  };

  return (
    <ScreenLayout title="Change Password" left="back" headerContent={<View style={{ height: 30 }} />}>
      <AppText size={13} style={{ marginBottom: 20, opacity: 0.8 }}>
        Keep your account safe — use at least 8 characters with letters and numbers.
      </AppText>
      <FormField label="Current Password" value={current} onChangeText={setCurrent} error={errors.current} secure />
      <FormField label="New Password" value={next} onChangeText={setNext} error={errors.next} secure />
      <FormField label="Confirm New Password" value={confirm} onChangeText={setConfirm} error={errors.confirm} secure />
      <Button title="Change Password" onPress={onSubmit} style={{ alignSelf: 'center', width: 230, marginTop: 16 }} />
    </ScreenLayout>
  );
}
