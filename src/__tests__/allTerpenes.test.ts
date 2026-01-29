import { ALL_TERPENES_DATA } from '../terpene_wheel/data/allTerpenes';

describe('ALL_TERPENES_DATA', () => {
  it('should be defined', () => {
    expect(ALL_TERPENES_DATA).toBeDefined();
  });

  it('should be an array', () => {
    expect(Array.isArray(ALL_TERPENES_DATA)).toBe(true);
  });

  it('should have terpenes', () => {
    expect(ALL_TERPENES_DATA.length).toBeGreaterThan(0);
  });
});
