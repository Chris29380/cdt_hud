HudSeatbelt = {}
local previous, managedPed, nativeFlag, cooldown = nil, nil, nil, 0

function HudSeatbelt.reset()
    if managedPed and DoesEntityExist(managedPed) then SetPedConfigFlag(managedPed, 32, nativeFlag) end
    previous, managedPed, nativeFlag = nil, nil, nil
end

-- Sample actual occupancy independently of HUD visibility and its slower refresh.
function HudSeatbelt.tick(ped, vehicle, attached)
    local settings = Config.Belt.ejection
    local class = vehicle ~= 0 and GetVehicleClass(vehicle) or -1
    if not Config.Belt.enabled or not settings or not settings.enabled or vehicle == 0
        or class == 8 or class == 13 or class == 14 or class == 15 or class == 16 or class == 21
        or IsEntityDead(ped) then
        HudSeatbelt.reset()
        return
    end
    if managedPed ~= ped then
        HudSeatbelt.reset()
        managedPed, nativeFlag = ped, GetPedConfigFlag(ped, 32, true)
    end
    -- Own the crash decision, preventing GTA's separate windscreen ejection.
    SetPedConfigFlag(ped, 32, false)
    local speed, now = GetEntitySpeed(vehicle), GetGameTimer()
    local velocity = GetEntityVelocity(vehicle)
    local drop = previous and previous.speed - speed or 0
    local sameVehicle = previous and previous.vehicle == vehicle
    if sameVehicle and not attached and now >= cooldown
        and previous.speed * 3.6 >= settings.minimumKmh
        and drop * 3.6 >= settings.speedDropKmh
        and drop >= previous.speed * settings.dropRatio
        and HasEntityCollidedWithAnything(vehicle) then
        local motion = previous.velocity
        local length = math.sqrt(motion.x * motion.x + motion.y * motion.y)
        if length > 0.1 then
            local position = GetEntityCoords(ped)
            ClearPedTasksImmediately(ped)
            SetEntityCoords(ped, position.x + motion.x / length * 2.0,
                position.y + motion.y / length * 2.0, position.z + 0.5, false, false, false, false)
            SetPedToRagdoll(ped, settings.ragdollMs, settings.ragdollMs, 0, false, false, false)
            SetEntityVelocity(ped, motion.x, motion.y, math.max(motion.z, 0.0) + 1.0)
            cooldown = now + settings.cooldownMs
        end
        previous = nil
        return
    end
    previous = { vehicle = vehicle, speed = speed, velocity = velocity }
end

AddEventHandler('onResourceStop', function(resource)
    if resource == GetCurrentResourceName() then HudSeatbelt.reset() end
end)
