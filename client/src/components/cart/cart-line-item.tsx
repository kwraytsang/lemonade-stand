import { SymbolView } from 'expo-symbols';
import { Pressable, useColorScheme } from 'react-native';

import { QuantityStepper } from '@/components/common/quantity-stepper';
import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { Colors } from '@/constants/theme';
import { CartItem } from '@/types/order';

type CartLineItemProps = {
  item: CartItem;
  onUpdateQuantity: (
    beverageId: string,
    sizeId: string,
    quantity: number,
  ) => void;
  onRemove: (beverageId: string, sizeId: string) => void;
};

export function CartLineItem({
  item,
  onUpdateQuantity,
  onRemove,
}: CartLineItemProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <ThemedView className="flex-row items-center justify-between gap-2 rounded-2xl border border-border p-4">
      <ThemedView className="flex-1 gap-0.5">
        <ThemedText type="smallBold">{item.beverageName}</ThemedText>
        <ThemedText type="small" themeColor="foreground-secondary">
          {item.sizeLabel} · ${item.unitPrice.toFixed(2)} each
        </ThemedText>
      </ThemedView>

      <QuantityStepper
        quantity={item.quantity}
        onDecrement={() =>
          onUpdateQuantity(item.beverageId, item.sizeId, item.quantity - 1)
        }
        onIncrement={() =>
          onUpdateQuantity(item.beverageId, item.sizeId, item.quantity + 1)
        }
        size={28}
      />

      <ThemedText type="smallBold" className="min-w-14 text-right">
        ${(item.unitPrice * item.quantity).toFixed(2)}
      </ThemedText>

      <Pressable
        accessibilityLabel="Remove item"
        onPress={() => onRemove(item.beverageId, item.sizeId)}
      >
        <SymbolView
          name={{ ios: 'trash', android: 'delete', web: 'delete' }}
          size={20}
          tintColor={theme.destructive}
        />
      </Pressable>
    </ThemedView>
  );
}
