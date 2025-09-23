Prisma migrations — how to apply

This project includes SQL migration files under `backend/prisma/migrations/` and an updated `schema.prisma` that adds the `PaymentMethod` model and user fields (`name`, `phone`). To apply them locally or in CI follow these steps.

Prerequisites

- Node >= 18 and npm or pnpm
- A Postgres-compatible database accessible from your environment
- `DATABASE_URL` environment variable pointing to that DB

Quick commands (local)

1. From project root set DATABASE_URL (example uses psql local)

```bash
export DATABASE_URL="postgresql://user:pass@localhost:5432/jars_dev?schema=public"
cd backend
./scripts/run-migrations.sh
```

2. Regenerate Prisma client (the script will run `prisma generate` but you can run manually):

```bash
npx prisma generate --schema=./prisma/schema.prisma
```

Notes

- The repo uses a lazy Prisma client proxy in `backend/src/prismaClient.ts`. If you run server code or tests after regenerating `@prisma/client`, restart the server/test runner so the updated types are picked up.
- CI: set `DATABASE_URL` in your CI environment (use a temporary DB) and run the script from `backend/`.
- If you prefer a one-off SQL application (already included in `backend/prisma/migrations/*/migration.sql`), you may apply those SQL files with your DB tooling but Prisma metadata may still need to be updated if you want to use `prisma migrate` later.

Security

- Do not commit database credentials. Use CI secrets or local env files excluded from VCS.

If you'd like, I can: regenerate `@prisma/client` in this environment (requires a working DB), or prepare a CI job snippet to apply migrations on merge. Tell me which.
