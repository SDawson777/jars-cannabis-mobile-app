/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react-native';

import ScreenReaderOnly from '../../components/ScreenReaderOnly';

describe('ScreenReaderOnly', () => {
  it('renders children text', () => {
    const { getByText } = render(<ScreenReaderOnly>Hidden but accessible</ScreenReaderOnly>);
    expect(getByText('Hidden but accessible')).toBeTruthy();
  });

  it('is accessible', () => {
    const { getByRole } = render(<ScreenReaderOnly>Accessible content</ScreenReaderOnly>);
    const element = getByRole('text');
    expect(element).toBeTruthy();
  });

  it('has accessible prop', () => {
    const { getByText } = render(<ScreenReaderOnly>Test content</ScreenReaderOnly>);
    const element = getByText('Test content');
    expect(element.props.accessible).toBe(true);
  });

  it('renders multiple children', () => {
    const { getByText } = render(<ScreenReaderOnly>Part 1 Part 2</ScreenReaderOnly>);
    expect(getByText('Part 1 Part 2')).toBeTruthy();
  });
});
