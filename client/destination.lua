HudDestination = {}
local cachedX, cachedY, groundZ, nextGroundCheck = nil, nil, nil, 0

local showing = false
local previousRotation, previousFrame
local provisional, transitionStarted = false, nil
local provisionalX, provisionalY
local rayLayers = { { 0.22, 48 }, { 0.45, 32 }, { 0.80, 18 }, { 1.20, 8 } }
function HudDestination.hide()
    if showing then SendNUIMessage({ action = 'destination', visible = false }) end
    showing = false
    previousRotation, previousFrame = nil, nil
    provisional, transitionStarted = false, nil
end

function HudDestination.draw()
    local settings = Config.Destination
    if not settings or not settings.enabled or IsPauseMenuActive() then HudDestination.hide() return end
    local ped = PlayerPedId()
    local vehicle = GetVehiclePedIsIn(ped, false)
    if vehicle == 0 or GetPedInVehicleSeat(vehicle, -1) ~= ped or IsEntityDead(ped) then HudDestination.hide() return end
    if not IsWaypointActive() then HudDestination.hide() return end
    local blip = GetFirstBlipInfoId(8)
    if not DoesBlipExist(blip) then HudDestination.hide() return end
    local target, position = GetBlipInfoIdCoord(blip), GetEntityCoords(ped)
    local dx, dy = target.x - position.x, target.y - position.y
    local distance = math.sqrt(dx * dx + dy * dy)
    local radius = math.max(1, tonumber(settings.radius) or 700)
    if distance > radius then HudDestination.hide() return end

    local now = GetGameTimer()
    if cachedX ~= target.x or cachedY ~= target.y then
        cachedX, cachedY, groundZ, nextGroundCheck = target.x, target.y, nil, 0
        provisional, transitionStarted = false, nil
    end
    if now >= nextGroundCheck then
        -- A distant waypoint may not have collision loaded yet. Ask for it
        -- without moving streaming focus away from the driver or blocking a frame.
        if not groundZ then RequestCollisionAtCoord(target.x, target.y, tonumber(target.z) or position.z) end
        local found, z = GetGroundZFor_3dCoord(target.x, target.y, 1000.0, false)
        if found then groundZ = z end
        nextGroundCheck = now + (groundZ and 1000 or 250)
    end
    local camera, rotation = GetGameplayCamCoord(), GetGameplayCamRot(2)
    local fov = GetGameplayCamFov()
    if not groundZ then
        -- Only the bearing is known. Show a temporary high-screen label without
        -- inventing a ground altitude or drawing a ray towards an unknown floor.
        local yaw = math.rad(rotation.z)
        local cx, cy = target.x - camera.x, target.y - camera.y
        local forward = -math.sin(yaw)*cx + math.cos(yaw)*cy
        local right = math.cos(yaw)*cx + math.sin(yaw)*cy
        local horizontalLimit = math.tan(math.rad(fov / 2)) * GetAspectRatio(false)
        if forward <= 0 or math.abs(right) > forward * horizontalLimit then HudDestination.hide() return end
        provisionalX = 0.5 + right / (2 * forward * horizontalLimit)
        provisionalY = 0.25
        provisional, showing = true, true
        SendNUIMessage({ action = 'destination', visible = true, x = provisionalX, y = provisionalY,
            groundVisible = false, worldRay = true, provisional = true,
            distance = math.floor(distance + 0.5), opacity = 1 })
        return
    end
    -- Only show arrivals in the driver's field of view.
    local yaw, pitch = math.rad(rotation.z), math.rad(rotation.x)
    local cx, cy, cz = target.x - camera.x, target.y - camera.y, groundZ - camera.z
    local forward = -math.sin(yaw)*math.cos(pitch)*cx + math.cos(yaw)*math.cos(pitch)*cy + math.sin(pitch)*cz
    local right = math.cos(yaw)*cx + math.sin(yaw)*cy
    local up = math.sin(yaw)*math.sin(pitch)*cx - math.cos(yaw)*math.sin(pitch)*cy + math.cos(pitch)*cz
    local tangent = math.tan(math.rad(fov / 2))
    if forward <= 0 or math.abs(right) > forward * tangent * GetAspectRatio(false)
        or math.abs(up) > forward * tangent then
        HudDestination.hide() return
    end
    -- Keep the same world X/Y, lowering only the height within the last 100m.
    local farHeight = math.max(10, tonumber(settings.height) or 40)
    local approach = math.max(0, math.min(1, (distance - 30) / 70))
    local height = 10 + (farHeight - 10) * approach * approach
    local z = groundZ + height
    local onScreen, x, y = World3dToScreen2d(target.x, target.y, z)
    if not onScreen then HudDestination.hide() return end
    local transitioning = false
    if provisional then
        transitionStarted = transitionStarted or now
        local progress = math.min(1, (now - transitionStarted) / 350)
        local blend = progress * progress * (3 - 2 * progress)
        x = provisionalX + (x - provisionalX) * blend
        y = provisionalY + (y - provisionalY) * blend
        transitioning = progress < 1
        if not transitioning then provisional, transitionStarted = false, nil end
    end
    -- Reserve a screen-sized gap plus a short camera-motion safety margin. The
    -- native ray and asynchronously rendered HTML must not share an endpoint.
    local _, screenHeight = GetActiveScreenResolution()
    local gapPixels = 32
    if previousRotation and previousFrame then
        local elapsed = math.max(1, now - previousFrame)
        local yawChange = math.abs((rotation.z - previousRotation.z + 180) % 360 - 180)
        local pitchChange = math.abs(rotation.x - previousRotation.x)
        gapPixels = gapPixels + math.min(100, (yawChange + pitchChange) / elapsed * 50 * screenHeight / fov)
    end
    previousRotation, previousFrame = { x = rotation.x, z = rotation.z }, now
    local panelDepth = forward + math.sin(pitch) * height
    local verticalProjection = math.abs(math.cos(pitch) * panelDepth - (up + math.cos(pitch)*height) * math.sin(pitch))
    local pixelsPerMetre = screenHeight * verticalProjection / (2 * tangent * math.max(0.01, panelDepth * panelDepth))
    local gap = math.max(0.75, gapPixels / math.max(0.01, pixelsPerMetre))
    local rayHeight = math.max(0, height - gap)
    -- Render the ray in the game world instead of depending on an HTML ground
    -- projection. The engine clips this finite segment naturally at the camera.
    if rayHeight > 0.1 and not transitioning then
    DrawLine(target.x, target.y, groundZ + 0.05, target.x, target.y, groundZ + rayHeight, 130, 225, 245, 45)
    for _, layer in ipairs(rayLayers) do
        DrawMarker(1, target.x, target.y, groundZ, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
            layer[1], layer[1], rayHeight, 100, 225, 255, layer[2],
            false, false, 2, false, nil, nil, false)
    end
    end
    local groundVisible, groundX, groundY = World3dToScreen2d(target.x, target.y, groundZ)
    if not groundVisible then
        -- Exact camera projection of the same ground point, never a screen-edge ray.
        groundX = 0.5 + right / (2 * forward * tangent * GetAspectRatio(false))
        groundY = 0.5 - up / (2 * forward * tangent)
        groundVisible = groundX >= 0 and groundX <= 1 and groundY >= 0 and groundY <= 1
    end
    -- Screen projection gives a camera-facing HTML billboard above the waypoint.
    showing = true
    SendNUIMessage({ action = 'destination', visible = true, x = x, y = y,
        groundVisible = groundVisible, groundX = groundX, groundY = groundY,
        worldRay = true, distance = math.floor(distance + 0.5), opacity = 1 })
end
