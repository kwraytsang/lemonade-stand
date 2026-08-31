import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { Colors } from '@/constants/theme';
import { useCart } from '@/context/cart-context';

export function CartButton() {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <Pressable onPress={() => router.push('/cart')}>
      <ThemedView
        type="background-element"
        className="flex-row items-center gap-1 rounded-2xl px-4 py-1"
      >
        <SymbolView
          name={{ ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' }}
          size={18}
          tintColor={theme.text}
        />
        {count > 0 ? (
          <ThemedView className="h-[18px] min-w-[18px] items-center justify-center rounded-full bg-foreground px-1">
            <ThemedText
              type="small"
              themeColor="background"
              className="font-bold"
            >
              {count}
            </ThemedText>
          </ThemedView>
        ) : null}
      </ThemedView>
    </Pressable>
  );
}
