import React from 'react';
import { render } from '@testing-library/react-native';
import CheckoutStack from '../navigation/CheckoutStack';

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: any) => children || null,
    Screen: () => null,
  }),
}));

jest.mock('../screens/checkout/ContactInfoScreen', () => 'ContactInfoScreen');
jest.mock('../screens/checkout/DeliveryMethodScreen', () => 'DeliveryMethodScreen');

describe('CheckoutStack', () => {
  it('should render', () => {
    const { toJSON } = render(<CheckoutStack />);
    expect(toJSON).toBeDefined();
  });
});
