import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
} from 'react-native';

import { ThemedText } from '@/components/common/themed-text';
import { cn } from '@/lib/cn';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  style?: PressableProps['style'];
};

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  className,
  style,
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        'items-center rounded-2xl bg-accent py-4',
        loading && 'opacity-60',
        className,
      )}
      style={style}
    >
      {loading ? (
        <ActivityIndicator colorClassName="text-accent-foreground" />
      ) : (
        <ThemedText type="smallBold" themeColor="accent-foreground">
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}
