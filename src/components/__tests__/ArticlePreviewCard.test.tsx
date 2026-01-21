// src/components/__tests__/ArticlePreviewCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ArticlePreviewCard from '../ArticlePreviewCard';

// Mock dependencies
jest.mock('../../utils/haptic', () => ({
  hapticLight: jest.fn(),
}));

const mockArticle = {
  __id: 'article-1',
  title: 'Understanding Cannabis Terpenes',
  body: 'Terpenes are aromatic compounds found in many plants, including cannabis. They contribute to the unique scent and flavor profiles of different strains.',
  image: { url: 'https://example.com/article.jpg', alt: 'Terpenes' },
};

describe('ArticlePreviewCard', () => {
  const defaultProps = {
    article: mockArticle,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders article title', () => {
      const { getByText } = render(<ArticlePreviewCard {...defaultProps} />);
      expect(getByText('Understanding Cannabis Terpenes')).toBeTruthy();
    });

    it('renders article snippet (first 80 characters)', () => {
      const { getByText } = render(<ArticlePreviewCard {...defaultProps} />);
      // First 80 characters of the body
      expect(getByText(/Terpenes are aromatic compounds/)).toBeTruthy();
    });

    it('does not render Preview badge for non-preview articles', () => {
      const { queryByText } = render(<ArticlePreviewCard {...defaultProps} />);
      expect(queryByText('Preview')).toBeNull();
    });

    it('renders Preview badge for preview articles', () => {
      const previewArticle = { ...mockArticle, isPreview: true };
      const { getByText } = render(
        <ArticlePreviewCard {...defaultProps} article={previewArticle} />
      );
      expect(getByText('Preview')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onPress when card is pressed', () => {
      const onPress = jest.fn();
      const { getByText } = render(<ArticlePreviewCard {...defaultProps} onPress={onPress} />);

      fireEvent.press(getByText('Understanding Cannabis Terpenes'));

      expect(onPress).toHaveBeenCalled();
    });

    it('triggers haptic feedback on press', () => {
      const { hapticLight } = require('../../utils/haptic');
      const { getByText } = render(<ArticlePreviewCard {...defaultProps} />);

      fireEvent.press(getByText('Understanding Cannabis Terpenes'));

      expect(hapticLight).toHaveBeenCalled();
    });
  });

  describe('Body Truncation', () => {
    it('truncates long body text to 80 characters', () => {
      const longArticle = {
        ...mockArticle,
        body: 'A'.repeat(200),
      };
      const { getByText } = render(<ArticlePreviewCard {...defaultProps} article={longArticle} />);
      // Should show 80 'A's followed by '...'
      expect(getByText('A'.repeat(80) + '...')).toBeTruthy();
    });
  });
});
