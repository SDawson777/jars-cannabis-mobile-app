import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLegal } from '../hooks/useLegal';
import * as useCMSContentModule from '../hooks/useCMSContent';

jest.mock('../hooks/useCMSContent');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useLegal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call useCMSContent with correct parameters', () => {
    const mockUseCMSContent = jest.fn().mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    (useCMSContentModule.useCMSContent as jest.Mock) = mockUseCMSContent;

    renderHook(() => useLegal(), { wrapper: createWrapper() });

    expect(mockUseCMSContent).toHaveBeenCalledWith(['legal'], '/content/legal');
  });

  it('should return legal content when loaded', () => {
    const mockLegalContent = {
      termsOfService: 'TOS content',
      privacyPolicy: 'Privacy content',
      disclaimer: 'Disclaimer content',
    };
    (useCMSContentModule.useCMSContent as jest.Mock).mockReturnValue({
      data: mockLegalContent,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useLegal(), { wrapper: createWrapper() });

    expect(result.current.data).toEqual(mockLegalContent);
  });

  it('should return loading state', () => {
    (useCMSContentModule.useCMSContent as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(() => useLegal(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle error state', () => {
    const mockError = new Error('Failed to fetch legal content');
    (useCMSContentModule.useCMSContent as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    });

    const { result } = renderHook(() => useLegal(), { wrapper: createWrapper() });

    expect(result.current.error).toEqual(mockError);
  });
});
