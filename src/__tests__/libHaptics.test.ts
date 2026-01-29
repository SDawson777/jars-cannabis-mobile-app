import Haptic from 'react-native-haptic-feedback';
import haptics from '../lib/haptics';

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

describe('haptics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should trigger success haptic', () => {
    haptics.success();
    expect(Haptic.trigger).toHaveBeenCalledWith('notificationSuccess', expect.any(Object));
  });

  it('should trigger warning haptic', () => {
    haptics.warning();
    expect(Haptic.trigger).toHaveBeenCalledWith('notificationWarning', expect.any(Object));
  });

  it('should trigger error haptic', () => {
    haptics.error();
    expect(Haptic.trigger).toHaveBeenCalledWith('notificationError', expect.any(Object));
  });

  it('should trigger selection haptic', () => {
    haptics.selection();
    expect(Haptic.trigger).toHaveBeenCalledWith('selection', expect.any(Object));
  });

  it('should trigger impactLight haptic', () => {
    haptics.impactLight();
    expect(Haptic.trigger).toHaveBeenCalledWith('impactLight', expect.any(Object));
  });

  it('should trigger impactMedium haptic', () => {
    haptics.impactMedium();
    expect(Haptic.trigger).toHaveBeenCalledWith('impactMedium', expect.any(Object));
  });

  it('should trigger impactHeavy haptic', () => {
    haptics.impactHeavy();
    expect(Haptic.trigger).toHaveBeenCalledWith('impactHeavy', expect.any(Object));
  });

  it('should pass options with enableVibrateFallback', () => {
    haptics.success();
    expect(Haptic.trigger).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ enableVibrateFallback: true })
    );
  });

  it('should pass options with ignoreAndroidSystemSettings', () => {
    haptics.success();
    expect(Haptic.trigger).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ ignoreAndroidSystemSettings: false })
    );
  });
});
