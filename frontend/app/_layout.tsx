import '@/global.css';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toasts } from '@startlinks/react-native-toast';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { PortalHost } from '@rn-primitives/portal';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <Toasts />
        <PortalHost />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
