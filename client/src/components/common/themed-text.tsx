import { Platform, Text, type TextProps } from 'react-native';

import { cn } from '@/lib/cn';

export type ThemedTextType =
  | 'default'
  | 'title'
  | 'small'
  | 'smallBold'
  | 'subtitle'
  | 'linkPrimary'
  | 'eyebrow';

export type ThemedTextColor =
  | 'foreground'
  | 'foreground-secondary'
  | 'background'
  | 'destructive'
  | 'accent-foreground';

export type ThemedTextProps = TextProps & {
  type?: ThemedTextType;
  themeColor?: ThemedTextColor;
  className?: string;
};

const typeClasses: Record<ThemedTextType, string> = {
  default: 'text-base leading-6 font-medium',
  small: 'text-sm leading-5 font-medium',
  smallBold: 'text-sm leading-5 font-bold',
  title: 'font-serif text-[32px] leading-[38px] font-semibold',
  subtitle: 'font-serif text-xl leading-[26px] font-semibold',
  linkPrimary: 'text-sm leading-[30px] text-link',
  eyebrow: `font-mono text-[11px] leading-4 uppercase tracking-[1.5px] ${
    Platform.select({ android: 'font-bold' }) ?? 'font-semibold'
  }`,
};

const colorClasses: Record<ThemedTextColor, string> = {
  foreground: 'text-foreground',
  'foreground-secondary': 'text-foreground-secondary',
  background: 'text-background',
  destructive: 'text-destructive',
  'accent-foreground': 'text-accent-foreground',
};

export function ThemedText({
  className,
  type = 'default',
  themeColor = 'foreground',
  ...rest
}: ThemedTextProps) {
  return (
    <Text
      className={cn(colorClasses[themeColor], typeClasses[type], className)}
      {...rest}
    />
  );
}
