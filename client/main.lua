local ready, editing, cinema, visible = false, false, false, false
local previous, profile = {}, nil
local vehicle, belt, cruise, cruiseLimit = 0, false, false, nil
local priorRadar = IsRadarEnabled()
local minimapGeneration, stopping = 0, false
local minimapPreview = nil
local minimapAutoOffset, minimapScaleform = 0, nil
local lastScreenWidth, lastScreenHeight, lastSafeZone
local nuiWarnings={}
local function nuiMessage(message)
    local clean,invalid=HudUtil.nuiSafe(message)
    if invalid and not nuiWarnings[invalid] then
        nuiWarnings[invalid]=true
        print('[cdt_hud] Valeur NUI invalide ignorée : '..invalid)
    end
    SendNUIMessage(clean)
end
local function nativeBars(mode)
    if minimapScaleform and HasScaleformMovieLoaded(minimapScaleform) then
        BeginScaleformMovieMethod(minimapScaleform, 'SETUP_HEALTH_ARMOUR')
        ScaleformMovieMethodAddParamInt(mode)
        EndScaleformMovieMethod()
    end
end
local function voiceTalking()
    local state = MumbleIsPlayerTalking(PlayerId())
    return state == true or state == 1
end
local integrationRequests, integrationSequence = {}, 0
local function integrationRequest(action, input, callback, eventName)
    integrationSequence = integrationSequence % 1000000 + 1
    local id = integrationSequence
    integrationRequests[id] = callback
    TriggerServerEvent(eventName or 'cdt_hud:server:integrations', id, action, input)
    SetTimeout(5000, function()
        if integrationRequests[id] then
            integrationRequests[id]({ ok = false, error = 'Délai serveur dépassé' }) integrationRequests[id] = nil
        end
    end)
end
local function applyIntegrations(settings)
    if type(settings) == 'table' then Config.Integrations = settings HudBridge.resolve() previous = {} end
end
RegisterNetEvent('cdt_hud:client:integrationsReply', function(id, result)
    local callback = integrationRequests[id]
    if callback then integrationRequests[id] = nil callback(result) end
end)
RegisterNetEvent('cdt_hud:client:integrationsChanged', applyIntegrations)
local defaultOwner = false
RegisterNetEvent('cdt_hud:client:defaultChanged',function(value)
    if type(value)=='table' then nuiMessage({action='serverDefault',profile=value,canEdit=defaultOwner}) end
end)
RegisterNUICallback('getServerDefault',function(_,cb)
    integrationRequest('get',nil,cb,'cdt_hud:server:defaults')
end)
RegisterNUICallback('saveServerDefault',function(data,cb)
    if not editing then cb({ok=false,error='Ouvrir le menu HUD'}) return end
    integrationRequest('save',data.profile,cb,'cdt_hud:server:defaults')
end)
RegisterNUICallback('getIntegrations', function(_, cb) integrationRequest('get', nil, cb) end)
RegisterNUICallback('getEjection', function(_, cb) integrationRequest('get', nil, cb, 'cdt_hud:server:ejection') end)
RegisterNUICallback('saveEjection', function(data, cb) integrationRequest('save', data.ejection, cb, 'cdt_hud:server:ejection') end)
RegisterNetEvent('cdt_hud:client:ejectionChanged', function(settings) Config.Belt.ejection = settings end)
RegisterNUICallback('saveIntegrations', function(data, cb)
    if not editing then cb({ ok = false, error = 'Ouvrir le menu HUD' }) return end
    integrationRequest('save', data.integrations, cb)
end)
local function minimapLayout(p)
    minimapGeneration = minimapGeneration + 1
    local generation = minimapGeneration
    local round = not stopping and type(p) == 'table' and p.minimapShape == 'round'
    local dictionary = round and 'cdt_hud_circle' or 'cdt_hud_square'
    if not stopping then
        RequestStreamedTextureDict(dictionary, false)
        local deadline = GetGameTimer() + 5000
        while not HasStreamedTextureDictLoaded(dictionary) do
            Wait(0)
            if stopping or generation ~= minimapGeneration then return end
            if GetGameTimer() >= deadline then
                print(('[cdt_hud] Impossible de charger le masque de minimap %s'):format(dictionary))
                return
            end
        end
    end
    if generation ~= minimapGeneration then return end
    local x = type(p) == 'table' and tonumber(p.minimapX) or 0
    local y = type(p) == 'table' and (tonumber(p.minimapY) or -0.14) or 0
    local scale = type(p) == 'table' and tonumber(p.minimapScale) or 1
    x, y, scale = math.max(-0.5, math.min(0.5, x or 0)), math.max(-0.5, math.min(0.5, y or 0)), math.max(0.5, math.min(1.5, scale or 1))
    if not stopping and not editing then y = math.min(0.5, y + minimapAutoOffset) end
    SetMinimapClipType(round and 1 or 0)
    -- Measure the same native alignment used by GTA (including its safe zone).
    local function bounds(px, py, width, height)
        SetScriptGfxAlign(string.byte('L'), string.byte('B'))
        local left, top = GetScriptGfxPosition(px, py - height)
        local right, bottom = GetScriptGfxPosition(px + width, py)
        ResetScriptGfxAlign()
        return left, top, right - left, bottom - top
    end
    local screenWidth, screenHeight = GetActiveScreenResolution()
    if not screenWidth or not screenHeight or screenWidth<=0 or screenHeight<=0 then return end
    lastScreenWidth, lastScreenHeight, lastSafeZone = screenWidth, screenHeight, GetSafeZoneSize()
    local mapX, mapY, mapWidth, mapHeight = -0.0045 + x, 0.002 + y, 0.150 * scale, 0.188888 * scale
    if stopping then
        RemoveReplaceTexture('platform:/textures/graphics', 'radarmasksm')
        RemoveReplaceTexture('platform:/textures/graphics', 'radarmask1g')
        SetMinimapComponentPosition('minimap', 'L', 'B', mapX, mapY, mapWidth, mapHeight)
        SetMinimapComponentPosition('minimap_mask', 'L', 'B', 0.020, 0.032, 0.111, 0.159)
        SetMinimapComponentPosition('minimap_blur', 'L', 'B', -0.030, 0.022, 0.266, 0.237)
    elseif round then
        local _, _, baseWidth, baseHeight = bounds(0, 0, 0.180, 0.258)
        local correction = math.max(0.5, math.min(1.5, tonumber(Config.MinimapCircleWidthCorrection) or 1.0))
        local horizontal = (baseHeight * screenHeight) / (baseWidth * screenWidth) * correction
        mapX, mapY, mapWidth, mapHeight = -0.010 * horizontal + x, -0.030 + y, 0.180 * horizontal * scale, 0.258 * scale
        AddReplaceTexture('platform:/textures/graphics', 'radarmasksm', 'cdt_hud_circle', 'radarmasksm')
        AddReplaceTexture('platform:/textures/graphics', 'radarmask1g', 'cdt_hud_circle', 'radarmasksm')
        SetMinimapComponentPosition('minimap', 'L', 'B', mapX, mapY, mapWidth, mapHeight)
        SetMinimapComponentPosition('minimap_mask', 'L', 'B', mapX + 0.210 * horizontal * scale, mapY + 0.030 * scale, 0.065 * horizontal * scale, 0.200 * scale)
        SetMinimapComponentPosition('minimap_blur', 'L', 'B', mapX + 0.010 * horizontal * scale, mapY + 0.045 * scale, 0.252 * horizontal * scale, 0.338 * scale)
    else
        -- Square-map assets need their matching mask and blur geometry; the
        -- vanilla mask is inset and cannot describe the frame of a moved map.
        local _, _, baseWidth, baseHeight = bounds(0, 0, 0.1638, 0.183)
        local referenceRatio = 0.1638 * (16 / 9) / 0.183
        local horizontal = referenceRatio * baseHeight * screenHeight / (baseWidth * screenWidth)
        mapX, mapY, mapWidth, mapHeight = x, -0.047 + y, 0.1638 * horizontal * scale, 0.183 * scale
        AddReplaceTexture('platform:/textures/graphics', 'radarmasksm', dictionary, 'radarmasksm')
        AddReplaceTexture('platform:/textures/graphics', 'radarmask1g', dictionary, 'radarmasksm')
        SetMinimapComponentPosition('minimap', 'L', 'B', mapX, mapY, mapWidth, mapHeight)
        SetMinimapComponentPosition('minimap_mask', 'L', 'B', mapX, mapY + 0.047 * scale, 0.128 * horizontal * scale, 0.200 * scale)
        SetMinimapComponentPosition('minimap_blur', 'L', 'B', mapX - 0.010 * horizontal * scale, mapY + 0.072 * scale, 0.262 * horizontal * scale, 0.300 * scale)
    end
    -- Keep the game's distinct map, clipping and background components.
    -- Their dimensions are not interchangeable; zeroing blur removes map content.
    SetBlipAlpha(GetNorthRadarBlip(), stopping and 255 or 0)
    if not stopping then
        local left, top, width, height = bounds(mapX, mapY, mapWidth, mapHeight)
        -- A full-screen sample reaches y=-1, outside GTA's valid alignment range.
        -- Measure a small local displacement and extrapolate the native scale.
        local sample=0.01
        local _, _, sampleX, sampleY = bounds(0, 0, sample, sample)
        local unitX, unitY = sampleX/sample, sampleY/sample
        if unitX~=unitX or unitX<=0 or unitX==math.huge then unitX=1 end
        if unitY~=unitY or unitY<=0 or unitY==math.huge then unitY=1 end
        nuiMessage({ action = 'minimapGeometry', geometry = {
            left = left, top = top, width = width, height = height, unitX = unitX, unitY = unitY,
            centerX = left + width / 2, centerY = top + height / 2,
            x = x, y = y, scale = scale, shape = round and 'round' or 'square'
        } })
    end
    if stopping then SetBigmapActive(true, false) SetBigmapActive(false, false) return end
    -- Re-render the map itself after moving its mask, without changing dimensions.
    SetBigmapActive(true, false)
    CreateThread(function()
        Wait(0)
        if not stopping and generation == minimapGeneration then SetBigmapActive(false, false) end
    end)
end
local function send(action, fields)
    fields = fields or {} fields.action = action nuiMessage(fields)
end
HudVisibility.onChange = function(state)
    send('externalVisibility', state)
    if state.hud or state.minimap then DisplayRadar(false) end
end
local function update(values)
    local clean,invalid=HudUtil.nuiSafe(values)
    if invalid and not nuiWarnings[invalid] then
        nuiWarnings[invalid]=true
        print('[cdt_hud] Donnée HUD invalide ignorée : '..invalid)
    end
    values=clean
    local delta = {}
    for key, value in pairs(values) do
        if previous[key] ~= value then delta[key], previous[key] = value, value end
    end
    if next(delta) and ready then send('update', { data = delta }) end
end
AddEventHandler('cdt_hud:client:indicatorsChanged',function(values) update(values) end)
local function releaseCruise()
    if cruise and vehicle ~= 0 and DoesEntityExist(vehicle) then
        SetEntityMaxSpeed(vehicle, cruiseLimit or GetVehicleEstimatedMaxSpeed(vehicle))
    end
    cruise, cruiseLimit = false, nil
    update({ cruise = false })
end
local function checkPermissions(verbose)
    integrationRequest('permissions',nil,function(result)
        if not result.ok then if verbose then print('[cdt_hud] Diagnostic permissions : '..tostring(result.error)) end return end
        defaultOwner=result.canEdit==true
        send('permissions',{canEdit=defaultOwner,canAdmin=result.canAdmin==true})
        if verbose then
            print(('[cdt_hud] Permission %s / joueur %s : %s'):format(Config.AdminAce,GetPlayerServerId(PlayerId()),defaultOwner and 'ALLOW' or 'DENY'))
            local d=result.diagnostic
            if d then
                print(('[cdt_hud] group.admin=%s | group.owner=%s | %s=%s'):format(d.admin,d.owner,d.fivem,d.identifier))
                print('[cdt_hud] Ressource exécutée : '..tostring(d.resourcePath))
            end
        end
    end,'cdt_hud:server:defaults')
end
RegisterCommand('hudpermissions',function() checkPermissions(true) end,false)
local function setEdit(open)
    if open and cinema then cinema=false send('cinema',{enabled=false}) end
    editing = open
    minimapPreview = nil
    minimapLayout(profile)
    SetNuiFocus(open, open)
    send('edit', { open = open })
    if open then
        checkPermissions(Config.Debug==true)
    end
end
RegisterCommand(Config.Command, function() if ready then setEdit(not editing) end end, false)
RegisterKeyMapping(Config.Command, 'Configurer le HUD CDT', 'keyboard', Config.Key)
RegisterNUICallback('ready', function(_, cb)
    previous = {}
    local stored = GetResourceKvpString(Config.ProfileKey)
    if stored then
        local ok, decoded = pcall(json.decode, stored)
        if ok and type(decoded) == 'table' and decoded.version == 1 then profile = decoded end
    end
    integrationRequest('public',profile,function(result)
    if not result.ok or type(result.profile)~='table' or result.profile.version~=1 then cb({ok=false,error=result.error or 'Configuration serveur indisponible'}) return end
    defaultOwner=result.canEdit==true
    send('serverDefault',{profile=result.profile,canEdit=defaultOwner})
    profile=result.personal
    if type(profile)~='table' then cb({ok=false,error='Profil SQL indisponible'}) return end
    DeleteResourceKvp(Config.ProfileKey)
    ready=true
    -- Move only a recognised former factory minimap; custom offsets are preserved.
    if (tonumber(profile.revision) or 0) < 4 and profile.minimapY == 0 and type(profile.elements) == 'table' then
        local legacy = false
        for index, key in ipairs({'health','armor','hunger','thirst','stamina','oxygen','stress'}) do
            local e = profile.elements[key]
            if type(e) == 'table' then
                local first = e.width == 64 and e.height == 64 and math.abs((e.x or -1) - (0.025 + (index-1)*0.044)) < 0.00001 and e.y == 0.925
                local second = e.width == 72 and e.height == 72 and math.abs((e.x or -1) - (0.225 + (index-1)*0.045)) < 0.00001 and e.y == 0.965
                legacy = legacy or first or second
            end
        end
        local speed = profile.elements.speed
        legacy = legacy or (type(speed) == 'table' and ((speed.x == 0.82 and speed.y == 0.81 and speed.width == 180 and speed.height == 96) or (speed.x == 0.79 and speed.y == 0.79 and speed.width == 160 and speed.height == 42)))
        if legacy then profile.minimapY = -0.14 end
    end
    send('profile', { profile = profile }) minimapLayout(profile)
    send('debug', { enabled = Config.Debug == true })
    send('externalVisibility', HudVisibility.snapshot())
    send('visibility', { visible = visible })
    cb({ ok = true })
    end,'cdt_hud:server:defaults')
end)
RegisterNUICallback('close', function(_, cb) setEdit(false) cb({ ok = true }) end)
RegisterNUICallback('refreshMinimap', function(_, cb)
    if not ready then cb({ ok = false }) return end
    minimapLayout(editing and (minimapPreview or profile) or profile)
    cb({ ok = true })
end)
RegisterNUICallback('minimapSpace', function(data, cb)
    local offset = tonumber(data.offset)
    if not ready or not offset or offset ~= offset then cb({ ok = false }) return end
    offset = math.max(0, math.min(0.05, offset))
    if offset ~= minimapAutoOffset then
        minimapAutoOffset = offset
        if not editing then minimapLayout(profile) end
    end
    cb({ ok = true })
end)
RegisterNUICallback('previewMinimap', function(data, cb)
    if not editing or type(data.profile) ~= 'table' then cb({ ok = false }) return end
    minimapPreview = data.profile
    minimapLayout(data.profile)
    cb({ ok = true })
end)
RegisterNUICallback('save', function(data, cb)
    if not editing or type(data.profile) ~= 'table' or data.profile.version ~= 1 then cb({ ok = false }) return end
    integrationRequest('personal',data.profile,function(result)
        if result.ok then profile=result.profile minimapLayout(profile) end
        cb(result)
    end,'cdt_hud:server:defaults')
end)
local function setCinema(enabled)
    cinema = enabled == true
    if cinema then setEdit(false) visible = false DisplayRadar(false) end
    send('cinema', { enabled=cinema, barHeight=Config.Cinema.barHeight })
    if cinema then send('visibility', {visible=false}) end
end
RegisterNUICallback('cinema', function(data, cb) setCinema(data.enabled) cb({ ok = true }) end)
exports('SetCinemaMode', function(enabled)
    if type(enabled) ~= 'boolean' then return false end
    setCinema(enabled)
    return true
end)
RegisterCommand('hudcinema', function() setCinema(not cinema) end, false)
RegisterKeyMapping('hudcinema', 'Mode cinéma HUD CDT', 'keyboard', Config.Cinema.key)
exports('Notify', function(message, kind, duration)
    if not Config.Notifications.enabled or type(message) ~= 'string' then return end
    send('notify', { message = message:sub(1, 500), kind = kind or 'info', duration = math.max(1000, math.min(15000, tonumber(duration) or 5000)), maximum = Config.Notifications.maximum })
end)
AddEventHandler('onClientResourceStop', function(resource)
    if resource == GetCurrentResourceName() then
        stopping = true
        nativeBars(0)
        SetNuiFocus(false, false) releaseCruise() minimapLayout(nil) DisplayRadar(priorRadar)
    else HudFramework.detect() HudBridge.resolve() end
end)

RegisterCommand('huddiagnostic', function()
    print(('[cdt_hud] framework=%s loaded=%s ready=%s'):format(HudFramework.kind, tostring(HudFramework.loaded), tostring(ready)))
    for domain, name in pairs(HudBridge.selected) do
        local settings = Config.Integrations[domain]
        print(('[cdt_hud] %s=%s resource=%s version=%s'):format(domain, name, settings.resource or name,
            GetResourceMetadata(settings.resource or name, 'version', 0) or 'non exposée'))
    end
end, false)
local function roadVehicle()
    if vehicle == 0 then return false end
    local class = GetVehicleClass(vehicle)
    return class ~= 8 and class ~= 13 and class ~= 14 and class ~= 15 and class ~= 16 and class ~= 21
end
RegisterCommand('hudbelt', function() if Config.Belt.enabled and roadVehicle() then belt = not belt update({belt=belt}) end end, false)
RegisterKeyMapping('hudbelt', 'Ceinture HUD CDT', 'keyboard', Config.Belt.key)
RegisterCommand('hudcruise', function()
    if cruise then releaseCruise() return end
    if not editing and Config.Cruise.enabled and roadVehicle() and GetPedInVehicleSeat(vehicle, -1) == PlayerPedId() and GetIsVehicleEngineRunning(vehicle) and GetEntitySpeed(vehicle) * 3.6 >= Config.Cruise.minimumKmh then
        cruiseLimit = GetVehicleEstimatedMaxSpeed(vehicle)
        SetEntityMaxSpeed(vehicle, GetEntitySpeed(vehicle)) cruise = true
        update({ cruise = true })
    end
end, false)
RegisterKeyMapping('hudcruise', 'Régulateur HUD CDT', 'keyboard', Config.Cruise.key)
CreateThread(function()
    HudFramework.detect() HudBridge.resolve()
    integrationRequest('public', nil, function(result) if result.ok then Config.Belt.ejection=result.ejection end end, 'cdt_hud:server:ejection')
    integrationRequest('public', nil, function(result) if result.ok then applyIntegrations(result.integrations) end end)
    local lastRadar
    while true do
        local width, height = GetActiveScreenResolution()
        local safeZone = GetSafeZoneSize()
        if ready and (width ~= lastScreenWidth or height ~= lastScreenHeight or safeZone ~= lastSafeZone) then
            lastScreenWidth, lastScreenHeight, lastSafeZone = width, height, safeZone
            minimapLayout(editing and (minimapPreview or profile) or profile)
        end
        local ped = PlayerPedId()
        local current = GetVehiclePedIsIn(ped, false)
        if current ~= vehicle then releaseCruise() vehicle = current belt = false end
        local shouldShow = ready and HudFramework.loaded and not IsPauseMenuActive() and not cinema and not HudVisibility.isHidden('hud')
        if shouldShow ~= visible then visible = shouldShow send('visibility', { visible = visible }) end
        local mode = profile and (profile.minimapMode or profile.minimap) or Config.Minimap
        local mapProfile = editing and (minimapPreview or profile) or profile
        local radar = not cinema and not HudVisibility.isHidden('hud') and not HudVisibility.isHidden('minimap') and (editing and not (mapProfile and mapProfile.minimap == false)
            or not editing and visible and not (profile and profile.minimap == false) and (mode == 'always' or mode == 'vehicle' and vehicle ~= 0)
        )
        DisplayRadar(radar)
        if lastRadar ~= radar then lastRadar = radar send('minimapVisibility', { visible = radar }) end
        if visible then
            local values = HudFramework.values()
            local needs = HudBridge.read('needs', ped)
            if type(needs) == 'table' then values.hunger, values.thirst = needs.hunger or false, needs.thirst or false
            elseif HudBridge.selected.needs ~= 'framework' then values.hunger, values.thirst = false, false end
            if HudBridge.selected.stress ~= 'framework' then values.stress = HudUtil.percent(HudBridge.read('stress', ped)) end
            values.health = HudUtil.percent(GetEntityHealth(ped) - 100, 0, math.max(1, GetEntityMaxHealth(ped) - 100))
            values.armor = GetPedArmour(ped)
            values.stamina = HudUtil.round(GetPlayerSprintStaminaRemaining(PlayerId()))
            values.underwater = IsPedSwimmingUnderWater(ped)
            values.oxygen = values.underwater and HudUtil.percent(GetPlayerUnderwaterTimeRemaining(PlayerId()), 0, Config.UnderwaterSeconds) or false
            values.vehicle, values.id, values.belt = vehicle ~= 0, GetPlayerServerId(PlayerId()), belt
            for key,value in pairs(HudIndicators.read(vehicle)) do values[key]=value end
            if HudBridge.selected.voice == 'pma' and HudUtil.running(Config.Integrations.voice.resource or 'pma-voice') then
                local proximity = LocalPlayer.state.proximity
                values.voice = type(proximity) == 'table' and proximity.distance or false
                values.voiceLevel = type(proximity) == 'table' and proximity.index or false
                values.radio = LocalPlayer.state.radioChannel or false
                values.talking = voiceTalking()
            elseif HudBridge.selected.voice == 'custom' or HudBridge.selected.voice == 'statebag' or HudBridge.selected.voice == 'export' then
                local voice = HudBridge.read('voice', ped)
                values.voice, values.radio, values.talking, values.voiceLevel = false, false, false, false
                if type(voice) == 'table' then values.voice, values.radio, values.talking = voice.voice or false, voice.radio or false, voice.talking == true or voice.talking == 1 values.voiceLevel = tonumber(voice.level) or false end
            else values.voice, values.radio, values.talking, values.voiceLevel = false, false, false, false end
            update(values)
        end
        Wait(visible and Config.Intervals.player or Config.Intervals.hidden)
    end
end)
CreateThread(function()
    while true do
        if cruise and (not DoesEntityExist(vehicle) or GetVehiclePedIsIn(PlayerPedId(), false) ~= vehicle
            or IsControlPressed(0, 72) or GetPedInVehicleSeat(vehicle, -1) ~= PlayerPedId() or not GetIsVehicleEngineRunning(vehicle)) then releaseCruise() end
        if visible and vehicle ~= 0 then
            update({ speed = HudUtil.round(GetEntitySpeed(vehicle) * 3.6), rpm = HudUtil.round(GetVehicleCurrentRpm(vehicle) * 100),
                gear = GetVehicleCurrentGear(vehicle), fuel = HudBridge.read('fuel', vehicle), engine = HudUtil.percent(GetVehicleEngineHealth(vehicle), 0, 1000), belt = belt, cruise = cruise })
            update(HudIndicators.read(vehicle))
        end
        Wait(cruise and 0 or (visible and vehicle ~= 0 and Config.Intervals.vehicle or Config.Intervals.hidden))
    end
end)
CreateThread(function()
    while true do
        if visible then
            local coords = GetEntityCoords(PlayerPedId())
            local street = GetStreetNameAtCoord(coords.x, coords.y, coords.z)
            update({ street = GetStreetNameFromHashKey(street), zone = GetLabelText(GetNameOfZone(coords.x, coords.y, coords.z)), heading = HudUtil.round(GetEntityHeading(PlayerPedId())) })
        end
        Wait(Config.Intervals.location)
    end
end)
-- Event-driven frameworks still refresh occasionally for providers without money events.
CreateThread(function() while true do Wait(Config.Intervals.framework) HudFramework.refresh() end end)
-- Exit protection needs a frame loop; crash detection samples every 100 ms.
CreateThread(function()
    local sampledAt = -100
    while true do
        local now = GetGameTimer()
        if now - sampledAt >= 100 then
            sampledAt = now
            local ped = PlayerPedId()
            local current = GetVehiclePedIsIn(ped, false)
            HudSeatbelt.tick(ped, current, current == vehicle and belt)
        end
        if belt and vehicle ~= 0 then DisableControlAction(0, 75, true) DisableControlAction(27, 75, true) Wait(0)
        else Wait(100) end
    end
end)

-- Refresh activation independently of slower health/needs polling.
CreateThread(function()
    while not stopping do
        if visible and HudBridge.selected.voice == 'pma' and HudUtil.running(Config.Integrations.voice.resource or 'pma-voice') then
            update({talking=voiceTalking()})
            Wait(50)
        elseif visible and (HudBridge.selected.voice == 'statebag' or HudBridge.selected.voice == 'export' or HudBridge.selected.voice == 'custom') then
            local voice=HudBridge.read('voice',PlayerPedId())
            update({talking=type(voice)=='table' and (voice.talking==true or voice.talking==1) or false})
            Wait(50)
        else Wait(750) end
    end
end)
-- GTA recreates its native bars each frame while the radar is drawn.
CreateThread(function()
    minimapScaleform = RequestScaleformMovie('minimap')
    while not stopping do
        if ready and IsRadarEnabled() and HasScaleformMovieLoaded(minimapScaleform) then
            nativeBars(3)
            Wait(0)
        else Wait(250) end
    end
end)
AddEventHandler('onClientResourceStart', function(resource)
    if resource ~= GetCurrentResourceName() then HudFramework.detect() HudBridge.resolve() end
end)
CreateThread(function()
    while not stopping do
        if visible and not editing and not cinema and not (profile and profile.destination == false) and not HudVisibility.isHidden('hud') and not HudVisibility.isHidden('destination') then
            HudDestination.draw()
            Wait(0)
        else HudDestination.hide() Wait(200) end
    end
end)
