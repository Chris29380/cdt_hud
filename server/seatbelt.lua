local settings
local function load()
    if not settings then settings = HudStorage.load('ejection') or Config.Belt.ejection end
    return settings
end
local ranges = { minimumKmh={10,300}, speedDropKmh={5,200}, dropRatio={0.05,1}, ragdollMs={500,10000}, cooldownMs={1000,30000} }
RegisterNetEvent('cdt_hud:server:ejection', function(id, action, input)
    local player = source
    if type(id) ~= 'number' or id % 1 ~= 0 or id < 1 or id > 1000000 then return end
    local function reply(value) TriggerClientEvent('cdt_hud:client:integrationsReply', player, id, value) end
    if action ~= 'public' and not HudPermissions.admin(player) then reply({ok=false,error='Permission administrateur nécessaire'}) return end
    local ok, current = pcall(load)
    if not ok then reply({ok=false,error='Base de données HUD indisponible'}) return end
    if action == 'public' or action == 'get' then reply({ok=true,ejection=current}) return end
    if action ~= 'save' or type(input) ~= 'table' or type(input.enabled) ~= 'boolean' then reply({ok=false,error='Réglages invalides'}) return end
    local clean = { enabled=input.enabled }
    for key, range in pairs(ranges) do
        local value=input[key]
        if type(value)~='number' or value~=value or value<range[1] or value>range[2] then reply({ok=false,error='Réglages invalides : '..key}) return end
        clean[key]=value
    end
    local success, saved = pcall(HudStorage.save, 'ejection', clean)
    if not success or not saved then reply({ok=false,error='Enregistrement SQL impossible'}) return end
    settings=clean
    TriggerClientEvent('cdt_hud:client:ejectionChanged', -1, settings)
    reply({ok=true})
end)
