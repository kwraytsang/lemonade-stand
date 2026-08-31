import { Pressable } from 'react-native';

import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';

type QuantityStepperProps = {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
  size?: number;
};

export function QuantityStepper({ quantity, onDecrement, onIncrement, size = 32 }: QuantityStepperProps) {
  const buttonStyle = { width: size, height: size };

  return (
    <ThemedView className="flex-row items-center gap-2">
      <Pressable
        onPress={onDecrement}
        className="items-center justify-center rounded-full bg-background-selected"
        style={buttonStyle}>
        <ThemedText type="smallBold">-</ThemedText>
      </Pressable>
      <ThemedText type="smallBold" className="min-w-5 text-center">
        {quantity}
      </ThemedText>
      <Pressable
        onPress={onIncrement}
        className="items-center justify-center rounded-full bg-background-selected"
        style={buttonStyle}>
        <ThemedText type="smallBold">+</ThemedText>
      </Pressable>
    </ThemedView>
  );
}
