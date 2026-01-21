import React from 'react';
import { render } from '@testing-library/react-native';
import PreviewBadge from '../PreviewBadge';

describe('PreviewBadge', () => {
  it('renders Preview Mode text', () => {
    const { getByText } = render(<PreviewBadge />);
    expect(getByText('Preview Mode')).toBeTruthy();
  });

  it('has accessibility label', () => {
    const { getByLabelText } = render(<PreviewBadge />);
    expect(getByLabelText('Preview mode')).toBeTruthy();
  });

  it('has text accessibility role', () => {
    const { getByRole } = render(<PreviewBadge />);
    expect(getByRole('text')).toBeTruthy();
  });
});
