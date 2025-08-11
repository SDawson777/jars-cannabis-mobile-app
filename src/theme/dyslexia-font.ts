import { Platform } from 'react-native';

export const DYSLEXIA_FONT_FAMILY = Platform.select({
  ios: 'OpenDyslexic3',
  android: 'opendyslexic3',
});
