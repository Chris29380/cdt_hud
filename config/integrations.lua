-- Each domain is independent of the framework. Override resource for renamed scripts.
Config.Integrations = {
    fuel = { provider = 'auto', resource = nil, minimum = 0, maximum = 100 },
    needs = { provider = 'auto' }, -- framework, esx_status, custom, disabled
    voice = { provider = 'auto', resource = 'pma-voice' }, -- pma, statebag, export, custom, disabled
    stress = { provider = 'framework' },
}
-- Simple custom fuel export: provider='export', resource='my-fuel', export='GetFuel'.
-- Simple fuel state bag: provider='statebag', key='fuel', minimum=0, maximum=100.
-- Complex/asynchronous APIs: register a provider in bridge/custom/ (see docs/BRIDGES.md).
