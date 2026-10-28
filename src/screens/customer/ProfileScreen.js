import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import AppText from '../../components/AppText';
import Avatar from '../../components/Avatar';
import ScreenLayout from '../../components/ScreenLayout';
import { useApp } from '../../context/AppContext';
import { colors, themed } from '../../theme';
import { confirmAction } from '../../utils/alerts';

export function ProfileHeader({ user }) {
  return (
    <View style={styles.head}>
      <Avatar name={user.name} style={styles.avatar} />
      <AppText weight="bold" size={20}>
        {user.name}
      </AppText>
      <AppText size={13}>
        <AppText weight="semibold" size={13}>ID: </AppText>
        {user.customerId}
      </AppText>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const { currentUser, signOut } = useApp();

  const items = [
    { label: 'Edit Profile', icon: 'account-outline', color: colors.lightBlue, onPress: () => navigation.navigate('EditProfile') },
    { label: 'Security', icon: 'shield-check-outline', color: colors.vividBlue, onPress: () => navigation.navigate('Security') },
    { label: 'Setting', icon: 'cog-outline', color: colors.cyprus, onPress: () => navigation.navigate('Settings') },
    { label: 'Help', icon: 'headset', color: colors.lightBlue, onPress: () => navigation.navigate('Help') },
    { label: 'Logout', icon: 'logout', color: colors.vividBlue, onPress: () => confirmAction('End Session', 'Are you sure you want to log out?', signOut, 'Yes, End Session') },
  ];

  return (
    <ScreenLayout title="Profile" inTabs headerContent={<View style={{ height: 20 }} />}>
      <ProfileHeader user={currentUser} />
      {items.map((it) => (
        <Pressable key={it.label} onPress={it.onPress} style={({ pressed }) => [styles.item, pressed && { opacity: 0.6 }]}>
          <View style={[styles.icon, { backgroundColor: it.color }]}>
            <MaterialCommunityIcons name={it.icon} size={26} color={colors.white} />
          </View>
          <AppText weight="medium" size={15} style={{ flex: 1 }}>
            {it.label}
          </AppText>
          <MaterialCommunityIcons name="chevron-right" size={22} color={colors.muted} />
        </Pressable>
      ))}
    </ScreenLayout>
  );
}

const styles = themed(() => ({
  head: { alignItems: 'center', marginTop: -8, marginBottom: 20 },
  avatar: { marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  icon: { width: 56, height: 52, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
}));
