import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Modal, Pressable, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/common/primary-button';
import { QuantityStepper } from '@/components/common/quantity-stepper';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/cart-context';
import { BeverageType } from '@/types/beverage';

export function BeverageDetailModal({
  beverage,
  onClose,
}: {
  beverage: BeverageType;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const [selectedSizeId, setSelectedSizeId] = useState(beverage.sizes[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const selectedSize = beverage.sizes.find((size) => size.id === selectedSizeId);

  const handleAdd = () => {
    if (!selectedSize) return;
    addItem(
      {
        beverageId: beverage.id,
        beverageName: beverage.name,
        sizeId: selectedSize.id,
        sizeLabel: selectedSize.label,
        unitPrice: selectedSize.price,
      },
      quantity,
    );
    onClose();
  };

  return (
    <Modal animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
      <ThemedView
        className="absolute inset-x-0 bottom-0 gap-2 rounded-t-[32px] px-4 pt-4"
        style={{ paddingBottom: insets.bottom + 16 }}>
        <ThemedView className="mb-2 flex-row items-start justify-between">
          <ThemedView className="flex-1 gap-0.5 pr-4">
            <ThemedText type="subtitle">{beverage.name}</ThemedText>
            {beverage.description ? (
              <ThemedText type="small" themeColor="foreground-secondary">
                {beverage.description}
              </ThemedText>
            ) : null}
          </ThemedView>
          <Pressable accessibilityLabel="Close" onPress={onClose}>
            <SymbolView
              name={{ ios: 'xmark', android: 'close', web: 'close' }}
              size={20}
              tintColor={theme.textSecondary}
            />
          </Pressable>
        </ThemedView>

        <ThemedText type="smallBold" className="mt-2">
          Choose a size
        </ThemedText>
        <ThemedView className="gap-2">
          {beverage.sizes.map((size) => {
            const selected = size.id === selectedSizeId;
            return (
              <Pressable key={size.id} onPress={() => setSelectedSizeId(size.id)}>
                <ThemedView
                  type={selected ? 'accent' : 'background'}
                  className="flex-row items-center justify-between rounded-2xl border border-border px-4 py-4">
                  <ThemedText type="smallBold" themeColor={selected ? 'accent-foreground' : 'foreground'}>
                    {size.label}
                  </ThemedText>
                  <ThemedText type="small" themeColor={selected ? 'accent-foreground' : 'foreground-secondary'}>
                    ${size.price.toFixed(2)}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
        </ThemedView>

        <ThemedView className="mt-4 flex-row items-center justify-between">
          <ThemedText type="smallBold">Quantity</ThemedText>
          <QuantityStepper
            quantity={quantity}
            onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
            onIncrement={() => setQuantity((q) => q + 1)}
          />
        </ThemedView>

        <PrimaryButton
          label={`Add to order · $${((selectedSize?.price ?? 0) * quantity).toFixed(2)}`}
          onPress={handleAdd}
          disabled={!selectedSize}
          className="mt-6"
        />
      </ThemedView>
    </Modal>
  );
}
