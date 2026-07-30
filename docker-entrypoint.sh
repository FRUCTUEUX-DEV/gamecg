#!/bin/sh
# Preparation avant de laisser la main a supervisord (laravel + frontend).
# La base est externe (Render) : rien a initialiser localement, juste migrer.
set -e

echo "==> Migrations Laravel..."
php artisan migrate --force

if [ "$DB_SEED" = "true" ]; then
    echo "==> Seed de la base (reglages, acces, membres)..."
    php artisan db:seed --force
fi

echo "==> Demarrage de laravel + frontend..."
exec "$@"
