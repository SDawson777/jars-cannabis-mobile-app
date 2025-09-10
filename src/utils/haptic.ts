// src/utils/haptic.ts
import haptics from '../lib/haptics';

// Light — subtle selection taps
export const hapticLight = () => haptics.impactLight();

// Medium — meaningful actions (e.g. add/remove)
export const hapticMedium = () => haptics.impactMedium();

// Heavy — final/completion actions
export const hapticHeavy = () => haptics.impactHeavy();

// Notification patterns
export const hapticSuccess = () => haptics.success();
export const hapticWarning = () => haptics.warning();
export const hapticError = () => haptics.error();
