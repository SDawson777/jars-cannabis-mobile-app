/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Image } from 'react-native';

import CMSImage from '../../components/CMSImage';

describe('CMSImage', () => {
  it('renders an image with given uri', () => {
    const { UNSAFE_getByType } = render(<CMSImage uri="https://example.com/image.jpg" />);

    const image = UNSAFE_getByType(Image);
    expect(image.props.source.uri).toBe('https://example.com/image.jpg');
  });

  it('sets accessibility label from alt prop', () => {
    const { getByLabelText } = render(
      <CMSImage uri="https://example.com/image.jpg" alt="Product image" />
    );

    expect(getByLabelText('Product image')).toBeTruthy();
  });

  it('applies aspect ratio from prop', () => {
    const { UNSAFE_getByType } = render(
      <CMSImage uri="https://example.com/image.jpg" aspectRatio={1.5} />
    );

    const image = UNSAFE_getByType(Image);
    // Style is an array, check that aspectRatio is applied
    const styles = image.props.style;
    expect(styles).toEqual(expect.arrayContaining([expect.objectContaining({ aspectRatio: 1.5 })]));
  });

  it('applies custom style', () => {
    const { UNSAFE_getByType } = render(
      <CMSImage uri="https://example.com/image.jpg" style={{ borderRadius: 10 }} />
    );

    const image = UNSAFE_getByType(Image);
    const styles = image.props.style;
    expect(styles).toEqual(expect.arrayContaining([expect.objectContaining({ borderRadius: 10 })]));
  });

  it('uses cover resize mode', () => {
    const { UNSAFE_getByType } = render(<CMSImage uri="https://example.com/image.jpg" />);

    const image = UNSAFE_getByType(Image);
    expect(image.props.resizeMode).toBe('cover');
  });

  it('has progressive rendering enabled', () => {
    const { UNSAFE_getByType } = render(<CMSImage uri="https://example.com/image.jpg" />);

    const image = UNSAFE_getByType(Image);
    expect(image.props.progressiveRenderingEnabled).toBe(true);
  });

  it('sets width to 100%', () => {
    const { UNSAFE_getByType } = render(<CMSImage uri="https://example.com/image.jpg" />);

    const image = UNSAFE_getByType(Image);
    const styles = image.props.style;
    expect(styles).toEqual(expect.arrayContaining([expect.objectContaining({ width: '100%' })]));
  });
});
