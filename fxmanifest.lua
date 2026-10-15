fx_version 'cerulean'
game 'gta5'
author 'CDT'
description 'Modular ESX / Qbox / QBCore HUD'
version '0.1.0'
ui_page 'web/index.html'
shared_scripts { 'config.lua', 'config/integrations.lua' }
client_scripts { 'shared/utils.lua', 'bridge/registry.lua', 'bridge/framework.lua', 'bridge/custom/*.lua', 'client/indicators.lua', 'client/seatbelt.lua', 'client/visibility.lua', 'client/destination.lua', 'client/main.lua' }
dependency 'oxmysql'
server_scripts { '@oxmysql/lib/MySQL.lua', 'config/default-profile.lua', 'server/storage.lua', 'server/permissions.lua', 'shared/integrations.lua', 'server/integrations.lua', 'server/seatbelt.lua', 'server/default-profile.lua' }
files { 'web/i18n.js', 'web/locales/*.js', 'web/installation.js', 'web/bootstrap.js', 'web/index.html', 'web/style.css', 'web/app.js', 'web/profile.js', 'web/skins.js', 'web/skins.css', 'web/destination.js', 'web/destination.css', 'web/icons/*.svg' }
