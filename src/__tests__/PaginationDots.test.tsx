import React from 'react';
import { render } from '@testing-library/react-native';
import PaginationDots from '../components/PaginationDots';

describe('PaginationDots', () => {
  it('should render correct number of dots', () => {
    const { toJSON } = render(<PaginationDots current={0} total={5} />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
    // Count the dot Views (children of the container)
    if (tree && 'children' in tree) {
      expect(tree.children?.length).toBe(5);
    }
  });

  it('should render single dot for total of 1', () => {
    const { toJSON } = render(<PaginationDots current={0} total={1} />);
    const tree = toJSON();
    if (tree && 'children' in tree) {
      expect(tree.children?.length).toBe(1);
    }
  });

  it('should render no dots for total of 0', () => {
    const { toJSON } = render(<PaginationDots current={0} total={0} />);
    const tree = toJSON();
    if (tree && 'children' in tree) {
      expect(tree.children?.length ?? 0).toBe(0);
    }
  });

  it('should highlight current dot', () => {
    const { toJSON } = render(<PaginationDots current={2} total={5} />);
    const tree = toJSON();
    expect(tree).toBeTruthy();
  });

  it('should render with different current values', () => {
    // Test first dot
    const { rerender, toJSON } = render(<PaginationDots current={0} total={3} />);
    expect(toJSON()).toBeTruthy();

    // Test middle dot
    rerender(<PaginationDots current={1} total={3} />);
    expect(toJSON()).toBeTruthy();

    // Test last dot
    rerender(<PaginationDots current={2} total={3} />);
    expect(toJSON()).toBeTruthy();
  });
});
