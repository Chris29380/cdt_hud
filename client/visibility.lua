HudVisibility = {}
local requests = {}
local keys = {}
for key in ('health armor hunger thirst stamina oxygen stress speed rpm gear fuel engine belt cruise voice radio street zone heading cash bank job id indicatorLeft indicatorRight hazards destination'):gmatch('%S+') do keys[key] = true end

function HudVisibility.isHidden(target)
    for _, reasons in pairs(requests) do
        for _, targets in pairs(reasons) do
            if targets[target] then return true end
        end
    end
    return false
end

function HudVisibility.snapshot()
    local elements = {}
    for key in pairs(keys) do elements[key] = HudVisibility.isHidden(key) end
    return { hud = HudVisibility.isHidden('hud'), minimap = HudVisibility.isHidden('minimap'), elements = elements }
end

local function changed()
    if HudVisibility.onChange then HudVisibility.onChange(HudVisibility.snapshot()) end
end

local function setTargets(targets, show, reason)
    if type(show) ~= 'boolean' or (reason ~= nil and type(reason) ~= 'string') then return false end
    local owner = GetInvokingResource() or 'external'
    reason = reason or 'default'
    requests[owner] = requests[owner] or {}
    local reasons = requests[owner]
    reasons[reason] = reasons[reason] or {}
    for _, target in ipairs(targets) do reasons[reason][target] = not show or nil end
    if not next(reasons[reason]) then reasons[reason] = nil end
    if not next(reasons) then requests[owner] = nil end
    changed()
    return true
end

local function setHud(show, reason) return setTargets({ 'hud' }, show, reason) end
exports('SetVisible', setHud)
exports('SetHudVisible', setHud)
exports('SetMinimapVisible', function(show, reason) return setTargets({ 'minimap' }, show, reason) end)
exports('SetElementVisible', function(key, show, reason)
    if type(key) ~= 'string' or not keys[key] then return false end
    return setTargets({ key }, show, reason)
end)
exports('SetElementsVisible', function(elements, show, reason)
    if type(elements) ~= 'table' or #elements == 0 then return false end
    local targets = {}
    for index, key in pairs(elements) do
        if type(index) ~= 'number' or index % 1 ~= 0 or index < 1 or index > #elements or type(key) ~= 'string' or not keys[key] then return false end
        targets[#targets + 1] = key
    end
    return setTargets(targets, show, reason)
end)
exports('ResetVisibility', function(reason)
    if reason ~= nil and type(reason) ~= 'string' then return false end
    local owner = GetInvokingResource() or 'external'
    if reason == nil then requests[owner] = nil
    elseif requests[owner] then
        requests[owner][reason] = nil
        if not next(requests[owner]) then requests[owner] = nil end
    end
    changed()
    return true
end)
AddEventHandler('onClientResourceStop', function(resource)
    if requests[resource] then requests[resource] = nil changed() end
end)
