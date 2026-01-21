import React from 'react';
import { render } from '@testing-library/react-native';
import DataCategoryItem from '../DataCategoryItem';

describe('DataCategoryItem', () => {
  const mockCategory = {
    id: '1',
    label: 'Personal Information',
  };

  it('renders category label', () => {
    const { getByText } = render(<DataCategoryItem category={mockCategory} />);
    expect(getByText('Personal Information')).toBeTruthy();
  });

  it('has accessible role of text', () => {
    const { getAllByRole } = render(<DataCategoryItem category={mockCategory} />);
    expect(getAllByRole('text').length).toBeGreaterThan(0);
  });

  it('has accessibility label matching category label', () => {
    const { getByLabelText } = render(<DataCategoryItem category={mockCategory} />);
    expect(getByLabelText('Personal Information')).toBeTruthy();
  });

  it('renders different category labels', () => {
    const category = { id: '2', label: 'Usage Data' };
    const { getByText } = render(<DataCategoryItem category={category} />);
    expect(getByText('Usage Data')).toBeTruthy();
  });
});
