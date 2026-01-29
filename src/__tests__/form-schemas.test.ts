import { profileSchema, type ProfileFormValues } from '../screens/account/profileSchema';
import { addressSchema, type AddressFormValues } from '../screens/account/addressSchema';

describe('form validation schemas', () => {
  describe('profileSchema', () => {
    it('validates valid profile data', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-0100',
      };

      await expect(profileSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('requires name field', async () => {
      const invalidData = {
        email: 'test@example.com',
      };

      await expect(profileSchema.validate(invalidData)).rejects.toThrow('Name is required');
    });

    it('requires name to be at least 2 characters', async () => {
      const invalidData = {
        name: 'A',
        email: 'test@example.com',
      };

      await expect(profileSchema.validate(invalidData)).rejects.toThrow('Name too short');
    });

    it('requires email field', async () => {
      const invalidData = {
        name: 'John Doe',
      };

      await expect(profileSchema.validate(invalidData)).rejects.toThrow('Email is required');
    });

    it('validates email format', async () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
      };

      await expect(profileSchema.validate(invalidData)).rejects.toThrow('Invalid email');
    });

    it('accepts valid email formats', async () => {
      const validEmails = [
        'john@example.com',
        'jane.doe@company.co.uk',
        'user+tag@domain.com',
        'test_user@sub.domain.org',
      ];

      for (const email of validEmails) {
        const data = { name: 'Test User', email };
        await expect(profileSchema.validate(data)).resolves.toBeDefined();
      }
    });

    it('makes phone optional', async () => {
      const dataWithoutPhone = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      await expect(profileSchema.validate(dataWithoutPhone)).resolves.toBeDefined();
    });

    it('accepts phone when provided', async () => {
      const dataWithPhone = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
      };

      await expect(profileSchema.validate(dataWithPhone)).resolves.toEqual(dataWithPhone);
    });

    it('type inference works correctly', () => {
      const profile: ProfileFormValues = {
        name: 'Test',
        email: 'test@example.com',
        phone: '555-0000',
      };

      expect(profile.name).toBe('Test');
      expect(profile.email).toBe('test@example.com');
    });
  });

  describe('addressSchema', () => {
    it('validates complete valid address', async () => {
      const validAddress = {
        fullName: 'Jane Smith',
        phone: '555-0200',
        line1: '123 Main Street',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        country: 'US',
      };

      await expect(addressSchema.validate(validAddress)).resolves.toEqual(validAddress);
    });

    it('requires fullName', async () => {
      const invalidData = {
        phone: '555-0200',
        line1: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        country: 'US',
      };

      await expect(addressSchema.validate(invalidData)).rejects.toThrow('Full name is required');
    });

    it('requires phone', async () => {
      const invalidData = {
        fullName: 'John Doe',
        line1: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        country: 'US',
      };

      await expect(addressSchema.validate(invalidData)).rejects.toThrow('Phone is required');
    });

    it('requires line1 (street address)', async () => {
      const invalidData = {
        fullName: 'John Doe',
        phone: '555-0100',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        country: 'US',
      };

      await expect(addressSchema.validate(invalidData)).rejects.toThrow(
        'Street address is required'
      );
    });

    it('requires city', async () => {
      const invalidData = {
        fullName: 'John Doe',
        phone: '555-0100',
        line1: '123 Main St',
        state: 'CO',
        zipCode: '80202',
        country: 'US',
      };

      await expect(addressSchema.validate(invalidData)).rejects.toThrow('City is required');
    });

    it('requires state', async () => {
      const invalidData = {
        fullName: 'John Doe',
        phone: '555-0100',
        line1: '123 Main St',
        city: 'Denver',
        zipCode: '80202',
        country: 'US',
      };

      await expect(addressSchema.validate(invalidData)).rejects.toThrow('State is required');
    });

    it('requires zipCode', async () => {
      const invalidData = {
        fullName: 'John Doe',
        phone: '555-0100',
        line1: '123 Main St',
        city: 'Denver',
        state: 'CO',
        country: 'US',
      };

      await expect(addressSchema.validate(invalidData)).rejects.toThrow('ZIP is required');
    });

    it('requires country', async () => {
      const invalidData = {
        fullName: 'John Doe',
        phone: '555-0100',
        line1: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
      };

      await expect(addressSchema.validate(invalidData)).rejects.toThrow('Country is required');
    });

    it('validates zipCode is numeric', async () => {
      const invalidData = {
        fullName: 'John Doe',
        phone: '555-0100',
        line1: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zipCode: 'ABCDE',
        country: 'US',
      };

      await expect(addressSchema.validate(invalidData)).rejects.toThrow('ZIP must be numeric');
    });

    it('accepts valid numeric zipCode', async () => {
      const validData = {
        fullName: 'John Doe',
        phone: '555-0100',
        line1: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        country: 'US',
      };

      await expect(addressSchema.validate(validData)).resolves.toBeDefined();
    });

    it('makes line2 optional', async () => {
      const dataWithoutLine2 = {
        fullName: 'John Doe',
        phone: '555-0100',
        line1: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        country: 'US',
      };

      await expect(addressSchema.validate(dataWithoutLine2)).resolves.toBeDefined();
    });

    it('accepts line2 when provided', async () => {
      const dataWithLine2 = {
        fullName: 'John Doe',
        phone: '555-0100',
        line1: '123 Main St',
        line2: 'Apt 4B',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        country: 'US',
      };

      await expect(addressSchema.validate(dataWithLine2)).resolves.toEqual(dataWithLine2);
    });

    it('accepts null for line2', async () => {
      const dataWithNullLine2 = {
        fullName: 'John Doe',
        phone: '555-0100',
        line1: '123 Main St',
        line2: null,
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        country: 'US',
      };

      await expect(addressSchema.validate(dataWithNullLine2)).resolves.toBeDefined();
    });

    it('makes isDefault optional', async () => {
      const dataWithoutDefault = {
        fullName: 'John Doe',
        phone: '555-0100',
        line1: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        country: 'US',
      };

      await expect(addressSchema.validate(dataWithoutDefault)).resolves.toBeDefined();
    });

    it('accepts isDefault when provided', async () => {
      const dataWithDefault = {
        fullName: 'John Doe',
        phone: '555-0100',
        line1: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        country: 'US',
        isDefault: true,
      };

      await expect(addressSchema.validate(dataWithDefault)).resolves.toEqual(dataWithDefault);
    });

    it('accepts 5-digit ZIP codes', async () => {
      const data = {
        fullName: 'Test User',
        phone: '555-0100',
        line1: '123 Test St',
        city: 'City',
        state: 'CA',
        zipCode: '94102',
        country: 'US',
      };

      await expect(addressSchema.validate(data)).resolves.toBeDefined();
    });

    it('accepts 9-digit ZIP codes', async () => {
      const data = {
        fullName: 'Test User',
        phone: '555-0100',
        line1: '123 Test St',
        city: 'City',
        state: 'CA',
        zipCode: '941021234',
        country: 'US',
      };

      await expect(addressSchema.validate(data)).resolves.toBeDefined();
    });

    it('type inference works correctly', () => {
      const address: AddressFormValues = {
        fullName: 'Test User',
        phone: '555-0100',
        line1: '123 Test St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        country: 'US',
        line2: 'Apt 1',
        isDefault: true,
      };

      expect(address.fullName).toBe('Test User');
      expect(address.city).toBe('Denver');
    });
  });

  describe('schema integration', () => {
    it('profile and address schemas can be used together', async () => {
      const profile = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-0100',
      };

      const address = {
        fullName: 'John Doe',
        phone: '555-0100',
        line1: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        country: 'US',
      };

      await expect(profileSchema.validate(profile)).resolves.toBeDefined();
      await expect(addressSchema.validate(address)).resolves.toBeDefined();
    });

    it('phone field can be consistent between profile and address', async () => {
      const phone = '555-1234';

      const profile = {
        name: 'Test User',
        email: 'test@example.com',
        phone,
      };

      const address = {
        fullName: 'Test User',
        phone,
        line1: '123 Test St',
        city: 'City',
        state: 'ST',
        zipCode: '12345',
        country: 'US',
      };

      const validatedProfile = await profileSchema.validate(profile);
      const validatedAddress = await addressSchema.validate(address);

      expect(validatedProfile.phone).toBe(validatedAddress.phone);
    });
  });
});
