import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { CMSPreviewProvider, useCMSPreview } from '../context/CMSPreviewContext';
import * as Linking from 'expo-linking';

jest.mock('expo-linking');

const mockedLinking = Linking as jest.Mocked<typeof Linking>;

describe('CMSPreviewContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should default to preview=false', async () => {
    mockedLinking.getInitialURL.mockResolvedValue(null);

    const { result } = renderHook(() => useCMSPreview(), {
      wrapper: ({ children }) => <CMSPreviewProvider>{children}</CMSPreviewProvider>,
    });

    await waitFor(() => {
      expect(result.current.preview).toBe(false);
    });
  });

  it('should enable preview mode when URL contains preview=true', async () => {
    mockedLinking.getInitialURL.mockResolvedValue('nimbus://app?preview=true');

    const { result } = renderHook(() => useCMSPreview(), {
      wrapper: ({ children }) => <CMSPreviewProvider>{children}</CMSPreviewProvider>,
    });

    await waitFor(() => {
      expect(result.current.preview).toBe(true);
    });
  });

  it('should not enable preview mode without preview param', async () => {
    mockedLinking.getInitialURL.mockResolvedValue('nimbus://app?mode=production');

    const { result } = renderHook(() => useCMSPreview(), {
      wrapper: ({ children }) => <CMSPreviewProvider>{children}</CMSPreviewProvider>,
    });

    await waitFor(() => {
      expect(result.current.preview).toBe(false);
    });
  });

  it('should toggle preview mode', async () => {
    mockedLinking.getInitialURL.mockResolvedValue(null);

    const { result } = renderHook(() => useCMSPreview(), {
      wrapper: ({ children }) => <CMSPreviewProvider>{children}</CMSPreviewProvider>,
    });

    await waitFor(() => {
      expect(result.current.preview).toBe(false);
    });

    act(() => {
      result.current.toggle?.();
    });

    expect(result.current.preview).toBe(true);

    act(() => {
      result.current.toggle?.();
    });

    expect(result.current.preview).toBe(false);
  });

  it('should handle Linking errors gracefully', async () => {
    mockedLinking.getInitialURL.mockRejectedValue(new Error('Linking error'));

    const { result } = renderHook(() => useCMSPreview(), {
      wrapper: ({ children }) => <CMSPreviewProvider>{children}</CMSPreviewProvider>,
    });

    await waitFor(() => {
      expect(result.current.preview).toBe(false);
    });
  });

  it('should return default value when used outside provider', () => {
    const { result } = renderHook(() => useCMSPreview());

    expect(result.current.preview).toBe(false);
    expect(result.current.toggle).toBeUndefined();
  });
});
