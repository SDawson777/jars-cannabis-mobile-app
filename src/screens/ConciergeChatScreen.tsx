// src/screens/ConciergeChatScreen.tsx
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Send, RefreshCw } from 'lucide-react-native';
import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Alert,
  ToastAndroid,
} from 'react-native';

import { ThemeContext } from '../context/ThemeContext';
import { useConcierge } from '../hooks/useConcierge';
import { useAiBudtender } from '../hooks/useAI';
import type { RootStackParamList } from '../navigation/types';
import { hapticLight, hapticMedium } from '../utils/haptic';
import { useTranslation } from '../i18n/useTranslation';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp?: number;
  isOptimistic?: boolean;
  error?: boolean;
}

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type ChatNavProp = NativeStackNavigationProp<RootStackParamList, 'ConciergeChat'>;

export default function ConciergeChatScreen() {
  const navigation = useNavigation<ChatNavProp>();
  const { colorTemp, brandPrimary, brandSecondary, brandBackground } = useContext(ThemeContext);
  const { messages, loading, sendMessage, retryMessage } = useConcierge();
  const aiBudtenderMutation = useAiBudtender();
  const { t } = useTranslation();

  const bgColor =
    colorTemp === 'warm' ? '#FAF8F4' : colorTemp === 'cool' ? '#F7F9FA' : brandBackground;

  const [input, setInput] = useState('');
  const [lastUserMessage, setLastUserMessage] = useState('');
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(t('concierge.notice'), message);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    hapticMedium();

    const messageText = input.trim();
    setLastUserMessage(messageText);
    setInput('');

    const result = await sendMessage(messageText);

    if (!result.success && result.error) {
      const { code, message: errorMessage, retryAfter } = result.error;

      if (code === 'rate_limit' && retryAfter) {
        showToast(t('concierge.rateLimitError', { seconds: retryAfter }));
      } else if (code === 'timeout') {
        showToast(t('concierge.timeoutError'));
      } else if (code === 'network') {
        showToast(t('concierge.networkError'));
      } else {
        showToast(errorMessage || t('concierge.genericError'));
      }
    }
  };

  const handleRetry = async () => {
    if (!lastUserMessage || loading) return;

    hapticMedium();
    const result = await retryMessage(lastUserMessage);

    if (!result.success && result.error) {
      showToast(result.error.message || t('concierge.retryError'));
    }
  };

  const handleBack = () => {
    hapticLight();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    navigation.goBack();
  };

  const handleQuickPrompt = async (prompt: string) => {
    hapticMedium();

    try {
      const _response = await aiBudtenderMutation.mutateAsync({
        message: prompt,
        userId: 'user123', // In a real app, this would come from auth
      });

      // Add the user message to the chat
      setInput('');

      // Add both user message and AI response to regular chat
      // This integrates with the existing concierge system
      await sendMessage(prompt);

      // Note: The AI response from the budtender could be integrated here
      // For now, it uses the existing concierge flow
    } catch (_error) {
      showToast(t('concierge.aiBudtenderUnavailable'));
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: bgColor }]}
      testID="concierge-chat-screen"
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: brandSecondary }]}>
          <Pressable onPress={handleBack}>
            <Send color={brandPrimary} size={24} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.headerTitle, { color: brandPrimary }]}>
              {t('concierge.title')}
            </Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* Messages */}
        <FlatList
          testID="chat-messages"
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatContainer}
          renderItem={({ item }) => (
            <View
              testID={item.sender === 'bot' ? 'bot-message' : 'user-message'}
              style={[
                styles.messageBubble,
                item.sender === 'user'
                  ? [styles.userBubble, { backgroundColor: brandPrimary }]
                  : [
                      styles.botBubble,
                      {
                        backgroundColor: item.error ? '#ffebee' : brandBackground,
                        borderColor: item.error ? '#f44336' : 'transparent',
                        borderWidth: item.error ? 1 : 0,
                      },
                    ],
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.sender === 'user'
                    ? { color: '#FFFFFF' }
                    : {
                        color: item.error ? '#f44336' : brandPrimary,
                        fontStyle: item.isOptimistic ? 'italic' : 'normal',
                      },
                ]}
              >
                {item.text}
              </Text>
              {item.error && (
                <Pressable style={styles.retryButton} onPress={handleRetry}>
                  <RefreshCw size={16} color="#f44336" />
                  <Text style={[styles.retryText, { color: '#f44336' }]}>Retry</Text>
                </Pressable>
              )}
            </View>
          )}
        />

        {loading && (
          <Text style={[styles.statusText, { color: brandSecondary }]}>
            {t('concierge.botTyping')}
          </Text>
        )}

        {/* AI Budtender Quick Prompts */}
        <View style={styles.quickPromptsContainer}>
          <Text style={[styles.quickPromptsTitle, { color: brandPrimary }]}>
            {t('concierge.quickPromptsTitle')}
          </Text>
          <View style={styles.quickPromptsGrid}>
            <Pressable
              style={[styles.quickPromptButton, { backgroundColor: brandSecondary }]}
              onPress={() => handleQuickPrompt('Recommend something for sleep')}
            >
              <Text style={[styles.quickPromptText, { color: brandPrimary }]}>
                💤 {t('concierge.quick.sleep')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.quickPromptButton, { backgroundColor: brandSecondary }]}
              onPress={() => handleQuickPrompt("I'm new to cannabis, where do I start?")}
            >
              <Text style={[styles.quickPromptText, { color: brandPrimary }]}>
                🌱 {t('concierge.quick.beginner')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.quickPromptButton, { backgroundColor: brandSecondary }]}
              onPress={() => handleQuickPrompt('What helps with stress and anxiety?')}
            >
              <Text style={[styles.quickPromptText, { color: brandPrimary }]}>
                😌 {t('concierge.quick.stress')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.quickPromptButton, { backgroundColor: brandSecondary }]}
              onPress={() => handleQuickPrompt('Something for energy and focus?')}
            >
              <Text style={[styles.quickPromptText, { color: brandPrimary }]}>
                ⚡ {t('concierge.quick.energy')}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Input */}
        <View
          style={[
            styles.inputRow,
            { borderTopColor: brandSecondary, backgroundColor: brandBackground },
          ]}
        >
          <TextInput
            testID="message-input"
            style={[styles.input, { backgroundColor: brandBackground, color: brandPrimary }]}
            placeholder={t('concierge.placeholder')}
            placeholderTextColor={brandSecondary}
            value={input}
            onChangeText={text => {
              hapticLight();
              setInput(text);
            }}
          />
          <Pressable
            testID="send-button"
            style={[
              styles.sendButton,
              { backgroundColor: brandPrimary, opacity: loading ? 0.5 : 1 },
            ]}
            onPress={handleSendMessage}
            disabled={loading}
          >
            <Send size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  chatContainer: { padding: 16, paddingBottom: 80 },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  userBubble: { alignSelf: 'flex-end' },
  botBubble: {
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  inputRow: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 15,
    marginRight: 8,
  },
  sendButton: {
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: { textAlign: 'center', marginBottom: 8 },
  error: { textAlign: 'center', marginBottom: 8 },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
  },
  retryText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  quickPromptsContainer: {
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  quickPromptsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickPromptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickPromptButton: {
    width: '48%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  quickPromptText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
