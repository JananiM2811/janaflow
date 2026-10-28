import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_HEIGHT } from '../components/ScreenLayout';
import CustomersScreen from '../screens/admin/CustomersScreen';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import CategoriesScreen from '../screens/customer/CategoriesScreen';
import HomeScreen from '../screens/customer/HomeScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import TransactionsScreen from '../screens/customer/TransactionsScreen';
import AnalysisScreen from '../screens/shared/AnalysisScreen';
import { colors, themed } from '../theme';

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: 'home-outline',
  Analysis: 'chart-bar',
  Transactions: 'swap-horizontal',
  Categories: 'layers-outline',
  Profile: 'account-outline',
  Customers: 'account-group-outline',
};

function useTabOptions() {
  const insets = useSafeAreaInsets();
  return ({ route }) => ({
    headerShown: false,
    tabBarShowLabel: false,
    tabBarStyle: [styles.bar, { height: TAB_BAR_HEIGHT + insets.bottom, paddingBottom: insets.bottom }],
    tabBarItemStyle: { justifyContent: 'center', alignItems: 'center', paddingTop: 12 },
    tabBarIcon: ({ focused }) => (
      <View style={[styles.icon, focused && styles.iconActive]}>
        <MaterialCommunityIcons name={ICONS[route.name]} size={26} color={focused ? colors.white : colors.muted} />
      </View>
    ),
    tabBarAccessibilityLabel: route.name,
  });
}

export function CustomerTabs() {
  const screenOptions = useTabOptions();
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Categories" component={CategoriesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AdminTabs() {
  const screenOptions = useTabOptions();
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={AdminHomeScreen} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} />
      <Tab.Screen name="Customers" component={CustomersScreen} />
    </Tab.Navigator>
  );
}

const styles = themed(() => ({
  bar: {
    position: 'absolute',
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderTopWidth: 0,
    elevation: 12,
    paddingHorizontal: 20,
  },
  icon: { width: 56, height: 50, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: colors.header },
}));
