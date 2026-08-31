import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

export type ThemedViewColor =
  'background' | 'background-element' | 'background-selected' | 'accent';

export type ThemedViewProps = ViewProps & {
  type?: ThemedViewColor;
  className?: string;
};

const colorClasses: Record<ThemedViewColor, string> = {
  background: 'bg-background',
  'background-element': 'bg-background-element',
  'background-selected': 'bg-background-selected',
  accent: 'bg-accent',
};

export function ThemedView({
  className,
  type = 'background',
  ...otherProps
}: ThemedViewProps) {
  return <View className={cn(colorClasses[type], className)} {...otherProps} />;
}
