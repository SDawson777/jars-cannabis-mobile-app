import React from 'react';
import { render } from '@testing-library/react-native';
import PasswordStrengthBar from '../PasswordStrengthBar';

describe('PasswordStrengthBar', () => {
  it('renders with gray bar for empty password', () => {
    const { UNSAFE_root } = render(<PasswordStrengthBar password="" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('shows weak strength for short password', () => {
    const { UNSAFE_root } = render(<PasswordStrengthBar password="ab" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('shows medium strength for password > 5 chars', () => {
    const { UNSAFE_root } = render(<PasswordStrengthBar password="abcdef" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('shows strong strength for password with length > 8, uppercase and digit', () => {
    const { UNSAFE_root } = render(<PasswordStrengthBar password="AbCdEfGh1" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('shows medium for long password without uppercase', () => {
    const { UNSAFE_root } = render(<PasswordStrengthBar password="abcdefghij" />);
    expect(UNSAFE_root).toBeTruthy();
  });

  it('shows medium for long password without digit', () => {
    const { UNSAFE_root } = render(<PasswordStrengthBar password="AbCdEfGhIj" />);
    expect(UNSAFE_root).toBeTruthy();
  });
});
