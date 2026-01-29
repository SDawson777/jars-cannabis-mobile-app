import React from 'react';
import { render } from '@testing-library/react-native';
import SkeletonArticleCard from '../components/SkeletonArticleCard';

describe('SkeletonArticleCard', () => {
  it('should render skeleton card', () => {
    const { toJSON } = render(<SkeletonArticleCard />);
    expect(toJSON()).toBeTruthy();
  });

  it('should have multiple skeleton elements', () => {
    const { UNSAFE_getAllByType } = render(<SkeletonArticleCard />);
    const views = UNSAFE_getAllByType('View');
    expect(views.length).toBeGreaterThan(0);
  });
});
