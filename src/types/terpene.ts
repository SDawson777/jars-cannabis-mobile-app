export type TerpeneInfo = {
  key:
    | 'myrcene'
    | 'limonene'
    | 'caryophyllene'
    | 'pinene'
    | 'linalool'
    | 'humulene'
    | 'terpinolene'
    | 'ocimene'
    | 'bisabolol'
    | 'valencene'
    | 'geraniol'
    | 'camphene';
  name: string;
  percent: number; // 0–1 normalized prominence
  aromas: string[];
  effects: string[];
  strains: string[];
  waveColor: string; // subtle aroma hue
};

export interface TerpeneProfileData {
  strain: string;
  dominant: TerpeneInfo['key'];
  terpenes: { key: TerpeneInfo['key']; percent: number }[];
}
