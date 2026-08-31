import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { CartItem } from '@/types/order';

type OrderItemsSummaryProps = {
  items: CartItem[];
};

export function OrderItemsSummary({ items }: OrderItemsSummaryProps) {
  return (
    <>
      {items.map((item) => (
        <ThemedView key={`${item.beverageId}:${item.sizeId}`} className="flex-row justify-between py-0.5">
          <ThemedText type="small" className="flex-1 pr-2">
            {item.quantity} × {item.beverageName}{' '}
            <ThemedText type="small" themeColor="foreground-secondary">
              ({item.sizeLabel})
            </ThemedText>
          </ThemedText>
          <ThemedText type="small">${(item.unitPrice * item.quantity).toFixed(2)}</ThemedText>
        </ThemedView>
      ))}
    </>
  );
}
