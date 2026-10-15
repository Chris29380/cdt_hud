HudBridge = { providers = {}, selected = {}, errors = {}, pushed = {} }
function HudBridge.register(domain, name, definition)
    assert(type(domain) == 'string' and type(name) == 'string' and type(definition.read) == 'function', 'Invalid provider')
    HudBridge.providers[domain] = HudBridge.providers[domain] or {}
    HudBridge.providers[domain][name] = definition
end
local fuels = { 'ox_fuel', 'LegacyFuel', 'qb-fuel', 'ps-fuel', 'lj-fuel', 'okokGasStation', 'qs-fuelstations', 'lc_fuel', 'cdn-fuel' }
for _, name in ipairs(fuels) do
    HudBridge.register('fuel', name, { resource = name, read = function(vehicle, settings)
        if name == 'ox_fuel' then return Entity(vehicle).state.fuel or GetVehicleFuelLevel(vehicle) end
        return exports[settings.resource or name]:GetFuel(vehicle)
    end })
end
HudBridge.register('fuel', 'native', { read = function(vehicle) return GetVehicleFuelLevel(vehicle) end })
HudBridge.register('fuel', 'export', { read = function(vehicle, settings)
    if not settings.resource or not settings.export then return nil end
    return exports[settings.resource][settings.export](nil, vehicle)
end })
HudBridge.register('fuel', 'statebag', { read = function(vehicle, settings) return Entity(vehicle).state[settings.key or 'fuel'] end })
local function voiceState(path)
    if not path or path == '' then return nil end
    local value = LocalPlayer.state
    for part in path:gmatch('[^.]+') do
        if type(value) ~= 'table' then return nil end
        value = value[part]
    end
    return value
end
HudBridge.register('voice', 'statebag', { read = function(_, settings)
    local talking = voiceState(settings.talkingKey)
    return { voice=voiceState(settings.voiceKey or 'proximity.distance'), radio=voiceState(settings.radioKey or 'radioChannel'),
        level=voiceState(settings.levelKey or 'proximity.index'), talking=talking == nil and MumbleIsPlayerTalking(PlayerId()) or talking }
end })
HudBridge.register('voice', 'export', { read = function(_, settings)
    if not settings.resource or not HudUtil.running(settings.resource) then return nil end
    local function read(name)
        if not name or name == '' then return nil end
        local ok, value = pcall(function() return exports[settings.resource][name](nil) end)
        if ok then return value end
        return nil
    end
    local talking = read(settings.talkingExport)
    return { voice=read(settings.voiceExport), radio=read(settings.radioExport), level=read(settings.levelExport),
        talking=talking == nil and MumbleIsPlayerTalking(PlayerId()) or talking }
end })
function HudBridge.resolve()
    HudBridge.selected = {}
    for domain, settings in pairs(Config.Integrations) do
        local name = settings.provider
        if domain == 'fuel' and name == 'auto' then
            name = 'native'
            local found = 0
            for _, candidate in ipairs(fuels) do
                if HudUtil.running(candidate) then
                    found = found + 1
                    if name == 'native' then name = candidate end
                end
            end
            if found > 1 then print('[cdt_hud] Plusieurs fournisseurs essence : choisir explicitement dans config/integrations.lua.') end
        elseif domain == 'voice' and name == 'auto' then name = HudUtil.running(settings.resource or 'pma-voice') and 'pma' or 'disabled'
        elseif domain == 'needs' and name == 'auto' then name = HudFramework.kind == 'esx' and HudUtil.running('esx_status') and 'esx_status' or 'framework' end
        HudBridge.selected[domain] = name
    end
end
function HudBridge.read(domain, context)
    local name = HudBridge.selected[domain]
    if name == 'disabled' then return false end
    local provider = (HudBridge.providers[domain] or {})[name]
    if not provider then return HudBridge.pushed[domain] or false end
    local settings = Config.Integrations[domain] or {}
    if provider.resource and not HudUtil.running(settings.resource or provider.resource) then return false end
    local ok, value = pcall(provider.read, context, settings)
    if not ok then
        local now = GetGameTimer()
        if not HudBridge.errors[domain] or now - HudBridge.errors[domain].time > 30000 then
            HudBridge.errors[domain] = { time = now, message = tostring(value) }
            print(('[cdt_hud] Bridge %s/%s : %s'):format(domain, tostring(name), tostring(value)))
        end
        return false
    end
    if domain == 'fuel' then return HudUtil.percent(value, settings.minimum, settings.maximum) end
    return value == nil and false or value
end
exports('RegisterProvider', function(domain, name, definition)
    definition.owner = GetInvokingResource()
    HudBridge.register(domain, name, definition)
    HudBridge.resolve()
end)
exports('SetStatus', function(domain, value) HudBridge.pushed[domain] = value end)
AddEventHandler('onClientResourceStop', function(resource)
    for _, providers in pairs(HudBridge.providers) do
        for name, provider in pairs(providers) do if provider.owner == resource then providers[name] = nil end end
    end
end)
