/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import OfflineNotice from '../../components/OfflineNotice';
import { useNetInfo } from '@react-native-community/netinfo';

jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: jest.fn(),
}));

const mockUseNetInfo = useNetInfo as jest.MockedFunction<typeof useNetInfo>;

describe('OfflineNotice', () => {
  it('shows banner when offline', () => {
    mockUseNetInfo.mockReturnValue({
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
    } as any);

    const { getByText } = render(<OfflineNotice />);
    expect(getByText('Offline Mode')).toBeDefined();
  });

  it('hides banner when online', () => {
    mockUseNetInfo.mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    } as any);

    const { queryByText } = render(<OfflineNotice />);
    expect(queryByText('Offline Mode')).toBeNull();
  });

  it('hides banner when connection status unknown', () => {
    mockUseNetInfo.mockReturnValue({
      isConnected: null,
      isInternetReachable: null,
      type: 'unknown',
    } as any);

    const { queryByText } = render(<OfflineNotice />);
    expect(queryByText('Offline Mode')).toBeNull();
  });

  it('shows banner only when explicitly offline', () => {
    mockUseNetInfo.mockReturnValue({
      isConnected: false,
      isInternetReachable: null,
      type: 'cellular',
    } as any);

    const { getByText } = render(<OfflineNotice />);
    expect(getByText('Offline Mode')).toBeDefined();
  });
});
