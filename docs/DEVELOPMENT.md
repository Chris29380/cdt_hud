# Development

[Français](DEVELOPMENT.fr.md) · [Client API](API.md) · [Installation](../README.md)

## Source layout

- `fxmanifest.lua`: resource entry points and packaged NUI assets.
- `config.lua`, `config/integrations.lua`: runtime options and provider selection.
- `config/default-profile.lua`, `web/installation.js`: matching embedded installation profiles and server validation schema. Keep both synchronized.
- `bridge/`: framework normalization, provider registry and custom adapters.
- `client/`: sampling, NUI lifecycle, vehicle controls, external visibility and GPS projection/native ray.
- `server/`: SQL storage, permissions, integration settings and default profiles.
- `web/`: plain HTML/CSS/JS UI, profile validation, styles and language dictionaries.
- `stream/`: minimap textures. See [attribution](ATTRIBUTION.md).
- This distribution excludes test fixtures and local development tooling.

No frontend build is required. The manifest version is `0.1.0`. Server/player settings are stored in SQL, not generated JSON files. Never embed credentials or personal identifiers in defaults.

## Providers

Select providers independently in `config/integrations.lua` or the protected server menu. Domains: `fuel`, `needs`, `stress`, `voice`. Supported strategies depend on the domain: auto detection, native, named providers, export, state bag, custom, disabled. Use explicit selection when several providers are running. A missing value is unavailable; zero is a real value. Native fallback is not a substitute for errors from an explicitly selected provider.

```lua
Config.Integrations.fuel = {
    provider = 'export', resource = 'your_fuel', export = 'GetFuel',
    minimum = 0, maximum = 100
}
-- Or register an adapter from a client resource:
exports['cdt_hud']:RegisterProvider('fuel', 'custom', {
    resource = GetCurrentResourceName(),
    read = function(vehicle, settings)
        return exports['your_fuel']:GetFuel(vehicle)
    end
})
```

Select `custom` in the matching domain. `bridge/custom/example.lua` is a second extension point loaded by the manifest. Adapter contracts: fuel returns a number in the configured scale; needs returns `{hunger, thirst}` percentages; stress returns a percentage; voice returns `{voice, radio, talking}`. Use cached values for event/callback APIs; `read` must return immediately and must not issue a request on each sample. Check third-party API signatures against the installed provider version.

Voice can use pma-voice, state bags (`proximity.distance`, `radioChannel`, optional `proximity.index`), separate argument-free exports, or a custom adapter. An unspecified talking flag uses native Mumble detection. Configure permissions server-side; never trust NUI input as authorization.

## Languages

Set `cdt_language` in `server.cfg` before startup. English is used if missing/unavailable; a saved player language takes priority. To add a language, copy `web/locales/en.js`, change `window.HudLocales.en` and `name`, translate values while preserving keys, then add the file to `web/locales/index.js`. The manifest already includes `web/locales/*.js`. Files must exist for server-side discovery. Preserve the case of regional codes when naming files.

Missing keys in additional languages use available English translations. Unknown custom text remains unchanged. Streets, jobs and other real server data are not translated; standard labels and demonstration text are. Do not translate raw profile JSON or user-entered field values. `web/i18n.js` observes editor text and attributes; HUD labels are translated during rendering. The GPS overlay listens to `hud:languageChanged`.

## Extending the HUD

Add elements consistently to profile defaults, labels, validation schemas, category/style lists, renderers, client values, translations and visibility keys. New settings need matching browser and server validation; otherwise they may be dropped during persistence. Change factory revisions deliberately: existing personal profiles must not be overwritten when a server default is published.

The GPS module keeps world X/Y anchored to the waypoint, queries terrain at 250 ms until available, then at 1 s, and requests distant collision without blocking. Before terrain is known, a bearing-based label appears high in view; it transitions to its anchor in 350 ms. Native ray rendering is separate from the HTML label. The gap includes a camera-motion margin. Avoid adding per-frame network requests or expensive DOM layout reads.

## Validation after modifications

This distribution contains runtime source and documentation only; automated test suites and browser development helpers are not included. Check modified Lua syntax with `luac -p` and JavaScript syntax with `node --check`.

Before deployment, test character loading/death, resource restart, saved profiles, framework/provider lifecycle, camera/GPS terrain behavior, minimap restoration, permissions, vehicle safety and resolutions from 1080p to 4K. Measure resource profiler and NUI cost on the target server; no fixed performance guarantee is implied by prior unit-test results.