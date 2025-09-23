# JARS Cannabis Mobile App - API Reference

Base URL: `https://api.jars.app/api/v1` (Production)  
Staging: `https://staging-api.jars.app/api/v1`  
Local: `http://localhost:3000/api/v1`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All responses follow a consistent format:

- Success responses include the requested data
- Error responses include an `error` field with a descriptive message
- List endpoints include pagination metadata when applicable

## Endpoints

### Authentication

| Method | Endpoint              | Description                   | Auth Required |
| ------ | --------------------- | ----------------------------- | ------------- |
| POST   | /auth/register        | Register a new user           | No            |
| POST   | /auth/login           | Login with email and password | No            |
| POST   | /auth/refresh         | Refresh access token          | No            |
| POST   | /auth/logout          | Logout current user           | Yes           |
| GET    | /auth/me              | Get current user info         | Yes           |
| POST   | /auth/forgot-password | Start password reset          | No            |

### User Profile

| Method | Endpoint             | Description                | Auth Required |
| ------ | -------------------- | -------------------------- | ------------- |
| GET    | /profile             | Get current profile        | Yes           |
| PUT    | /profile             | Update current profile     | Yes           |
| GET    | /profile/preferences | Get profile preferences    | Yes           |
| PUT    | /profile/preferences | Update profile preferences | Yes           |

### Products

| Method | Endpoint              | Description                | Auth Required |
| ------ | --------------------- | -------------------------- | ------------- |
| GET    | /products             | List products with filters | No            |
| GET    | /products/:id         | Get product by ID          | No            |
| GET    | /products/slug/:slug  | Get product by slug        | No            |
| GET    | /products/categories  | List product categories    | No            |
| GET    | /products/featured    | Get featured products      | No            |
| POST   | /products/:id/reviews | Create product review      | Yes           |
| GET    | /products/:id/reviews | List product reviews       | No            |

### Stores

| Method | Endpoint    | Description       | Auth Required |
| ------ | ----------- | ----------------- | ------------- |
| GET    | /stores     | List stores       | No            |
| GET    | /stores/:id | Get store details | No            |

### Shopping Cart

| Method | Endpoint            | Description               | Auth Required |
| ------ | ------------------- | ------------------------- | ------------- |
| GET    | /cart               | Get cart contents         | Yes           |
| POST   | /cart/items         | Add item to cart          | Yes           |
| PUT    | /cart/items/:itemId | Update cart item quantity | Yes           |
| DELETE | /cart/items/:itemId | Remove item from cart     | Yes           |
| DELETE | /cart               | Clear entire cart         | Yes           |
| POST   | /cart/apply-coupon  | Apply coupon to cart      | Yes           |

### Orders

| Method | Endpoint             | Description             | Auth Required |
| ------ | -------------------- | ----------------------- | ------------- |
| POST   | /orders              | Create new order        | Yes           |
| GET    | /orders              | List user orders        | Yes           |
| GET    | /orders/:id          | Get order details       | Yes           |
| PUT    | /orders/:id/cancel   | Cancel order            | Yes           |
| GET    | /orders/:id/tracking | Get order tracking info | Yes           |
| POST   | /orders/:id/rate     | Rate completed order    | Yes           |

### Content & Education

| Method | Endpoint                            | Description               | Auth Required |
| ------ | ----------------------------------- | ------------------------- | ------------- |
| GET    | /content/faq                        | FAQ content               | No            |
| GET    | /content/legal                      | Legal content             | No            |
| GET    | /greenhouse/articles                | List educational articles | No            |
| GET    | /greenhouse/articles/:slug          | Get article by slug       | No            |
| POST   | /greenhouse/articles/:slug/complete | Mark article as completed | Yes           |

### Recommendations

| Method | Endpoint                            | Description                     | Auth Required |
| ------ | ----------------------------------- | ------------------------------- | ------------- |
| GET    | /recommendations/for-you            | Personalized recommendations    | Yes           |
| GET    | /recommendations/related/:productId | Related product recommendations | No            |

### Loyalty & Gamification

| Method | Endpoint        | Description         | Auth Required |
| ------ | --------------- | ------------------- | ------------- |
| GET    | /loyalty/status | Get loyalty status  | Yes           |
| GET    | /loyalty/badges | List loyalty badges | Yes           |
| GET    | /awards/status  | List earned awards  | Yes           |

### Journal & My JARS

| Method | Endpoint             | Description          | Auth Required |
| ------ | -------------------- | -------------------- | ------------- |
| GET    | /journal/entries     | List journal entries | Yes           |
| POST   | /journal/entries     | Create journal entry | Yes           |
| PUT    | /journal/entries/:id | Update journal entry | Yes           |

### Data & Privacy

| Method | Endpoint       | Description                   | Auth Required |
| ------ | -------------- | ----------------------------- | ------------- |
| POST   | /data/export   | Request data export           | Yes           |
| GET    | /accessibility | Get accessibility preferences | Yes           |
| PUT    | /accessibility | Update accessibility prefs    | Yes           |

### Future Endpoints (Not Implemented)

| Method | Endpoint              | Description            | Auth Required |
| ------ | --------------------- | ---------------------- | ------------- |
| POST   | /concierge/chat       | Concierge chat service | Yes           |
| GET    | /ar/models/:productId | AR model for product   | No            |

## Error Codes

| Code | Description                      |
| ---- | -------------------------------- |
| 400  | Bad Request - Invalid parameters |
| 401  | Unauthorized - Invalid token     |
| 403  | Forbidden - Access denied        |
| 404  | Not Found - Resource not found   |
| 429  | Too Many Requests - Rate limited |
| 500  | Internal Server Error            |

## Rate Limiting

- API requests are limited to 100 requests per minute per user
- Higher limits available for authenticated users
- Rate limit headers included in responses

## Versioning

- Current API version: v1
- Version specified in URL path
- Breaking changes will increment version number
