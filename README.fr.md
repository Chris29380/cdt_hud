# cdt_hud

![CDT HUD — Présentation](.github/assets/cdt-hud-showcase.png)

## Rejoignez la communauté CDT

Besoin d’aide pour installer ou configurer le HUD ? **Rejoignez notre Discord pour obtenir du support**, échanger avec la communauté et découvrir notre travail de développement. Suivez nos projets et partagez vos retours.

[![Rejoindre notre Discord — support et développements](.github/assets/discord-join-fr.svg)](https://discord.gg/yNkYVhNCQQ)

**[Obtenir de l’aide →](https://discord.gg/yNkYVhNCQQ)** · **[Découvrir nos développements →](https://discord.gg/yNkYVhNCQQ)**

## Licence

La [licence CDT HUD en anglais](LICENSE) autorise l'utilisation personnelle, la modification du code et la redistribution gratuite avec attribution et conservation des conditions. La vente de la ressource, de copies modifiées ou de packs payants contenant son code est interdite sans autorisation écrite préalable de CDT. Les assets tiers conservent leurs licences ; voir les [attributions](docs/ATTRIBUTION.md).

[English](README.md) · [Guide développeur](docs/DEVELOPMENT.fr.md) · [API client](docs/API.fr.md) · [Historique](CHANGELOG.md)

HUD FiveM configurable pour ESX, Qbox, QBCore et indicateurs natifs standalone : jauges joueur/véhicule, micro/radio, minimap ronde ou rectangulaire, styles, profils SQL, ceinture, régulateur, clignotants, cinéma et repère GPS. Interface HTML/CSS/JavaScript sans compilation.

## Installation

1. Conserver le nom de dossier `cdt_hud`.
2. Installer/configurer `oxmysql` et démarrer le framework et les fournisseurs avant le HUD.
3. Ajouter dans `server.cfg` :

```cfg
set cdt_language "fr"
ensure oxmysql
# Démarrer ici votre framework et vos fournisseurs.
ensure cdt_hud
```

Adapter `config.lua` et `config/integrations.lua`. `Framework = 'auto'` privilégie Qbox, puis QBCore et ESX ; une sélection explicite est possible. Sans framework, les indicateurs natifs restent disponibles.

Les tables SQL sont créées automatiquement. Les préférences sont associées à la license, communes aux personnages. Les anciens réglages SQL/KVP sont migrés par la ressource. Sauvegarder la base avant une mise à jour.

## Utilisation

| Action | Commande / touche initiale |
|---|---|
| Configuration | `/hud` ou F7 |
| Cinéma | O ou `/hudcinema` |
| Ceinture | B ou `/hudbelt` |
| Régulateur | Maj gauche ou `/hudcruise` |
| Clignotants / détresse | Flèches gauche / droite / bas |

Les raccourcis FiveM peuvent remplacer ces valeurs. Choisir un style ou un élément, modifier sa présentation et sa position, puis **Enregistrer**. **Annuler** reprend le profil précédent. Affichage contient la langue, les unités, la minimap et l'option du repère GPS.

`cdt_language` définit la langue initiale des nouveaux profils. Valeur absente ou langue indisponible : anglais. Chaque joueur peut sauvegarder une autre langue dans son HUD ; son choix personnel reste prioritaire. Français et anglais sont fournis.

Le repère GPS est activé par défaut, réservé au conducteur dans les 700 unités de son waypoint personnel et dans la direction de la caméra. Sans hauteur de terrain, un panneau provisoire apparaît en haut de la vue. Dès que le sol est connu, transition de 350 ms vers son ancrage réel. Hauteur de 40 unités au-delà de 100 m, puis descente accélérée à 10 unités dès 30 m. Le rayon diffus rejoint le terrain avec un espace sous le panneau. L'ensemble disparaît avec le waypoint. `Config.Destination` règle l'activation globale, le rayon et la hauteur distante.

La ceinture et l'éjection optionnelle concernent les véhicules routiers compatibles. Le régulateur fonctionne dès 20 km/h et se désactive au freinage, arrêt moteur ou changement de véhicule/conducteur. Désactiver les modules déjà gérés par une autre ressource.

## Administration

```cfg
add_ace group.admin cdt.hud.configure allow
# Seulement si owner ne possède pas déjà les droits via héritage :
add_ace group.owner cdt.hud.configure allow
```

Associer les joueurs aux principaux selon les permissions du serveur. La configuration serveur et la publication du HUD par défaut exigent cette ACE, réglable via `Config.AdminAce`. Le défaut publié s'applique aux joueurs sans profil personnel. Les autres conservent leurs préférences ; une réinitialisation complète reprend le défaut courant.

- `/huddiagnostic` : diagnostic framework/fournisseurs dans F8.
- `/hudpermissions` : diagnostic des droits effectifs.
- `hudbridgereset` : rétablir les intégrations du fichier, depuis la console serveur ou un administrateur autorisé.
- `Config.Debug = true` : onglet JSON debug et diagnostics supplémentaires. Désactivé dans la configuration de release.

## Dépannage et mise à jour

HUD absent : vérifier personnage chargé, pause/cinéma et demandes de masquage externes. Donnée absente : vérifier sélection du fournisseur et compatibilité de son API installée. Menu inaccessible : vérifier SQL et les journaux F8/serveur. Modules en double : désactiver les ressources ou fonctions concurrentes.

Redémarrer `cdt_hud` après modification des fichiers de configuration ou de `cdt_language`. Aucune compilation de l'interface n'est nécessaire. Les performances et la compatibilité complète ESX/Qbox/QBCore restent à vérifier sur votre serveur : les tests automatisés ne certifient pas le rendu des natives ni les versions des fournisseurs externes.

Voir le [guide développeur](docs/DEVELOPMENT.fr.md), [l'API](docs/API.fr.md) et les [attributions](docs/ATTRIBUTION.md).
