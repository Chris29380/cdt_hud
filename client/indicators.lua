HudIndicators = {}
function HudIndicators.read(vehicle)
    local state=vehicle~=0 and GetVehicleIndicatorLights(vehicle) or 0
    local interval=math.max(100,tonumber(Config.Indicators.blinkMs) or 500)
    return {indicatorLeft=state==1 or state==3,indicatorRight=state==2 or state==3,hazards=state==3,
        indicatorBlink=state~=0 and math.floor(GetGameTimer()/interval)%2==0}
end
local function toggle(mode)
    if not Config.Indicators.enabled or IsNuiFocused() then return end
    local ped=PlayerPedId()
    local vehicle=GetVehiclePedIsIn(ped,false)
    if vehicle==0 or GetPedInVehicleSeat(vehicle,-1)~=ped then return end
    local class=GetVehicleClass(vehicle)
    if class==13 or class==14 or class==15 or class==16 or class==21 then return end
    local state=GetVehicleIndicatorLights(vehicle)
    local nextState=state==mode and 0 or mode
    SetVehicleIndicatorLights(vehicle,1,nextState==1 or nextState==3)
    SetVehicleIndicatorLights(vehicle,0,nextState==2 or nextState==3)
    TriggerEvent('cdt_hud:client:indicatorsChanged',HudIndicators.read(vehicle))
end
for _,binding in ipairs({{'hudindicatorleft',1,'Clignotant gauche',Config.Indicators.leftKey},{'hudindicatorright',2,'Clignotant droit',Config.Indicators.rightKey},{'hudhazards',3,'Feux de détresse',Config.Indicators.hazardKey}}) do
    RegisterCommand(binding[1],function() toggle(binding[2]) end,false)
    RegisterKeyMapping(binding[1],binding[3],'keyboard',binding[4])
end
