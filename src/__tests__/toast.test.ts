import { Alert } from 'react-native';
import { toast } from '../utils/toast';

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

describe('toast', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call Alert.alert with message', () => {
    toast('Test message');
    expect(Alert.alert).toHaveBeenCalledWith('Test message');
  });

  it('should handle empty message', () => {
    toast('');
    expect(Alert.alert).toHaveBeenCalledWith('');
  });

  it('should handle long message', () => {
    const longMessage =
      'This is a very long message that should still work fine with the toast function';
    toast(longMessage);
    expect(Alert.alert).toHaveBeenCalledWith(longMessage);
  });

  it('should handle special characters', () => {
    toast('Success! 🎉');
    expect(Alert.alert).toHaveBeenCalledWith('Success! 🎉');
  });
});
