import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo } from 'react-native';

import {
  AccessibilityProvider,
  useAccessibility,
  useTheme,
  useIsDarkMode,
  useAccessibilityProps,
  useAnnounce,
  useSyncedAccessibilitySettings,
  useSyncAccessibilitySettings,
  useColorBlindAdjustments,
  useAnimationDuration,
} from '../../hooks/useAccessibility';
import * as http from '../../api/http';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('react-native', () => ({
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn().mockResolvedValue(false),
    addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
    announceForAccessibility: jest.fn(),
  },
  useColorScheme: jest.fn().mockReturnValue('light'),
}));

jest.mock('../../api/http', () => ({
  clientGet: jest.fn(),
  clientPost: jest.fn(),
}));

jest.mock('../../utils/analytics', () => ({
  logEvent: jest.fn(),
}));

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>{children}</AccessibilityProvider>
    </QueryClientProvider>
  );
};

const createQueryWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('AccessibilityProvider and useAccessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('should provide default settings', () => {
    const { result } = renderHook(() => useAccessibility(), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.settings.themeMode).toBe('system');
    expect(result.current.settings.fontScale).toBe('md');
    expect(result.current.settings.highContrast).toBe(false);
  });

  it('should provide light theme by default when system is light', () => {
    const { result } = renderHook(() => useAccessibility(), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.theme.mode).toBe('light');
    expect(result.current.theme.colors.background).toBe('#FFFFFF');
  });

  it('should calculate font size based on scale', () => {
    const { result } = renderHook(() => useAccessibility(), {
      wrapper: createTestWrapper(),
    });

    const baseSize = 16;
    // Default scale is 'md' which is 1.0
    expect(result.current.getFontSize(baseSize)).toBe(16);
  });

  it('should get spacing correctly', () => {
    const { result } = renderHook(() => useAccessibility(), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.getSpacing('md')).toBe(16);
    expect(result.current.getSpacing('sm')).toBe(8);
    expect(result.current.getSpacing('lg')).toBe(24);
  });

  it('should load saved settings from storage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({ fontScale: 'lg', highContrast: true })
    );

    const { result } = renderHook(() => useAccessibility(), {
      wrapper: createTestWrapper(),
    });

    await waitFor(() => {
      expect(result.current.settings.fontScale).toBe('lg');
    });
  });
});

describe('useTheme hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('should return current theme', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.mode).toBe('light');
    expect(result.current.colors).toBeDefined();
    expect(result.current.spacing).toBeDefined();
  });
});

describe('useIsDarkMode hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('should return false when light mode is active', () => {
    const { result } = renderHook(() => useIsDarkMode(), {
      wrapper: createTestWrapper(),
    });

    expect(result.current).toBe(false);
  });
});

describe('useAccessibilityProps hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('should generate accessibility props from label', () => {
    const { result } = renderHook(
      () =>
        useAccessibilityProps({
          label: 'Add to cart',
          hint: 'Adds this item to your shopping cart',
          role: 'button',
          state: { disabled: false },
        }),
      { wrapper: createTestWrapper() }
    );

    expect(result.current.accessible).toBe(true);
    expect(result.current.accessibilityLabel).toBe('Add to cart');
    expect(result.current.accessibilityHint).toBe('Adds this item to your shopping cart');
    expect(result.current.accessibilityRole).toBe('button');
    expect(result.current.accessibilityState).toEqual({ disabled: false });
  });
});

describe('useAnnounce hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('should announce message to screen readers', () => {
    const { result } = renderHook(() => useAnnounce(), {
      wrapper: createTestWrapper(),
    });

    act(() => {
      result.current.announce('Item added to cart');
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Item added to cart');
  });

  it('should announce polite message', () => {
    const { result } = renderHook(() => useAnnounce(), {
      wrapper: createTestWrapper(),
    });

    act(() => {
      result.current.announcePolite('Loading complete');
    });

    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Loading complete');
  });
});

describe('useSyncedAccessibilitySettings hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch settings from server', async () => {
    const mockSettings = { themeMode: 'dark', fontScale: 'lg' };
    (http.clientGet as jest.Mock).mockResolvedValueOnce(mockSettings);

    const { result } = renderHook(() => useSyncedAccessibilitySettings(), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockSettings);
  });
});

describe('useSyncAccessibilitySettings hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sync settings to server', async () => {
    const mockSettings = { themeMode: 'dark', fontScale: 'lg' };
    (http.clientPost as jest.Mock).mockResolvedValueOnce(mockSettings);

    const { result } = renderHook(() => useSyncAccessibilitySettings(), {
      wrapper: createQueryWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({ fontScale: 'lg' });
    });

    expect(http.clientPost).toHaveBeenCalledWith(expect.anything(), '/user/accessibility', {
      fontScale: 'lg',
    });
  });
});

describe('useColorBlindAdjustments hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('should return unchanged color when colorBlindMode is none', () => {
    const { result } = renderHook(() => useColorBlindAdjustments(), {
      wrapper: createTestWrapper(),
    });

    const adjusted = result.current.adjustColor('#FF0000');
    expect(adjusted).toBe('#FF0000');
  });
});

describe('useAnimationDuration hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('should return base duration when reduce motion is off', () => {
    const { result } = renderHook(() => useAnimationDuration(), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.getDuration(300)).toBe(300);
    expect(result.current.shouldAnimate).toBe(true);
  });

  it('should return 0 duration when reduce motion is on', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({ reduceMotion: true }));

    const { result } = renderHook(() => useAnimationDuration(), {
      wrapper: createTestWrapper(),
    });

    await waitFor(() => {
      expect(result.current.shouldAnimate).toBe(false);
    });

    expect(result.current.getDuration(300)).toBe(0);
  });
});
