import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, useColorScheme } from 'react-native';

import { ThemedText, type ThemedTextColor } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';
import { Colors } from '@/constants/theme';

const DEFAULT_ACTION_ICON: SymbolViewProps['name'] = {
  ios: 'cup.and.saucer.fill',
  android: 'local_cafe',
  web: 'local_cafe',
};

type EmptyStateProps = {
  icon?: SymbolViewProps['name'];
  title: string;
  titleColor?: ThemedTextColor;
  message?: string;
  actionLabel?: string;
  actionIcon?: SymbolViewProps['name'];
  onAction?: () => void;
};

export function EmptyState({
  icon,
  title,
  titleColor = 'foreground-secondary',
  message,
  actionLabel,
  actionIcon = DEFAULT_ACTION_ICON,
  onAction,
}: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <ThemedView className="flex-1 items-center justify-center gap-2 px-4">
      {icon ? (
        <SymbolView
          name={icon}
          size={28}
          tintColor={titleColor === 'destructive' ? theme.destructive : theme.textSecondary}
          style={{ marginBottom: 4 }}
        />
      ) : null}
      <ThemedText themeColor={titleColor} className="text-center">
        {title}
      </ThemedText>
      {message ? (
        <ThemedText type="small" themeColor="foreground-secondary" className="text-center">
          {message}
        </ThemedText>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} className="mt-1 flex-row items-center gap-1.5">
          <SymbolView name={actionIcon} size={16} tintColor={theme.link} />
          <ThemedText type="linkPrimary" className="text-center">
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </ThemedView>
  );
}
