import React from 'react';
import { render } from '@testing-library/react-native';
import ScreenReaderOnly from '../components/ScreenReaderOnly';

describe('ScreenReaderOnly', () => {
  it('should render children text', () => {
    const { getByText } = render(<ScreenReaderOnly>Screen reader announcement</ScreenReaderOnly>);
    expect(getByText('Screen reader announcement')).toBeTruthy();
  });

  it('should have text accessibility role', () => {
    const { getByRole } = render(<ScreenReaderOnly>Important info</ScreenReaderOnly>);
    expect(getByRole('text')).toBeTruthy();
  });

  it('should be accessible', () => {
    const { getByText } = render(<ScreenReaderOnly>Accessible content</ScreenReaderOnly>);
    const element = getByText('Accessible content');
    expect(element.props.accessible).toBe(true);
  });

  it('should render with multiple children', () => {
    const { toJSON } = render(<ScreenReaderOnly>First line. Second line.</ScreenReaderOnly>);
    expect(toJSON()).toBeTruthy();
  });

  it('should handle empty content', () => {
    const { toJSON } = render(<ScreenReaderOnly></ScreenReaderOnly>);
    expect(toJSON()).toBeTruthy();
  });
});
