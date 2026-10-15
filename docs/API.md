# Client API

[Français](API.fr.md) · [Developer guide](DEVELOPMENT.md)

All exports below are **client-side** and affect the local player. Start `cdt_hud` first or declare `dependency 'cdt_hud'` in the consuming resource.

| Export | Purpose |
|---|---|
| `SetVisible(show, reason?)` | Hide/release the HUD, minimap and arrival overlay. |
| `SetHudVisible(show, reason?)` | Alias of `SetVisible`. |
| `SetMinimapVisible(show, reason?)` | Control the native minimap and frame. |
| `SetElementVisible(key, show, reason?)` | Control one element. |
| `SetElementsVisible(keys, show, reason?)` | Control a nonempty list; invalid entries reject the whole request. |
| `ResetVisibility(reason?)` | Release the caller's requests for this reason; omit it to release all caller requests. |
| `SetCinemaMode(enabled)` | Enable/disable cinema mode, including bars and notification hiding. |
| `Notify(message, kind?, duration?)` | Notification string; kind: `info`, `success`, `warning`, `error`; duration in ms. |
| `RegisterProvider(domain, name, definition)` | Register a data adapter. See the developer guide. |
| `SetStatus(domain, value)` | Feed a custom domain without a registered adapter. |

Visibility exports and `SetCinemaMode` require booleans and return `true` for accepted input, `false` for invalid input. `reason` is an optional string, defaulting to `default` for visibility setters.

```lua
exports['cdt_hud']:SetHudVisible(false, 'inventory')
exports['cdt_hud']:SetHudVisible(true, 'inventory')
exports['cdt_hud']:SetMinimapVisible(false) -- default reason
exports['cdt_hud']:SetMinimapVisible(true)
exports['cdt_hud']:SetElementsVisible({'speed', 'rpm', 'fuel'}, false, 'garage')
exports['cdt_hud']:SetElementVisible('destination', false, 'mission')
exports['cdt_hud']:ResetVisibility('garage')
exports['cdt_hud']:ResetVisibility()
exports['cdt_hud']:SetCinemaMode(true)
exports['cdt_hud']:SetCinemaMode(false)
exports['cdt_hud']:Notify('Vehicle ready', 'success', 4000)
```

Requests are isolated by caller resource, reason and element. `true` releases only that caller's matching request; another resource can keep the target hidden. Stopping a caller releases its visibility requests. Requests are temporary and reset when the HUD restarts. Releasing a request respects normal profile/vehicle/pause/cinema conditions; it does not force disabled elements on. HUD/minimap recovery can wait for `Config.Intervals.hidden` (750 ms by default).

Cinema is a shared local state, **not** a request stack. Last change wins. `ResetVisibility` and caller shutdown do not disable cinema; the caller must arrange `SetCinemaMode(false)`. Opening `/hud` also exits cinema. Regular HUD hiding does not hide notifications; cinema does.

Element keys: `health`, `armor`, `hunger`, `thirst`, `stamina`, `oxygen`, `stress`, `speed`, `rpm`, `gear`, `fuel`, `engine`, `belt`, `cruise`, `voice`, `radio`, `street`, `zone`, `heading`, `cash`, `bank`, `job`, `id`, `indicatorLeft`, `indicatorRight`, `hazards`, `destination`. Control the minimap through its dedicated export.

For `SetStatus`, select an unregistered `custom` provider in the matching domain. Example: `SetStatus('stress', 35)` or `SetStatus('needs', {hunger=80, thirst=60})`. Values are percentages; do not use this to change server gameplay state.
