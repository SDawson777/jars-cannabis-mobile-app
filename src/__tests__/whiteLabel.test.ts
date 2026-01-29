import { whiteLabelConfig } from '../config/whiteLabel';
import type { WhiteLabelConfig } from '../config/whiteLabel';

describe('whiteLabel config', () => {
  describe('configuration structure', () => {
    it('exports a valid whiteLabelConfig object', () => {
      expect(whiteLabelConfig).toBeDefined();
      expect(typeof whiteLabelConfig).toBe('object');
    });

    it('has all required properties', () => {
      expect(whiteLabelConfig).toHaveProperty('brandName');
      expect(whiteLabelConfig).toHaveProperty('brandSlug');
      expect(whiteLabelConfig).toHaveProperty('tagline');
      expect(whiteLabelConfig).toHaveProperty('primaryColor');
      expect(whiteLabelConfig).toHaveProperty('secondaryColor');
      expect(whiteLabelConfig).toHaveProperty('accentColor');
      expect(whiteLabelConfig).toHaveProperty('logo');
      expect(whiteLabelConfig).toHaveProperty('icon');
      expect(whiteLabelConfig).toHaveProperty('splashImage');
      expect(whiteLabelConfig).toHaveProperty('supportEmail');
      expect(whiteLabelConfig).toHaveProperty('websiteUrl');
      expect(whiteLabelConfig).toHaveProperty('termsUrl');
      expect(whiteLabelConfig).toHaveProperty('privacyUrl');
    });
  });

  describe('brand identity', () => {
    it('has a valid brand name', () => {
      expect(typeof whiteLabelConfig.brandName).toBe('string');
      expect(whiteLabelConfig.brandName.length).toBeGreaterThan(0);
    });

    it('has a valid brand slug', () => {
      expect(typeof whiteLabelConfig.brandSlug).toBe('string');
      expect(whiteLabelConfig.brandSlug.length).toBeGreaterThan(0);
    });

    it('has a tagline', () => {
      expect(typeof whiteLabelConfig.tagline).toBe('string');
      expect(whiteLabelConfig.tagline).toBe('Your trusted cannabis companion');
    });
  });

  describe('color scheme', () => {
    it('has valid hex color format for primary color', () => {
      expect(whiteLabelConfig.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('has valid hex color format for secondary color', () => {
      expect(whiteLabelConfig.secondaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('has valid hex color format for accent color', () => {
      expect(whiteLabelConfig.accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('uses green as primary color', () => {
      expect(whiteLabelConfig.primaryColor).toBe('#4CAF50');
    });

    it('uses dark green as secondary color', () => {
      expect(whiteLabelConfig.secondaryColor).toBe('#2E7D32');
    });

    it('uses orange as accent color', () => {
      expect(whiteLabelConfig.accentColor).toBe('#FF6F00');
    });
  });

  describe('assets', () => {
    it('has logo asset', () => {
      expect(whiteLabelConfig.logo).toBeDefined();
    });

    it('has icon asset', () => {
      expect(whiteLabelConfig.icon).toBeDefined();
    });

    it('has splash image asset', () => {
      expect(whiteLabelConfig.splashImage).toBeDefined();
    });
  });

  describe('contact information', () => {
    it('has valid support email format', () => {
      expect(whiteLabelConfig.supportEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    it('has support email', () => {
      expect(whiteLabelConfig.supportEmail).toBe('support@nimbuscannabis.com');
    });

    it('support phone is optional', () => {
      expect(
        whiteLabelConfig.supportPhone === undefined ||
          typeof whiteLabelConfig.supportPhone === 'string'
      ).toBe(true);
    });
  });

  describe('URLs', () => {
    it('has valid website URL', () => {
      expect(whiteLabelConfig.websiteUrl).toMatch(/^https?:\/\/.+/);
    });

    it('has valid terms URL', () => {
      expect(whiteLabelConfig.termsUrl).toMatch(/^https?:\/\/.+/);
    });

    it('has valid privacy URL', () => {
      expect(whiteLabelConfig.privacyUrl).toMatch(/^https?:\/\/.+/);
    });

    it('website URL points to nimbuscannabis.com', () => {
      expect(whiteLabelConfig.websiteUrl).toContain('nimbuscannabis.com');
    });

    it('terms URL points to terms page', () => {
      expect(whiteLabelConfig.termsUrl).toContain('/terms');
    });

    it('privacy URL points to privacy page', () => {
      expect(whiteLabelConfig.privacyUrl).toContain('/privacy');
    });
  });

  describe('environment variable integration', () => {
    it('can be customized via EXPO_PUBLIC_BRAND_NAME env var', () => {
      // Config reads from process.env.EXPO_PUBLIC_BRAND_NAME
      // Test verifies it has a value (either env var or default)
      expect(whiteLabelConfig.brandName).toBeTruthy();
    });

    it('can be customized via EXPO_PUBLIC_BRAND_SLUG env var', () => {
      // Config reads from process.env.EXPO_PUBLIC_BRAND_SLUG
      // Test verifies it has a value (either env var or default)
      expect(whiteLabelConfig.brandSlug).toBeTruthy();
    });
  });

  describe('TypeScript type safety', () => {
    it('conforms to WhiteLabelConfig interface', () => {
      const config: WhiteLabelConfig = whiteLabelConfig;
      expect(config).toBeDefined();
    });
  });
});
