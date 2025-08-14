# API Reference

Base URL: `https://api.example.com/api/v1`

| Method | Endpoint                            | Description                      | Example                                                                                                |
| ------ | ----------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| POST   | /auth/register                      | Register a new user              | https://api.example.com/api/v1/auth/register                        |
| POST   | /auth/login                         | Login with email and password    | https://api.example.com/api/v1/auth/login                           |
| POST   | /auth/logout                        | Logout current user              | https://api.example.com/api/v1/auth/logout                          |
| POST   | /auth/forgot-password               | Start password reset             | https://api.example.com/api/v1/auth/forgot-password                 |
| GET    | /profile                            | Get current profile              | https://api.example.com/api/v1/profile                              |
| PUT    | /profile                            | Update current profile           | https://api.example.com/api/v1/profile                              |
| GET    | /profile/preferences                | Get profile preferences          | https://api.example.com/api/v1/profile/preferences                  |
| PUT    | /profile/preferences                | Update profile preferences       | https://api.example.com/api/v1/profile/preferences                  |
| GET    | /products                           | List products                    | https://api.example.com/api/v1/products                             |
| GET    | /products/:id                       | Product detail                   | https://api.example.com/api/v1/products/123                         |
| GET    | /products/:id/reviews               | List product reviews             | https://api.example.com/api/v1/products/123/reviews                 |
| POST   | /products/:id/reviews               | Create product review            | https://api.example.com/api/v1/products/123/reviews                 |
| GET    | /stores                             | List stores                      | https://api.example.com/api/v1/stores                               |
| GET    | /stores/:id                         | Store detail                     | https://api.example.com/api/v1/stores/1                             |
| GET    | /cart                               | Get cart contents                | https://api.example.com/api/v1/cart                                 |
| POST   | /cart                               | Add item to cart                 | https://api.example.com/api/v1/cart                                 |
| PUT    | /cart/:itemId                       | Update cart item                 | https://api.example.com/api/v1/cart/1                               |
| DELETE | /cart/:itemId                       | Remove cart item                 | https://api.example.com/api/v1/cart/1                               |
| POST   | /orders                             | Create order                     | https://api.example.com/api/v1/orders                               |
| GET    | /orders                             | List orders                      | https://api.example.com/api/v1/orders                               |
| GET    | /orders/:id                         | Order detail                     | https://api.example.com/api/v1/orders/1                             |
| GET    | /content/faq                        | FAQ content                      | https://api.example.com/api/v1/content/faq                          |
| GET    | /content/legal                      | Legal content                    | https://api.example.com/api/v1/content/legal                        |
| GET    | /recommendations/for-you            | Personalized recommendations     | https://api.example.com/api/v1/recommendations/for-you              |
| GET    | /recommendations/related/:productId | Related product recommendations  | https://api.example.com/api/v1/recommendations/related/123          |
| GET    | /loyalty/status                     | Get loyalty status               | https://api.example.com/api/v1/loyalty/status                       |
| GET    | /loyalty/badges                     | List loyalty badges              | https://api.example.com/api/v1/loyalty/badges                       |
| GET    | /greenhouse/articles                | List greenhouse articles         | https://api.example.com/api/v1/greenhouse/articles                  |
| GET    | /greenhouse/articles/:slug          | Greenhouse article detail        | https://api.example.com/api/v1/greenhouse/articles/example          |
| POST   | /greenhouse/articles/:slug/complete | Mark article complete            | https://api.example.com/api/v1/greenhouse/articles/example/complete |
| GET    | /journal/entries                    | List journal entries             | https://api.example.com/api/v1/journal/entries                      |
| POST   | /journal/entries                    | Create journal entry             | https://api.example.com/api/v1/journal/entries                      |
| PUT    | /journal/entries/:id                | Update journal entry             | https://api.example.com/api/v1/journal/entries/1                    |
| GET    | /awards/status                      | List earned awards               | https://api.example.com/api/v1/awards/status                        |
| POST   | /data/export                        | Request data export              | https://api.example.com/api/v1/data/export                          |
| GET    | /accessibility                      | Get accessibility preferences    | https://api.example.com/api/v1/accessibility                        |
| PUT    | /accessibility                      | Update accessibility preferences | https://api.example.com/api/v1/accessibility                        |
| POST   | /concierge/chat                     | Concierge chat (not implemented) | https://api.example.com/api/v1/concierge/chat                       |
| GET    | /ar/models/:productId               | AR model (not implemented)       | https://api.example.com/api/v1/ar/models/123                        |
