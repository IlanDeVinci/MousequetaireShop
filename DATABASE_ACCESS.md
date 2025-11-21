# Database Access Guide

## Database Configuration

Your PostgreSQL database is running in Docker with the following credentials:

- **Host**: `localhost` (from your machine) or `database` (from other containers)
- **Port**: `5432`
- **Database Name**: `app`
- **Username**: `app`
- **Password**: `app`

## Data Persistence

✅ **Your database data is already persistent!**

The `compose.yaml` file defines a Docker volume named `database_data` that stores all PostgreSQL data. This means:

- Data survives container restarts
- Data survives `docker compose down`
- Data survives `docker compose up --build`

**Data is ONLY deleted if you:**

- Run `docker compose down -v` (the `-v` flag removes volumes)
- Manually delete the volume with `docker volume rm`

## Accessing the Database

### Option 1: Using psql in Docker (Recommended for Quick Access)

```powershell
# Connect to the database using psql
docker compose exec database psql -U app -d app

# Once connected, you can run SQL queries:
# \dt          - List all tables
# \d user      - Describe the user table
# SELECT * FROM "user";
# \q           - Quit
```

### Option 2: Using pgAdmin (GUI Tool)

1. Download and install [pgAdmin](https://www.pgadmin.org/download/)
2. Open pgAdmin
3. Right-click "Servers" → "Register" → "Server"
4. Configure:
   - **General Tab**:
     - Name: `Mousquetaire Shop`
   - **Connection Tab**:
     - Host: `localhost`
     - Port: `5432`
     - Database: `app`
     - Username: `app`
     - Password: `app`
5. Click "Save"

### Option 3: Using DBeaver (Free Universal Database Tool)

1. Download and install [DBeaver Community](https://dbeaver.io/download/)
2. Create new connection → PostgreSQL
3. Configure:
   - Host: `localhost`
   - Port: `5432`
   - Database: `app`
   - Username: `app`
   - Password: `app`
4. Test connection and finish

### Option 4: Using VS Code Extension

1. Install the "PostgreSQL" extension by Chris Kolkman
2. Click the PostgreSQL icon in the sidebar
3. Add connection with the credentials above
4. Browse tables and run queries directly in VS Code

### Option 5: From PHP Container

```powershell
# Access the database from within the PHP container
docker compose exec php php bin/console dbal:run-sql "SELECT * FROM \"user\""
```

## Common Database Commands

### View all tables

```powershell
docker compose exec database psql -U app -d app -c "\dt"
```

### View all users

```powershell
docker compose exec database psql -U app -d app -c "SELECT id, email, roles FROM \"user\""
```

### View all products

```powershell
docker compose exec database psql -U app -d app -c "SELECT id, name, price, stock FROM product"
```

### Backup your database

```powershell
docker compose exec database pg_dump -U app app > backup.sql
```

### Restore from backup

```powershell
Get-Content backup.sql | docker compose exec -T database psql -U app app
```

## Database Volume Management

### Check if volume exists

```powershell
docker volume ls | Select-String "database_data"
```

### Inspect volume details

```powershell
docker volume inspect mousquetaireshop_database_data
```

### Backup volume data

```powershell
# Create a backup of the entire volume
docker run --rm -v mousquetaireshop_database_data:/data -v ${PWD}:/backup alpine tar czf /backup/database_backup.tar.gz /data
```

### Remove volume (⚠️ WARNING: This deletes all data!)

```powershell
# Stop containers first
docker compose down

# Remove volume
docker volume rm mousquetaireshop_database_data

# Recreate database
docker compose up -d
docker compose exec php php bin/console doctrine:migrations:migrate --no-interaction
docker compose exec php php bin/console doctrine:fixtures:load --no-interaction
```

## Troubleshooting

### "Connection refused" error

Make sure the database container is running:

```powershell
docker compose ps
```

If not running:

```powershell
docker compose up -d database
```

### Port 5432 already in use

If you have PostgreSQL installed locally, it might be using port 5432. Either:

1. Stop your local PostgreSQL service
2. Change the port in `compose.yaml`:
   ```yaml
   ports:
     - "5433:5432" # Use 5433 on your machine instead
   ```

### Reset database completely

```powershell
docker compose exec php php bin/console doctrine:database:drop --force
docker compose exec php php bin/console doctrine:database:create
docker compose exec php php bin/console doctrine:migrations:migrate --no-interaction
docker compose exec php php bin/console doctrine:fixtures:load --no-interaction
```

## Quick Reference

| Action | Command |
| --- | --- |
| Connect via psql | `docker compose exec database psql -U app -d app` |
| View tables | `docker compose exec database psql -U app -d app -c "\dt"` |
| Run SQL query | `docker compose exec database psql -U app -d app -c "YOUR SQL HERE"` |
| Backup database | `docker compose exec database pg_dump -U app app > backup.sql` |
| Check container status | `docker compose ps` |
| View logs | `docker compose logs database` |
| Restart database | `docker compose restart database` |
