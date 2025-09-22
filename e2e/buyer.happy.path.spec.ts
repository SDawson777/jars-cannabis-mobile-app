describe('Buyer Happy Path E2E', () => {
  beforeAll(async () => {
    // Launch the app
    await device.launchApp();
  });

  beforeEach(async () => {
    // Reload the app before each test to ensure clean state
    await device.reloadReactNative();
  });

  afterAll(async () => {
    // Cleanup after all tests
    await device.terminateApp();
  });

  it('should complete the full buyer journey: Home → Shop → Product → Add to Cart → Checkout', async () => {
    // Check if we're on the splash/onboarding flow first
    try {
      await waitFor(element(by.id('splash-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // If splash screen is visible, wait for it to finish
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(10000);
    } catch {
      // If no splash screen, we might already be on home or need to navigate
      console.log('No splash screen detected, checking current screen');
    }

    // Step 1: Verify we're on the home screen
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(10000);

    await expect(element(by.text('Welcome to JARS'))).toBeVisible();

    // Step 2: Navigate to Shop
    await element(by.id('shop-tab-button')).tap();

    await waitFor(element(by.id('shop-screen')))
      .toBeVisible()
      .withTimeout(5000);

    await expect(element(by.text('Shop Cannabis'))).toBeVisible();

    // Step 3: Browse products and select one
    await waitFor(element(by.id('product-list')))
      .toBeVisible()
      .withTimeout(5000);

    // Tap on the first product
    await element(by.id('product-item-0')).tap();

    // Step 4: View product details
    await waitFor(element(by.id('product-detail-screen')))
      .toBeVisible()
      .withTimeout(5000);

    await expect(element(by.id('product-name'))).toBeVisible();
    await expect(element(by.id('product-price'))).toBeVisible();
    await expect(element(by.id('add-to-cart-button'))).toBeVisible();

    // Step 5: Add product to cart
    await element(by.id('add-to-cart-button')).tap();

    // Wait for confirmation (could be a toast or modal)
    await waitFor(element(by.text('Added to cart')))
      .toBeVisible()
      .withTimeout(3000);

    // Step 6: Navigate to cart
    await element(by.id('cart-tab-button')).tap();

    await waitFor(element(by.id('cart-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify cart has items
    await expect(element(by.id('cart-item-0'))).toBeVisible();
    await expect(element(by.id('cart-total'))).toBeVisible();

    // Step 7: Proceed to checkout
    await element(by.id('checkout-button')).tap();

    await waitFor(element(by.id('checkout-screen')))
      .toBeVisible()
      .withTimeout(5000);

    // Step 8: Fill checkout form (simplified for E2E)
    await element(by.id('delivery-address-input')).typeText('123 Test St, Denver, CO 80202');
    await element(by.id('payment-method-card')).tap();

    // Verify order summary is displayed
    await expect(element(by.id('order-summary'))).toBeVisible();
    await expect(element(by.id('order-total'))).toBeVisible();

    // Note: In a real E2E test, we would complete the order
    // For now, we just verify the checkout screen is functional
    await expect(element(by.id('place-order-button'))).toBeVisible();

    console.log('✅ Buyer happy path E2E test completed successfully');
  });

  it('should handle navigation between main tabs', async () => {
    // Test tab navigation
    const tabs = [
      { id: 'home-tab-button', screen: 'home-screen' },
      { id: 'shop-tab-button', screen: 'shop-screen' },
      { id: 'cart-tab-button', screen: 'cart-screen' },
      { id: 'profile-tab-button', screen: 'profile-screen' },
    ];

    for (const tab of tabs) {
      await element(by.id(tab.id)).tap();
      await waitFor(element(by.id(tab.screen)))
        .toBeVisible()
        .withTimeout(3000);

      console.log(`✅ Successfully navigated to ${tab.screen}`);
    }
  });

  it('should handle search functionality', async () => {
    // Navigate to shop
    await element(by.id('shop-tab-button')).tap();
    await waitFor(element(by.id('shop-screen'))).toBeVisible();

    // Use search
    await element(by.id('search-input')).typeText('indica');
    await element(by.id('search-submit-button')).tap();

    // Wait for results
    await waitFor(element(by.id('search-results')))
      .toBeVisible()
      .withTimeout(5000);

    console.log('✅ Search functionality working');
  });

  it('should handle offline state gracefully', async () => {
    // Simulate network failure
    await device.setNetworkConditions({
      type: 'none', // No network
    });

    // Navigate to shop (should show offline state)
    await element(by.id('shop-tab-button')).tap();

    // Check for offline indicator
    await waitFor(element(by.id('offline-indicator')))
      .toBeVisible()
      .withTimeout(5000);

    // Restore network
    await device.setNetworkConditions({
      type: 'wifi',
    });

    console.log('✅ Offline handling working');
  });

  it('should support accessibility features', async () => {
    // Test accessibility labels are present
    await expect(element(by.label('Home tab'))).toBeVisible();
    await expect(element(by.label('Shop tab'))).toBeVisible();
    await expect(element(by.label('Cart tab'))).toBeVisible();
    await expect(element(by.label('Profile tab'))).toBeVisible();

    console.log('✅ Accessibility features present');
  });
});
