export type TerpeneKey =
  | 'myrcene'
  | 'limonene'
  | 'caryophyllene'
  | 'pinene'
  | 'linalool'
  | 'humulene'
  | 'terpinolene'
  | 'ocimene';

export interface TerpeneInfo {
  key: TerpeneKey;
  name: string;
  percent: number; // 0–1 normalized prominence
  aromas: string[];
  effects: string[];
  strains: string[];
  waveColor: string; // subtle aroma hue
}

export interface TerpeneProfileData {
  terpenes: TerpeneInfo[];
}
