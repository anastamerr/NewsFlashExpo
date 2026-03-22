import React, { useEffect, useCallback, createContext, useContext, useState, useRef } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react-native';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets } from '@/theme/typography';
import { lightTap } from '@/utils/haptics';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastData {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const VARIANT_CONFIG: Record<ToastVariant, { icon: React.ComponentType<any>; color: string }> = {
  success: { icon: CheckCircle, color: '#00f700' },
  error: { icon: AlertTriangle, color: '#ff6b6b' },
  warning: { icon: AlertTriangle, color: '#ff9f43' },
  info: { icon: Info, color: '#8aa8ff' },
};

function ToastItem({ toast, onDismiss }: { toast: ToastData; onDismiss: (id: string) => void }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const config = VARIANT_CONFIG[toast.variant];
  const Icon = config.icon;

  useEffect(() => {
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 200 });

    const timer = setTimeout(() => {
      dismiss();
    }, toast.duration ?? 3000);

    return () => clearTimeout(timer);
  }, []);

  const dismiss = useCallback(() => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withSpring(-100, { damping: 15 }, () => {
      runOnJS(onDismiss)(toast.id);
    });
  }, [toast.id, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          top: insets.top + spacing.sm,
          backgroundColor: colors.surface,
          borderColor: config.color + '40',
        },
        animatedStyle,
      ]}
    >
      <Icon size={18} color={config.color} strokeWidth={2} />
      <Text style={[typePresets.bodySm, { color: colors.text, flex: 1 }]} numberOfLines={2}>
        {toast.message}
      </Text>
      <Pressable onPress={() => { lightTap(); dismiss(); }} hitSlop={8} accessibilityRole="button" accessibilityLabel="Dismiss notification">
        <X size={16} color={colors.textTertiary} strokeWidth={2} />
      </Pressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const counter = useRef(0);

  const show = useCallback((message: string, variant: ToastVariant = 'info', duration?: number) => {
    const id = `toast-${++counter.current}`;
    setToasts((prev) => [...prev.slice(-2), { id, message, variant, duration }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
      ))}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
});
