import { router } from 'expo-router';
import { useEffect } from 'react';

import { PrimaryButton } from '@/components/common/primary-button';
import { OrderItemsSummary } from '@/components/cart/order-items-summary';
import { ReviewSummaryCard } from '@/components/cart/review-summary-card';
import { LoadingState } from '@/components/common/loading-state';
import { ScreenLayout } from '@/components/common/screen-layout';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useToast } from '@/components/common/toast';
import { useCart } from '@/context/cart-context';

export default function ReviewScreen() {
  const {
    items,
    total,
    customerName,
    contactMethod,
    customerContact,
    submitting,
    submitError,
    confirmationNumber,
    placeOrder,
  } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    if (confirmationNumber) {
      router.replace('/success');
    } else if (items.length === 0) {
      router.replace('/cart');
    } else if (!customerName.trim()) {
      router.replace('/details');
    }
  }, [confirmationNumber, items.length, customerName]);

  useEffect(() => {
    if (submitError) {
      showToast(submitError);
    }
  }, [submitError, showToast]);

  if (!confirmationNumber && (items.length === 0 || !customerName.trim())) {
    return <LoadingState />;
  }

  return (
    <ScreenLayout
      edges={['bottom']}
      scroll
      contentContainerClassName="gap-4 px-4 pt-4 pb-4"
      bottomBar={
        <ThemedView className="px-4 pt-2">
          <PrimaryButton
            label="Place order"
            onPress={placeOrder}
            loading={submitting}
          />
        </ThemedView>
      }
    >
      <ThemedText type="eyebrow" themeColor="foreground-secondary">
        Step 3 of 3
      </ThemedText>
      <ThemedText themeColor="foreground-secondary">
        One last look before we send it through.
      </ThemedText>

      <ReviewSummaryCard
        title="Order items"
        onEdit={() => router.dismissTo('/cart')}
      >
        <OrderItemsSummary items={items} />
      </ReviewSummaryCard>

      <ReviewSummaryCard
        title="Contact details"
        onEdit={() => router.dismissTo('/details')}
      >
        <ThemedText type="smallBold">{customerName}</ThemedText>
        <ThemedText type="small" themeColor="foreground-secondary">
          {contactMethod === 'phone' ? 'Phone' : 'Email'} · {customerContact}
        </ThemedText>
      </ReviewSummaryCard>

      <ThemedView className="flex-row justify-between pt-2">
        <ThemedText type="subtitle">Total</ThemedText>
        <ThemedText type="subtitle">${total.toFixed(2)}</ThemedText>
      </ThemedView>
    </ScreenLayout>
  );
}
