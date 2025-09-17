# API Endpoint Documentation

## Stripe Payment Integration

### Endpoint: POST /api/v1/stripe/payment-sheet

**Purpose**: Creates a Stripe payment sheet for mobile app payments

**URL**: `${API_BASE_URL}/api/v1/stripe/payment-sheet`

**Method**: POST

**Headers**:
- `Content-Type: application/json`

**Request Body**:
```json
{
  "platform": "ios" | "android" | "web"
}
```

**Response** (200 OK):
```json
{
  "paymentIntent": "pi_1234567890_secret_abcdef",
  "ephemeralKey": "ek_1234567890_secret_ghijkl", 
  "customer": "cus_1234567890"
}
```

**Error Response** (500):
```json
{
  "error": "Stripe error"
}
```

### Environment Variables

**Client-side**:
- `EXPO_PUBLIC_API_BASE_URL`: Base URL for the backend API (e.g., `https://api.example.com` or `http://localhost:3000`)

**Server-side**:
- `STRIPE_SECRET_KEY`: Stripe secret key for payment processing

### Usage Example

```typescript
import { fetchPaymentSheetParams } from '../api/stripe';

// Fetch payment parameters
const params = await fetchPaymentSheetParams();

// Use with Stripe React Native SDK
const { error } = await presentPaymentSheet({
  ...params
});
```

### Testing

Run the smoke test to verify the endpoint is accessible:

```bash
# Test endpoint (requires running backend)
node scripts/test-stripe-endpoint.js

# Start backend for testing
npm run start:backend
```

### Troubleshooting

1. **404 Error**: Ensure `stripeRouter` is imported and mounted in `backend/src/app.ts`
2. **500 Error**: Check that `STRIPE_SECRET_KEY` environment variable is set
3. **Connection Error**: Verify the backend server is running and `API_BASE_URL` is correct