# PostgreSQL Backup & Restore

This guide documents safe backup and restore procedures for the production database.

## Backup (Logical)

Use `pg_dump` to create a compressed, schema+data dump.

```bash
# Set connection string (no spaces)
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Dump schema and data to a gzip file
pg_dump "$DATABASE_URL" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --compress=9 \
  --file=backup_$(date +%F).dump
```

Notes:

- `--format=custom` is compatible with `pg_restore` and supports parallel restore.
- Avoid `--no-owner`/`--no-privileges` drift by applying roles via migrations.

## Restore (to new DB)

```bash
# Restore into a fresh database
export RESTORE_URL="postgresql://user:pass@host:5432/newdb"

# Create the target database (if not exists)
psql "$RESTORE_URL" -c 'SELECT 1' || createdb -h host -U user newdb

# Restore with parallel jobs
pg_restore \
  --dbname="$RESTORE_URL" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --jobs=4 \
  backup_YYYY-MM-DD.dump
```

## Verify

> **Note**: Database migrations are managed in the [nimbus-cms](https://github.com/SDawson777/nimbus-cms) repository.
> Run migrations from that repo, not from this mobile repo.

## Retention & Security

- Store encrypted dumps in a secure bucket; restrict access to infra admins.
- Rotate backups daily; keep 7 daily + 4 weekly + 12 monthly.
- Never embed secrets in dumps; scrub sensitive tables if exporting for testing.
