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

# Optionnel, desactive par defaut : equipes/participants/points de
# demonstration (memes que ceux utilises pendant les tests). Le seeder
# lui-meme n'est pas idempotent (relance = doublons) — on ne le lance donc
# que si aucune equipe n'existe deja, meme si DB_SEED_DEMO reste a "true"
# apres le premier demarrage.
if [ "$DB_SEED_DEMO" = "true" ]; then
    DEJA=$(php artisan tinker --execute="echo \App\Models\Equipe::count();" 2>/dev/null | tail -n 1)
    if [ "$DEJA" = "0" ]; then
        echo "==> Seed des donnees de demonstration (equipes, participants, points)..."
        php artisan db:seed --class=DemoClassementSeeder --force
    else
        echo "==> Donnees de demonstration deja presentes (${DEJA} equipe(s)), on ne rejoue pas le seed."
    fi
fi

# Render (et la plupart des plateformes Docker) fournissent le port a
# ecouter via $PORT ; 8000 en repli pour un lancement local.
PORT="${PORT:-8000}"
echo "==> Demarrage sur le port ${PORT}..."
exec php artisan serve --host=0.0.0.0 --port="$PORT"
