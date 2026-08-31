import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/common/themed-text';
import { ThemedView } from '@/components/common/themed-view';

type ToastState = {
  id: number;
  message: string;
};

type ToastContextValue = {
  showToast: (message: string) => void;
  setBottomOffset: (height: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const VISIBLE_DURATION_MS = 4000;
const GAP_ABOVE_BOTTOM_BAR = 12;

/** Renders error toasts above all screens, floating just above the focused screen's bottom bar (see useToastBottomInset). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [bottomOffset, setBottomOffset] = useState(0);
  const insets = useSafeAreaInsets();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setToast({ id: Date.now(), message });
    timeoutRef.current = setTimeout(() => setToast(null), VISIBLE_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const value = useMemo(() => ({ showToast, setBottomOffset }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          key={toast.id}
          entering={FadeInDown}
          exiting={FadeOutDown}
          pointerEvents="none"
          className="absolute inset-x-4 z-[1000]"
          style={{
            bottom: insets.bottom + bottomOffset + GAP_ABOVE_BOTTOM_BAR,
          }}
        >
          <ThemedView
            type="background-element"
            className="rounded-2xl px-4 py-3"
          >
            <ThemedText
              type="small"
              themeColor="destructive"
              className="text-center"
            >
              {toast.message}
            </ThemedText>
          </ThemedView>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return { showToast: context.showToast };
}

/** Lets the focused screen reserve space so the toast renders above its fixed bottom bar instead of overlapping it. */
export function useToastBottomInset(height: number) {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastBottomInset must be used within a ToastProvider');
  }
  const { setBottomOffset } = context;

  useEffect(() => {
    setBottomOffset(height);
    return () => setBottomOffset(0);
  }, [height, setBottomOffset]);
}
