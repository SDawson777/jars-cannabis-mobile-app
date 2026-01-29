import haptics from '../lib/haptics';
import Haptic from 'react-native-haptic-feedback';

// Mock react-native-haptic-feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

describe('haptics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const expectedOpts = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };

  describe('success', () => {
    it('triggers notificationSuccess haptic feedback', () => {
      haptics.success();

      expect(Haptic.trigger).toHaveBeenCalledWith('notificationSuccess', expectedOpts);
    });
  });

  describe('warning', () => {
    it('triggers notificationWarning haptic feedback', () => {
      haptics.warning();

      expect(Haptic.trigger).toHaveBeenCalledWith('notificationWarning', expectedOpts);
    });
  });

  describe('error', () => {
    it('triggers notificationError haptic feedback', () => {
      haptics.error();

      expect(Haptic.trigger).toHaveBeenCalledWith('notificationError', expectedOpts);
    });
  });

  describe('selection', () => {
    it('triggers selection haptic feedback', () => {
      haptics.selection();

      expect(Haptic.trigger).toHaveBeenCalledWith('selection', expectedOpts);
    });
  });

  describe('impactLight', () => {
    it('triggers impactLight haptic feedback', () => {
      haptics.impactLight();

      expect(Haptic.trigger).toHaveBeenCalledWith('impactLight', expectedOpts);
    });
  });

  describe('impactMedium', () => {
    it('triggers impactMedium haptic feedback', () => {
      haptics.impactMedium();

      expect(Haptic.trigger).toHaveBeenCalledWith('impactMedium', expectedOpts);
    });
  });

  describe('impactHeavy', () => {
    it('triggers impactHeavy haptic feedback', () => {
      haptics.impactHeavy();

      expect(Haptic.trigger).toHaveBeenCalledWith('impactHeavy', expectedOpts);
    });
  });

  describe('multiple calls', () => {
    it('can trigger multiple haptics in sequence', () => {
      haptics.impactLight();
      haptics.selection();
      haptics.success();

      expect(Haptic.trigger).toHaveBeenCalledTimes(3);
    });
  });

  describe('options configuration', () => {
    it('always uses enableVibrateFallback: true', () => {
      haptics.success();

      const callOpts = (Haptic.trigger as jest.Mock).mock.calls[0][1];
      expect(callOpts.enableVibrateFallback).toBe(true);
    });

    it('always uses ignoreAndroidSystemSettings: false', () => {
      haptics.error();

      const callOpts = (Haptic.trigger as jest.Mock).mock.calls[0][1];
      expect(callOpts.ignoreAndroidSystemSettings).toBe(false);
    });
  });
});
