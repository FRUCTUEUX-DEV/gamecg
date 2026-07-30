<?php
// Routeur pour le serveur integre de PHP (php -S ... spa-router.php), utilise
// pour servir le frontend construit sans passer par un serveur web dedie.
//
// Un fichier qui existe (JS, CSS, image...) est servi tel quel ; toute autre
// route (/a-propos, /admin...) retombe sur index.html, pour que React Router
// prenne le relai cote client — sinon un rechargement sur ces pages
// renverrait un 404.
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$fichier = __DIR__ . $uri;

if ($uri !== '/' && is_file($fichier)) {
    return false;
}

readfile(__DIR__ . '/index.html');
