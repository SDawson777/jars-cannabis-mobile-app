import { renderHook } from '@testing-library/react-native';
import { useTextScaling } from '../useTextScaling';
import { useAccessibilityStore } from '../../state/accessibilityStore';

// Mock the accessibility store
jest.mock('../../state/accessibilityStore', () => ({
  useAccessibilityStore: jest.fn(),
}));

const mockUseAccessibilityStore = useAccessibilityStore as jest.MockedFunction<
  typeof useAccessibilityStore
>;

describe('useTextScaling', () => {
  describe('scaleSize', () => {
    it('returns base size for medium text size', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: 'md' } as any);
      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleSize(14)).toBe(14);
      expect(result.current.scaleSize(16)).toBe(16);
      expect(result.current.scaleSize(20)).toBe(20);
    });

    it('reduces size by 12.5% for small text size', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: 'sm' } as any);
      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleSize(14)).toBe(12); // 14 * 0.875 = 12.25, rounded to 12
      expect(result.current.scaleSize(16)).toBe(14); // 16 * 0.875 = 14
    });

    it('increases size by 12.5% for large text size', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: 'lg' } as any);
      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleSize(14)).toBe(16); // 14 * 1.125 = 15.75, rounded to 16
      expect(result.current.scaleSize(16)).toBe(18); // 16 * 1.125 = 18
    });

    it('increases size by 25% for extra large text size', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: 'xl' } as any);
      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleSize(14)).toBe(18); // 14 * 1.25 = 17.5, rounded to 18
      expect(result.current.scaleSize(16)).toBe(20); // 16 * 1.25 = 20
      expect(result.current.scaleSize(20)).toBe(25); // 20 * 1.25 = 25
    });

    it('returns base size for system text size', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: 'system' } as any);
      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleSize(14)).toBe(14);
      expect(result.current.scaleSize(16)).toBe(16);
    });

    it('returns base size for undefined text size', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: undefined } as any);
      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleSize(14)).toBe(14);
    });

    it('rounds to nearest integer', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: 'sm' } as any);
      const { result } = renderHook(() => useTextScaling());

      // 14 * 0.875 = 12.25, should round to 12
      expect(result.current.scaleSize(14)).toBe(12);
    });

    it('works with various base sizes', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: 'md' } as any);
      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleSize(10)).toBe(10);
      expect(result.current.scaleSize(12)).toBe(12);
      expect(result.current.scaleSize(14)).toBe(14);
      expect(result.current.scaleSize(16)).toBe(16);
      expect(result.current.scaleSize(18)).toBe(18);
      expect(result.current.scaleSize(20)).toBe(20);
      expect(result.current.scaleSize(24)).toBe(24);
    });
  });

  describe('scaleFactor', () => {
    it('returns 1.0 for medium text size', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: 'md' } as any);
      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleFactor).toBe(1.0);
    });

    it('returns 0.875 for small text size', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: 'sm' } as any);
      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleFactor).toBe(0.875);
    });

    it('returns 1.125 for large text size', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: 'lg' } as any);
      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleFactor).toBe(1.125);
    });

    it('returns 1.25 for extra large text size', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: 'xl' } as any);
      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleFactor).toBe(1.25);
    });

    it('returns 1.0 for system text size', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: 'system' } as any);
      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleFactor).toBe(1.0);
    });

    it('returns 1.0 for undefined text size', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: undefined } as any);
      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleFactor).toBe(1.0);
    });
  });

  describe('accessibility store integration', () => {
    it('reads textSize from accessibility store', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: 'lg' } as any);
      renderHook(() => useTextScaling());

      expect(mockUseAccessibilityStore).toHaveBeenCalled();
    });

    it('updates when textSize changes', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: 'md' } as any);
      const { result, rerender } = renderHook(() => useTextScaling());

      expect(result.current.scaleFactor).toBe(1.0);

      // Change the textSize
      mockUseAccessibilityStore.mockReturnValue({ textSize: 'xl' } as any);
      rerender();

      expect(result.current.scaleFactor).toBe(1.25);
    });
  });

  describe('edge cases', () => {
    it('handles zero base size', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: 'md' } as any);
      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleSize(0)).toBe(0);
    });

    it('handles very large base sizes', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: 'xl' } as any);
      const { result } = renderHook(() => useTextScaling());

      expect(result.current.scaleSize(100)).toBe(125);
      expect(result.current.scaleSize(1000)).toBe(1250);
    });

    it('handles fractional base sizes', () => {
      mockUseAccessibilityStore.mockReturnValue({ textSize: 'lg' } as any);
      const { result } = renderHook(() => useTextScaling());

      // 14.5 * 1.125 = 16.3125, should round to 16
      expect(result.current.scaleSize(14.5)).toBe(16);
    });
  });
});
