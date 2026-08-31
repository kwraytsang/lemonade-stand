import { useIsFocused } from 'expo-router';
import { useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  type LayoutChangeEvent,
  type ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/common/themed-view';
import { useToastBottomInset } from '@/components/common/toast';

type ScreenLayoutProps = {
  children: ReactNode;
  edges?: Edge[];
  safeAreaClassName?: string;
  scroll?: boolean;
  contentContainerClassName?: string;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  keyboardAvoiding?: boolean;
  bottomBar?: ReactNode;
};

const DEFAULT_EDGES: Edge[] = ['top', 'right', 'bottom', 'left'];

export function ScreenLayout({
  children,
  edges = DEFAULT_EDGES,
  safeAreaClassName = 'flex-1 self-stretch',
  scroll = false,
  contentContainerClassName,
  keyboardShouldPersistTaps,
  keyboardAvoiding = false,
  bottomBar,
}: ScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [bottomBarHeight, setBottomBarHeight] = useState(0);

  useToastBottomInset(isFocused && bottomBar ? bottomBarHeight : 0);

  const handleBottomBarLayout = (event: LayoutChangeEvent) => {
    setBottomBarHeight(event.nativeEvent.layout.height);
  };

  const content = scroll ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={contentContainerClassName}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  const bottomBarNode = bottomBar ? (
    <View onLayout={handleBottomBarLayout}>{bottomBar}</View>
  ) : null;

  // Pinned outside the ScrollView so it sits at the bottom at rest; when
  // keyboardAvoiding is set, it's still inside the KeyboardAvoidingView, so it
  // rises with the keyboard instead of staying fixed behind it.
  const body = keyboardAvoiding ? (
    <KeyboardAvoidingView
      className="flex-1 self-stretch"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {content}
      {bottomBarNode}
    </KeyboardAvoidingView>
  ) : (
    <>
      {content}
      {bottomBarNode}
    </>
  );

  const safeAreaStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
  };

  const safeArea = (
    <View className={safeAreaClassName} style={safeAreaStyle}>
      {body}
    </View>
  );

  return <ThemedView className="flex-1">{safeArea}</ThemedView>;
}
