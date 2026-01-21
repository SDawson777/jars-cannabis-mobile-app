/**
 * @jest-environment jsdom
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useOnboardingProgress } from '../../hooks/useOnboardingProgress';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('useOnboardingProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.removeItem.mockResolvedValue();
  });

  it('initially has null completed state', () => {
    const { result } = renderHook(() => useOnboardingProgress());

    expect(result.current.completed).toBeNull();
  });

  it('loads completed state from storage', async () => {
    mockAsyncStorage.getItem.mockImplementation(async key => {
      if (key === 'onboardingCompleted') return 'true';
      if (key === 'onboardingLastIndex') return '2';
      return null;
    });

    const { result } = renderHook(() => useOnboardingProgress());

    await waitFor(() => {
      expect(result.current.completed).toBe(true);
      expect(result.current.lastIndex).toBe(2);
    });
  });

  it('loads false for incomplete onboarding', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const { result } = renderHook(() => useOnboardingProgress());

    await waitFor(() => {
      expect(result.current.completed).toBe(false);
    });
  });

  it('completeOnboarding sets completed to true', async () => {
    const { result } = renderHook(() => useOnboardingProgress());

    await waitFor(() => {
      expect(result.current.completed).toBe(false);
    });

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(result.current.completed).toBe(true);
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('onboardingCompleted', 'true');
  });

  it('setLastIndex updates index', async () => {
    const { result } = renderHook(() => useOnboardingProgress());

    await waitFor(() => {
      expect(result.current.lastIndex).toBe(0);
    });

    await act(async () => {
      await result.current.setLastIndex(3);
    });

    expect(result.current.lastIndex).toBe(3);
    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('onboardingLastIndex', '3');
  });

  it('resetOnboarding clears state', async () => {
    mockAsyncStorage.getItem.mockImplementation(async key => {
      if (key === 'onboardingCompleted') return 'true';
      if (key === 'onboardingLastIndex') return '5';
      return null;
    });

    const { result } = renderHook(() => useOnboardingProgress());

    await waitFor(() => {
      expect(result.current.completed).toBe(true);
    });

    await act(async () => {
      await result.current.resetOnboarding();
    });

    expect(result.current.completed).toBe(false);
    expect(result.current.lastIndex).toBe(0);
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('onboardingCompleted');
    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('onboardingLastIndex');
  });
});
