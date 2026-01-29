import { TERPENES } from '../terpene_wheel/data/terpenes';

describe('TERPENES data', () => {
  it('should have terpenes array', () => {
    expect(TERPENES).toBeDefined();
    expect(Array.isArray(TERPENES)).toBe(true);
  });

  it('should have multiple terpenes', () => {
    expect(TERPENES.length).toBeGreaterThan(0);
  });

  it('should have valid terpene structure', () => {
    const terpene = TERPENES[0];
    expect(terpene).toHaveProperty('key');
    expect(terpene).toHaveProperty('name');
    expect(terpene).toHaveProperty('percent');
    expect(terpene).toHaveProperty('aromas');
    expect(terpene).toHaveProperty('effects');
    expect(terpene).toHaveProperty('strains');
    expect(terpene).toHaveProperty('waveColor');
  });

  it('should have valid percent values', () => {
    TERPENES.forEach(terpene => {
      expect(terpene.percent).toBeGreaterThanOrEqual(0);
      expect(terpene.percent).toBeLessThanOrEqual(1);
    });
  });

  it('should have non-empty aromas', () => {
    TERPENES.forEach(terpene => {
      expect(Array.isArray(terpene.aromas)).toBe(true);
      expect(terpene.aromas.length).toBeGreaterThan(0);
    });
  });

  it('should have non-empty effects', () => {
    TERPENES.forEach(terpene => {
      expect(Array.isArray(terpene.effects)).toBe(true);
      expect(terpene.effects.length).toBeGreaterThan(0);
    });
  });
});
