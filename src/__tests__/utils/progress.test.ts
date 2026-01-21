// src/__tests__/utils/progress.test.ts
import { calculateProgress } from '../../utils/progress';

describe('progress utility', () => {
  describe('calculateProgress', () => {
    it('should return 0 when current is 0', () => {
      expect(calculateProgress(0, 100)).toBe(0);
    });

    it('should return 0.5 when current is half of target', () => {
      expect(calculateProgress(50, 100)).toBe(0.5);
    });

    it('should return 1 when current equals target', () => {
      expect(calculateProgress(100, 100)).toBe(1);
    });

    it('should cap at 1 when current exceeds target', () => {
      expect(calculateProgress(150, 100)).toBe(1);
    });

    it('should handle small values', () => {
      expect(calculateProgress(1, 10)).toBe(0.1);
    });

    it('should handle decimal values', () => {
      expect(calculateProgress(25.5, 100)).toBe(0.255);
    });
  });
});
