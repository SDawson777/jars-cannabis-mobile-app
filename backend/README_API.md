# API Reference

Base URL: `https://jars-cannabis-mobile-app-production.up.railway.app/api/v1`

| Method | Endpoint                            | Description                      | Example                                                                                                |
| ------ | ----------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| POST   | /auth/register                      | Register a new user              | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/auth/register                        |
| POST   | /auth/login                         | Login with email and password    | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/auth/login                           |
| POST   | /auth/logout                        | Logout current user              | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/auth/logout                          |
| POST   | /auth/forgot-password               | Start password reset             | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/auth/forgot-password                 |
| GET    | /profile                            | Get current profile              | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/profile                              |
| PUT    | /profile                            | Update current profile           | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/profile                              |
| GET    | /profile/preferences                | Get profile preferences          | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/profile/preferences                  |
| PUT    | /profile/preferences                | Update profile preferences       | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/profile/preferences                  |
| GET    | /products                           | List products                    | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/products                             |
| GET    | /products/:id                       | Product detail                   | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/products/123                         |
| GET    | /products/:id/reviews               | List product reviews             | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/products/123/reviews                 |
| POST   | /products/:id/reviews               | Create product review            | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/products/123/reviews                 |
| GET    | /stores                             | List stores                      | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/stores                               |
| GET    | /stores/:id                         | Store detail                     | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/stores/1                             |
| GET    | /cart                               | Get cart contents                | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/cart                                 |
| POST   | /cart                               | Add item to cart                 | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/cart                                 |
| PUT    | /cart/:itemId                       | Update cart item                 | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/cart/1                               |
| DELETE | /cart/:itemId                       | Remove cart item                 | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/cart/1                               |
| POST   | /orders                             | Create order                     | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/orders                               |
| GET    | /orders                             | List orders                      | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/orders                               |
| GET    | /orders/:id                         | Order detail                     | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/orders/1                             |
| GET    | /content/faq                        | FAQ content                      | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/content/faq                          |
| GET    | /content/legal                      | Legal content                    | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/content/legal                        |
| GET    | /recommendations/for-you            | Personalized recommendations     | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/recommendations/for-you              |
| GET    | /recommendations/related/:productId | Related product recommendations  | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/recommendations/related/123          |
| GET    | /loyalty/status                     | Get loyalty status               | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/loyalty/status                       |
| GET    | /loyalty/badges                     | List loyalty badges              | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/loyalty/badges                       |
| GET    | /greenhouse/articles                | List greenhouse articles         | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/greenhouse/articles                  |
| GET    | /greenhouse/articles/:slug          | Greenhouse article detail        | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/greenhouse/articles/example          |
| POST   | /greenhouse/articles/:slug/complete | Mark article complete            | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/greenhouse/articles/example/complete |
| GET    | /journal/entries                    | List journal entries             | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/journal/entries                      |
| POST   | /journal/entries                    | Create journal entry             | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/journal/entries                      |
| PUT    | /journal/entries/:id                | Update journal entry             | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/journal/entries/1                    |
| GET    | /awards/status                      | List earned awards               | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/awards/status                        |
| POST   | /data/export                        | Request data export              | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/data/export                          |
| GET    | /accessibility                      | Get accessibility preferences    | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/accessibility                        |
| PUT    | /accessibility                      | Update accessibility preferences | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/accessibility                        |
| POST   | /concierge/chat                     | Concierge chat (not implemented) | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/concierge/chat                       |
| GET    | /ar/models/:productId               | AR model (not implemented)       | https://jars-cannabis-mobile-app-production.up.railway.app/api/v1/ar/models/123                        |
