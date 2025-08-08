import { addressSchema } from '../../screens/account/addressSchema';

describe('addressSchema', () => {
  it('validates correct data', async () => {
    const valid = await addressSchema.isValid({
      label: 'Home',
      line1: '123 Main',
      city: 'Detroit',
      state: 'MI',
      zip: '12345',
    });
    expect(valid).toBe(true);
  });

  it('fails with missing or invalid fields', async () => {
    const valid = await addressSchema.isValid({
      label: '',
      line1: '',
      city: '',
      state: '',
      zip: 'abc',
    });
    expect(valid).toBe(false);
  });
});
