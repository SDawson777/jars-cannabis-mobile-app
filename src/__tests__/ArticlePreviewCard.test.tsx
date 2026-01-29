import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ArticlePreviewCard from '../components/ArticlePreviewCard';
import * as haptic from '../utils/haptic';

jest.mock('../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

const mockArticle = {
  __id: 'article-1',
  title: 'Understanding Cannabis Terpenes',
  body: 'Terpenes are aromatic compounds found in cannabis that contribute to its unique scent and flavor profile. They also play a role in the overall effects.',
  slug: 'understanding-cannabis-terpenes',
  author: 'Dr. Jane Smith',
  publishedAt: '2024-01-15',
};

describe('ArticlePreviewCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render article title', () => {
    const { getByText } = render(<ArticlePreviewCard article={mockArticle} onPress={jest.fn()} />);
    expect(getByText('Understanding Cannabis Terpenes')).toBeTruthy();
  });

  it('should render snippet of article body', () => {
    const { getByText } = render(<ArticlePreviewCard article={mockArticle} onPress={jest.fn()} />);
    expect(getByText(/Terpenes are aromatic compounds/)).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<ArticlePreviewCard article={mockArticle} onPress={onPress} />);
    fireEvent.press(getByText('Understanding Cannabis Terpenes'));
    expect(onPress).toHaveBeenCalled();
  });

  it('should trigger haptic feedback on press', () => {
    const { getByText } = render(<ArticlePreviewCard article={mockArticle} onPress={jest.fn()} />);
    fireEvent.press(getByText('Understanding Cannabis Terpenes'));
    expect(haptic.hapticLight).toHaveBeenCalled();
  });

  it('should show preview badge when isPreview is true', () => {
    const { getByText } = render(
      <ArticlePreviewCard article={{ ...mockArticle, isPreview: true }} onPress={jest.fn()} />
    );
    expect(getByText('Preview')).toBeTruthy();
  });

  it('should not show preview badge when isPreview is false', () => {
    const { queryByText } = render(
      <ArticlePreviewCard article={{ ...mockArticle, isPreview: false }} onPress={jest.fn()} />
    );
    expect(queryByText('Preview')).toBeNull();
  });

  it('should truncate snippet to 80 characters', () => {
    const { getByText } = render(<ArticlePreviewCard article={mockArticle} onPress={jest.fn()} />);
    const snippet = getByText(/\.\.\.$/);
    expect(snippet).toBeTruthy();
  });
});
