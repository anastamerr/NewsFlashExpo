import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useSession } from '../../store/session';
import { palette, radii, shadows, spacing, typography } from '../../theme/tokens';

/* ────────────────────────────────────────────────────── */

export function LoginScreen() {
  const { isBusy, signIn } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  /* ── refs for field chaining ── */
  const passwordRef = useRef<TextInput>(null);

  /* ── staggered entrance animations ── */
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(180, [
      Animated.timing(bannerAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 520,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  /* ── derived state ── */
  const canSubmit = email.trim().length > 0 && password.length > 0;

  /* ── handlers ── */
  async function handleSignIn() {
    if (!canSubmit || isBusy) return;
    Keyboard.dismiss();
    setError(null);

    try {
      await signIn(email.trim(), password);
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Unable to sign in');
    }
  }

  /* ── animation helpers ── */
  function fadeSlide(anim: Animated.Value) {
    return {
      opacity: anim,
      transform: [
        {
          translateY: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
        },
      ],
    };
  }

  /* ── render ── */
  return (
    <View style={styles.root}>
      {/* Gradient background for depth */}
      <LinearGradient
        colors={['#0a0c0f', '#111317', '#161a21', '#111317']}
        locations={[0, 0.35, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', default: 'height' })}
          keyboardVerticalOffset={Platform.select({ ios: 10, default: 0 })}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Pressable style={styles.frame} onPress={Keyboard.dismiss}>
              {/* ── Banner ── */}
              <Animated.View style={[styles.banner, fadeSlide(bannerAnim)]}>
                <View style={styles.bannerAccent} />

                <Text style={styles.bannerEyebrow}>NEWSFLASH / MARKET DESK</Text>
                <Text style={styles.bannerTitle}>
                  Intelligence, ranked{'\n'}and ready for action.
                </Text>
                <Text style={styles.bannerCopy}>
                  Authenticate to enter your monitoring workspace.
                </Text>
              </Animated.View>

              {/* ── Sign-in card ── */}
              <Animated.View style={[styles.card, fadeSlide(cardAnim)]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="shield-checkmark-outline" size={16} color={palette.emerald} />
                  <Text style={styles.cardEyebrow}>SECURE ACCESS</Text>
                </View>
                <Text style={styles.cardTitle}>Sign in</Text>
                <Text style={styles.helper}>Use your Newsflash admin credentials.</Text>

                {/* Email field */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>EMAIL</Text>
                  <View
                    style={[
                      styles.inputRow,
                      focusedField === 'email' && styles.inputRowFocused,
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={focusedField === 'email' ? palette.emerald : palette.inkSoft}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      blurOnSubmit={false}
                      keyboardType="email-address"
                      onChangeText={setEmail}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={() => passwordRef.current?.focus()}
                      placeholder="analyst@newsflash.ai"
                      placeholderTextColor={`${palette.inkSoft}88`}
                      returnKeyType="next"
                      style={styles.input}
                      textContentType="emailAddress"
                      value={email}
                    />
                  </View>
                </View>

                {/* Password field */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>PASSWORD</Text>
                  <View
                    style={[
                      styles.inputRow,
                      focusedField === 'password' && styles.inputRowFocused,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={focusedField === 'password' ? palette.emerald : palette.inkSoft}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      ref={passwordRef}
                      autoComplete="password"
                      onChangeText={setPassword}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      onSubmitEditing={() => void handleSignIn()}
                      placeholder="Enter password"
                      placeholderTextColor={`${palette.inkSoft}88`}
                      returnKeyType="go"
                      secureTextEntry={!showPassword}
                      style={styles.input}
                      textContentType="password"
                      value={password}
                    />
                    <Pressable
                      onPress={() => setShowPassword((v) => !v)}
                      hitSlop={14}
                      style={styles.eyeToggle}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={palette.inkSoft}
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Error */}
                {error ? (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={16} color={palette.rose} />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* CTA */}
                <Pressable
                  onPress={handleSignIn}
                  disabled={!canSubmit || isBusy}
                  style={({ pressed }) => [
                    styles.cta,
                    !canSubmit && styles.ctaDisabled,
                    pressed && canSubmit && !isBusy && styles.ctaPressed,
                  ]}
                >
                  {isBusy ? (
                    <ActivityIndicator color={palette.canvas} />
                  ) : (
                    <Text style={[styles.ctaLabel, !canSubmit && styles.ctaLabelDisabled]}>
                      Enter Workspace
                    </Text>
                  )}
                </Pressable>
              </Animated.View>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

/* ────────────────────────────────────────────────────── */

const INPUT_HEIGHT = 52;

const styles = StyleSheet.create({
  /* ── layout ── */
  root: {
    flex: 1,
    backgroundColor: palette.background,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  frame: {
    gap: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },

  /* ── banner ── */
  banner: {
    backgroundColor: palette.canvas,
    borderColor: palette.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    padding: spacing.lg,
  },
  bannerAccent: {
    backgroundColor: palette.emerald,
    borderTopLeftRadius: radii.lg,
    borderBottomLeftRadius: radii.lg,
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: 3,
  },
  bannerEyebrow: {
    color: palette.emerald,
    fontFamily: typography.monoBold,
    fontSize: 13,
    letterSpacing: 2.5,
    marginLeft: spacing.xs,
  },
  bannerTitle: {
    color: palette.white,
    fontFamily: typography.serifBold,
    fontSize: 36,
    lineHeight: 42,
    marginLeft: spacing.xs,
    marginTop: spacing.md,
  },
  bannerCopy: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 16,
    lineHeight: 24,
    marginLeft: spacing.xs,
    marginTop: spacing.sm,
  },

  /* ── card ── */
  card: {
    backgroundColor: palette.panel,
    borderColor: palette.line,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    ...shadows.soft,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  cardEyebrow: {
    color: palette.inkSoft,
    fontFamily: typography.monoBold,
    fontSize: 12,
    letterSpacing: 1.6,
  },
  cardTitle: {
    color: palette.ink,
    fontFamily: typography.serifBold,
    fontSize: 30,
    marginTop: spacing.xs,
  },
  helper: {
    color: palette.inkSoft,
    fontFamily: typography.serif,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xs,
  },

  /* ── fields ── */
  fieldGroup: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  label: {
    color: palette.ink,
    fontFamily: typography.monoBold,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  inputRow: {
    alignItems: 'center',
    backgroundColor: palette.canvasMuted,
    borderColor: palette.lineStrong,
    borderRadius: radii.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    minHeight: INPUT_HEIGHT,
    paddingHorizontal: spacing.md,
  },
  inputRowFocused: {
    backgroundColor: palette.canvas,
    borderColor: palette.emerald,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    color: palette.ink,
    flex: 1,
    fontFamily: typography.mono,
    fontSize: 16,
    paddingVertical: Platform.select({ ios: 14, default: 12 }),
  },
  eyeToggle: {
    marginLeft: spacing.sm,
    padding: 4,
  },

  /* ── error ── */
  errorBanner: {
    alignItems: 'center',
    backgroundColor: palette.roseSoft,
    borderRadius: radii.sm,
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorText: {
    color: palette.rose,
    flex: 1,
    fontFamily: typography.mono,
    fontSize: 14,
    lineHeight: 20,
  },

  /* ── cta ── */
  cta: {
    alignItems: 'center',
    backgroundColor: palette.emerald,
    borderRadius: radii.pill,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: 54,
  },
  ctaDisabled: {
    opacity: 0.35,
  },
  ctaPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  ctaLabel: {
    color: palette.canvas,
    fontFamily: typography.monoBold,
    fontSize: 15,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  ctaLabelDisabled: {
    opacity: 0.7,
  },
});
