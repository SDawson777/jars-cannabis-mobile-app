import { addressSchema } from '../../screens/account/addressSchema';

describe('addressSchema', () => {
  it('validates correct data', async () => {
    const valid = await addressSchema.isValid({
      fullName: 'Jane Doe',
      phone: '555-555-5555',
      line1: '123 Main',
      city: 'Detroit',
      _state: 'MI',
      zipCode: '12345',
      country: 'US',
    });
    expect(valid).toBe(true);
  });

  it('fails with missing or invalid fields', async () => {
    const valid = await addressSchema.isValid({
      fullName: '',
      phone: 'abc',
      line1: '',
      city: '',
      _state: '',
      zipCode: 'abc',
      country: '',
    });
    expect(valid).toBe(false);
  });
});
