import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl } from 'react-native';

import { BeverageDetailModal } from '@/components/beverages/beverage-detail-modal';
import { BeverageRow } from '@/components/beverages/beverage-row';
import { CartButton } from '@/components/cart/cart-button';
import { EmptyState } from '@/components/common/empty-state';
import { LoadingState } from '@/components/common/loading-state';
import { ScreenLayout } from '@/components/common/screen-layout';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { BottomTabInset } from '@/constants/theme';
import { useCart } from '@/context/cart-context';
import { useBeverages } from '@/hooks/use-beverages';
import { BeverageType } from '@/types/beverage';

export default function MenuScreen() {
  const { beverages, loading, refreshing, error, refetch } = useBeverages();
  const { items, total } = useCart();
  const [selectedBeverage, setSelectedBeverage] = useState<BeverageType | null>(null);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ScreenLayout
      edges={['bottom']}
      bottomBar={
        itemCount > 0 ? (
          <ThemedView className="px-4 pt-2">
            <Pressable
              onPress={() => router.push('/cart')}
              className="flex-row items-center justify-between rounded-2xl bg-accent px-4 py-4">
              <ThemedText type="smallBold" themeColor="accent-foreground">
                View order · {itemCount}
              </ThemedText>
              <ThemedText type="smallBold" themeColor="accent-foreground">
                ${total.toFixed(2)}
              </ThemedText>
            </Pressable>
          </ThemedView>
        ) : null
      }>
      <Stack.Screen options={{ headerRight: () => <CartButton /> }} />
      {loading ? (
        <LoadingState />
      ) : error ? (
        <EmptyState
          icon={{ ios: 'exclamationmark.triangle', android: 'error_outline', web: 'error_outline' }}
          title={error}
          titleColor="destructive"
          actionLabel="Try again"
          actionIcon={{ ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' }}
          onAction={() => {
            console.log('TRY_AGAIN_PRESSED_DEBUG');
            refetch();
          }}
        />
      ) : (
        <FlatList
          data={beverages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BeverageRow beverage={item} onSelect={setSelectedBeverage} />}
          ListHeaderComponent={
            <ThemedView className="mb-2 gap-1">
              <ThemedText type="eyebrow" themeColor="foreground-secondary">
                Today&apos;s menu
              </ThemedText>
              <ThemedText type="title">Pick your pour</ThemedText>
            </ThemedView>
          }
          ListEmptyComponent={
            <EmptyState title="No drinks on the menu right now." message="Check back soon, or pull down to refresh." />
          }
          contentContainerStyle={{ paddingBottom: BottomTabInset + 16, flexGrow: 1 }}
          contentContainerClassName="gap-4 px-4 pt-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => refetch()} tintColorClassName="accent-foreground" />
          }
        />
      )}

      {selectedBeverage ? (
        <BeverageDetailModal beverage={selectedBeverage} onClose={() => setSelectedBeverage(null)} />
      ) : null}
    </ScreenLayout>
  );
}
