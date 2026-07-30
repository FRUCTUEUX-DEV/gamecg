# syntax=docker/dockerfile:1

# ---------- Etape 1 : build des assets statiques ----------
FROM node:22-alpine AS build

WORKDIR /app

# Couche dependances separee du code source pour le cache Docker.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_API_URL est inline dans le bundle AU BUILD (comme toute variable
# Vite) : impossible de le changer apres coup sans reconstruire l'image.
# Doit pointer vers une adresse joignable depuis le NAVIGATEUR de
# l'utilisateur, pas depuis le reseau interne de Docker — d'ou
# localhost:8000 par defaut (le port du backend publie sur l'hote), et non
# "http://backend:8000" qui ne resout que depuis un autre conteneur.
ARG VITE_API_URL=http://localhost:8000/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---------- Etape 2 : service statique ----------
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
