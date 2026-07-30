# syntax=docker/dockerfile:1
#
# Image UNIQUE pour le projet HerboQuiz : frontend (React/Vite) et backend
# (Laravel) dans le meme conteneur, servis par UN SEUL processus
# (`php artisan serve`, avec un server.php personnalise qui route aussi vers
# le frontend construit). La base de donnees est EXTERNE (PostgreSQL gere
# par Render) : ce conteneur ne fait que s'y connecter, il n'en heberge
# aucune. Pas de nginx, pas de superviseur de processus.
#
# Construire (depuis la racine du projet, ou se trouve ce Dockerfile) :
#   docker build -t herboquiz .
#
# Lancer :
#   docker run -p 8000:8000 herboquiz
#
# Le site (frontend + API sous /api) est alors sur http://localhost:8000.

# ---------- Etape 1 : build des assets statiques du frontend ----------
FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY herboquiz_frontend/package.json herboquiz_frontend/package-lock.json ./
RUN npm ci

COPY herboquiz_frontend/ ./

# Chemin relatif : frontend et API sont servis par le MEME processus sur le
# MEME port, plus besoin d'une URL absolue vers un autre conteneur/port.
ENV VITE_API_URL=/api
RUN npm run build

# ---------- Etape 2 : image finale (backend + frontend) ----------
FROM php:8.3-cli-alpine

# postgresql-dev : en-tetes necessaires pour compiler pdo_pgsql (client
# seulement — la base elle-meme est hebergee par Render, pas ici).
RUN apk add --no-cache \
        postgresql-dev \
        libzip-dev \
        oniguruma-dev \
        icu-dev \
        $PHPIZE_DEPS \
    && docker-php-ext-install -j"$(nproc)" \
        pdo \
        pdo_pgsql \
        pgsql \
        mbstring \
        bcmath \
        pcntl \
        zip \
        intl \
    && apk del $PHPIZE_DEPS

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Couche dependances separee du code : un changement de composer.json
# n'invalide le cache Docker que si les dependances changent reellement.
COPY herboquiz_backend/composer.json herboquiz_backend/composer.lock ./
RUN composer install \
        --no-dev \
        --no-scripts \
        --no-interaction \
        --prefer-dist \
        --no-progress \
        --optimize-autoloader

COPY herboquiz_backend/ ./

RUN composer dump-autoload --optimize --no-dev --no-scripts \
    && chmod -R ug+rwX storage bootstrap/cache

# Frontend construit directement DANS public/ : le server.php personnalise
# ci-dessous sert ces fichiers tels quels, et Laravel garde son index.php
# pour les routes API. Un seul document root, un seul processus.
COPY --from=frontend-build /app/dist/ ./public/

# Remplace le server.php par defaut de Laravel (voir le fichier pour le
# detail) : c'est lui que `php artisan serve` utilise des qu'il existe a la
# racine du projet.
COPY server.php ./server.php

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Valeurs par defaut, surchargeables via `docker run -e VAR=valeur`.
# DB_URL est la chaine de connexion complete de la base Render ; Laravel la
# parse directement ("postgresql://" est reconnu comme alias de "pgsql", voir
# Illuminate\Support\ConfigurationUrlParser). DB_CONNECTION reste necessaire
# pour selectionner le bloc "pgsql" de config/database.php.
#
# ATTENTION : ce mot de passe est en clair dans l'image. Ne PAS pousser cette
# image vers un registre public ; sur une plateforme comme Render, passer
# plutot DB_URL comme variable d'environnement du service, pas ici.
ENV APP_NAME=HerboQuiz \
    APP_ENV=production \
    APP_KEY=base64:Ea4FadSBLzL2j/4QWQEAD4WSDr3NT5Y+K6UCU+eXGO4= \
    APP_DEBUG=false \
    APP_TIMEZONE=Africa/Porto-Novo \
    APP_URL=http://localhost:8000 \
    LOG_CHANNEL=stack \
    LOG_LEVEL=warning \
    DB_CONNECTION=pgsql \
    DB_URL=postgresql://gamecg_user:44l2HUGhxennLWkVbXKvGclgIrrDs5Ql@dpg-d9llld942hec739v9d8g-a/gamecg \
    SESSION_DRIVER=file \
    CACHE_STORE=file \
    QUEUE_CONNECTION=sync \
    SESSION_MINUTES=720 \
    HERBOQUIZ_PROPRIETAIRE=Kaido \
    DB_SEED=true

EXPOSE 8000

ENTRYPOINT ["docker-entrypoint.sh"]
