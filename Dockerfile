# syntax=docker/dockerfile:1
#
# Image UNIQUE pour tout le projet HerboQuiz : frontend (React/Vite), backend
# (Laravel) et base de donnees (PostgreSQL), tous les trois dans le meme
# conteneur, geres par supervisord. Pas de serveur web dedie (pas de nginx) :
# le frontend est servi par le serveur integre de PHP, deja present pour
# Laravel — un seul langage, un seul outil, rien de plus a apprendre.
#
# Construire (depuis la racine du projet, ou se trouve ce Dockerfile) :
#   docker build -t herboquiz .
#
# Lancer :
#   docker run -p 8000:8000 -p 8080:80 \
#       -v herboquiz-pgdata:/var/lib/postgresql/data herboquiz
#
# Frontend sur http://localhost:8080, API sur http://localhost:8000/api.

# ---------- Etape 1 : build des assets statiques du frontend ----------
FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY herboquiz_frontend/package.json herboquiz_frontend/package-lock.json ./
RUN npm ci

COPY herboquiz_frontend/ ./

# Doit rester joignable depuis le NAVIGATEUR : l'adresse publique de l'API
# (port 8000 publie plus bas), pas une adresse interne au conteneur.
ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---------- Etape 2 : image finale (backend + frontend + Postgres) ----------
FROM php:8.3-cli-alpine

# supervisor   : tient les trois processus (postgres, laravel, frontend) ensemble
# postgresql16 : la base de donnees, embarquee dans le meme conteneur
#                (nom de paquet Alpine ; si le build echoue sur ce paquet,
#                verifier "apk search postgresql" dans l'image de base
#                utilisee, le numero de version suit celui d'Alpine)
# su-exec      : execute des commandes sous l'utilisateur "postgres" (pas de sudo sur alpine)
RUN apk add --no-cache \
        supervisor \
        postgresql16 \
        su-exec \
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

# ----- Backend Laravel -----
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

# ----- Frontend (fichiers statiques deja construits a l'etape 1) -----
COPY --from=frontend-build /app/dist /var/www/frontend
# Petit routeur PHP (fallback SPA) : servi par le meme serveur integre, place
# a cote des fichiers qu'il sert.
COPY spa-router.php /var/www/frontend/spa-router.php

# ----- Configuration systeme : supervisord, script de demarrage -----
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Valeurs par defaut, surchargeables via `docker run -e VAR=valeur`.
ENV APP_NAME=HerboQuiz \
    APP_ENV=production \
    APP_KEY=base64:Ea4FadSBLzL2j/4QWQEAD4WSDr3NT5Y+K6UCU+eXGO4= \
    APP_DEBUG=false \
    APP_TIMEZONE=Africa/Porto-Novo \
    APP_URL=http://localhost:8000 \
    LOG_CHANNEL=stack \
    LOG_LEVEL=warning \
    DB_CONNECTION=pgsql \
    DB_HOST=127.0.0.1 \
    DB_PORT=5432 \
    DB_DATABASE=herboquiz \
    DB_USERNAME=herboquiz \
    DB_PASSWORD=herboquiz \
    SESSION_DRIVER=file \
    CACHE_STORE=file \
    QUEUE_CONNECTION=sync \
    SESSION_MINUTES=720 \
    HERBOQUIZ_PROPRIETAIRE=Kaido \
    PGDATA=/var/lib/postgresql/data \
    DB_SEED=true

# Volume pour que les donnees Postgres survivent a un `docker rm` /
# reconstruction de l'image — sans lui, tout est perdu a chaque redemarrage.
VOLUME ["/var/lib/postgresql/data"]

EXPOSE 80 8000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf", "-n"]
