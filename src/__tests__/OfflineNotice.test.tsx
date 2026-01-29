import React from 'react';
import { render } from '@testing-library/react-native';
import OfflineNotice from '../components/OfflineNotice';

const mockNetInfo = { isConnected: true };

jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: () => mockNetInfo,
}));

describe('OfflineNotice', () => {
  it('should render nothing when online', () => {
    mockNetInfo.isConnected = true;
    const { toJSON } = render(<OfflineNotice />);
    expect(toJSON()).toBeNull();
  });

  it('should render offline banner when offline', () => {
    mockNetInfo.isConnected = false;
    const { getByText } = render(<OfflineNotice />);
    expect(getByText('Offline Mode')).toBeTruthy();
  });

  it('should have red background when offline', () => {
    mockNetInfo.isConnected = false;
    const { getByText } = render(<OfflineNotice />);
    const text = getByText('Offline Mode');
    expect(text).toBeTruthy();
  });
});
