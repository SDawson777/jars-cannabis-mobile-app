import React from 'react';
import { render } from '@testing-library/react-native';
import ProductCardSkeleton from '../components/ProductCardSkeleton';

describe('ProductCardSkeleton', () => {
  it('should render skeleton with width', () => {
    const { toJSON } = render(<ProductCardSkeleton width={200} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render with different widths', () => {
    const { rerender } = render(<ProductCardSkeleton width={100} />);
    expect(() => rerender(<ProductCardSkeleton width={300} />)).not.toThrow();
  });
});
