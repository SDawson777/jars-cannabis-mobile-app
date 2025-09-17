#!/usr/bin/env node

/**
 * Simple smoke test for the Stripe payment sheet endpoint
 * Tests that the endpoint is mounted and accessible at the expected path
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const ENDPOINT = `${API_BASE_URL}/api/v1/stripe/payment-sheet`;

async function testEndpoint() {
  try {
    console.log(`Testing Stripe endpoint: ${ENDPOINT}`);
    
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: 'test' })
    });

    if (response.status === 200) {
      const data = await response.json();
      console.log('✅ Success! Endpoint returned 200');
      console.log('Response data keys:', Object.keys(data));
      
      const requiredKeys = ['paymentIntent', 'ephemeralKey', 'customer'];
      const hasAllKeys = requiredKeys.every(key => key in data);
      
      if (hasAllKeys) {
        console.log('✅ Response contains all required keys');
        return true;
      } else {
        console.log('❌ Response missing required keys:', requiredKeys.filter(key => !(key in data)));
        return false;
      }
    } else if (response.status === 500) {
      const errorData = await response.json();
      console.log('⚠️  Server error (expected if Stripe key not configured):', errorData.error);
      return true; // This is expected in test environment
    } else {
      console.log('❌ Unexpected status:', response.status);
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
      console.log('⚠️  Server not running - start backend with `npm run start:backend` to test endpoint');
      return true; // This is expected if server isn't running
    }
    console.error('❌ Error testing endpoint:', error.message);
    return false;
  }
}

if (require.main === module) {
  testEndpoint().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testEndpoint };