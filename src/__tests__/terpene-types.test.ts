import type { TerpeneInfo, TerpeneProfileData } from '../types/terpene';

describe('terpene types', () => {
  describe('TerpeneInfo', () => {
    it('has correct structure with all required fields', () => {
      const terpene: TerpeneInfo = {
        key: 'myrcene',
        name: 'Myrcene',
        percent: 0.78,
        aromas: ['Earthy', 'Musky', 'Herbal'],
        effects: ['Relaxing', 'Sedative'],
        strains: ['GDP', 'Blue Dream'],
        waveColor: '#6A4D32',
      };

      expect(terpene.key).toBe('myrcene');
      expect(terpene.name).toBe('Myrcene');
      expect(terpene.percent).toBe(0.78);
      expect(terpene.aromas).toEqual(['Earthy', 'Musky', 'Herbal']);
      expect(terpene.effects).toEqual(['Relaxing', 'Sedative']);
      expect(terpene.strains).toEqual(['GDP', 'Blue Dream']);
      expect(terpene.waveColor).toBe('#6A4D32');
    });

    it('accepts myrcene key', () => {
      const terpene: TerpeneInfo = {
        key: 'myrcene',
        name: 'Myrcene',
        percent: 0.5,
        aromas: ['Earthy'],
        effects: ['Relaxing'],
        strains: ['Strain'],
        waveColor: '#6A4D32',
      };

      expect(terpene.key).toBe('myrcene');
    });

    it('accepts limonene key', () => {
      const terpene: TerpeneInfo = {
        key: 'limonene',
        name: 'Limonene',
        percent: 0.62,
        aromas: ['Citrus', 'Lemon'],
        effects: ['Uplifting'],
        strains: ['Sour Diesel'],
        waveColor: '#FFDD55',
      };

      expect(terpene.key).toBe('limonene');
    });

    it('accepts caryophyllene key', () => {
      const terpene: TerpeneInfo = {
        key: 'caryophyllene',
        name: 'Caryophyllene',
        percent: 0.55,
        aromas: ['Spicy', 'Peppery'],
        effects: ['Anti-inflammatory'],
        strains: ['Girl Scout Cookies'],
        waveColor: '#A05A32',
      };

      expect(terpene.key).toBe('caryophyllene');
    });

    it('accepts pinene key', () => {
      const terpene: TerpeneInfo = {
        key: 'pinene',
        name: 'Pinene',
        percent: 0.47,
        aromas: ['Pine', 'Woody'],
        effects: ['Alertness'],
        strains: ['Jack Herer'],
        waveColor: '#3BAA6B',
      };

      expect(terpene.key).toBe('pinene');
    });

    it('accepts linalool key', () => {
      const terpene: TerpeneInfo = {
        key: 'linalool',
        name: 'Linalool',
        percent: 0.33,
        aromas: ['Floral', 'Lavender'],
        effects: ['Calming'],
        strains: ['LA Confidential'],
        waveColor: '#B08BD6',
      };

      expect(terpene.key).toBe('linalool');
    });

    it('accepts humulene key', () => {
      const terpene: TerpeneInfo = {
        key: 'humulene',
        name: 'Humulene',
        percent: 0.25,
        aromas: ['Earthy', 'Woody'],
        effects: ['Appetite suppressant'],
        strains: ['White Widow'],
        waveColor: '#8B7355',
      };

      expect(terpene.key).toBe('humulene');
    });

    it('accepts terpinolene key', () => {
      const terpene: TerpeneInfo = {
        key: 'terpinolene',
        name: 'Terpinolene',
        percent: 0.15,
        aromas: ['Floral', 'Pine'],
        effects: ['Uplifting'],
        strains: ['Jack Herer'],
        waveColor: '#A8D5BA',
      };

      expect(terpene.key).toBe('terpinolene');
    });

    it('accepts ocimene key', () => {
      const terpene: TerpeneInfo = {
        key: 'ocimene',
        name: 'Ocimene',
        percent: 0.12,
        aromas: ['Sweet', 'Herbal'],
        effects: ['Energizing'],
        strains: ['OG Kush'],
        waveColor: '#FFE4B5',
      };

      expect(terpene.key).toBe('ocimene');
    });

    it('accepts bisabolol key', () => {
      const terpene: TerpeneInfo = {
        key: 'bisabolol',
        name: 'Bisabolol',
        percent: 0.1,
        aromas: ['Floral', 'Sweet'],
        effects: ['Relaxing'],
        strains: ['Harle-Tsu'],
        waveColor: '#E6E6FA',
      };

      expect(terpene.key).toBe('bisabolol');
    });

    it('accepts valencene key', () => {
      const terpene: TerpeneInfo = {
        key: 'valencene',
        name: 'Valencene',
        percent: 0.08,
        aromas: ['Citrus', 'Orange'],
        effects: ['Uplifting'],
        strains: ['Tangie'],
        waveColor: '#FFA500',
      };

      expect(terpene.key).toBe('valencene');
    });

    it('accepts geraniol key', () => {
      const terpene: TerpeneInfo = {
        key: 'geraniol',
        name: 'Geraniol',
        percent: 0.05,
        aromas: ['Floral', 'Sweet'],
        effects: ['Calming'],
        strains: ['Amnesia Haze'],
        waveColor: '#FF69B4',
      };

      expect(terpene.key).toBe('geraniol');
    });

    it('accepts camphene key', () => {
      const terpene: TerpeneInfo = {
        key: 'camphene',
        name: 'Camphene',
        percent: 0.03,
        aromas: ['Woody', 'Earthy'],
        effects: ['Anti-inflammatory'],
        strains: ['Ghost OG'],
        waveColor: '#8B7D6B',
      };

      expect(terpene.key).toBe('camphene');
    });

    it('accepts percent as normalized value 0-1', () => {
      const terpene: TerpeneInfo = {
        key: 'myrcene',
        name: 'Myrcene',
        percent: 0.85,
        aromas: ['Earthy'],
        effects: ['Relaxing'],
        strains: ['Strain'],
        waveColor: '#6A4D32',
      };

      expect(terpene.percent).toBeGreaterThanOrEqual(0);
      expect(terpene.percent).toBeLessThanOrEqual(1);
    });

    it('accepts multiple aromas', () => {
      const terpene: TerpeneInfo = {
        key: 'limonene',
        name: 'Limonene',
        percent: 0.6,
        aromas: ['Citrus', 'Lemon', 'Orange', 'Lime'],
        effects: ['Uplifting'],
        strains: ['Strain'],
        waveColor: '#FFDD55',
      };

      expect(terpene.aromas).toHaveLength(4);
      expect(terpene.aromas).toContain('Citrus');
    });

    it('accepts multiple effects', () => {
      const terpene: TerpeneInfo = {
        key: 'myrcene',
        name: 'Myrcene',
        percent: 0.7,
        aromas: ['Earthy'],
        effects: ['Relaxing', 'Sedative', 'Pain Relief', 'Anti-inflammatory'],
        strains: ['Strain'],
        waveColor: '#6A4D32',
      };

      expect(terpene.effects).toHaveLength(4);
      expect(terpene.effects).toContain('Relaxing');
    });

    it('accepts multiple strains', () => {
      const terpene: TerpeneInfo = {
        key: 'pinene',
        name: 'Pinene',
        percent: 0.5,
        aromas: ['Pine'],
        effects: ['Alertness'],
        strains: ['Jack Herer', 'Blue Dream', 'OG Kush', 'Cannatonic'],
        waveColor: '#3BAA6B',
      };

      expect(terpene.strains).toHaveLength(4);
      expect(terpene.strains).toContain('Jack Herer');
    });

    it('accepts hex color for waveColor', () => {
      const terpene: TerpeneInfo = {
        key: 'limonene',
        name: 'Limonene',
        percent: 0.6,
        aromas: ['Citrus'],
        effects: ['Uplifting'],
        strains: ['Strain'],
        waveColor: '#FFDD55',
      };

      expect(terpene.waveColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe('TerpeneProfileData', () => {
    it('has correct structure with strain, dominant, and terpenes', () => {
      const profile: TerpeneProfileData = {
        strain: 'Blue Dream',
        dominant: 'myrcene',
        terpenes: [
          { key: 'myrcene', percent: 0.78 },
          { key: 'limonene', percent: 0.62 },
          { key: 'pinene', percent: 0.47 },
        ],
      };

      expect(profile.strain).toBe('Blue Dream');
      expect(profile.dominant).toBe('myrcene');
      expect(profile.terpenes).toHaveLength(3);
    });

    it('accepts any terpene key as dominant', () => {
      const terpeneKeys = [
        'myrcene',
        'limonene',
        'caryophyllene',
        'pinene',
        'linalool',
        'humulene',
      ] as const;

      terpeneKeys.forEach(key => {
        const profile: TerpeneProfileData = {
          strain: 'Test Strain',
          dominant: key,
          terpenes: [{ key, percent: 0.8 }],
        };

        expect(profile.dominant).toBe(key);
      });
    });

    it('accepts empty terpenes array', () => {
      const profile: TerpeneProfileData = {
        strain: 'Unknown Strain',
        dominant: 'myrcene',
        terpenes: [],
      };

      expect(profile.terpenes).toEqual([]);
      expect(profile.terpenes).toHaveLength(0);
    });

    it('accepts multiple terpenes in profile', () => {
      const profile: TerpeneProfileData = {
        strain: 'OG Kush',
        dominant: 'caryophyllene',
        terpenes: [
          { key: 'caryophyllene', percent: 0.75 },
          { key: 'myrcene', percent: 0.55 },
          { key: 'limonene', percent: 0.45 },
          { key: 'pinene', percent: 0.35 },
          { key: 'linalool', percent: 0.25 },
        ],
      };

      expect(profile.terpenes).toHaveLength(5);
    });

    it('terpenes have key and percent', () => {
      const profile: TerpeneProfileData = {
        strain: 'Test',
        dominant: 'myrcene',
        terpenes: [
          { key: 'myrcene', percent: 0.8 },
          { key: 'limonene', percent: 0.6 },
        ],
      };

      expect(profile.terpenes[0]).toHaveProperty('key');
      expect(profile.terpenes[0]).toHaveProperty('percent');
      expect(typeof profile.terpenes[0].percent).toBe('number');
    });

    it('accepts various strain names', () => {
      const profile: TerpeneProfileData = {
        strain: 'Super Lemon Haze - Premium Sativa Dominant',
        dominant: 'limonene',
        terpenes: [{ key: 'limonene', percent: 0.85 }],
      };

      expect(profile.strain).toContain('Lemon');
      expect(profile.strain).toContain('Sativa');
    });
  });

  describe('type compatibility', () => {
    it('TerpeneProfileData can contain any valid terpene key', () => {
      const profile: TerpeneProfileData = {
        strain: 'Multi-Terpene Strain',
        dominant: 'myrcene',
        terpenes: [
          { key: 'myrcene', percent: 0.8 },
          { key: 'limonene', percent: 0.7 },
          { key: 'caryophyllene', percent: 0.6 },
          { key: 'pinene', percent: 0.5 },
          { key: 'linalool', percent: 0.4 },
          { key: 'humulene', percent: 0.3 },
          { key: 'terpinolene', percent: 0.2 },
          { key: 'ocimene', percent: 0.15 },
          { key: 'bisabolol', percent: 0.1 },
          { key: 'valencene', percent: 0.08 },
          { key: 'geraniol', percent: 0.05 },
          { key: 'camphene', percent: 0.03 },
        ],
      };

      expect(profile.terpenes).toHaveLength(12);
      expect(profile.terpenes.every(t => typeof t.percent === 'number')).toBe(true);
    });

    it('can sort terpenes by percent', () => {
      const profile: TerpeneProfileData = {
        strain: 'Test',
        dominant: 'myrcene',
        terpenes: [
          { key: 'limonene', percent: 0.5 },
          { key: 'myrcene', percent: 0.8 },
          { key: 'pinene', percent: 0.3 },
        ],
      };

      const sorted = [...profile.terpenes].sort((a, b) => b.percent - a.percent);

      expect(sorted[0].key).toBe('myrcene');
      expect(sorted[0].percent).toBe(0.8);
      expect(sorted[2].key).toBe('pinene');
    });

    it('can filter terpenes by minimum percent', () => {
      const profile: TerpeneProfileData = {
        strain: 'Test',
        dominant: 'myrcene',
        terpenes: [
          { key: 'myrcene', percent: 0.8 },
          { key: 'limonene', percent: 0.3 },
          { key: 'pinene', percent: 0.6 },
        ],
      };

      const prominent = profile.terpenes.filter(t => t.percent > 0.5);

      expect(prominent).toHaveLength(2);
      expect(prominent.map(t => t.key)).toEqual(['myrcene', 'pinene']);
    });

    it('dominant terpene key matches a terpene in the array', () => {
      const profile: TerpeneProfileData = {
        strain: 'Test',
        dominant: 'caryophyllene',
        terpenes: [
          { key: 'caryophyllene', percent: 0.85 },
          { key: 'myrcene', percent: 0.5 },
        ],
      };

      const hasDominant = profile.terpenes.some(t => t.key === profile.dominant);

      expect(hasDominant).toBe(true);
    });

    it('can calculate total terpene content', () => {
      const profile: TerpeneProfileData = {
        strain: 'Test',
        dominant: 'myrcene',
        terpenes: [
          { key: 'myrcene', percent: 0.5 },
          { key: 'limonene', percent: 0.3 },
          { key: 'pinene', percent: 0.2 },
        ],
      };

      const total = profile.terpenes.reduce((sum, t) => sum + t.percent, 0);

      expect(total).toBe(1.0);
    });
  });
});
