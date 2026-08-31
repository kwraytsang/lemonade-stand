import { Pressable } from 'react-native';

import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { BeverageType } from '@/types/beverage';

export function BeverageRow({
  beverage,
  onSelect,
}: {
  beverage: BeverageType;
  onSelect: (beverage: BeverageType) => void;
}) {
  const fromPrice = beverage.sizes.length
    ? Math.min(...beverage.sizes.map((size) => size.price))
    : null;

  return (
    <Pressable onPress={() => onSelect(beverage)}>
      <ThemedView className="flex-row items-center gap-2 rounded-3xl border border-border p-4">
        <ThemedView className="flex-1 gap-0.5">
          <ThemedText type="subtitle">{beverage.name}</ThemedText>
          {beverage.description ? (
            <ThemedText
              type="small"
              themeColor="foreground-secondary"
              numberOfLines={2}
            >
              {beverage.description}
            </ThemedText>
          ) : null}
          {fromPrice !== null ? (
            <ThemedText
              type="small"
              themeColor="foreground-secondary"
              className="mt-1"
            >
              from ${fromPrice.toFixed(2)}
            </ThemedText>
          ) : null}
        </ThemedView>
        <ThemedText type="title" className="opacity-30">
          ›
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}
