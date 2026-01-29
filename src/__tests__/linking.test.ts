import { linking } from '../navigation/linking';

describe('linking configuration', () => {
  it('should have prefixes', () => {
    expect(linking.prefixes).toBeDefined();
    expect(Array.isArray(linking.prefixes)).toBe(true);
    expect(linking.prefixes.length).toBeGreaterThan(0);
  });

  it('should have screens config', () => {
    expect(linking.config.screens).toBeDefined();
  });

  it('should have onboarding screens', () => {
    const { screens } = linking.config;
    expect(screens.SplashScreen).toBeDefined();
    expect(screens.Onboarding).toBe('onboarding');
    expect(screens.AgeVerification).toBe('age-verification');
  });

  it('should have auth screens', () => {
    const { screens } = linking.config;
    expect(screens.LoginSignUpDecision).toBe('auth');
    expect(screens.Login).toBe('auth/login');
    expect(screens.SignUp).toBe('auth/signup');
  });

  it('should have shop screens', () => {
    const { screens } = linking.config;
    expect(screens.ShopScreen).toBe('shop');
    expect(screens.ProductDetail).toBe('shop/product/:slug');
  });

  it('should have cart screens', () => {
    const { screens } = linking.config;
    expect(screens.CartScreen).toBe('cart');
    expect(screens.Checkout).toBe('checkout');
  });

  it('should have profile screens', () => {
    const { screens } = linking.config;
    expect(screens.Profile).toBe('profile');
    expect(screens.EditProfile).toBe('profile/edit');
  });
});
