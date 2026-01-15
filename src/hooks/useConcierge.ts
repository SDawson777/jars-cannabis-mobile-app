import { useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { conciergeChat, phase4Client } from '../api/phase4Client';
import { clientGet, clientPost } from '../api/http';
import { logEvent } from '../utils/analytics';

// ============================================
// Types
// ============================================

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp?: number;
  isOptimistic?: boolean; // For "bot is thinking..." messages
  error?: boolean; // For failed messages
  metadata?: {
    tokens?: number;
    latency?: number;
    sources?: KnowledgeSource[];
  };
}

export interface KnowledgeSource {
  type: 'strain_guide' | 'usage_guideline' | 'legal_info' | 'product_info' | 'faq';
  title: string;
  url?: string;
  confidence: number;
}

export interface ConversationContext {
  userId?: string;
  preferredStrainType?: 'indica' | 'sativa' | 'hybrid';
  experienceLevel?: 'beginner' | 'intermediate' | 'experienced';
  medicalConditions?: string[];
  recentProducts?: string[];
  location?: string;
}

export interface StreamingState {
  isStreaming: boolean;
  partialContent: string;
  isComplete: boolean;
}

export interface ChatSession {
  id: string;
  title?: string;
  messages: Message[];
  context?: ConversationContext;
  createdAt: string;
  updatedAt: string;
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

// ============================================
// Streaming Chat Hook
// ============================================

const SESSIONS_KEY = '@nimbus/chat_sessions';

/**
 * Enhanced streaming chat hook with context retention
 */
export function useStreamingChat() {
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    partialContent: '',
    isComplete: true,
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const sendStreamingMessage = useCallback(async (content: string, context?: ConversationContext) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: content,
      sender: 'user',
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setStreamingState({ isStreaming: true, partialContent: '', isComplete: false });

    logEvent('concierge_streaming_started', { sessionId, messageLength: content.length });

    try {
      const response = await fetch(`${phase4Client.defaults.baseURL}/concierge/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...phase4Client.defaults.headers as Record<string, string>,
        },
        body: JSON.stringify({
          message: content,
          sessionId,
          history: messages.slice(-10).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
          context,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                setStreamingState(prev => ({ ...prev, isComplete: true, isStreaming: false }));
              } else {
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    fullContent += parsed.content;
                    setStreamingState(prev => ({ ...prev, partialContent: fullContent }));
                  }
                } catch {
                  fullContent += data;
                  setStreamingState(prev => ({ ...prev, partialContent: fullContent }));
                }
              }
            }
          }
        }

        const botMessage: Message = {
          id: `msg-${Date.now()}`,
          text: fullContent,
          sender: 'bot',
          timestamp: Date.now(),
        };

        setMessages([...newMessages, botMessage]);
        logEvent('concierge_streaming_completed', { sessionId });
      } else {
        const data = await response.json();
        const botMessage: Message = {
          id: `msg-${Date.now()}`,
          text: data.reply,
          sender: 'bot',
          timestamp: Date.now(),
          metadata: { tokens: data.usage?.tokens, latency: data.usage?.latency, sources: data.sources },
        };

        setMessages([...newMessages, botMessage]);
        setStreamingState({ isStreaming: false, partialContent: '', isComplete: true });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setStreamingState({ isStreaming: false, partialContent: '', isComplete: true });
        return;
      }

      // Fallback to non-streaming
      try {
        const res = await conciergeChat({
          message: content,
          history: messages.slice(-10).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text })),
        });

        const botMessage: Message = {
          id: `msg-${Date.now()}`,
          text: res.reply,
          sender: 'bot',
          timestamp: Date.now(),
        };

        setMessages([...newMessages, botMessage]);
        setStreamingState({ isStreaming: false, partialContent: '', isComplete: true });
      } catch (fallbackError) {
        console.error('Concierge error:', fallbackError);
        setStreamingState({ isStreaming: false, partialContent: '', isComplete: true });
        throw fallbackError;
      }
    }
  }, [messages, sessionId]);

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStreamingState({ isStreaming: false, partialContent: '', isComplete: true });
  }, []);

  const clearSession = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    logEvent('concierge_session_cleared', {});
  }, []);

  return {
    messages,
    streamingState,
    sessionId,
    sendMessage: sendStreamingMessage,
    cancelStream,
    clearSession,
    isLoading: streamingState.isStreaming,
  };
}

// ============================================
// Knowledge Base Hooks
// ============================================

/**
 * Hook to search the knowledge base
 */
export function useKnowledgeSearch(query: string) {
  return useQuery<{ results: KnowledgeSource[]; suggestedQuestions: string[] }, Error>({
    queryKey: ['concierge', 'knowledge', query],
    queryFn: async () => {
      const res = await clientGet<{ results: KnowledgeSource[]; suggestedQuestions: string[] }>(
        phase4Client,
        '/concierge/knowledge/search',
        { params: { q: query } }
      );
      return res;
    },
    enabled: query.length >= 3,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch strain information
 */
export function useStrainKnowledge(strainName: string) {
  return useQuery<{
    name: string;
    type: 'indica' | 'sativa' | 'hybrid';
    effects: string[];
    medicalUses: string[];
    terpenes: string[];
    thcRange: { min: number; max: number };
    cbdRange: { min: number; max: number };
    description: string;
    warnings: string[];
  }, Error>({
    queryKey: ['concierge', 'knowledge', 'strain', strainName],
    queryFn: async () => {
      return await clientGet<{
        name: string;
        type: 'indica' | 'sativa' | 'hybrid';
        effects: string[];
        medicalUses: string[];
        terpenes: string[];
        thcRange: { min: number; max: number };
        cbdRange: { min: number; max: number };
        description: string;
        warnings: string[];
      }>(phase4Client, `/concierge/knowledge/strains/${encodeURIComponent(strainName)}`);
    },
    enabled: !!strainName,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * Hook to fetch usage guidelines
 */
export function useUsageGuidelines(category: 'flower' | 'edibles' | 'concentrates' | 'topicals' | 'tinctures') {
  return useQuery<{
    category: string;
    guidelines: { title: string; content: string; forBeginners: boolean }[];
    dosageInfo: { level: string; amount: string; effects: string }[];
    warnings: string[];
  }, Error>({
    queryKey: ['concierge', 'knowledge', 'guidelines', category],
    queryFn: async () => {
      return await clientGet<{
        category: string;
        guidelines: { title: string; content: string; forBeginners: boolean }[];
        dosageInfo: { level: string; amount: string; effects: string }[];
        warnings: string[];
      }>(phase4Client, `/concierge/knowledge/guidelines/${category}`);
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * Hook to fetch legal information by state
 */
export function useLegalInfo(state: string) {
  return useQuery<{
    state: string;
    legalStatus: 'recreational' | 'medical' | 'decriminalized' | 'illegal';
    purchaseLimits: { category: string; limit: string; period: string }[];
    requirements: string[];
    restrictions: string[];
    resources: { name: string; url: string }[];
    lastUpdated: string;
  }, Error>({
    queryKey: ['concierge', 'knowledge', 'legal', state],
    queryFn: async () => {
      return await clientGet<{
        state: string;
        legalStatus: 'recreational' | 'medical' | 'decriminalized' | 'illegal';
        purchaseLimits: { category: string; limit: string; period: string }[];
        requirements: string[];
        restrictions: string[];
        resources: { name: string; url: string }[];
        lastUpdated: string;
      }>(phase4Client, `/concierge/knowledge/legal/${state}`);
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * Hook to submit concierge feedback
 */
export function useConciergeFeedback() {
  return useMutation<void, Error, { messageId: string; rating: 'positive' | 'negative'; feedback?: string }>({
    mutationFn: async ({ messageId, rating, feedback }: { messageId: string; rating: 'positive' | 'negative'; feedback?: string }) => {
      await clientPost<{ messageId: string; rating: string; feedback?: string }, void>(
        phase4Client,
        '/concierge/feedback',
        { messageId, rating, feedback }
      );
      logEvent('concierge_feedback', { messageId, rating });
    },
  });
}
