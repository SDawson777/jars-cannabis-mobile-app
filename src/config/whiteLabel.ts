/**
 * White-label configuration
 *
 * Externalize brand-specific strings, colors, and assets so they can be
 * swapped at build time or via environment variables.
 *
 * To rebrand:
 * 1. Set EXPO_PUBLIC_BRAND_NAME in .env
 * 2. Replace assets in assets/{brandSlug}/ directory
 * 3. Update slug and bundle IDs in app.config.ts
 * 4. Run white-label script: npm run white-label:setup
 */

export interface WhiteLabelConfig {
  brandName: string;
  brandSlug: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo: any; // require() path
  icon: any;
  splashImage: any;
  supportEmail: string;
  supportPhone?: string;
  websiteUrl: string;
  termsUrl: string;
  privacyUrl: string;
}

const DEFAULT_CONFIG: WhiteLabelConfig = {
  brandName: process.env.EXPO_PUBLIC_BRAND_NAME || 'Nimbus Cannabis OS',
  brandSlug: process.env.EXPO_PUBLIC_BRAND_SLUG || 'nimbus-cannabis-mobile',
  tagline: 'Your trusted cannabis companion',
  primaryColor: '#4CAF50',
  secondaryColor: '#2E7D32',
  accentColor: '#FF6F00',
  logo: require('../../assets/nimbus/nimbus-icon.png'),
  icon: require('../../assets/nimbus/nimbus-icon.png'),
  splashImage: require('../../assets/nimbus/nimbus-splash.png'),
  supportEmail: 'support@nimbuscannabis.com',
  supportPhone: undefined,
  websiteUrl: 'https://nimbuscannabis.com',
  termsUrl: 'https://nimbuscannabis.com/terms',
  privacyUrl: 'https://nimbuscannabis.com/privacy',
};

export const whiteLabelConfig: WhiteLabelConfig = DEFAULT_CONFIG;

export default whiteLabelConfig;
