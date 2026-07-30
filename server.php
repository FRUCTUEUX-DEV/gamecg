<?php
// Remplace le server.php par defaut de Laravel (utilise par `php artisan
// serve` — voir ServeCommand::serverCommand, qui prend CE fichier des qu'il
// existe a la racine du projet). Sert le frontend construit ET l'API
// Laravel depuis le MEME processus PHP et le MEME port : pas de nginx, pas
// de superviseur, pas de fichier de routage separe a maintenir.
//
// Copie dans l'image Docker uniquement (voir Dockerfile) : absent du depot
// backend local, le `composer run dev` habituel n'est donc pas affecte.
$publicPath = getcwd();
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '');

// Fichier existant (JS/CSS du frontend, favicon...) : servi tel quel.
if ($uri !== '/' && file_exists($publicPath.$uri) && ! is_dir($publicPath.$uri)) {
    return false;
}

// Routes API et sonde de sante : Laravel.
if ($uri === '/up' || str_starts_with($uri, '/api/')) {
    require_once $publicPath.'/index.php';
    return true;
}

// Tout le reste (/, /a-propos, /admin...) : le frontend. React Router prend
// le relais cote client, sinon un rechargement sur ces pages donnerait un 404.
readfile($publicPath.'/index.html');
