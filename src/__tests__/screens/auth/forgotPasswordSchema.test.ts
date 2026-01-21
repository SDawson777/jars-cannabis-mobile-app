import { forgotPasswordSchema } from '../../../screens/auth/forgotPasswordSchema';

describe('forgotPasswordSchema', () => {
  it('should validate correct email', async () => {
    const result = await forgotPasswordSchema.isValid({ email: 'test@example.com' });
    expect(result).toBe(true);
  });

  it('should reject invalid email', async () => {
    const result = await forgotPasswordSchema.isValid({ email: 'invalid-email' });
    expect(result).toBe(false);
  });

  it('should reject empty email', async () => {
    const result = await forgotPasswordSchema.isValid({ email: '' });
    expect(result).toBe(false);
  });

  it('should reject missing email', async () => {
    const result = await forgotPasswordSchema.isValid({});
    expect(result).toBe(false);
  });

  it('should return correct error message for invalid email', async () => {
    try {
      await forgotPasswordSchema.validate({ email: 'invalid' });
    } catch (error: any) {
      expect(error.message).toBe('Invalid email');
    }
  });

  it('should return correct error message for required email', async () => {
    try {
      await forgotPasswordSchema.validate({ email: '' });
    } catch (error: any) {
      expect(error.message).toBe('Email is required');
    }
  });

  it('should validate various email formats', async () => {
    const validEmails = [
      'user@domain.com',
      'user.name@domain.com',
      'user+tag@domain.org',
      'user@subdomain.domain.co',
    ];

    for (const email of validEmails) {
      const result = await forgotPasswordSchema.isValid({ email });
      expect(result).toBe(true);
    }
  });

  it('should reject invalid email formats', async () => {
    const invalidEmails = ['usernoat.com', '@domain.com', 'user@'];

    for (const email of invalidEmails) {
      const result = await forgotPasswordSchema.isValid({ email });
      expect(result).toBe(false);
    }
  });
});
