import { router } from 'expo-router';

import { CartLineItem } from '@/components/cart/cart-line-item';
import { EmptyState } from '@/components/common/empty-state';
import { PrimaryButton } from '@/components/common/primary-button';
import { ScreenLayout } from '@/components/common/screen-layout';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useCart } from '@/context/cart-context';

export default function CartScreen() {
  const { items, updateQuantity, removeItem, total } = useCart();

  return (
    <ScreenLayout
      edges={['bottom']}
      scroll
      contentContainerClassName="gap-4 px-4 pt-4 pb-4"
      bottomBar={
        items.length > 0 ? (
          <ThemedView className="px-4 pt-2">
            <PrimaryButton
              label="Continue"
              onPress={() => router.push('/details')}
            />
          </ThemedView>
        ) : null
      }
    >
      <ThemedText type="eyebrow" themeColor="foreground-secondary">
        Step 1 of 3
      </ThemedText>

      {items.length === 0 ? (
        <EmptyState
          title="Your order is empty."
          actionLabel="Browse the menu"
          onAction={() => router.dismissTo('/')}
        />
      ) : (
        <>
          <ThemedView className="gap-2">
            {items.map((item) => (
              <CartLineItem
                key={`${item.beverageId}:${item.sizeId}`}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </ThemedView>

          <ThemedView className="flex-row justify-between border-t border-border pt-4">
            <ThemedText type="subtitle">Total</ThemedText>
            <ThemedText type="subtitle">${total.toFixed(2)}</ThemedText>
          </ThemedView>
        </>
      )}
    </ScreenLayout>
  );
}
