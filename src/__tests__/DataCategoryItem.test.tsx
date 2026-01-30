import React from 'react';
import { render } from '@testing-library/react-native';
import DataCategoryItem from '../components/DataCategoryItem';

describe('DataCategoryItem', () => {
  const mockCategory = {
    id: 'category-1',
    label: 'Test Category',
  };

  it('should render category label', () => {
    const { getByText } = render(<DataCategoryItem category={mockCategory} />);
    expect(getByText('Test Category')).toBeTruthy();
  });

  it('should have accessibility label', () => {
    const { getByLabelText } = render(<DataCategoryItem category={mockCategory} />);
    expect(getByLabelText('Test Category')).toBeTruthy();
  });
});
