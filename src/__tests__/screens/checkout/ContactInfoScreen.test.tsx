import { contactInfoSchema } from '../../../screens/checkout/ContactInfoScreen';

describe('contactInfoSchema', () => {
  it('should validate correct data', async () => {
    const valid = await contactInfoSchema.isValid({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
    });
    expect(valid).toBe(true);
  });

  it('should reject missing name', async () => {
    const valid = await contactInfoSchema.isValid({
      name: '',
      email: 'john@example.com',
      phone: '555-1234',
    });
    expect(valid).toBe(false);
  });

  it('should reject invalid email', async () => {
    const valid = await contactInfoSchema.isValid({
      name: 'John',
      email: 'invalid',
      phone: '555-1234',
    });
    expect(valid).toBe(false);
  });

  it('should reject missing phone', async () => {
    const valid = await contactInfoSchema.isValid({
      name: 'John',
      email: 'john@example.com',
      phone: '',
    });
    expect(valid).toBe(false);
  });

  it('should return error messages', async () => {
    try {
      await contactInfoSchema.validate({ name: '', email: '', phone: '' });
    } catch (error: any) {
      expect(error.message).toBe('Required');
    }
  });
});
