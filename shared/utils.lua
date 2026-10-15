HudUtil = {}
function HudUtil.percent(value, minimum, maximum)
    if type(value) ~= 'number' or value ~= value or value == math.huge or value == -math.huge then return false end
    minimum, maximum = minimum or 0, maximum or 100
    if maximum <= minimum then return false end
    return math.floor(math.max(0, math.min(100, (value - minimum) * 100 / (maximum - minimum))) + 0.5)
end
function HudUtil.round(value)
    if type(value)~='number' or value~=value or value==math.huge or value==-math.huge then return false end
    return math.floor(value + 0.5)
end
-- NUI accepts finite numbers and plain UTF-8 data only. False means unavailable.
function HudUtil.nuiSafe(value)
    local visited, invalid = {}, nil
    local function clean(item,path,depth)
        local kind=type(item)
        if kind=='boolean' then return item end
        if kind=='number' and item==item and item~=math.huge and item~=-math.huge then return item end
        if kind=='string' and utf8.len(item) then return item end
        if kind=='table' and not visited[item] and depth<16 then
            visited[item]=true
            local out={}
            for key,child in pairs(item) do
                if type(key)=='string' and utf8.len(key) or type(key)=='number' and key%1==0 and key>0 and key<math.huge then
                    out[key]=clean(child,path..'.'..tostring(key),depth+1)
                else invalid=invalid or path..'.[clé]' end
            end
            visited[item]=nil
            return out
        end
        invalid=invalid or path
        return false
    end
    local out=clean(value,'message',0)
    return out,invalid
end
function HudUtil.running(name) return name and GetResourceState(name) == 'started' end
