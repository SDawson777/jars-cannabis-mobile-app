import { renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useFiltersQuery } from '../hooks/useFilters';
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

describe('useFiltersQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call useCMSContent with correct parameters', () => {
    const mockUseCMSContent = jest.fn().mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    (useCMSContentModule.useCMSContent as jest.Mock) = mockUseCMSContent;

    renderHook(() => useFiltersQuery(), { wrapper: createWrapper() });

    expect(mockUseCMSContent).toHaveBeenCalledWith(['filters'], '/content/filters');
  });

  it('should return filter items when loaded', () => {
    const mockFilters = [
      { id: '1', name: 'Category', options: ['Indica', 'Sativa'] },
      { id: '2', name: 'Price', options: ['$0-25', '$25-50'] },
    ];
    (useCMSContentModule.useCMSContent as jest.Mock).mockReturnValue({
      data: mockFilters,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useFiltersQuery(), { wrapper: createWrapper() });

    expect(result.current.data).toEqual(mockFilters);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return loading state', () => {
    (useCMSContentModule.useCMSContent as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(() => useFiltersQuery(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle error state', () => {
    const mockError = new Error('Failed to fetch filters');
    (useCMSContentModule.useCMSContent as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    });

    const { result } = renderHook(() => useFiltersQuery(), { wrapper: createWrapper() });

    expect(result.current.error).toEqual(mockError);
  });
});
