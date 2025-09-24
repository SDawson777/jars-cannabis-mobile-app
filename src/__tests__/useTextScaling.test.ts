import { renderHook } from '@testing-library/react-native';
import { useTextScaling } from '../hooks/useTextScaling';
import { useAccessibilityStore } from '../state/accessibilityStore';

describe('useTextScaling', () => {
  beforeEach(() => {
    // Reset store state
    useAccessibilityStore.getState().setTextSize('md');
  });

  it('returns scale factor 1.0 for medium text size', () => {
    const { result } = renderHook(() => useTextScaling());

    expect(result.current.scaleFactor).toBe(1.0);
    expect(result.current.scaleSize(16)).toBe(16);
  });

  it('returns scale factor 0.875 for small text size', () => {
    useAccessibilityStore.getState().setTextSize('sm');

    const { result } = renderHook(() => useTextScaling());

    expect(result.current.scaleFactor).toBe(0.875);
    expect(result.current.scaleSize(16)).toBe(14); // 16 * 0.875 = 14
  });

  it('returns scale factor 1.125 for large text size', () => {
    useAccessibilityStore.getState().setTextSize('lg');

    const { result } = renderHook(() => useTextScaling());

    expect(result.current.scaleFactor).toBe(1.125);
    expect(result.current.scaleSize(16)).toBe(18); // 16 * 1.125 = 18
  });

  it('returns scale factor 1.25 for extra large text size', () => {
    useAccessibilityStore.getState().setTextSize('xl');

    const { result } = renderHook(() => useTextScaling());

    expect(result.current.scaleFactor).toBe(1.25);
    expect(result.current.scaleSize(16)).toBe(20); // 16 * 1.25 = 20
  });

  it('returns scale factor 1.0 for system text size', () => {
    useAccessibilityStore.getState().setTextSize('system');

    const { result } = renderHook(() => useTextScaling());

    expect(result.current.scaleFactor).toBe(1.0);
    expect(result.current.scaleSize(16)).toBe(16);
  });

  it('rounds scaled sizes correctly', () => {
    useAccessibilityStore.getState().setTextSize('sm');

    const { result } = renderHook(() => useTextScaling());

    // 15 * 0.875 = 13.125, should round to 13
    expect(result.current.scaleSize(15)).toBe(13);

    // 17 * 0.875 = 14.875, should round to 15
    expect(result.current.scaleSize(17)).toBe(15);
  });
});
