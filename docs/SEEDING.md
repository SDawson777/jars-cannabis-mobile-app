# Database Seeding

Use these commands to hydrate the database with baseline or demo data for local development and preview builds.

## Prerequisites

- Configure `backend/.env` (or another gitignored `.env.*` file) with a valid `DATABASE_URL` and other backend secrets; see `backend/.env.example` for required keys.
- Install dependencies with `./setup.sh` or `npm install && npm --prefix backend install` so Prisma is available.
- Ensure the database is reachable (e.g., start Docker services if you use `docker-compose`).

## Baseline seed

Run schema migrations and insert the default catalog + content pages:

```bash
npm --prefix backend run migrate
npm --prefix backend run seed
```

This populates brands, two sample stores (Scottsdale and Detroit), flower products with variants and pricing, FAQ/legal content, and compliance rules.

## Demo seed

For richer demo data (with `DEMO_MODE=true`), run:

```bash
npm --prefix backend run seed:demo
```

Add `DEBUG=true` for verbose logging if you need to troubleshoot seeding:

```bash
npm --prefix backend run seed:demo:verbose
```

## Reseeding tips

- To reseed from a clean slate, reset your database using your preferred workflow (e.g., drop and recreate the database) and rerun the commands above.
- Keep secrets in your local `.env` or `.env.*` files—these are gitignored and should never be committed.
