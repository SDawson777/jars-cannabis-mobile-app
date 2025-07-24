import { calculateProgress } from '../utils/progress';

describe('calculateProgress', () => {
  it('caps progress at 1', () => {
    expect(calculateProgress(150, 100)).toBe(1);
  });

  it('returns ratio', () => {
    expect(calculateProgress(50, 100)).toBe(0.5);
  });
});
