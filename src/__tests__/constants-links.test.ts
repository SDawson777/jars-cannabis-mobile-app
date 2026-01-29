import { PRIVACY_EXPORT_FORM, SUPPORT_EMAIL } from '../constants/links';

describe('constants/links', () => {
  describe('PRIVACY_EXPORT_FORM', () => {
    it('is defined as a string', () => {
      expect(typeof PRIVACY_EXPORT_FORM).toBe('string');
    });

    it('contains Google Forms URL', () => {
      expect(PRIVACY_EXPORT_FORM).toContain('https://docs.google.com/forms');
    });

    it('contains form ID', () => {
      expect(PRIVACY_EXPORT_FORM).toContain(
        '1FAIpQLSc2nor8KqwMnDAP2ag0CQcUjRGV99Lo-h6YQrk9tyGk9yg3VA'
      );
    });

    it('includes email placeholder for runtime replacement', () => {
      expect(PRIVACY_EXPORT_FORM).toContain('{{EMAIL}}');
    });

    it('has entry parameter for email field', () => {
      expect(PRIVACY_EXPORT_FORM).toContain('entry.1497979039={{EMAIL}}');
    });

    it('uses viewform endpoint', () => {
      expect(PRIVACY_EXPORT_FORM).toContain('/viewform?');
    });

    it('has prefilled URL parameter', () => {
      expect(PRIVACY_EXPORT_FORM).toContain('usp=pp_url');
    });
  });

  describe('SUPPORT_EMAIL', () => {
    it('is defined as a string', () => {
      expect(typeof SUPPORT_EMAIL).toBe('string');
    });

    it('contains valid email format', () => {
      expect(SUPPORT_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('is support@nimbus.app', () => {
      expect(SUPPORT_EMAIL).toBe('support@nimbus.app');
    });

    it('uses nimbus.app domain', () => {
      expect(SUPPORT_EMAIL).toContain('@nimbus.app');
    });

    it('starts with support prefix', () => {
      expect(SUPPORT_EMAIL.startsWith('support@')).toBe(true);
    });
  });

  describe('URL replacement functionality', () => {
    it('can replace email placeholder in privacy form URL', () => {
      const testEmail = 'user@example.com';
      const replacedUrl = PRIVACY_EXPORT_FORM.replace('{{EMAIL}}', testEmail);

      expect(replacedUrl).toContain(testEmail);
      expect(replacedUrl).not.toContain('{{EMAIL}}');
    });

    it('preserves URL structure after email replacement', () => {
      const testEmail = 'test@test.com';
      const replacedUrl = PRIVACY_EXPORT_FORM.replace('{{EMAIL}}', testEmail);

      expect(replacedUrl).toContain('https://docs.google.com/forms');
      expect(replacedUrl).toContain('viewform');
    });

    it('handles special characters in email replacement', () => {
      const testEmail = 'user+tag@example.com';
      const replacedUrl = PRIVACY_EXPORT_FORM.replace('{{EMAIL}}', encodeURIComponent(testEmail));

      expect(replacedUrl).toContain(encodeURIComponent(testEmail));
    });
  });
});
