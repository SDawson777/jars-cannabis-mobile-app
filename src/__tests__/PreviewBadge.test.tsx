import React from 'react';
import { render } from '@testing-library/react-native';
import PreviewBadge from '../components/PreviewBadge';

describe('PreviewBadge', () => {
  it('should render "Preview Mode" text', () => {
    const { getByText } = render(<PreviewBadge />);
    expect(getByText('Preview Mode')).toBeTruthy();
  });

  it('should have text accessibility role', () => {
    const { getByRole } = render(<PreviewBadge />);
    expect(getByRole('text')).toBeTruthy();
  });

  it('should have accessibility label', () => {
    const { getByLabelText } = render(<PreviewBadge />);
    expect(getByLabelText('Preview mode')).toBeTruthy();
  });

  it('should render correctly', () => {
    const { toJSON } = render(<PreviewBadge />);
    expect(toJSON()).toBeTruthy();
  });
});
