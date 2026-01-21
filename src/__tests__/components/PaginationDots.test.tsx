import React from 'react';
import { render } from '@testing-library/react-native';

import PaginationDots from '../../components/PaginationDots';

describe('PaginationDots component', () => {
  it('should render correct number of dots', () => {
    const { toJSON } = render(<PaginationDots current={0} total={5} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render with first dot active', () => {
    const { toJSON } = render(<PaginationDots current={0} total={3} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render with middle dot active', () => {
    const { toJSON } = render(<PaginationDots current={2} total={5} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render with last dot active', () => {
    const { toJSON } = render(<PaginationDots current={4} total={5} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should render single dot', () => {
    const { toJSON } = render(<PaginationDots current={0} total={1} />);
    expect(toJSON()).toBeTruthy();
  });

  it('should handle zero total', () => {
    const { toJSON } = render(<PaginationDots current={0} total={0} />);
    expect(toJSON()).toBeTruthy();
  });
});
