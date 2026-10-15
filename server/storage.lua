-- One JSON document per SQL row; no JSON files on disk.
HudStorage = { cache = {}, locks = {}, players = {} }
local initialized, available = false, false
local function copy(value)
    if type(value) ~= 'table' then return value end
    local out = {} for key, item in pairs(value) do out[key] = copy(item) end return out
end
HudStorage.copy = copy
MySQL.ready(function()
    local ok, err = pcall(function()
        MySQL.query.await([[CREATE TABLE IF NOT EXISTS cdt_hud_profiles (
            owner_key VARCHAR(100) COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
            profile_data LONGTEXT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4]])
        -- Keep the previous table available for automatic migration.
        MySQL.query.await([[CREATE TABLE IF NOT EXISTS cdt_hud_settings (
            owner_key VARCHAR(100) COLLATE utf8mb4_bin NOT NULL,
            setting_path VARCHAR(191) COLLATE utf8mb4_bin NOT NULL,
            value_type VARCHAR(8) NOT NULL,
            text_value TEXT NULL,
            number_value DOUBLE NULL,
            boolean_value TINYINT NULL,
            PRIMARY KEY (owner_key, setting_path)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4]])
    end)
    available, initialized = ok, true
    if not ok then print('[cdt_hud] SQL indisponible : '..tostring(err)) end
end)
local function ready()
    while not initialized do Wait(50) end
    if not available then error('Base de données HUD indisponible') end
end
local function readProfile(owner)
    local stored=MySQL.single.await('SELECT profile_data FROM cdt_hud_profiles WHERE owner_key = ? LIMIT 1',{owner})
    if stored then
        local value=json.decode(stored.profile_data)
        assert(type(value)=='table','Profil SQL invalide')
        HudStorage.cache[owner]=copy(value)
        return value
    end
    local rows, cursor = {}, ''
    local batchSize = 400
    repeat
        local batch = MySQL.query.await('SELECT setting_path, value_type, text_value, number_value, boolean_value FROM cdt_hud_settings WHERE owner_key = ? AND setting_path > ? ORDER BY setting_path LIMIT 400', {owner,cursor})
        for _,row in ipairs(batch) do rows[#rows+1]=row end
        if #batch < batchSize then break end
        cursor=batch[#batch].setting_path
    until false
    if #rows == 0 then HudStorage.cache[owner] = false return nil end
    local value = {}
    for _, row in ipairs(rows) do
        local node, parts = value, {}
        for part in row.setting_path:gmatch('[^.]+') do parts[#parts+1] = part end
        for i=1,#parts-1 do node[parts[i]] = node[parts[i]] or {} node = node[parts[i]] end
        local decoded
        if row.value_type == 'table' then decoded = {}
        elseif row.value_type == 'boolean' then decoded = row.boolean_value == true or tonumber(row.boolean_value) == 1
        elseif row.value_type == 'number' then decoded = tonumber(row.number_value)
        elseif row.value_type == 'string' then decoded = row.text_value
        else error('Valeur SQL HUD invalide') end
        node[parts[#parts]] = decoded
    end
    local saved=MySQL.transaction.await({
        {query='INSERT INTO cdt_hud_profiles (owner_key,profile_data) VALUES (?,?) ON DUPLICATE KEY UPDATE profile_data = VALUES(profile_data)',values={owner,json.encode(value)}},
        {query='DELETE FROM cdt_hud_settings WHERE owner_key = ?',values={owner}}
    })
    if not saved then error('Migration SQL du profil impossible') end
    HudStorage.cache[owner] = copy(value)
    return value
end
function HudStorage.load(owner)
    ready()
    -- Serialize reads/migrations and writes for each profile.
    while HudStorage.locks[owner] do Wait(25) end
    if HudStorage.cache[owner] ~= nil then
        return HudStorage.cache[owner] ~= false and copy(HudStorage.cache[owner]) or nil
    end
    HudStorage.locks[owner]=true
    local ok,value=pcall(readProfile,owner)
    HudStorage.locks[owner]=nil
    if not ok then error(value) end
    return value
end
function HudStorage.save(owner, value)
    ready()
    if HudStorage.locks[owner] then return false, 'Enregistrement en cours' end
    HudStorage.locks[owner] = true
    local ok, result = pcall(function()
        assert(type(value)=='table','Profil invalide')
        local encoded=json.encode(value)
        assert(type(encoded)=='string' and #encoded<=65536,'Profil trop volumineux')
        return MySQL.transaction.await({
            {query='INSERT INTO cdt_hud_profiles (owner_key,profile_data) VALUES (?,?) ON DUPLICATE KEY UPDATE profile_data = VALUES(profile_data)',values={owner,encoded}},
            {query='DELETE FROM cdt_hud_settings WHERE owner_key = ?',values={owner}}
        })
    end)
    HudStorage.locks[owner] = nil
    if not ok or not result then return false, 'Enregistrement SQL impossible' end
    HudStorage.cache[owner] = copy(value)
    return true
end
function HudStorage.playerKey(player)
    local license = GetPlayerIdentifierByType(player,'license')
    if not license then error('Identifiant joueur indisponible') end
    local key='player:'..license
    HudStorage.players[player]=key
    return key
end
AddEventHandler('playerDropped',function()
    local key=HudStorage.players[source]
    if key then HudStorage.cache[key]=nil HudStorage.players[source]=nil end
end)
