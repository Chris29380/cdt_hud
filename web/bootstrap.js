/* One installation profile is shared by the native client and the editor. */
(async () => {
 'use strict';
 const load=src=>new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src=src;
  script.onload=resolve;script.onerror=()=>reject(new Error('Chargement impossible : '+src));
  document.body.append(script);
 });
 await load('installation.js');
 await load('profile.js');
 await load('i18n.js');
 await load('locales/index.js');
 for(const file of window.HudLocaleFiles){try{await load(file);}catch(error){console.error('[cdt_hud] '+error.message);}}
 window.HudI18n.setLanguage(window.HudInstallationProfile.language);
 await load('app.js');
 window.HudI18n.start();
})().catch(error=>console.error('[cdt_hud] '+error.message));
