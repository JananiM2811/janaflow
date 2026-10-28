import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import CustomerDetailScreen from '../screens/admin/CustomerDetailScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import SplashScreen from '../screens/auth/SplashScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import AddTransactionScreen from '../screens/customer/AddTransactionScreen';
import CategoryDetailsScreen from '../screens/customer/CategoryDetailsScreen';
import EditProfileScreen from '../screens/customer/EditProfileScreen';
import SecurityScreen from '../screens/customer/SecurityScreen';
import { AdminDrawer, CustomerDrawer } from './Drawers';

const Stack = createNativeStackNavigator();

/**
 * Stack (auth + detail screens) → Drawer (side menu) → Bottom Tabs (main screens).
 * The screen set switches on the signed-in user's role.
 */
export default function RootStack() {
  const { currentUser } = useApp();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      {!currentUser ? (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      ) : currentUser.role === 'admin' ? (
        <>
          <Stack.Screen name="AdminRoot" component={AdminDrawer} />
          <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="CustomerRoot" component={CustomerDrawer} />
          <Stack.Screen name="CategoryDetails" component={CategoryDetailsScreen} />
          <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Security" component={SecurityScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
