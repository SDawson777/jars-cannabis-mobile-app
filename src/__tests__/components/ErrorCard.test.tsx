import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import ErrorCard from '../../components/ErrorCard';

describe('ErrorCard component', () => {
  it('should render error message', () => {
    const { getByText } = render(
      <ErrorCard message="Store unavailable" onSwitchStore={jest.fn()} />
    );

    expect(getByText('Store unavailable')).toBeTruthy();
  });

  it('should render switch store button', () => {
    const { getByText } = render(
      <ErrorCard message="Store unavailable" onSwitchStore={jest.fn()} />
    );

    expect(getByText('Switch Store')).toBeTruthy();
  });

  it('should call onSwitchStore when button is pressed', () => {
    const onSwitchStore = jest.fn();
    const { getByText } = render(
      <ErrorCard message="Store unavailable" onSwitchStore={onSwitchStore} />
    );

    fireEvent.press(getByText('Switch Store'));

    expect(onSwitchStore).toHaveBeenCalledTimes(1);
  });
});
