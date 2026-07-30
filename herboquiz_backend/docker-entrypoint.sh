#!/bin/sh
# Point d'entree du conteneur backend.
#
# Aucun fichier .env n'est copie dans l'image : toute la configuration vient
# des variables d'environnement passees par docker-compose (voir
# docker-compose.yml). Laravel les lit directement, .env ou pas.
set -e

echo "Attente de PostgreSQL et application des migrations..."
php artisan migrate --force

# Seeders de base uniquement (reglages, acces, membres) : jamais les jeux de
# donnees de demonstration, qui restent un geste manuel (php artisan
# db:seed --class=DemoClassementSeeder) et non une etape automatique au
# demarrage.
if [ "$DB_SEED" = "true" ]; then
    echo "Seed de la base (reglages, acces, membres)..."
    php artisan db:seed --force
fi

exec "$@"
