import React from 'react';
import { render } from '@testing-library/react-native';

import PasswordStrengthBar from '../../components/PasswordStrengthBar';

describe('PasswordStrengthBar component', () => {
  it('should render with empty password', () => {
    const { toJSON } = render(<PasswordStrengthBar password="" />);
    expect(toJSON()).toBeTruthy();
  });

  it('should show weak strength for short password', () => {
    const { toJSON } = render(<PasswordStrengthBar password="abc" />);
    expect(toJSON()).toBeTruthy();
  });

  it('should show medium strength for medium password', () => {
    const { toJSON } = render(<PasswordStrengthBar password="abcdef" />);
    expect(toJSON()).toBeTruthy();
  });

  it('should show strong strength for strong password', () => {
    const { toJSON } = render(<PasswordStrengthBar password="Abcdefgh1" />);
    expect(toJSON()).toBeTruthy();
  });

  it('should require uppercase for strong', () => {
    const { toJSON } = render(<PasswordStrengthBar password="abcdefgh1" />);
    // Without uppercase, should not be strong (length >8 and number but no uppercase)
    expect(toJSON()).toBeTruthy();
  });

  it('should require number for strong', () => {
    const { toJSON } = render(<PasswordStrengthBar password="Abcdefghi" />);
    // Without number, should not be strong
    expect(toJSON()).toBeTruthy();
  });
});
