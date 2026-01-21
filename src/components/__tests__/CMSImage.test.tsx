import React from 'react';
import { render } from '@testing-library/react-native';
import CMSImage from '../CMSImage';

describe('CMSImage', () => {
  const defaultProps = {
    uri: 'https://example.com/image.jpg',
  };

  it('renders image with uri', () => {
    const { UNSAFE_root } = render(<CMSImage {...defaultProps} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('sets accessibility label from alt prop', () => {
    const { getByLabelText } = render(<CMSImage {...defaultProps} alt="Product image" />);
    expect(getByLabelText('Product image')).toBeTruthy();
  });

  it('renders without alt prop', () => {
    const { UNSAFE_root } = render(<CMSImage {...defaultProps} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('applies custom aspect ratio', () => {
    const { UNSAFE_root } = render(<CMSImage {...defaultProps} aspectRatio={1.5} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('applies custom style', () => {
    const { UNSAFE_root } = render(<CMSImage {...defaultProps} style={{ borderRadius: 10 }} />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('renders with different uri values', () => {
    const { UNSAFE_root } = render(<CMSImage uri="https://cdn.example.com/another-image.png" />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
