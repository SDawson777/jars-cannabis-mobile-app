import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { conciergeChat } from '../api/phase4Client';
import { logEvent } from '../utils/analytics';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp?: number;
  isOptimistic?: boolean; // For "bot is thinking..." messages
  error?: boolean; // For failed messages
}

const STORAGE_KEY = 'concierge_history';
const MAX_MESSAGES = 20;

export function useConcierge() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi, how can I assist you today?',
      sender: 'bot',
      timestamp: Date.now(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  // Load persisted messages on mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (error) {
        console.warn('Failed to load concierge history:', error);
      }
    };
    loadMessages();
  }, []);

  // Persist messages to AsyncStorage (last 20 exchanges)
  const persistMessages = useCallback(async (newMessages: Message[]) => {
    try {
      // Keep only last 20 messages (10 exchanges)
      const toStore = newMessages.slice(-MAX_MESSAGES);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.warn('Failed to persist concierge history:', error);
    }
  }, []);

  const sendMessage = useCallback(
    async (
      text: string
    ): Promise<{
      success: boolean;
      error?: { code?: string; message?: string; retryAfter?: number };
    }> => {
      if (!text.trim()) return { success: false };

      const userMsg: Message = {
        id: Date.now().toString(),
        text: text.trim(),
        sender: 'user',
        timestamp: Date.now(),
      };

      // Add optimistic "bot is thinking..." message
      const thinkingMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Bot is thinking...',
        sender: 'bot',
        timestamp: Date.now() + 1,
        isOptimistic: true,
      };

      const newMessages = [...messages, userMsg, thinkingMsg];
      setMessages(newMessages);
      setLoading(true);

      try {
        // Build history for API call (exclude optimistic messages)
        const history = messages
          .filter(m => !m.isOptimistic)
          .map(m => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          }));

        const res = await conciergeChat({ message: text.trim(), history });

        // Track analytics event for concierge message sent
        logEvent('concierge_message_sent', {
          messageLength: text.trim().length,
          hasHistory: history.length > 0,
          historySize: history.length,
          timestamp: Date.now(),
        });

        // Replace optimistic message with actual response
        const botMsg: Message = {
          id: (Date.now() + 2).toString(),
          text: res.reply || 'Sorry, I had trouble answering that.',
          sender: 'bot',
          timestamp: Date.now() + 2,
        };

        const finalMessages = [...messages, userMsg, botMsg];
        setMessages(finalMessages);
        await persistMessages(finalMessages);

        return { success: true };
      } catch (error: any) {
        // Track analytics event for concierge message error
        logEvent('concierge_message_error', {
          messageLength: text.trim().length,
          errorCode: error?.response?.status || error?.code || 'unknown',
          timestamp: Date.now(),
        });
        // Remove optimistic message and add error message
        const errorMsg: Message = {
          id: (Date.now() + 2).toString(),
          text: 'Failed to get response. Tap to retry.',
          sender: 'bot',
          timestamp: Date.now() + 2,
          error: true,
        };

        const finalMessages = [...messages, userMsg, errorMsg];
        setMessages(finalMessages);

        // Parse error details
        const errorDetails: { code?: string; message?: string; retryAfter?: number } = {};

        if (error?.response?.status === 429) {
          errorDetails.code = 'rate_limit';
          errorDetails.retryAfter = error.response.headers?.['retry-after']
            ? parseInt(error.response.headers['retry-after'])
            : 60;
          errorDetails.message = `Too many requests. Try again in ${errorDetails.retryAfter}s.`;
        } else if (error?.code === 'timeout') {
          errorDetails.code = 'timeout';
          errorDetails.message = 'Request timed out. Please try again.';
        } else if (!error?.response) {
          errorDetails.code = 'network';
          errorDetails.message = 'Network error. Check your connection.';
        } else {
          errorDetails.code = error?.response?.data?.error?.code || 'unknown';
          errorDetails.message = error?.response?.data?.error?.message || 'Something went wrong.';
        }

        return { success: false, error: errorDetails };
      } finally {
        setLoading(false);
      }
    },
    [messages, persistMessages]
  );

  const retryMessage = useCallback(
    async (text: string) => {
      // Remove the last error message before retrying
      const filteredMessages = messages.filter(m => !m.error);
      setMessages(filteredMessages);
      return sendMessage(text);
    },
    [messages, sendMessage]
  );

  const clearHistory = useCallback(async () => {
    const initialMessage: Message = {
      id: '1',
      text: 'Hi, how can I assist you today?',
      sender: 'bot',
      timestamp: Date.now(),
    };
    setMessages([initialMessage]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    messages,
    loading,
    sendMessage,
    retryMessage,
    clearHistory,
  };
}
