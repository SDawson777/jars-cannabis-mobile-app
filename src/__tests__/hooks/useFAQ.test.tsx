import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

import { useFAQQuery } from '../../hooks/useFAQ';
import { cmsClient } from '../../api/cmsClient';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(),
}));

jest.mock('../../api/cmsClient', () => ({
  cmsClient: {
    get: jest.fn(),
  },
}));

jest.mock('../../context/CMSPreviewContext', () => ({
  useCMSPreview: jest.fn(() => ({ preview: false })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useFAQQuery hook', () => {
  const mockFAQResponse = {
    items: [
      { id: 'faq-1', question: 'What is cannabis?', answer: 'A plant.' },
      { id: 'faq-2', question: 'Is it legal?', answer: 'Depends on location.' },
      { slug: 'faq-3', title: 'How to store?', body: 'In a cool place.' },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  });

  it('should fetch FAQ items', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockFAQResponse });

    const { result } = renderHook(() => useFAQQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(3);
  });

  it('should transform FAQ items with question and answer', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockFAQResponse });

    const { result } = renderHook(() => useFAQQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data[0]).toEqual({
      id: 'faq-1',
      question: 'What is cannabis?',
      answer: 'A plant.',
    });
  });

  it('should use slug when id not available', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockFAQResponse });

    const { result } = renderHook(() => useFAQQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Item with slug but no id should use slug
    expect(result.current.data[2].id).toBe('faq-3');
  });

  it('should use title/body as fallback for question/answer', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: mockFAQResponse });

    const { result } = renderHook(() => useFAQQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data[2]).toEqual({
      id: 'faq-3',
      question: 'How to store?',
      answer: 'In a cool place.',
    });
  });

  it('should return empty array when no items', async () => {
    (cmsClient.get as jest.Mock).mockResolvedValueOnce({ data: { items: [] } });

    const { result } = renderHook(() => useFAQQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
  });
});
