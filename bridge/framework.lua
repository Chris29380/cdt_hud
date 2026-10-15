HudFramework = { kind = 'standalone', loaded = true, data = {}, core = nil }
function HudFramework.detect()
    local kind = Config.Framework
    if kind == 'auto' then
        kind = 'standalone'
        for _, candidate in ipairs({ 'qbox', 'qbcore', 'esx' }) do
            if HudUtil.running(Config.FrameworkResources[candidate]) then kind = candidate break end
        end
    end
    HudFramework.kind, HudFramework.core = kind, nil
    local ok, core = pcall(function()
        if kind == 'esx' then return exports[Config.FrameworkResources.esx]:getSharedObject() end
        if kind == 'qbcore' then return exports[Config.FrameworkResources.qbcore]:GetCoreObject() end
    end)
    if ok then HudFramework.core = core end
    HudFramework.refresh()
end
function HudFramework.refresh()
    local kind, core = HudFramework.kind, HudFramework.core
    local ok, data = pcall(function()
        if kind == 'qbox' then return exports[Config.FrameworkResources.qbox]:GetPlayerData() end
        if kind == 'esx' and core then return core.GetPlayerData() end
        if kind == 'qbcore' and core then return core.Functions.GetPlayerData() end
        return {}
    end)
    HudFramework.data = ok and type(data) == 'table' and data or {}
    local d = HudFramework.data
    HudFramework.loaded = kind == 'standalone' or (kind == 'esx' and d.identifier ~= nil) or d.citizenid ~= nil
end
function HudFramework.values()
    local d = HudFramework.data
    local meta, money, job = d.metadata or {}, d.money or {}, d.job or {}
    local cash, bank = money.cash, money.bank
    if HudFramework.kind == 'esx' then
        cash = d.money
        for _, account in pairs(d.accounts or {}) do
            if account.name == 'money' then cash = account.money elseif account.name == 'bank' then bank = account.money end
        end
    end
    return { hunger = HudUtil.percent(meta.hunger), thirst = HudUtil.percent(meta.thirst), stress = HudUtil.percent(meta.stress),
        cash = type(cash) == 'number' and cash or false, bank = type(bank) == 'number' and bank or false,
        job = (job.label or '') .. (job.grade and (' · ' .. tostring(type(job.grade) == 'table' and job.grade.name or job.grade_label or job.grade)) or '') }
end
for _, event in ipairs({ 'esx:playerLoaded', 'esx:setJob', 'esx:setAccountMoney', 'QBCore:Client:OnPlayerLoaded' }) do
    RegisterNetEvent(event, function() HudFramework.refresh() end)
end
RegisterNetEvent('QBCore:Player:SetPlayerData', function(data)
    if type(data) == 'table' then HudFramework.data = data HudFramework.loaded = data.citizenid ~= nil end
end)
for _, event in ipairs({ 'esx:onPlayerLogout', 'QBCore:Client:OnPlayerUnload' }) do
    RegisterNetEvent(event, function() HudFramework.loaded = false HudFramework.data = {} end)
end
RegisterNetEvent('hud:client:UpdateNeeds', function(hunger, thirst)
    HudFramework.data.metadata = HudFramework.data.metadata or {}
    HudFramework.data.metadata.hunger, HudFramework.data.metadata.thirst = hunger, thirst
end)
RegisterNetEvent('hud:client:UpdateStress', function(stress)
    HudFramework.data.metadata = HudFramework.data.metadata or {}
    HudFramework.data.metadata.stress = stress
end)
local statuses = { hunger = false, thirst = false }
AddEventHandler('esx_status:onTick', function(data)
    for _, status in pairs(data or {}) do
        if status.name == 'hunger' or status.name == 'thirst' then
            statuses[status.name] = HudUtil.percent(status.percent or status.val, 0, status.percent and 100 or 1000000)
        end
    end
end)
HudBridge.register('needs', 'esx_status', { resource = 'esx_status', read = function() return statuses end })
