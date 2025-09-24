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

  it('returns null for invalid format', () => {
    expect(parseAddress('Just Some Words')).toBeNull();
  });
});
