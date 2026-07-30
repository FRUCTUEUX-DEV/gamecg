# syntax=docker/dockerfile:1
#
# Image UNIQUE pour tout le projet HerboQuiz : frontend (React/Vite), backend
# (Laravel) et base de donnees (PostgreSQL), tous les trois dans le meme
# conteneur, geres par supervisord et exposes sur un seul port (80).
#
# Construire (depuis la racine du projet, ou se trouve ce Dockerfile) :
#   docker build -t herboquiz .
#
# Lancer :
#   docker run -p 8080:80 -v herboquiz-pgdata:/var/lib/postgresql/data herboquiz
#
# Le site est alors sur http://localhost:8080 — nginx sert le frontend et
# relaie /api vers Laravel en interne, aucun autre port a exposer.

# ---------- Etape 1 : build des assets statiques du frontend ----------
FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY herboquiz_frontend/package.json herboquiz_frontend/package-lock.json ./
RUN npm ci

COPY herboquiz_frontend/ ./

# Chemin relatif : le navigateur appelle /api sur CE MEME conteneur, nginx le
# relaie vers Laravel en coulisses. Pas d'URL absolue a batir.
ENV VITE_API_URL=/api
RUN npm run build

# ---------- Etape 2 : image finale (backend + frontend + Postgres) ----------
FROM php:8.3-cli-alpine

# nginx        : sert le frontend et relaie /api vers Laravel
# supervisor   : tient les trois processus (postgres, laravel, nginx) ensemble
# postgresql16 : la base de donnees, embarquee dans le meme conteneur
#                (nom de paquet Alpine ; si le build echoue sur ce paquet,
#                verifier "apk search postgresql" dans l'image de base
#                utilisee, le numero de version suit celui d'Alpine)
# su-exec      : execute des commandes sous l'utilisateur "postgres" (pas de sudo sur alpine)
RUN apk add --no-cache \
        nginx \
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

# ----- Configuration systeme : nginx, supervisord, script de demarrage -----
COPY nginx.conf /etc/nginx/http.d/default.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Valeurs par defaut, surchargeables via `docker run -e VAR=valeur`.
ENV APP_NAME=HerboQuiz \
    APP_ENV=production \
    APP_KEY=base64:Ea4FadSBLzL2j/4QWQEAD4WSDr3NT5Y+K6UCU+eXGO4= \
    APP_DEBUG=false \
    APP_TIMEZONE=Africa/Porto-Novo \
    APP_URL=http://localhost:8080 \
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

EXPOSE 80

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf", "-n"]
