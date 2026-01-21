# Schema Ownership

## Overview

This repository (`nimbus-cannabis-mobile`) is the **mobile application** repo. It does **NOT** own the database schema or Prisma migrations.

## Schema Location

All Prisma schema files and database migrations are managed exclusively in the **nimbus-cms** repository:

- **Repository**: [github.com/SDawson777/nimbus-cms](https://github.com/SDawson777/nimbus-cms)
- **Schema path**: `prisma/schema.prisma`
- **Migrations**: `prisma/migrations/`

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         nimbus-cms (CMS Repo)                       │
│                                                                     │
│  ┌─────────────────────┐    ┌─────────────────────────────────────┐│
│  │  prisma/            │    │  Owns:                              ││
│  │  ├── schema.prisma  │───▶│  • Database schema definition       ││
│  │  └── migrations/    │    │  • All Prisma migrations            ││
│  └─────────────────────┘    │  • Seed scripts                     ││
│                             │  • Schema validation                 ││
│                             └─────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼
                              ┌────────────────┐
                              │   PostgreSQL   │
                              │    Database    │
                              └────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   nimbus-cannabis-mobile (This Repo)                │
│                                                                     │
│  ┌─────────────────────┐    ┌─────────────────────────────────────┐│
│  │  src/ (Mobile App)  │    │  Consumes:                          ││
│  │  └── api/           │───▶│  • REST APIs via HTTP               ││
│  │      └── http.ts    │    │  • Does NOT access DB directly      ││
│  └─────────────────────┘    └─────────────────────────────────────┘│
│                                                                     │
│  ┌─────────────────────┐    ┌─────────────────────────────────────┐│
│  │  backend/           │    │  Uses:                              ││
│  │  └── src/           │───▶│  • @prisma/client (generated)       ││
│  │      └── routes/    │    │  • Schema from nimbus-cms           ││
│  └─────────────────────┘    └─────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
```

## What This Means

### ✅ This repo DOES:

- Consume APIs via REST endpoints
- Use `@prisma/client` in the backend to query the database
- Define API routes and controllers

### ❌ This repo does NOT:

- Own the Prisma schema (`schema.prisma`)
- Run or create database migrations
- Modify table structures or database models
- Contain seed scripts for the database

## Making Schema Changes

If you need to modify the database schema:

1. **Go to the nimbus-cms repository**
2. Edit `prisma/schema.prisma`
3. Create a migration: `npx prisma migrate dev --name your_migration_name`
4. Deploy to production: `npx prisma migrate deploy`
5. The mobile backend will automatically use the updated schema via `@prisma/client`

## Backend Prisma Client

The backend in this repo uses `@prisma/client` which connects to the shared PostgreSQL database. The Prisma client is generated based on the schema in the nimbus-cms repo.

To regenerate the client after schema changes in nimbus-cms:

```bash
# From the nimbus-cms repo:
npx prisma generate

# Or pull the latest client version when dependencies are installed
```

## Why This Architecture?

1. **Single Source of Truth**: One repo owns the schema, preventing drift
2. **Separation of Concerns**: Mobile app focuses on UI/UX, CMS handles data modeling
3. **Safe Deployments**: Schema changes are reviewed and deployed separately from mobile releases
4. **Clear Ownership**: Database administrators work in the CMS repo, mobile developers work here

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Overall system architecture
- [API_CONTRACT.md](./API_CONTRACT.md) - API endpoint documentation
- [backend/README_API.md](./backend/README_API.md) - Backend API reference
