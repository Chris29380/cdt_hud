# API client

[English](API.md) · [Guide développeur](DEVELOPMENT.fr.md)

Tous les exports sont **clients** et concernent le joueur local. Démarrer `cdt_hud` avant la ressource appelante, ou déclarer `dependency 'cdt_hud'` dans son manifest.

| Export | Fonction |
|---|---|
| `SetVisible(show, reason?)` | Masquer/libérer HUD, minimap et repère GPS. |
| `SetHudVisible(show, reason?)` | Alias de `SetVisible`. |
| `SetMinimapVisible(show, reason?)` | Contrôler minimap native et cadre. |
| `SetElementVisible(key, show, reason?)` | Contrôler un élément. |
| `SetElementsVisible(keys, show, reason?)` | Contrôler une liste non vide ; toute clé invalide refuse la demande entière. |
| `ResetVisibility(reason?)` | Libérer les demandes du script pour ce motif ; sans argument, toutes ses demandes. |
| `SetCinemaMode(enabled)` | Activer/désactiver cinéma, bandes noires et masquage des notifications. |
| `Notify(message, kind?, duration?)` | Notification texte ; types `info`, `success`, `warning`, `error` ; durée en ms. |
| `RegisterProvider(domain, name, definition)` | Enregistrer un adaptateur de données. Voir le guide développeur. |
| `SetStatus(domain, value)` | Alimenter un domaine custom sans adaptateur enregistré. |

Les exports de visibilité et de cinéma attendent des booléens et retournent `true` si la demande est valide, `false` sinon. `reason` est une chaîne facultative ; les setters de visibilité utilisent `default` si elle est omise.

```lua
exports['cdt_hud']:SetHudVisible(false, 'inventaire')
exports['cdt_hud']:SetHudVisible(true, 'inventaire')
exports['cdt_hud']:SetMinimapVisible(false)
exports['cdt_hud']:SetMinimapVisible(true)
exports['cdt_hud']:SetElementsVisible({'speed', 'rpm', 'fuel'}, false, 'garage')
exports['cdt_hud']:SetElementVisible('destination', false, 'mission')
exports['cdt_hud']:ResetVisibility('garage')
exports['cdt_hud']:ResetVisibility()
exports['cdt_hud']:SetCinemaMode(true)
exports['cdt_hud']:SetCinemaMode(false)
exports['cdt_hud']:Notify('Véhicule prêt', 'success', 4000)
```

Les demandes sont isolées par ressource, motif et élément. `true` libère uniquement la demande correspondante du script appelant ; une autre ressource peut maintenir le masquage. L'arrêt du script libère ses demandes. Elles sont temporaires et perdues au redémarrage du HUD. Leur libération respecte profil, véhicule, pause et cinéma ; elle ne force pas un élément désactivé à apparaître. La reprise HUD/minimap peut attendre `Config.Intervals.hidden` (750 ms par défaut).

Le cinéma est un état local partagé, **sans cumul de demandes** : le dernier changement s'applique. `ResetVisibility` et l'arrêt du script ne le désactivent pas ; prévoir `SetCinemaMode(false)`. Ouvrir `/hud` quitte aussi le cinéma. Le masquage standard du HUD ne masque pas les notifications ; le cinéma le fait.

Clés : `health`, `armor`, `hunger`, `thirst`, `stamina`, `oxygen`, `stress`, `speed`, `rpm`, `gear`, `fuel`, `engine`, `belt`, `cruise`, `voice`, `radio`, `street`, `zone`, `heading`, `cash`, `bank`, `job`, `id`, `indicatorLeft`, `indicatorRight`, `hazards`, `destination`. Utiliser l'export dédié pour la minimap.

Pour `SetStatus`, choisir un fournisseur `custom` non enregistré dans le domaine concerné. Exemples : `SetStatus('stress', 35)` ou `SetStatus('needs', {hunger=80, thirst=60})`. Valeurs en pourcentage ; cet export ne modifie pas les données de gameplay serveur.
