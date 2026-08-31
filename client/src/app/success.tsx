import { router } from 'expo-router';
import { useEffect } from 'react';

import { LoadingState } from '@/components/common/loading-state';
import { PrimaryButton } from '@/components/common/primary-button';
import { ScreenLayout } from '@/components/common/screen-layout';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { useCart } from '@/context/cart-context';

export default function SuccessScreen() {
  const { confirmationNumber, customerName, customerContact, reset } =
    useCart();

  useEffect(() => {
    if (!confirmationNumber) {
      router.replace('/');
    }
  }, [confirmationNumber]);

  const handleStartOver = () => {
    reset();
    router.dismissAll();
  };

  if (!confirmationNumber) {
    return <LoadingState />;
  }

  return (
    <ScreenLayout
      edges={['bottom']}
      scroll
      contentContainerClassName="flex-1 items-center justify-center px-4"
    >
      <ThemedView
        type="background-selected"
        className="mb-4 h-16 w-16 items-center justify-center rounded-full"
      >
        <ThemedText className="text-[28px] font-bold">✓</ThemedText>
      </ThemedView>
      <ThemedText type="eyebrow" themeColor="foreground-secondary">
        Order confirmed
      </ThemedText>
      <ThemedText type="title" className="mt-1 text-center">
        You&apos;re all set.
      </ThemedText>
      <ThemedText
        themeColor="foreground-secondary"
        className="mt-4 text-center"
      >
        Thanks{customerName ? `, ${customerName}` : ''}. We&apos;ll reach out at{' '}
        {customerContact} when your order is ready.
      </ThemedText>

      <ThemedView
        type="background-element"
        className="mt-8 items-center gap-2 self-stretch rounded-3xl p-6"
      >
        <ThemedText type="eyebrow" themeColor="foreground-secondary">
          Confirmation number
        </ThemedText>
        <ThemedText className="font-mono text-[26px] font-bold tracking-[2px]">
          {confirmationNumber}
        </ThemedText>
      </ThemedView>

      <PrimaryButton
        label="Start a new order"
        onPress={handleStartOver}
        className="mt-8 self-stretch"
      />
    </ScreenLayout>
  );
}
