// src/utils/haptic.ts
import * as Haptics from 'expo-haptics';

// Light — subtle selection taps
export const hapticLight = () => Haptics.selectionAsync();

// Medium — meaningful actions (e.g. add/remove)
export const hapticMedium = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Heavy — final/completion actions
export const hapticHeavy = () =>
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

// Notification patterns
export const hapticSuccess = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
export const hapticWarning = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
export const hapticError = () =>
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
