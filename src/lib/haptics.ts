import Haptic from 'react-native-haptic-feedback';

const opts = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };

export const haptics = {
  success: () => Haptic.trigger('notificationSuccess', opts),
  warning: () => Haptic.trigger('notificationWarning', opts),
  error: () => Haptic.trigger('notificationError', opts),
  selection: () => Haptic.trigger('selection', opts),
  impactLight: () => Haptic.trigger('impactLight', opts),
  impactMedium: () => Haptic.trigger('impactMedium', opts),
  impactHeavy: () => Haptic.trigger('impactHeavy', opts),
};

export default haptics;
