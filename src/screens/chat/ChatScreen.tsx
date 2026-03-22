import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Send, Bot, User, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, spacing, radius } from '@/theme';
import { typePresets, fontFamily } from '@/theme/typography';
import { GlassCard } from '@/components/ui/GlassCard';
import { Chip } from '@/components/ui/Chip';
import { MOCK_CHAT_ASSISTANTS } from '@/constants/mockData';
import type { ChatMessage } from '@/types/api';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ChatScreen({ visible, onClose }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedAssistant, setSelectedAssistant] = useState(MOCK_CHAT_ASSISTANTS[0]);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: `Based on my analysis as your ${selectedAssistant.name}, ${input.trim().toLowerCase().includes('sentiment') ? 'the overall sentiment across your tracked entities shows a mixed picture with banking sector trending positive while macro indicators remain cautious.' : 'I can provide detailed insights on this topic. The current market conditions suggest careful monitoring of key indicators and sector-specific developments.'}`,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [input, selectedAssistant]);

  const handleSuggestedQuestion = useCallback((question: string) => {
    setInput(question);
  }, []);

  if (!visible) return null;

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isUser = item.role === 'user';
    return (
      <Animated.View
        entering={FadeInUp.delay(50).springify()}
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowAI,
        ]}
      >
        {!isUser && (
          <View style={[styles.messageAvatar, { backgroundColor: colors.primary + '20' }]}>
            <Bot size={16} color={colors.primary} strokeWidth={2} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser
              ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
              : { backgroundColor: colors.surface, borderBottomLeftRadius: 4 },
          ]}
        >
          <Text
            style={[
              typePresets.body,
              { color: isUser ? colors.textInverse : colors.text },
            ]}
          >
            {item.content}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.headerInfo}>
          <View style={[styles.headerIcon, { backgroundColor: colors.primary + '20' }]}>
            <Bot size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <View>
            <Text style={[typePresets.h3, { color: colors.text }]}>{selectedAssistant.name}</Text>
            <Text style={[typePresets.labelSm, { color: colors.textTertiary }]}>{selectedAssistant.description}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close chat">
          <X size={22} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[typePresets.h2, { color: colors.text, textAlign: 'center' }]}>
            Ask me anything
          </Text>
          <Text style={[typePresets.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
            I can help with market analysis, news summaries, and sentiment insights
          </Text>
          <View style={styles.suggestions}>
            {selectedAssistant.suggestedQuestions.map((q) => (
              <Animated.View key={q} entering={FadeInDown.delay(100).springify()}>
                <GlassCard style={styles.suggestionCard}>
                  <TouchableOpacity onPress={() => handleSuggestedQuestion(q)}>
                    <Text style={[typePresets.bodySm, { color: colors.text }]}>{q}</Text>
                  </TouchableOpacity>
                </GlassCard>
              </Animated.View>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={[styles.inputRow, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.sm }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor={colors.textTertiary}
            accessibilityLabel="Chat message input"
            style={[styles.textInput, { color: colors.text, backgroundColor: colors.inputBackground, fontFamily: fontFamily.sans }]}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim()}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: !input.trim() }}
            style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.muted }]}
          >
            <Send size={18} color={input.trim() ? colors.textInverse : colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  suggestions: {
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  suggestionCard: {},
  messageList: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    maxWidth: '85%',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
  },
  messageRowAI: {
    alignSelf: 'flex-start',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  messageBubble: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    maxWidth: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
