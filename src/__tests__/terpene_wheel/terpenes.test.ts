// src/__tests__/terpene_wheel/terpenes.test.ts
import { TERPENES } from '../../terpene_wheel/data/terpenes';

describe('terpenes data', () => {
  describe('TERPENES array', () => {
    it('should contain 8 terpenes', () => {
      expect(TERPENES).toHaveLength(8);
    });

    it('should contain myrcene', () => {
      const myrcene = TERPENES.find(t => t.key === 'myrcene');
      expect(myrcene).toBeDefined();
      expect(myrcene?.name).toBe('Myrcene');
    });

    it('should contain limonene', () => {
      const limonene = TERPENES.find(t => t.key === 'limonene');
      expect(limonene).toBeDefined();
      expect(limonene?.name).toBe('Limonene');
    });

    it('should contain caryophyllene', () => {
      const caryophyllene = TERPENES.find(t => t.key === 'caryophyllene');
      expect(caryophyllene).toBeDefined();
      expect(caryophyllene?.name).toBe('Caryophyllene');
    });

    it('should contain pinene', () => {
      const pinene = TERPENES.find(t => t.key === 'pinene');
      expect(pinene).toBeDefined();
      expect(pinene?.name).toBe('Pinene');
    });

    it('should contain linalool', () => {
      const linalool = TERPENES.find(t => t.key === 'linalool');
      expect(linalool).toBeDefined();
      expect(linalool?.name).toBe('Linalool');
    });

    it('should contain humulene', () => {
      const humulene = TERPENES.find(t => t.key === 'humulene');
      expect(humulene).toBeDefined();
      expect(humulene?.name).toBe('Humulene');
    });

    it('should contain terpinolene', () => {
      const terpinolene = TERPENES.find(t => t.key === 'terpinolene');
      expect(terpinolene).toBeDefined();
      expect(terpinolene?.name).toBe('Terpinolene');
    });

    it('should contain ocimene', () => {
      const ocimene = TERPENES.find(t => t.key === 'ocimene');
      expect(ocimene).toBeDefined();
      expect(ocimene?.name).toBe('Ocimene');
    });

    it('should have valid percent values between 0 and 1', () => {
      TERPENES.forEach(terpene => {
        expect(terpene.percent).toBeGreaterThanOrEqual(0);
        expect(terpene.percent).toBeLessThanOrEqual(1);
      });
    });

    it('should have non-empty aromas array', () => {
      TERPENES.forEach(terpene => {
        expect(Array.isArray(terpene.aromas)).toBe(true);
        expect(terpene.aromas.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty effects array', () => {
      TERPENES.forEach(terpene => {
        expect(Array.isArray(terpene.effects)).toBe(true);
        expect(terpene.effects.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty strains array', () => {
      TERPENES.forEach(terpene => {
        expect(Array.isArray(terpene.strains)).toBe(true);
        expect(terpene.strains.length).toBeGreaterThan(0);
      });
    });

    it('should have valid waveColor hex values', () => {
      TERPENES.forEach(terpene => {
        expect(terpene.waveColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });
});
