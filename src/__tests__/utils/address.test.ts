/**
 * @jest-environment jsdom
 */

import { parseAddress, isValidParsedAddress } from '../../utils/address';

describe('address utils', () => {
  describe('parseAddress', () => {
    it('parses basic address format', () => {
      const result = parseAddress('123 Main St, Denver, CO 80202');
      expect(result).toEqual({
        line1: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
      });
    });

    it('parses address with apartment', () => {
      const result = parseAddress('123 Main St Apt 4B, Denver, CO 80202');
      expect(result).toEqual({
        line1: '123 Main St',
        line2: '4B',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
      });
    });

    it('parses address with unit', () => {
      const result = parseAddress('123 Main St Unit 12, Denver, CO 80202');
      expect(result).toEqual({
        line1: '123 Main St',
        line2: '12',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
      });
    });

    it('parses address with suite', () => {
      const result = parseAddress('123 Main St Suite 5A, Denver, CO 80202');
      expect(result).toEqual({
        line1: '123 Main St',
        line2: '5A',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
      });
    });

    it('parses address with # symbol', () => {
      const result = parseAddress('123 Main St #12, Denver, CO 80202');
      expect(result).toEqual({
        line1: '123 Main St',
        line2: '12',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
      });
    });

    it('parses address with ZIP+4', () => {
      const result = parseAddress('123 Main St, Denver, CO 80202-1234');
      expect(result).toEqual({
        line1: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        zipPlus4: '1234',
      });
    });

    it('returns null for empty string', () => {
      const result = parseAddress('');
      expect(result).toBeNull();
    });

    it('returns null for invalid format', () => {
      const result = parseAddress('Invalid Address');
      expect(result).toBeNull();
    });

    it('returns null for missing components', () => {
      const result = parseAddress('123 Main St, Denver');
      expect(result).toBeNull();
    });

    it('handles extra whitespace', () => {
      const result = parseAddress('  123 Main St  ,  Denver  ,  CO  80202  ');
      expect(result).toEqual({
        line1: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
      });
    });

    it('converts state to uppercase', () => {
      const result = parseAddress('123 Main St, Denver, co 80202');
      expect(result).toEqual({
        line1: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
      });
    });
  });

  describe('isValidParsedAddress', () => {
    it('returns true for valid address', () => {
      const addr = {
        line1: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
      };
      expect(isValidParsedAddress(addr)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isValidParsedAddress(null)).toBe(false);
    });

    it('returns false for missing city', () => {
      const addr = {
        line1: '123 Main St',
        city: '',
        state: 'CO',
        zipCode: '80202',
      };
      expect(isValidParsedAddress(addr)).toBe(false);
    });

    it('returns false for missing state', () => {
      const addr = {
        line1: '123 Main St',
        city: 'Denver',
        state: '',
        zipCode: '80202',
      };
      expect(isValidParsedAddress(addr)).toBe(false);
    });

    it('returns false for missing zipCode', () => {
      const addr = {
        line1: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zipCode: '',
      };
      expect(isValidParsedAddress(addr)).toBe(false);
    });
  });
});
