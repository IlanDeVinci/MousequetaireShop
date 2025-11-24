#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database..."
until pg_isready -h database -U app > /dev/null 2>&1; do
  sleep 1
done
echo "Database is ready!"

# Set proper permissions for var directory first
echo "Setting permissions..."
mkdir -p var/cache var/log public/uploads
chown -R www-data:www-data var public/uploads
chmod -R 775 var public/uploads

# Install Composer dependencies if vendor is empty or autoload is missing
if [ -f "composer.json" ] && [ ! -f "vendor/autoload.php" ]; then
    echo "Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
    chown -R www-data:www-data vendor
fi

# Warm up cache only if cache directory is empty (fresh install)
if [ "$APP_ENV" = "dev" ] && [ ! -f "var/cache/dev/App_KernelDevDebugContainer.php" ]; then
    echo "Cache not found, warming up..."
    php bin/console cache:warmup || true
    chown -R www-data:www-data var/cache
fi

echo "Starting PHP-FPM..."
exec docker-php-entrypoint php-fpm
