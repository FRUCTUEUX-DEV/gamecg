#!/bin/sh
# Un seul processus a lancer (php artisan serve, qui sert aussi le frontend
# via le server.php personnalise — voir server.php et le Dockerfile) : pas
# besoin de superviseur. La base est externe (Render), rien a initialiser
# localement, juste migrer.
set -e

echo "==> Migrations Laravel..."
php artisan migrate --force

if [ "$DB_SEED" = "true" ]; then
    echo "==> Seed de la base (reglages, acces, membres)..."
    php artisan db:seed --force
fi

# Render (et la plupart des plateformes Docker) fournissent le port a
# ecouter via $PORT ; 8000 en repli pour un lancement local.
PORT="${PORT:-8000}"
echo "==> Demarrage sur le port ${PORT}..."
exec php artisan serve --host=0.0.0.0 --port="$PORT"
