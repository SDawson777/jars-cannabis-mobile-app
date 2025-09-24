import { create } from 'zustand';

export type AccessibilityTextSize = 'system' | 'sm' | 'md' | 'lg' | 'xl';

export interface AccessibilitySettings {
  textSize: AccessibilityTextSize;
  highContrast: boolean;
  reduceMotion: boolean;
}

interface AccessibilityStore extends AccessibilitySettings {
  setTextSize: (size: AccessibilityTextSize) => void;
  setHighContrast: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  hydrate: (settings: AccessibilitySettings) => void;
}

export const useAccessibilityStore = create<AccessibilityStore>(set => ({
  textSize: 'system',
  highContrast: false,
  reduceMotion: false,
  setTextSize: size => set({ textSize: size }),
  setHighContrast: enabled => set({ highContrast: enabled }),
  setReduceMotion: enabled => set({ reduceMotion: enabled }),
  hydrate: settings => {
    const validTextSizes = ['system', 'sm', 'md', 'lg', 'xl'];
    set({
      textSize: validTextSizes.includes(settings.textSize) ? settings.textSize : 'md',
      highContrast: settings.highContrast ?? false,
      reduceMotion: settings.reduceMotion ?? false,
    });
  },
}));
