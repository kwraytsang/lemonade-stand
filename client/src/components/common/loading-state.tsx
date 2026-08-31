import { ActivityIndicator } from 'react-native';

import { ThemedView } from '@/components/common/themed-view';

export function LoadingState() {
  return (
    <ThemedView className="flex-1 items-center justify-center px-4">
      <ActivityIndicator />
    </ThemedView>
  );
}
