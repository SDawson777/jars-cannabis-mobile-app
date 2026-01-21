/**
 * @jest-environment node
 */

import Haptic from 'react-native-haptic-feedback';
import {
  hapticLight,
  hapticMedium,
  hapticHeavy,
  hapticSuccess,
  hapticWarning,
  hapticError,
} from '../../utils/haptic';

// Get the mock from jest.setup.ts
const mockTrigger = Haptic.trigger as jest.Mock;

describe('haptic utils', () => {
  beforeEach(() => {
    mockTrigger.mockClear();
  });

  describe('hapticLight', () => {
    it('calls haptic trigger with impactLight', () => {
      hapticLight();
      expect(mockTrigger).toHaveBeenCalledWith('impactLight', expect.any(Object));
    });
  });

  describe('hapticMedium', () => {
    it('calls haptic trigger with impactMedium', () => {
      hapticMedium();
      expect(mockTrigger).toHaveBeenCalledWith('impactMedium', expect.any(Object));
    });
  });

  describe('hapticHeavy', () => {
    it('calls haptic trigger with impactHeavy', () => {
      hapticHeavy();
      expect(mockTrigger).toHaveBeenCalledWith('impactHeavy', expect.any(Object));
    });
  });

  describe('hapticSuccess', () => {
    it('calls haptic trigger with notificationSuccess', () => {
      hapticSuccess();
      expect(mockTrigger).toHaveBeenCalledWith('notificationSuccess', expect.any(Object));
    });
  });

  describe('hapticWarning', () => {
    it('calls haptic trigger with notificationWarning', () => {
      hapticWarning();
      expect(mockTrigger).toHaveBeenCalledWith('notificationWarning', expect.any(Object));
    });
  });

  describe('hapticError', () => {
    it('calls haptic trigger with notificationError', () => {
      hapticError();
      expect(mockTrigger).toHaveBeenCalledWith('notificationError', expect.any(Object));
    });
  });
});
