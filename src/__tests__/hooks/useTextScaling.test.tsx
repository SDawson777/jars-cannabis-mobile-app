/**
 * @jest-environment jsdom
 */

import { renderHook } from '@testing-library/react-native';
import { useTextScaling } from '../../hooks/useTextScaling';
import { useAccessibilityStore } from '../../state/accessibilityStore';

// Mock the accessibility store
jest.mock('../../state/accessibilityStore', () => ({
  useAccessibilityStore: jest.fn(),
}));

describe('useTextScaling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns scale factor of 0.875 for small text size', () => {
    (useAccessibilityStore as unknown as jest.Mock).mockReturnValue({ textSize: 'sm' });

    const { result } = renderHook(() => useTextScaling());

    expect(result.current.scaleFactor).toBe(0.875);
  });

  it('returns scale factor of 1.0 for medium text size', () => {
    (useAccessibilityStore as unknown as jest.Mock).mockReturnValue({ textSize: 'md' });

    const { result } = renderHook(() => useTextScaling());

    expect(result.current.scaleFactor).toBe(1.0);
  });

  it('returns scale factor of 1.125 for large text size', () => {
    (useAccessibilityStore as unknown as jest.Mock).mockReturnValue({ textSize: 'lg' });

    const { result } = renderHook(() => useTextScaling());

    expect(result.current.scaleFactor).toBe(1.125);
  });

  it('returns scale factor of 1.25 for extra large text size', () => {
    (useAccessibilityStore as unknown as jest.Mock).mockReturnValue({ textSize: 'xl' });

    const { result } = renderHook(() => useTextScaling());

    expect(result.current.scaleFactor).toBe(1.25);
  });

  it('returns scale factor of 1.0 for system text size', () => {
    (useAccessibilityStore as unknown as jest.Mock).mockReturnValue({ textSize: 'system' });

    const { result } = renderHook(() => useTextScaling());

    expect(result.current.scaleFactor).toBe(1.0);
  });

  it('returns scale factor of 1.0 for undefined text size', () => {
    (useAccessibilityStore as unknown as jest.Mock).mockReturnValue({ textSize: undefined });

    const { result } = renderHook(() => useTextScaling());

    expect(result.current.scaleFactor).toBe(1.0);
  });

  describe('scaleSize', () => {
    it('scales base size for small text', () => {
      (useAccessibilityStore as unknown as jest.Mock).mockReturnValue({ textSize: 'sm' });

      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleSize(16)).toBe(14);
    });

    it('keeps base size for medium text', () => {
      (useAccessibilityStore as unknown as jest.Mock).mockReturnValue({ textSize: 'md' });

      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleSize(16)).toBe(16);
    });

    it('scales up for large text', () => {
      (useAccessibilityStore as unknown as jest.Mock).mockReturnValue({ textSize: 'lg' });

      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleSize(16)).toBe(18);
    });

    it('scales up more for extra large text', () => {
      (useAccessibilityStore as unknown as jest.Mock).mockReturnValue({ textSize: 'xl' });

      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleSize(16)).toBe(20);
    });

    it('rounds scaled value to integer', () => {
      (useAccessibilityStore as unknown as jest.Mock).mockReturnValue({ textSize: 'sm' });

      const { result } = renderHook(() => useTextScaling());

      // 14 * 0.875 = 12.25 -> rounds to 12
      expect(result.current.scaleSize(14)).toBe(12);
    });
  });
});
