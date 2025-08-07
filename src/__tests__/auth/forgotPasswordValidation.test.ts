import { forgotPasswordSchema } from '../../screens/auth/forgotPasswordSchema';

describe('forgotPasswordSchema', () => {
  it('rejects empty email', async () => {
    const valid = await forgotPasswordSchema.isValid({ email: '' });
    expect(valid).toBe(false);
  });

  it('rejects invalid email format', async () => {
    const valid = await forgotPasswordSchema.isValid({ email: 'not-an-email' });
    expect(valid).toBe(false);
  });

  it('accepts valid email', async () => {
    const valid = await forgotPasswordSchema.isValid({ email: 'user@example.com' });
    expect(valid).toBe(true);
  });
});
