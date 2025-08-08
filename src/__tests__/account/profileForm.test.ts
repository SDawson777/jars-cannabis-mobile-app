import { profileSchema } from '../../screens/account/profileSchema';

describe('profileSchema', () => {
  it('validates correct profile', async () => {
    const valid = await profileSchema.isValid({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '1234567890',
    });
    expect(valid).toBe(true);
  });

  it('detects invalid email and short name', async () => {
    const valid = await profileSchema.isValid({
      name: 'A',
      email: 'invalid',
      phone: '',
    });
    expect(valid).toBe(false);
  });
});
