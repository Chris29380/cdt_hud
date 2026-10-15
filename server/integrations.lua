local settings = Config.Integrations
local initialized = false
local function initialize()
    if initialized then return end
    local stored=HudStorage.load('integrations')
    if not stored then
        local legacy=GetResourceKvpString('cdt_hud_integrations_v1')
        if legacy then local ok,value=pcall(json.decode,legacy) if ok then stored=value end end
    end
    settings=stored and HudIntegrations.validate(stored) or settings
    settings=settings or Config.Integrations
    local ok,err=HudStorage.save('integrations',settings)
    if not ok then error(err) end
    initialized=true
    DeleteResourceKvp('cdt_hud_integrations_v1')
end
local requests = {}
RegisterNetEvent('cdt_hud:server:integrations', function(id, action, input)
    local player = source
    if type(id) ~= 'number' or id % 1 ~= 0 or id < 1 or id > 1000000 then return end
    local now = GetGameTimer()
    if requests[player] and now - requests[player] < 250 then
        TriggerClientEvent('cdt_hud:client:integrationsReply', player, id, { ok = false, error = 'Réessayez dans un instant' }) return
    end
    requests[player] = now
    local function reply(result) TriggerClientEvent('cdt_hud:client:integrationsReply', player, id, result) end
    if not pcall(initialize) then reply({ok=false,error='Base de données HUD indisponible'}) return end
    if action == 'public' then reply({ ok = true, integrations = settings }) return end
    if not HudPermissions.admin(player) then reply({ ok = false, error = 'Permission administrateur nécessaire' }) return end
    if action == 'get' then reply({ ok = true, integrations = settings, catalog = HudIntegrations.catalog }) return end
    if action ~= 'save' then reply({ ok = false, error = 'Action invalide' }) return end
    local clean, errorMessage = HudIntegrations.validate(input)
    if not clean then reply({ ok = false, error = errorMessage }) return end
    local success,saved,message=pcall(HudStorage.save,'integrations',clean)
    if not success or not saved then reply({ok=false,error=message or 'Enregistrement SQL impossible'}) return end
    settings = clean
    TriggerClientEvent('cdt_hud:client:integrationsChanged', -1, settings)
    reply({ ok = true })
end)
AddEventHandler('playerDropped', function() requests[source] = nil end)
RegisterCommand('hudbridgereset', function(player)
    if player ~= 0 and not HudPermissions.admin(player) then return end
    local success,saved=pcall(HudStorage.save,'integrations',Config.Integrations)
    if not success or not saved then print('[cdt_hud] Réinitialisation SQL impossible.') return end
    settings = Config.Integrations
    initialized=true
    TriggerClientEvent('cdt_hud:client:integrationsChanged', -1, settings)
    print('[cdt_hud] Bridges réinitialisés depuis config/integrations.lua.')
end, false)
