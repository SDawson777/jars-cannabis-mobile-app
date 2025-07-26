import { contactInfoSchema } from '../src/screens/checkout/ContactInfoScreen';

it('validates required fields', async () => {
  await expect(contactInfoSchema.isValid({ name: '', email: '', phone: '' })).resolves.toBe(false);
  await expect(
    contactInfoSchema.isValid({ name: 'A', email: 'a@test.com', phone: '1' })
  ).resolves.toBe(true);
});
