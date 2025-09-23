// Mock react-native-haptic-feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

import Haptic from 'react-native-haptic-feedback';

import haptics from '../lib/haptics';

describe('Haptics Wrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const expectedOptions = { enableVibrateFallback: true, ignoreAndroidSystemSettings: false };

  it('should trigger success notification haptic', () => {
    haptics.success();
    expect(Haptic.trigger).toHaveBeenCalledWith('notificationSuccess', expectedOptions);
  });

  it('should trigger warning notification haptic', () => {
    haptics.warning();
    expect(Haptic.trigger).toHaveBeenCalledWith('notificationWarning', expectedOptions);
  });

  it('should trigger error notification haptic', () => {
    haptics.error();
    expect(Haptic.trigger).toHaveBeenCalledWith('notificationError', expectedOptions);
  });

  it('should trigger selection haptic', () => {
    haptics.selection();
    expect(Haptic.trigger).toHaveBeenCalledWith('selection', expectedOptions);
  });

  it('should trigger light impact haptic', () => {
    haptics.impactLight();
    expect(Haptic.trigger).toHaveBeenCalledWith('impactLight', expectedOptions);
  });

  it('should trigger medium impact haptic', () => {
    haptics.impactMedium();
    expect(Haptic.trigger).toHaveBeenCalledWith('impactMedium', expectedOptions);
  });

  it('should trigger heavy impact haptic', () => {
    haptics.impactHeavy();
    expect(Haptic.trigger).toHaveBeenCalledWith('impactHeavy', expectedOptions);
  });

  it('should have all expected haptic methods available', () => {
    expect(typeof haptics.success).toBe('function');
    expect(typeof haptics.warning).toBe('function');
    expect(typeof haptics.error).toBe('function');
    expect(typeof haptics.selection).toBe('function');
    expect(typeof haptics.impactLight).toBe('function');
    expect(typeof haptics.impactMedium).toBe('function');
    expect(typeof haptics.impactHeavy).toBe('function');
  });
});
