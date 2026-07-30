# syntax=docker/dockerfile:1

FROM php:8.3-cli-alpine AS backend

# Extensions PHP requises par Laravel + le pilote PostgreSQL (pdo_pgsql).
# Les paquets *-dev et $PHPIZE_DEPS ne servent qu'a la compilation : on les
# retire ensuite pour garder l'image legere.
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
COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --no-scripts \
        --no-interaction \
        --prefer-dist \
        --no-progress \
        --optimize-autoloader

COPY . .

RUN composer dump-autoload --optimize --no-dev --no-scripts

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && chmod -R ug+rwX storage bootstrap/cache

EXPOSE 8000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
