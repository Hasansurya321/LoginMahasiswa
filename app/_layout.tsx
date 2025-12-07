import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
