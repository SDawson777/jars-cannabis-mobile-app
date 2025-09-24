import { parseAddress, isValidParsedAddress } from '../utils/address';

describe('parseAddress', () => {
  it('parses a standard US address', () => {
    const addr = parseAddress('123 Main St, Denver, CO 80202');
    expect(isValidParsedAddress(addr)).toBe(true);
    expect(addr).toEqual({
      line1: '123 Main St',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
    });
  });

  it('parses address with Apt designator', () => {
    const addr = parseAddress('500 Market Ave Apt 4B, San Francisco, CA 94105');
    expect(isValidParsedAddress(addr)).toBe(true);
    expect(addr?.line2).toBe('4B');
  });

  it('parses address with # unit and ZIP+4', () => {
    const addr = parseAddress('77 Sunset Blvd #12, Los Angeles, CA 90028-1234');
    expect(isValidParsedAddress(addr)).toBe(true);
    expect(addr?.line2).toBe('12');
    expect(addr?.zipPlus4).toBe('1234');
  });

  it('returns null for invalid format', () => {
    expect(parseAddress('Just Some Words')).toBeNull();
  });
});
