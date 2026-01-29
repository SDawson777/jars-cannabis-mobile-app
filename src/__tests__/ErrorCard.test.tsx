import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ErrorCard from '../components/ErrorCard';

describe('ErrorCard', () => {
  it('should render error message', () => {
    const { getByText } = render(
      <ErrorCard message="Something went wrong" onSwitchStore={jest.fn()} />
    );
    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('should render switch store button', () => {
    const { getByText } = render(<ErrorCard message="Error" onSwitchStore={jest.fn()} />);
    expect(getByText('Switch Store')).toBeTruthy();
  });

  it('should call onSwitchStore when button pressed', () => {
    const onSwitchStore = jest.fn();
    const { getByText } = render(<ErrorCard message="Error" onSwitchStore={onSwitchStore} />);
    fireEvent.press(getByText('Switch Store'));
    expect(onSwitchStore).toHaveBeenCalled();
  });

  it('should display custom message', () => {
    const { getByText } = render(<ErrorCard message="Store is closed" onSwitchStore={jest.fn()} />);
    expect(getByText('Store is closed')).toBeTruthy();
  });
});
