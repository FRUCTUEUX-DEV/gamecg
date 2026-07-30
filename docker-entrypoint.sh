#!/bin/sh
# Preparation avant de laisser la main a supervisord (postgres + laravel +
# nginx). Tout ce qui doit se faire UNE fois — initialiser la base, la
# creer, migrer, seeder — se fait ici, avec Postgres demarre temporairement
# en arriere-plan, puis arrete proprement pour que supervisord le reprenne
# comme processus long-terme.
set -e

PGDATA="${PGDATA:-/var/lib/postgresql/data}"

mkdir -p "$PGDATA"
chown -R postgres:postgres "$PGDATA"

if [ ! -s "$PGDATA/PG_VERSION" ]; then
    echo "==> Initialisation de PostgreSQL (premier demarrage)..."
    su-exec postgres initdb -D "$PGDATA" --auth=trust --username=postgres > /dev/null
fi

echo "==> Demarrage temporaire de PostgreSQL..."
su-exec postgres pg_ctl -D "$PGDATA" -l /tmp/postgres-init.log -w start

echo "==> Preparation du role et de la base applicatifs..."
su-exec postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname = '${DB_USERNAME}'" | grep -q 1 \
    || su-exec postgres psql -c "CREATE ROLE \"${DB_USERNAME}\" LOGIN PASSWORD '${DB_PASSWORD}';"

su-exec postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname = '${DB_DATABASE}'" | grep -q 1 \
    || su-exec postgres psql -c "CREATE DATABASE \"${DB_DATABASE}\" OWNER \"${DB_USERNAME}\";"

echo "==> Migrations Laravel..."
php artisan migrate --force

if [ "$DB_SEED" = "true" ]; then
    echo "==> Seed de la base (reglages, acces, membres)..."
    php artisan db:seed --force
fi

echo "==> Arret du PostgreSQL temporaire (supervisord va le reprendre)..."
su-exec postgres pg_ctl -D "$PGDATA" -m fast -w stop

echo "==> Demarrage de postgres + laravel + nginx..."
exec "$@"
