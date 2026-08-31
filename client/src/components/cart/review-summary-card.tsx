import type { ReactNode } from 'react';
import { Pressable } from 'react-native';

import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';

type ReviewSummaryCardProps = {
  title: string;
  onEdit: () => void;
  children: ReactNode;
};

export function ReviewSummaryCard({
  title,
  onEdit,
  children,
}: ReviewSummaryCardProps) {
  return (
    <ThemedView className="gap-1 rounded-2xl border border-border p-4">
      <ThemedView className="mb-1 flex-row items-center justify-between">
        <ThemedText type="eyebrow" themeColor="foreground-secondary">
          {title}
        </ThemedText>
        <Pressable onPress={onEdit}>
          <ThemedText type="linkPrimary">Edit</ThemedText>
        </Pressable>
      </ThemedView>
      {children}
    </ThemedView>
  );
}
