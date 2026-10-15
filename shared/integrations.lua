HudIntegrations = {}
HudIntegrations.catalog = {
    fuel = { 'auto', 'native', 'ox_fuel', 'LegacyFuel', 'qb-fuel', 'ps-fuel', 'lj-fuel', 'okokGasStation', 'qs-fuelstations', 'lc_fuel', 'cdn-fuel', 'custom', 'export', 'statebag', 'disabled' },
    needs = { 'auto', 'framework', 'esx_status', 'custom', 'disabled' },
    stress = { 'framework', 'custom', 'disabled' },
    voice = { 'auto', 'pma', 'statebag', 'export', 'custom', 'disabled' },
}
function HudIntegrations.validate(input)
    if type(input) ~= 'table' then return nil, 'Configuration invalide' end
    local out = {}
    for domain, catalog in pairs(HudIntegrations.catalog) do
        local settings = input[domain]
        if type(settings) ~= 'table' then return nil, 'Domaine manquant : ' .. domain end
        local valid = false
        for _, provider in ipairs(catalog) do if provider == settings.provider then valid = true break end end
        if not valid then return nil, 'Fournisseur invalide : ' .. domain end
        local cleaned = { provider = settings.provider }
        for _, key in ipairs({ 'resource', 'export', 'key', 'voiceKey', 'radioKey', 'talkingKey', 'levelKey', 'voiceExport', 'radioExport', 'talkingExport', 'levelExport' }) do
            local value = settings[key]
            if value ~= nil and value ~= '' then
                if type(value) ~= 'string' or #value > 80 or not value:match('^[%w_%.%-]+$') then return nil, 'Nom invalide : ' .. key end
                cleaned[key] = value
            end
        end
        for _, key in ipairs({ 'minimum', 'maximum' }) do
            local value = settings[key]
            if value ~= nil then
                if type(value) ~= 'number' or value ~= value or math.abs(value) > 100000000 then return nil, 'Échelle invalide' end
                cleaned[key] = value
            end
        end
        if (cleaned.maximum or 100) <= (cleaned.minimum or 0) then return nil, 'Échelle inversée' end
        if settings.provider == 'export' and (not cleaned.resource or not (domain == 'voice' and cleaned.voiceExport or domain ~= 'voice' and cleaned.export)) then return nil, 'Ressource et export nécessaires' end
        out[domain] = cleaned
    end
    return out
end
