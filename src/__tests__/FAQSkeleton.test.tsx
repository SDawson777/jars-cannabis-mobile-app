import React from 'react';
import { render } from '@testing-library/react-native';
import FAQSkeleton from '../components/FAQSkeleton';

describe('FAQSkeleton', () => {
  it('should render skeleton', () => {
    const { toJSON } = render(<FAQSkeleton />);
    expect(toJSON()).toBeTruthy();
  });

  it('should have multiple skeleton rows', () => {
    const { UNSAFE_getAllByType } = render(<FAQSkeleton />);
    const views = UNSAFE_getAllByType('View');
    expect(views.length).toBeGreaterThan(0);
  });
});
