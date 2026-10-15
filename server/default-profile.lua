local factory = HudStorage.copy(HudInstallationProfile)
local configuredLanguage = type(GetConvar)=='function' and GetConvar('cdt_language', 'en'):lower() or 'en'
local availableLanguages = { en = true, fr = true }
if type(LoadResourceFile)=='function' and type(GetCurrentResourceName)=='function' then
    local index = LoadResourceFile(GetCurrentResourceName(), 'web/locales/index.js') or ''
    availableLanguages = { en = true }
    for code in index:gmatch('locales/([%w%-]+)%.js') do
        if LoadResourceFile(GetCurrentResourceName(), 'web/locales/'..code..'.js') then availableLanguages[code] = true end
    end
end
if not availableLanguages[configuredLanguage] then configuredLanguage = 'en' end
factory.language = configuredLanguage
factory.destination = true
if Config.SpeedUnit == 'kmh' or Config.SpeedUnit == 'mph' then factory.unit = Config.SpeedUnit end
if Config.Minimap == 'disabled' then factory.minimap = false
elseif Config.Minimap == 'always' or Config.Minimap == 'vehicle' then
    factory.minimap = true
    factory.minimapMode = Config.Minimap
end
local schema = HudProfileSchema
local copy = HudStorage.copy
local function finite(value, low, high)
    return type(value) == 'number' and value == value and value >= low and value <= high
end
local function contains(values, value)
    for _, allowed in ipairs(values) do if allowed == value then return true end end
    return false
end
local function color(value) return type(value) == 'string' and #value == 7 and value:match('^#%x%x%x%x%x%x$') end
local function text(value, limit)
    if type(value)~='string' or value:find('[%z\1-\31]') then return false end
    local ok, length=pcall(function()
        local units=0
        for _, code in utf8.codes(value) do units=units+(code>65535 and 2 or 1) end
        return units
    end)
    return ok and length<=limit
end
HudServerDefaults = {}
function HudServerDefaults.validate(input)
    if type(input) ~= 'table' or input.version ~= 1 or type(input.elements) ~= 'table' then return nil, 'Format du profil invalide' end
    local out = copy(factory)
    if input.language~=nil then
        if type(input.language)~='string' or #input.language>16 or not (input.language:match('^%l%l%l?$') or input.language:match('^%l%l%l?%-%w%w[%w]*$')) then return nil,'Langue invalide' end
        out.language=input.language
    end
    for key, values in pairs(schema.globalEnums) do
        if input[key] ~= nil then if not contains(values, input[key]) then return nil, 'Option invalide : '..key end out[key] = input[key] end
    end
    for _, range in ipairs(schema.globalRanges) do
        local key = range[1]
        if input[key] ~= nil then if not finite(input[key], range[2], range[3]) then return nil, 'Valeur invalide : '..key end out[key] = input[key] end
    end
    for _, key in ipairs(schema.globalBooleans) do
        if input[key] ~= nil then if type(input[key]) ~= 'boolean' then return nil, 'Option invalide : '..key end out[key] = input[key] end
    end
    local styles = {'wanted','zurg','neon','sky','ursu','panel','grand','cycle','metro'}
    for _, key in ipairs({'carStyle','playerStyle'}) do
        if input[key] ~= nil then if not contains(styles,input[key]) then return nil, 'Style invalide' end out[key]=input[key] end
    end
    if input.name ~= nil then if not text(input.name,60) then return nil,'Nom invalide' end out.name=input.name end
    if input.minimapFrameColor ~= nil then if not color(input.minimapFrameColor) then return nil,'Couleur de cadre invalide' end out.minimapFrameColor=input.minimapFrameColor end
    local versions={revision=6,informationLayout=2,voiceGaugeVersion=1,communicationGaugeVersion=2}
    for key, maximum in pairs(versions) do
        if input[key] ~= nil and (not finite(input[key],1,maximum) or input[key]%1~=0) then return nil,'Version invalide : '..key end
        out[key]=maximum
    end
    for key, target in pairs(out.elements) do
        local element=input.elements[key]
        if element ~= nil then
            if type(element) ~= 'table' then return nil,'Élément invalide : '..key end
            for field,range in pairs(schema.elementRanges) do
                if element[field] ~= nil then if not finite(element[field],range[1],range[2]) then return nil,'Valeur invalide : '..key..'.'..field end target[field]=element[field] end
            end
            for field,values in pairs(schema.elementEnums) do
                if element[field] ~= nil then if not contains(values,element[field]) then return nil,'Option invalide : '..field end target[field]=element[field] end
            end
            for _,field in ipairs(schema.elementBooleans) do
                if element[field] ~= nil then if type(element[field]) ~= 'boolean' then return nil,'Option invalide : '..field end target[field]=element[field] end
            end
            for _,field in ipairs(schema.elementColors) do
                if element[field] ~= nil then if not color(element[field]) then return nil,'Couleur invalide' end target[field]=element[field] end
            end
            for field,limit in pairs({label=40,icon=8,group=24}) do
                if element[field] ~= nil then if not text(element[field],limit) then return nil,'Texte invalide' end target[field]=element[field] end
            end
            target.z=math.floor(target.z+.5) target.segments=math.floor(target.segments+.5)
            if contains({'street','zone','heading','cash','bank','job','id'},key) then target.showLabel=false target.group='' end
        end
    end
    return out
end
local active
local function defaults()
    if active then return active end
    local stored=HudStorage.load('server-default')
    -- Read legacy JSON only once to migrate old installations into typed SQL rows.
    if not stored then
        local legacy=GetResourceKvpString('cdt_hud_server_default_v1')
        if legacy then local ok,value=pcall(json.decode,legacy) if ok then stored=value end end
    end
    local value=stored and HudServerDefaults.validate(stored) or copy(factory)
    value=value or copy(factory)
    value.language = configuredLanguage
    -- Update the server default once; later owner edits remain authoritative.
    local preset=HudStorage.load('server-default-layout')
    local updatePreset=not preset or preset.revision~=HudInstallationRevision
    if updatePreset then
        value=copy(factory)
    end
    -- Apply changed file defaults once; later menu publications stay authoritative.
    local configured=HudStorage.load('server-config-defaults') or {}
    local unit=Config.SpeedUnit == 'mph' and 'mph' or 'kmh'
    local minimap=Config.Minimap == 'disabled' and 'disabled' or Config.Minimap == 'vehicle' and 'vehicle' or 'always'
    if configured.unit~=unit then value.unit=unit end
    if configured.minimap~=minimap then
        value.minimap=minimap~='disabled'
        value.minimapMode=minimap=='vehicle' and 'vehicle' or 'always'
    end
    local ok,err=HudStorage.save('server-default',value)
    if not ok then error(err) end
    if configured.unit~=unit or configured.minimap~=minimap then
        local saved,message=HudStorage.save('server-config-defaults',{version=2,unit=unit,minimap=minimap})
        if not saved then error(message) end
    end
    if updatePreset then
        local saved,message=HudStorage.save('server-default-layout',{version=2,revision=HudInstallationRevision})
        if not saved then error(message) end
    end
    active=value
    DeleteResourceKvp('cdt_hud_server_default_v1')
    return active
end
local requests = {}
RegisterNetEvent('cdt_hud:server:defaults', function(id, action, input)
    local player=source
    if not finite(id,1,1000000) or id%1~=0 then return end
    local function reply(result) TriggerClientEvent('cdt_hud:client:integrationsReply',player,id,result) end
    local owner=HudPermissions.admin(player)
    if action=='permissions' then
        local diagnostic
        if Config.Debug then
            local identifier=GetPlayerIdentifierByType(player,'fivem')
            local function principalAllowed(principal)
                if not principal or type(IsPrincipalAceAllowed)~='function' then return 'indisponible' end
                return IsPrincipalAceAllowed(principal,Config.AdminAce) and 'ALLOW' or 'DENY'
            end
            diagnostic={permission=Config.AdminAce,playerId=player,
                fivem=identifier or 'absent',admin=principalAllowed('group.admin'),
                owner=principalAllowed('group.owner'),identifier=principalAllowed(identifier and 'identifier.'..identifier),
                resourcePath=type(GetResourcePath)=='function' and GetResourcePath(GetCurrentResourceName()) or 'indisponible'}
        end
        reply({ok=true,canEdit=owner,canAdmin=owner,diagnostic=diagnostic}) return
    end
    local now=GetGameTimer()
    if requests[player] and now-requests[player]<250 then reply({ok=false,error='Réessayez dans un instant'}) return end
    requests[player]=now
    local ok, current=pcall(defaults)
    if not ok then reply({ok=false,error='Base de données HUD indisponible'}) return end
    if action=='public' or action=='personal' then
        local success,result=pcall(function()
            local key=HudStorage.playerKey(player)
            if action=='personal' then
                local clean,err=HudServerDefaults.validate(input)
                if not clean then return {ok=false,error=err} end
                local saved,message=HudStorage.save(key,clean)
                return {ok=saved,error=message,profile=saved and clean or nil}
            end
            local personal=HudStorage.load(key)
            if not personal then
                personal=input and HudServerDefaults.validate(input) or copy(current)
                personal=personal or copy(current)
                local saved,message=HudStorage.save(key,personal)
                if not saved then return {ok=false,error=message} end
            end
            return {ok=true,profile=current,personal=personal,canEdit=owner}
        end)
        reply(success and result or {ok=false,error='Chargement ou enregistrement SQL impossible'}) return
    end
    if not owner then reply({ok=false,error='Permission administrateur nécessaire'}) return end
    if action=='get' then reply({ok=true,profile=current,canEdit=true}) return end
    if action~='save' then reply({ok=false,error='Action invalide'}) return end
    local clean, errorMessage=HudServerDefaults.validate(input)
    if not clean then reply({ok=false,error=errorMessage}) return end
    local success,saved,message=pcall(HudStorage.save,'server-default',clean)
    if not success or not saved then reply({ok=false,error=message or 'Enregistrement SQL impossible'}) return end
    active=clean
    TriggerClientEvent('cdt_hud:client:defaultChanged',-1,active)
    reply({ok=true,profile=active,canEdit=true})
end)
AddEventHandler('playerDropped',function() requests[source]=nil end)
