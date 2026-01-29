import React from 'react';
import { render } from '@testing-library/react-native';
import CMSImage from '../components/CMSImage';

describe('CMSImage', () => {
  it('should render component', () => {
    const { toJSON } = render(<CMSImage uri="https://example.com/image.jpg" alt="Test Image" />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render with aspect ratio', () => {
    const { toJSON } = render(
      <CMSImage uri="https://example.com/image.jpg" alt="Test" aspectRatio={1.5} />
    );
    expect(toJSON()).toBeTruthy();
  });

  it('should render with custom style', () => {
    const { toJSON } = render(
      <CMSImage uri="https://example.com/image.jpg" alt="Test" style={{ borderRadius: 10 }} />
    );
    expect(toJSON()).toBeTruthy();
  });
});
