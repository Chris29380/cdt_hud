Config = {
    Framework = 'auto', -- auto, esx, qbox, qbcore, standalone
    FrameworkResources = { esx = 'es_extended', qbox = 'qbx_core', qbcore = 'qb-core' },
    Command = 'hud', Key = 'F7', Debug = false,
    Cinema = { key = 'O', barHeight = 0.12 }, -- fraction of screen height per black band
    Intervals = { player = 500, vehicle = 100, location = 1500, hidden = 750, framework = 5000 },
    SpeedUnit = 'kmh', -- 'kmh' or 'mph': default for new profiles; players can override in /hud > Affichage
    Minimap = 'always', -- vehicle, always, disabled (native shape)
    MinimapCircleWidthCorrection = 1.0, -- equal pixel dimensions; values below 1 squash the map horizontally
    Destination = { enabled = true, radius = 700, height = 40 }, -- metres; height beyond 100m; lowers to 10m on approach (driver only)
    UnderwaterSeconds = 10, -- adapt to diving resources if they change oxygen capacity
    Belt = { enabled = true, key = 'B',
        ejection = { enabled = true, minimumKmh = 60, speedDropKmh = 35, dropRatio = 0.35, ragdollMs = 3000, cooldownMs = 5000 }
    },
    Cruise = { enabled = true, key = 'LSHIFT', minimumKmh = 20 },
    Indicators = { enabled = true, leftKey = 'LEFT', rightKey = 'RIGHT', hazardKey = 'DOWN', blinkMs = 500 },
    Notifications = { enabled = true, maximum = 4 },
    AdminAce = 'cdt.hud.configure',
    ProfileKey = 'cdt_hud_profile_v1', -- legacy KVP key, read once for migration into SQL
}

