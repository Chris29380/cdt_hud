# Développement

[English](DEVELOPMENT.md) · [API client](API.fr.md) · [Installation](../README.fr.md)

## Organisation du code

- `fxmanifest.lua` : points d'entrée et fichiers NUI distribués.
- `config.lua`, `config/integrations.lua` : réglages et sélection des fournisseurs.
- `config/default-profile.lua`, `web/installation.js` : profils d'installation intégrés et schéma de validation serveur. Les maintenir synchronisés.
- `bridge/` : normalisation framework, registre et adaptateurs personnalisés.
- `client/` : échantillonnage, cycle NUI, contrôles véhicule, visibilité et projection GPS/rayon natif.
- `server/` : SQL, permissions, intégrations et défauts serveur.
- `web/` : HTML/CSS/JS, validation des profils, styles et dictionnaires.
- `stream/` : textures minimap ; voir les [attributions](ATTRIBUTION.md).
- Cette distribution exclut les fixtures de tests et les outils de développement locaux.

Aucune compilation frontend. Version du manifest : `0.1.0`. Les profils sont stockés en SQL, pas dans des fichiers JSON générés. Ne pas intégrer de secrets ni d'identifiants personnels dans les défauts.

## Fournisseurs

Sélectionner chaque domaine dans `config/integrations.lua` ou le menu serveur protégé : `fuel`, `needs`, `stress`, `voice`. Selon le domaine : auto, native, fournisseurs nommés, export, statebag, custom ou disabled. Choisir explicitement si plusieurs fournisseurs tournent. Une donnée absente reste indisponible ; zéro est une vraie valeur. Le repli natif ne remplace pas une erreur d'un fournisseur explicitement sélectionné.

```lua
Config.Integrations.fuel = {
    provider = 'export', resource = 'mon_fuel', export = 'GetFuel',
    minimum = 0, maximum = 100
}
-- Ou depuis une ressource client :
exports['cdt_hud']:RegisterProvider('fuel', 'custom', {
    resource = GetCurrentResourceName(),
    read = function(vehicle, settings)
        return exports['mon_fuel']:GetFuel(vehicle)
    end
})
```

Choisir `custom` pour ce domaine. `bridge/custom/example.lua` fournit une autre extension chargée par le manifest. Contrats : fuel renvoie un nombre dans l'échelle configurée ; needs renvoie `{hunger, thirst}` en pourcentage ; stress un pourcentage ; voice `{voice, radio, talking}`. Pour les API asynchrones, alimenter un cache par événement/callback ; `read` doit retourner immédiatement sans lancer une requête à chaque lecture. Vérifier les signatures sur la version réellement installée du fournisseur.

Voix : pma-voice, statebags (`proximity.distance`, `radioChannel`, éventuellement `proximity.index`), exports séparés sans argument ou adaptateur custom. Sans état de parole explicite, le HUD utilise Mumble. Contrôler les permissions côté serveur, sans faire confiance aux données NUI.

## Langues

Définir `cdt_language` avant le démarrage dans `server.cfg`. Valeur absente/indisponible : anglais. La langue personnelle sauvegardée est prioritaire. Pour ajouter une langue : copier `web/locales/en.js`, modifier `window.HudLocales.en` et `name`, traduire les valeurs sans modifier les clés, puis déclarer le fichier dans `web/locales/index.js`. Le manifest inclut déjà `web/locales/*.js`. Le fichier doit être présent pour la détection serveur.

Les clés manquantes des langues supplémentaires utilisent les traductions anglaises disponibles. Le texte inconnu reste inchangé. Les rues, métiers et données réelles du serveur ne sont pas traduits ; les libellés standards et données de démonstration le sont. Ne pas traduire le JSON brut ni les valeurs personnalisées saisies. `web/i18n.js` surveille le texte et les attributs du menu ; les libellés HUD sont traduits au rendu. Le GPS écoute `hud:languageChanged`.

## Étendre le HUD

Ajouter un élément dans les défauts, labels, schémas de validation, catégories/styles, rendu, données client, traductions et clés de visibilité. Toute nouvelle option nécessite une validation navigateur et serveur, sinon elle risque d'être perdue à la sauvegarde. Modifier les révisions usine avec précaution : publier un défaut serveur ne doit pas remplacer les profils personnels existants.

Le module GPS conserve les coordonnées X/Y du waypoint. Recherche du sol toutes les 250 ms tant qu'il manque, puis chaque seconde, avec demande de collision distante non bloquante. Un panneau provisoire suit la direction en haut de la vue, puis rejoint l'ancrage en 350 ms. Le rayon natif est indépendant du panneau HTML. L'espace sous le panneau augmente lors des rotations rapides. Éviter les requêtes réseau par frame et les lectures de géométrie DOM coûteuses.

## Vérification après modification

Cette distribution contient les sources utiles au fonctionnement et la documentation ; les suites de tests et outils navigateur de développement sont exclus. Vérifier la syntaxe Lua avec `luac -p` et JavaScript avec `node --check`.

Avant déploiement : tester chargement/mort du personnage, redémarrage, profils, cycle framework/fournisseurs, caméra et terrain GPS, restauration minimap, permissions, sécurité véhicule et résolutions 1080p à 4K. Mesurer le profiler et le coût NUI sur la cible ; les résultats de tests antérieurs ne garantissent pas un budget en ms.