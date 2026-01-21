/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react-native';

import StockAlert from '../../components/StockAlert';

// Mock react-native-animatable
jest.mock('react-native-animatable', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    View: ({ children, ...props }: any) => React.createElement(View, props, children),
  };
});

describe('StockAlert', () => {
  it('renders the message', () => {
    const { getByText } = render(<StockAlert message="Low stock!" />);
    expect(getByText('Low stock!')).toBeTruthy();
  });

  it('renders different messages', () => {
    const { getByText } = render(<StockAlert message="Only 5 left" />);
    expect(getByText('Only 5 left')).toBeTruthy();
  });

  it('renders empty message', () => {
    const { getByText } = render(<StockAlert message="" />);
    expect(getByText('')).toBeTruthy();
  });
});
