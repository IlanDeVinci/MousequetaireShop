#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database..."
until pg_isready -h database -U app > /dev/null 2>&1; do
  sleep 1
done
echo "Database is ready!"

# Clear cache completely to avoid permission issues
if [ -d "var/cache" ]; then
    echo "Clearing cache..."
    rm -rf var/cache/*
fi

# Set proper permissions for var directory
echo "Setting permissions..."
mkdir -p var/cache var/log
chown -R www-data:www-data var
chmod -R 775 var

# Install Composer dependencies if vendor doesn't exist
if [ -f "composer.json" ] && [ ! -d "vendor" ]; then
    echo "Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

echo "Starting PHP-FPM..."
exec docker-php-entrypoint php-fpm
