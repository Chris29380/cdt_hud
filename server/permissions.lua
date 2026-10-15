HudPermissions = {}
function HudPermissions.admin(player)
    -- The native expects a player handle as a string.
    if IsPlayerAceAllowed(tostring(player),Config.AdminAce) then return true end
    -- Some servers fail to resolve the live player principal despite a valid
    -- identifier inheritance chain. Only test identifiers owned by this player.
    for _,identifier in ipairs(GetPlayerIdentifiers(player)) do
        if IsPrincipalAceAllowed('identifier.'..identifier,Config.AdminAce) then return true end
    end
    return false
end
