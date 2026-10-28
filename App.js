import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from './src/components/Toast';
import { AppProvider, useApp } from './src/context/AppContext';
import RootStack from './src/navigation/RootStack';
import { colors } from './src/theme';

// Remounts the navigator when the theme changes so every screen re-reads the palette,
// while restoring the current navigation state so the user stays on the same screen.
function ThemedNavigation() {
  const { themeMode } = useApp();
  const navState = useRef(undefined);
  const base = themeMode === 'dark' ? DarkTheme : DefaultTheme;
  const theme = { ...base, colors: { ...base.colors, background: colors.honeydew, card: colors.surface, primary: colors.primary } };

  return (
    <>
      <NavigationContainer key={themeMode} theme={theme} initialState={navState.current} onStateChange={(s) => (navState.current = s)}>
        <RootStack />
      </NavigationContainer>
      <Toast />
    </>
  );
}

export default function App() {
  const [loaded, error] = useFonts({ Poppins_300Light, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold, Poppins_700Bold });

  if (!loaded && !error) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }}>
        <ActivityIndicator color={colors.white} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <ThemedNavigation />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
