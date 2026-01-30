import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useFAQQuery } from '../hooks/useFAQ';
import * as useCMSContentModule from '../hooks/useCMSContent';

jest.mock('../hooks/useCMSContent');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useFAQQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call useCMSContent with correct parameters', () => {
    const mockUseCMSContent = jest.fn().mockReturnValue({
      data: { items: [] },
      isLoading: false,
      error: null,
    });
    (useCMSContentModule.useCMSContent as jest.Mock) = mockUseCMSContent;

    renderHook(() => useFAQQuery(), { wrapper: createWrapper() });

    expect(mockUseCMSContent).toHaveBeenCalledWith(['faq'], '/content/faq');
  });

  it('should return FAQ items when loaded', () => {
    const mockFAQs = [
      { id: '1', question: 'Q1', answer: 'A1' },
      { id: '2', question: 'Q2', answer: 'A2' },
    ];
    (useCMSContentModule.useCMSContent as jest.Mock).mockReturnValue({
      data: { items: mockFAQs },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useFAQQuery(), { wrapper: createWrapper() });

    expect(result.current.data).toEqual(mockFAQs);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return loading state', () => {
    (useCMSContentModule.useCMSContent as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(() => useFAQQuery(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });
});
