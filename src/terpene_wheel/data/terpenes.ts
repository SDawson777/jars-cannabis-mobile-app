export type TerpeneInfo = {
  key:
    | 'myrcene'
    | 'limonene'
    | 'caryophyllene'
    | 'pinene'
    | 'linalool'
    | 'humulene'
    | 'terpinolene'
    | 'ocimene';
  name: string;
  percent: number; // 0–1 normalized prominence
  aromas: string[];
  effects: string[];
  strains: string[];
  waveColor: string; // subtle aroma hue
};

export const TERPENES: TerpeneInfo[] = [
  {
    key: 'myrcene',
    name: 'Myrcene',
    percent: 0.78,
    aromas: ['Earthy', 'Musky', 'Herbal'],
    effects: ['Relaxing', 'Sedative'],
    strains: ['GDP', 'Blue Dream'],
    waveColor: '#6A4D32',
  },
  {
    key: 'limonene',
    name: 'Limonene',
    percent: 0.62,
    aromas: ['Citrus', 'Lemon', 'Orange'],
    effects: ['Uplifting', 'Mood-boost'],
    strains: ['Sour Diesel'],
    waveColor: '#FFDD55',
  },
  {
    key: 'caryophyllene',
    name: 'Caryophyllene',
    percent: 0.55,
    aromas: ['Spicy', 'Peppery'],
    effects: ['Anti-inflammatory'],
    strains: ['Girl Scout Cookies'],
    waveColor: '#A05A32',
  },
  {
    key: 'pinene',
    name: 'Pinene',
    percent: 0.47,
    aromas: ['Pine', 'Woody'],
    effects: ['Alertness'],
    strains: ['Jack Herer'],
    waveColor: '#3BAA6B',
  },
  {
    key: 'linalool',
    name: 'Linalool',
    percent: 0.33,
    aromas: ['Floral', 'Lavender'],
    effects: ['Calming'],
    strains: ['LA Confidential'],
    waveColor: '#B08BD6',
  },
  {
    key: 'humulene',
    name: 'Humulene',
    percent: 0.28,
    aromas: ['Hoppy', 'Earthy'],
    effects: ['Appetite suppression'],
    strains: ['Headband'],
    waveColor: '#7C6B4F',
  },
  {
    key: 'terpinolene',
    name: 'Terpinolene',
    percent: 0.21,
    aromas: ['Piney', 'Herbal', 'Citrus'],
    effects: ['Creative'],
    strains: ['Dutch Treat'],
    waveColor: '#5EC4B4',
  },
  {
    key: 'ocimene',
    name: 'Ocimene',
    percent: 0.18,
    aromas: ['Sweet', 'Herbal'],
    effects: ['Uplifting'],
    strains: ['Amnesia Haze'],
    waveColor: '#9AD87A',
  },
];
