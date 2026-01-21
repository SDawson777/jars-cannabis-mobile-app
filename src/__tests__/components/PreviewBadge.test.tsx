/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react-native';

import PreviewBadge from '../../components/PreviewBadge';

describe('PreviewBadge', () => {
  it('renders preview mode text', () => {
    const { getByText } = render(<PreviewBadge />);
    expect(getByText('Preview Mode')).toBeTruthy();
  });

  it('has accessible role', () => {
    const { getByRole } = render(<PreviewBadge />);
    expect(getByRole('text')).toBeTruthy();
  });

  it('has accessibility label', () => {
    const { getByLabelText } = render(<PreviewBadge />);
    expect(getByLabelText('Preview mode')).toBeTruthy();
  });
});
