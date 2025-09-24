import { renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useConcierge } from '../hooks/useConcierge';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock the concierge API
jest.mock('../api/phase4Client', () => ({
  conciergeChat: jest.fn(),
}));

const mockConciergeChat = require('../api/phase4Client').conciergeChat;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('useConcierge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
  });

  it('initializes with default welcome message', () => {
    const { result } = renderHook(() => useConcierge());

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].text).toBe('Hi, how can I assist you today?');
    expect(result.current.messages[0].sender).toBe('bot');
    expect(result.current.loading).toBe(false);
  });

  it('loads persisted messages from AsyncStorage', async () => {
    const persistedMessages = [
      { id: '1', text: 'Hello', sender: 'user', timestamp: Date.now() },
      { id: '2', text: 'Hi there!', sender: 'bot', timestamp: Date.now() + 1 },
    ];
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(persistedMessages));

    const { result } = renderHook(() => useConcierge());

    await waitFor(() => {
      expect(result.current.messages).toEqual(persistedMessages);
    });
  });

  it('sends message successfully and gets response', async () => {
    mockConciergeChat.mockResolvedValue({ reply: 'Test response from bot' });

    const { result } = renderHook(() => useConcierge());

    const response = await result.current.sendMessage('Test message');

    expect(response.success).toBe(true);
    expect(mockConciergeChat).toHaveBeenCalledWith({
      message: 'Test message',
      history: [
        {
          role: 'assistant',
          content: 'Hi, how can I assist you today?',
        },
      ],
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(3);
      expect(result.current.messages[1].text).toBe('Test message');
      expect(result.current.messages[1].sender).toBe('user');
      expect(result.current.messages[2].text).toBe('Test response from bot');
      expect(result.current.messages[2].sender).toBe('bot');
    });
  });

  it('handles network errors gracefully', async () => {
    mockConciergeChat.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useConcierge());

    const response = await result.current.sendMessage('Test message');

    expect(response.success).toBe(false);
    expect(response.error?.code).toBe('network');
    expect(response.error?.message).toBe('Network error. Check your connection.');

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(3);
      expect(result.current.messages[2].error).toBe(true);
      expect(result.current.messages[2].text).toBe('Failed to get response. Tap to retry.');
    });
  });

  it('handles rate limit errors with retry after', async () => {
    const rateLimitError = {
      response: {
        status: 429,
        headers: { 'retry-after': '60' },
        data: { error: { code: 'rate_limit', message: 'Too many requests' } },
      },
    };
    mockConciergeChat.mockRejectedValue(rateLimitError);

    const { result } = renderHook(() => useConcierge());

    const response = await result.current.sendMessage('Test message');

    expect(response.success).toBe(false);
    expect(response.error?.code).toBe('rate_limit');
    expect(response.error?.retryAfter).toBe(60);
    expect(response.error?.message).toBe('Too many requests. Try again in 60s.');
  });

  it('handles timeout errors', async () => {
    const timeoutError = { code: 'timeout', message: 'Request timeout' };
    mockConciergeChat.mockRejectedValue(timeoutError);

    const { result } = renderHook(() => useConcierge());

    const response = await result.current.sendMessage('Test message');

    expect(response.success).toBe(false);
    expect(response.error?.code).toBe('timeout');
    expect(response.error?.message).toBe('Request timed out. Please try again.');
  });

  it('persists messages to AsyncStorage', async () => {
    mockConciergeChat.mockResolvedValue({ reply: 'Bot response' });

    const { result } = renderHook(() => useConcierge());

    await result.current.sendMessage('User message');

    await waitFor(() => {
      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'concierge_history',
        expect.any(String)
      );
    });
  });

  it('clears history and removes from storage', async () => {
    const { result } = renderHook(() => useConcierge());

    await result.current.clearHistory();

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].text).toBe('Hi, how can I assist you today?');
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('concierge_history');
  });

  it('shows optimistic "thinking" message during API call', async () => {
    mockConciergeChat.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ reply: 'Response' }), 100))
    );

    const { result } = renderHook(() => useConcierge());

    // Start the async operation
    const sendPromise = result.current.sendMessage('Test message');

    // Wait a bit for the optimistic message to appear
    await waitFor(() => {
      expect(result.current.messages).toHaveLength(3);
    });

    expect(result.current.messages[2].text).toBe('Bot is thinking...');
    expect(result.current.messages[2].isOptimistic).toBe(true);

    // Wait for completion
    await sendPromise;
  });
});
