import { render } from '@testing-library/react-native';
import React from 'react';

import TerpeneWheelScreen from '../screens/TerpeneWheelScreen';

// Mock the terpene wheel components
jest.mock('../terpene_wheel/components/TerpeneWheel', () => ({
  TerpeneWheel: ({ onSelect }: any) => {
    const MockTerpeneWheel = require('react').createElement;
    return MockTerpeneWheel('View', { testID: 'terpene-wheel', onPress: () => onSelect({}) });
  },
}));

jest.mock('../terpene_wheel/components/TerpeneInfoModal', () => ({
  TerpeneInfoModal: () => {
    const MockModal = require('react').createElement;
    return MockModal('View', { testID: 'terpene-info-modal' });
  },
}));

describe('TerpeneWheelScreen', () => {
  it('renders correctly and matches snapshot', () => {
    const component = render(<TerpeneWheelScreen />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders TerpeneWheel component', () => {
    const { getByTestId } = render(<TerpeneWheelScreen />);
    expect(getByTestId('terpene-wheel-screen')).toBeTruthy();
  });

  it('has accessible title', () => {
    const { getByText } = render(<TerpeneWheelScreen />);
    expect(getByText('Terpene Wheel')).toBeTruthy();
  });
});
