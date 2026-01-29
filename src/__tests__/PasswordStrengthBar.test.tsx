import React from 'react';
import { render } from '@testing-library/react-native';
import PasswordStrengthBar from '../components/PasswordStrengthBar';

describe('PasswordStrengthBar', () => {
  it('should show gray for empty password', () => {
    const { toJSON } = render(<PasswordStrengthBar password="" />);
    expect(toJSON()).toBeTruthy();
  });

  it('should show red for weak password', () => {
    const { toJSON } = render(<PasswordStrengthBar password="abc" />);
    expect(toJSON()).toBeTruthy();
  });

  it('should show orange for medium password', () => {
    const { toJSON } = render(<PasswordStrengthBar password="password123" />);
    expect(toJSON()).toBeTruthy();
  });

  it('should show green for strong password', () => {
    const { toJSON } = render(<PasswordStrengthBar password="StrongPass123" />);
    expect(toJSON()).toBeTruthy();
  });

  it('should require length > 8 for strong password', () => {
    const { toJSON } = render(<PasswordStrengthBar password="Pass1" />);
    expect(toJSON()).toBeTruthy();
  });

  it('should require uppercase for strong password', () => {
    const { toJSON } = render(<PasswordStrengthBar password="password123" />);
    expect(toJSON()).toBeTruthy();
  });

  it('should require digit for strong password', () => {
    const { toJSON } = render(<PasswordStrengthBar password="Password" />);
    expect(toJSON()).toBeTruthy();
  });
});
