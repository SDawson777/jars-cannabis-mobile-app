import haptics from '../lib/haptics';
import {
  hapticLight,
  hapticMedium,
  hapticHeavy,
  hapticSuccess,
  hapticWarning,
  hapticError,
} from '../utils/haptic';

// Mock the underlying haptics library
jest.mock('../lib/haptics', () => ({
  impactLight: jest.fn(),
  impactMedium: jest.fn(),
  impactHeavy: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
}));

describe('Utils Haptic Wrapper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call haptics.impactLight when hapticLight is called', () => {
    hapticLight();
    expect(haptics.impactLight).toHaveBeenCalledTimes(1);
  });

  it('should call haptics.impactMedium when hapticMedium is called', () => {
    hapticMedium();
    expect(haptics.impactMedium).toHaveBeenCalledTimes(1);
  });

  it('should call haptics.impactHeavy when hapticHeavy is called', () => {
    hapticHeavy();
    expect(haptics.impactHeavy).toHaveBeenCalledTimes(1);
  });

  it('should call haptics.success when hapticSuccess is called', () => {
    hapticSuccess();
    expect(haptics.success).toHaveBeenCalledTimes(1);
  });

  it('should call haptics.warning when hapticWarning is called', () => {
    hapticWarning();
    expect(haptics.warning).toHaveBeenCalledTimes(1);
  });

  it('should call haptics.error when hapticError is called', () => {
    hapticError();
    expect(haptics.error).toHaveBeenCalledTimes(1);
  });
});
