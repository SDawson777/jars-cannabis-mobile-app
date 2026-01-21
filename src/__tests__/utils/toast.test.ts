// src/__tests__/utils/toast.test.ts
import { toast } from '../../utils/toast';
import { Alert } from 'react-native';

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

describe('toast utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call Alert.alert with the message', () => {
    toast('Test message');
    expect(Alert.alert).toHaveBeenCalledWith('Test message');
  });

  it('should handle empty message', () => {
    toast('');
    expect(Alert.alert).toHaveBeenCalledWith('');
  });

  it('should handle long messages', () => {
    const longMessage = 'This is a very long message that could be used in a toast notification';
    toast(longMessage);
    expect(Alert.alert).toHaveBeenCalledWith(longMessage);
  });
});
