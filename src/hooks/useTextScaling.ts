import { useAccessibilityStore } from '../state/accessibilityStore';

export const useTextScaling = () => {
  const { textSize } = useAccessibilityStore();

  const getScaleFactor = () => {
    switch (textSize) {
      case 'sm':
        return 0.875; // 14px base becomes 12.25px
      case 'md':
        return 1.0; // normal size
      case 'lg':
        return 1.125; // 14px base becomes 15.75px
      case 'xl':
        return 1.25; // 14px base becomes 17.5px
      case 'system':
      default:
        return 1.0; // use system default
    }
  };

  const scaleSize = (baseSize: number) => {
    return Math.round(baseSize * getScaleFactor());
  };

  return { scaleSize, scaleFactor: getScaleFactor() };
};
