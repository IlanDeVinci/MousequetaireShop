# PHP Container Configuration

## Performance Optimizations

### OPcache

- **Enabled**: Yes, with JIT compilation
- **JIT Buffer**: 100MB (tracing mode)
- **Memory**: 256MB for dev, 512MB for production
- **Revalidation**: Enabled in dev (checks file changes), disabled in prod (maximum speed)

### APCu

- **Enabled**: Yes
- **Shared Memory**: 128MB for dev, 256MB for production
- **Purpose**: Application-level caching (Symfony cache pools)

### Configuration Files

- `php.ini` - Development settings (OPcache checks files for changes)
- `php-prod.ini` - Production settings (OPcache never checks files, uses preloading)

## Automatic Container Bootstrap

The entrypoint script (`docker-entrypoint.sh`) automatically handles:

1. **Database Connection**: Waits for PostgreSQL to be ready
2. **Composer Dependencies**: Installs if `vendor/autoload.php` is missing
3. **File Permissions**: Sets correct ownership for `var/` and `public/uploads/`
4. **Cache Warmup**: Only runs if cache doesn't exist (fresh install)

### Why This Approach?

**Composer Auto-Install:**

- Checks for `vendor/autoload.php` instead of just the directory
- Works correctly with Docker volumes
- Ensures dependencies are fully installed

**Smart Cache Warmup:**

- Only warms up if `App_KernelDevDebugContainer.php` doesn't exist
- Avoids unnecessary cache rebuilding on every restart
- Symfony auto-rebuilds cache in dev mode when config changes

## Manual Cache Operations

### When to Clear Cache

```bash
# After changing configuration files
docker compose exec php php bin/console cache:clear

# After adding/removing bundles
docker compose exec php php bin/console cache:clear

# When you have cache corruption
docker compose exec php php bin/console cache:clear --no-warmup
docker compose exec php php bin/console cache:warmup
```

### Cache Behavior by Environment

**Development (APP_ENV=dev):**

- Symfony automatically rebuilds cache when it detects changes
- You rarely need to manually clear cache
- Cache warmup on first boot ensures fast first request

**Production (APP_ENV=prod):**

- Cache is never automatically rebuilt
- Always run `cache:warmup` after deployment
- Consider using OPcache preloading for maximum performance

## Container Startup Time

**First Boot (Fresh Install):**

- ~30-60 seconds (Composer install + cache warmup)

**Subsequent Boots:**

- ~5-10 seconds (just permissions and health checks)

## Troubleshooting

### Dependencies Not Installing

If `composer install` doesn't run automatically:

```bash
# Check if autoload.php exists
docker compose exec php ls -la vendor/autoload.php

# Manually trigger install
docker compose exec php composer install
```

### Cache Issues

If you see cache-related errors:

```bash
# Remove all cache and rebuild
docker compose exec php rm -rf var/cache/*
docker compose exec php php bin/console cache:warmup
docker compose exec php chown -R www-data:www-data var/cache
```

### Permissions Issues

If you get permission denied errors:

```bash
# Fix ownership
docker compose exec php chown -R www-data:www-data var public/uploads vendor
```
