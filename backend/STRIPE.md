Stripe integration notes

Required environment variables

- STRIPE_SECRET_KEY (required): Your Stripe secret key. Used server-side to create customers, ephemeral keys, and payment intents.

Testing notes

- In tests we mock the `stripe` module. When running the server locally, set `STRIPE_SECRET_KEY` in your environment or .env so the Stripe SDK is initialized.

Security

- Do not commit your Stripe secret key to version control. Use environment variables or a secrets manager (E.g., GitHub Actions secrets, EAS secrets, etc.).
