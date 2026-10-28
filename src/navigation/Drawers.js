import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { Pressable, Switch, View } from 'react-native';
import AppText from '../components/AppText';
import Avatar from '../components/Avatar';
import { useApp } from '../context/AppContext';
import GoalsScreen from '../screens/customer/GoalsScreen';
import SettingsScreen from '../screens/customer/SettingsScreen';
import CalendarScreen from '../screens/shared/CalendarScreen';
import HelpScreen from '../screens/shared/HelpScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import { colors, themed } from '../theme';
import { confirmAction } from '../utils/alerts';
import { AdminTabs, CustomerTabs } from './Tabs';

const Drawer = createDrawerNavigator();

const CUSTOMER_LINKS = [
  { label: 'Home', icon: 'home-outline', to: ['Dashboard', { screen: 'Home' }] },
  { label: 'Analysis', icon: 'chart-bar', to: ['Dashboard', { screen: 'Analysis' }] },
  { label: 'Transactions', icon: 'swap-horizontal', to: ['Dashboard', { screen: 'Transactions' }] },
  { label: 'Categories', icon: 'layers-outline', to: ['Dashboard', { screen: 'Categories' }] },
  { label: 'Calendar', icon: 'calendar-month-outline', to: ['Calendar'] },
  { label: 'Savings Goals', icon: 'piggy-bank-outline', to: ['Goals'] },
  { label: 'Add Transaction', icon: 'plus-circle-outline', to: ['AddTransaction'] },
  { label: 'Profile', icon: 'account-outline', to: ['Dashboard', { screen: 'Profile' }] },
  { label: 'Edit Profile', icon: 'account-edit-outline', to: ['EditProfile'] },
  { label: 'Security', icon: 'shield-check-outline', to: ['Security'] },
  { label: 'Notifications', icon: 'bell-outline', to: ['Notifications'] },
  { label: 'Settings', icon: 'cog-outline', to: ['Settings'] },
  { label: 'Help', icon: 'headset', to: ['Help'] },
];

const ADMIN_LINKS = [
  { label: 'Dashboard', icon: 'view-dashboard-outline', to: ['Dashboard', { screen: 'Home' }] },
  { label: 'Analysis', icon: 'chart-bar', to: ['Dashboard', { screen: 'Analysis' }] },
  { label: 'Customers', icon: 'account-group-outline', to: ['Dashboard', { screen: 'Customers' }] },
  { label: 'Calendar', icon: 'calendar-month-outline', to: ['Calendar'] },
  { label: 'Notifications', icon: 'bell-outline', to: ['Notifications'] },
  { label: 'Settings', icon: 'cog-outline', to: ['Settings'] },
  { label: 'Help', icon: 'headset', to: ['Help'] },
];

function DrawerMenu({ navigation, state, links }) {
  const { currentUser, signOut, themeMode, setThemeMode } = useApp();
  const route = state.routes[state.index];
  const activeTab = route.state ? route.state.routes[route.state.index].name : route.name === 'Dashboard' ? 'Home' : null;
  const isActive = ([name, params]) => (params ? route.name === name && activeTab === params.screen : route.name === name);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.head}>
        <Avatar name={currentUser.name} size={64} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <AppText weight="semibold" size={16} color={colors.white} numberOfLines={1}>
            {currentUser.name}
          </AppText>
          <AppText size={12} color={colors.onHeader} numberOfLines={1}>
            {currentUser.email}
          </AppText>
          <View style={styles.role}>
            <AppText weight="medium" size={11} color={colors.header}>
              {currentUser.role === 'admin' ? 'ADMIN' : 'CUSTOMER'}
            </AppText>
          </View>
        </View>
      </View>
      <DrawerContentScrollView contentContainerStyle={{ paddingTop: 12 }}>
        {links.map((l) => {
          const active = isActive(l.to);
          return (
            <Pressable
              key={l.label}
              onPress={() => {
                navigation.closeDrawer();
                navigation.navigate(...l.to);
              }}
              style={[styles.item, active && styles.itemActive]}
            >
              <MaterialCommunityIcons name={l.icon} size={22} color={active ? colors.white : colors.fence} />
              <AppText weight="medium" size={15} color={active ? colors.white : colors.fence} style={{ marginLeft: 14 }}>
                {l.label}
              </AppText>
            </Pressable>
          );
        })}
      </DrawerContentScrollView>
      <View style={styles.themeRow}>
        <MaterialCommunityIcons name={themeMode === 'dark' ? 'weather-night' : 'white-balance-sunny'} size={22} color={colors.fence} />
        <AppText weight="medium" size={15} style={{ marginLeft: 14, flex: 1 }}>
          Dark Mode
        </AppText>
        <Switch
          value={themeMode === 'dark'}
          onValueChange={(on) => setThemeMode(on ? 'dark' : 'light')}
          trackColor={{ true: colors.vividBlue, false: colors.border }}
          thumbColor={colors.white}
          activeThumbColor={colors.white}
        />
      </View>
      <Pressable style={styles.logout} onPress={() => confirmAction('End Session', 'Are you sure you want to log out?', signOut, 'Yes, End Session')}>
        <MaterialCommunityIcons name="logout" size={22} color={colors.danger} />
        <AppText weight="semibold" size={15} color={colors.danger} style={{ marginLeft: 14 }}>
          Logout
        </AppText>
      </Pressable>
    </View>
  );
}

// a function so the drawer background follows the current theme
const drawerOptions = () => ({
  headerShown: false,
  drawerType: 'front',
  drawerStyle: { backgroundColor: colors.honeydew, width: 300, borderTopRightRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
  overlayColor: 'rgba(0,0,0,0.45)',
});

export function CustomerDrawer() {
  return (
    <Drawer.Navigator screenOptions={drawerOptions} drawerContent={(props) => <DrawerMenu {...props} links={CUSTOMER_LINKS} />}>
      <Drawer.Screen name="Dashboard" component={CustomerTabs} />
      <Drawer.Screen name="Calendar" component={CalendarScreen} />
      <Drawer.Screen name="Goals" component={GoalsScreen} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Help" component={HelpScreen} />
    </Drawer.Navigator>
  );
}

export function AdminDrawer() {
  return (
    <Drawer.Navigator screenOptions={drawerOptions} drawerContent={(props) => <DrawerMenu {...props} links={ADMIN_LINKS} />}>
      <Drawer.Screen name="Dashboard" component={AdminTabs} />
      <Drawer.Screen name="Calendar" component={CalendarScreen} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="Help" component={HelpScreen} />
    </Drawer.Navigator>
  );
}

const styles = themed(() => ({
  head: { backgroundColor: colors.header, paddingTop: 56, paddingBottom: 22, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  role: { alignSelf: 'flex-start', backgroundColor: colors.white, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  item: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, paddingHorizontal: 16, height: 48, borderRadius: 24, marginBottom: 4 },
  itemActive: { backgroundColor: colors.primary },
  themeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 30, paddingVertical: 8, borderTopWidth: 1, borderColor: colors.border },
  logout: { flexDirection: 'row', alignItems: 'center', padding: 28, borderTopWidth: 1, borderColor: colors.lightGreen },
}));
