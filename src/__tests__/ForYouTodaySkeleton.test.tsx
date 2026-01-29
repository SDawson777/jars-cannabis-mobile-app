import React from 'react';
import { render } from '@testing-library/react-native';
import ForYouTodaySkeleton from '../components/ForYouTodaySkeleton';

describe('ForYouTodaySkeleton', () => {
  it('should render skeleton', () => {
    const { toJSON } = render(<ForYouTodaySkeleton />);
    expect(toJSON()).toBeTruthy();
  });

  it('should have container', () => {
    const { UNSAFE_getAllByType } = render(<ForYouTodaySkeleton />);
    const views = UNSAFE_getAllByType('View');
    expect(views.length).toBeGreaterThan(0);
  });
});
