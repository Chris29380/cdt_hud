(function (root) {
 'use strict';
 const S=root.HudSkins||(typeof require==='function'?require('./skins.js'):null);
 const models = ['bar', 'vertical', 'circle', 'arc', 'ring', 'segments', 'icon', 'square'];
 const labels = {health:'Vie',armor:'Armure',hunger:'Faim',thirst:'Soif',stamina:'Endurance',oxygen:'Oxygène',stress:'Stress',speed:'Vitesse',rpm:'Régime',gear:'Rapport',fuel:'Carburant',engine:'Moteur',belt:'Ceinture',cruise:'Régulateur',voice:'Micro',radio:'Radio',street:'Rue',zone:'Quartier',heading:'Boussole',cash:'Espèces',bank:'Banque',job:'Métier',id:'Identifiant',indicatorLeft:'Clignotant gauche',indicatorRight:'Clignotant droit',hazards:'Feux de détresse'};
 const gauges = ['health','armor','hunger','thirst','stamina','oxygen','stress','fuel','engine','rpm','voice','radio'];
 const vehicle = ['speed','rpm','gear','fuel','engine','belt','cruise','indicatorLeft','indicatorRight','hazards'];
 const symbols = {health:'♥',armor:'◈',hunger:'◒',thirst:'◕',stamina:'ϟ',oxygen:'O₂',stress:'!',fuel:'F',engine:'E',rpm:'RPM',gear:'GEAR',belt:'B',cruise:'C',indicatorLeft:'←',indicatorRight:'→',hazards:'⚠',voice:'MIC',radio:'RAD'};
 const copy = value => JSON.parse(JSON.stringify(value));
 function defaults() {
  if(root.HudInstallationProfile===false)return builtinDefaults();
  const installation=root.HudInstallationProfile||(typeof require==='function'?require('./installation.js'):null);
  return installation?Object.assign({destination:true},copy(installation)):builtinDefaults();
 }
 function builtinDefaults() {
  const profile = {destination:true,language:'fr',version:1,revision:6,informationLayout:2,voiceGaugeVersion:1,communicationGaugeVersion:2,name:'Joueur essentiel',carStyle:'grand',playerStyle:'zurg',playerOrientation:'horizontal',scale:1,unit:'kmh',quality:'economy',demo:true,grid:false,snap:false,step:2,minimap:true,minimapMode:'always',minimapShape:'round',minimapX:0,minimapY:-.08,minimapScale:.88,carFrame:false,carShadow:false,minimapFrame:true,minimapShadow:true,minimapFrameColor:'#cbd5e1',minimapFrameStyle:'solid',minimapFrameWidth:1.5,minimapFrameOpacity:.7,minimapFrameRadius:0,minimapShadowOpacity:.5,minimapShadowSize:8,minimapAlignX:28,minimapAlignY:-15,minimapRoundAlignX:23,minimapRoundAlignY:-26,minimapRoundFrameScale:.85,elements:{}};
  Object.keys(labels).forEach((key,index) => {
   const isVehicle = vehicle.includes(key), isGauge = gauges.includes(key);
   const playerIndex = ['health','armor','hunger','thirst','stamina','oxygen','stress'].indexOf(key);
   profile.elements[key] = {x:playerIndex>=0 ? .025+playerIndex*.044 : isVehicle ? .79+(vehicle.indexOf(key)%4)*.047 : .975,y:playerIndex>=0 ? .925 : isVehicle ? .87+Math.floor(vehicle.indexOf(key)/4)*.066 : .035+(index-14)*.043,anchor:playerIndex>=0||isVehicle?'top-left':'top-right',width:isGauge?64:key==='speed'?160:180,height:isGauge?64:42,scale:1,"infoLineColor":"#20e7be","infoLineOpacity":1,"infoAccent":"#20e7be","infoAccentOpacity":1,"infoLineWidth":1,"infoLineStyle":"solid","infoOutlineWidth":1,"infoOutlineOffset":4,"infoGap":9,"infoBlur":8,"infoCutSize":12,"infoPatternOpacity":0.07,"infoPatternSize":7,"infoPatternAngle":135,"infoDecoration":true,"infoDecorationSize":5,"infoIconShape":"style","infoContentLayout":"style",iconBackground:"#171c23",iconBackgroundOpacity:0,iconBackgroundRadius:8,iconPadding:0,gradientReverse:false,blockShadow:false,textShadow:true,iconShadow:true,voiceLevels:3,voiceActiveColor:'#22c55e',fontFamily:'style',fontWeight:'style',infoAppearance:'style',iconSize:20,cardRadius:8,cardPadding:7,model:isGauge?'ring':'bar',enabled:!['cash','bank','job','id'].includes(key),hideAtZero:['armor','stamina','oxygen','stress'].includes(key),color:S.playerColors[key]||(isVehicle?'#59d6ff':'#22db80'),background:'#171c23',text:'#eef0f6',border:'#22252b',iconColor:'#eef0f6',opacity:1,backgroundOpacity:1,textOpacity:1,iconOpacity:1,borderOpacity:0,label:labels[key],icon:symbols[key]||'',showLabel:true,showValue:true,showIcon:true,fontSize:key==='speed'?30:isGauge?15:13,align:'center',rotation:0,thickness:2,radius:38,startAngle:0,arcAngle:270,segments:10,gap:3,reverse:false,threshold:20,alertColor:'#ef4444',alertHigh:key==='stress',animation:false,condition:key==='oxygen'?'underwater':key==='stamina'?'notfull':isVehicle?'vehicle':'always',locked:false,group:isVehicle?'vehicle':'',z:1,max:key==='speed'?240:100};
  });
  ['health','armor','hunger','thirst','stamina','oxygen','stress'].forEach((key,i)=>Object.assign(profile.elements[key],{x:.025+i*.035,y:.965,anchor:'bottom-left',width:60,height:60,showLabel:false,fontSize:11}));
  const info={zone:[.015,.578,260,32,'top-left'],street:[.015,.615,260,42,'top-left'],heading:[.015,.492,120,28,'top-left'],voice:[.02,.94,150,26,'top-left'],radio:[.11,.94,150,26,'top-left'],id:[.135,.69,220,32,'top-left'],job:[.135,.732,220,36,'top-left'],cash:[.135,.774,220,32,'top-left'],bank:[.135,.816,220,32,'top-left']};
  for(const [key,[x,y,width,height,anchor]] of Object.entries(info))Object.assign(profile.elements[key],{x,y,width,height,anchor,enabled:key!=='heading',align:'left',fontSize:13,showLabel:false,backgroundOpacity:0,infoAppearance:'minimal',group:''});
  Object.assign(profile.elements.voice,{model:'ring',width:60,height:60,fontSize:11,showValue:true,showIcon:true,backgroundOpacity:0,color:'#cbd5e1',max:15,thickness:2,radius:38});
  Object.assign(profile.elements.radio,{model:'ring',width:60,height:60,showValue:true,showIcon:true,backgroundOpacity:0,color:'#06b6d4',condition:'nonzero',max:100});
  template(profile,'compact');
  S.apply(profile,'grand','vehicle',true);
  S.apply(profile,'zurg','player',true);
  for(const key of S.player)Object.assign(profile.elements[key],{y:.916,group:'',iconColor:S.playerColors[key],backgroundOpacity:.2});
  return profile;
 }
 function recommendedPlayer(profile){const fresh=defaults();
  for(const key of Object.keys(labels))if(!vehicle.includes(key))profile.elements[key]=copy(fresh.elements[key]);
  for(const key of Object.keys(fresh))if(key.startsWith('minimap')||['playerStyle','playerOrientation','informationLayout','voiceGaugeVersion','communicationGaugeVersion'].includes(key))profile[key]=fresh[key];
  return profile;
 }
 function referenceLayout(profile){const fresh=defaults();if(S.ids.includes(profile.playerStyle))S.apply(fresh,profile.playerStyle,'player');
  for(const key of [...S.player,...Object.keys(labels).filter(key=>!S.player.includes(key)&&!vehicle.includes(key))]){
   for(const field of ['x','y','anchor','width','height','scale','rotation','group'])profile.elements[key][field]=fresh.elements[key][field];
   if(!S.player.includes(key)){for(const field of ['infoAppearance','backgroundOpacity','showLabel','enabled'])profile.elements[key][field]=fresh.elements[key][field];}
  }
  for(const key of ['minimapShape','minimapX','minimapY','minimapScale','informationLayout'])profile[key]=fresh[key];
  return profile;
 }
 const finite=(v,min,max)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
 function validate(input) {
  if (!input || typeof input!=='object' || Array.isArray(input) || input.version!==1 || !input.elements || typeof input.elements!=='object') throw Error('Format ou version de profil invalide.');
  if (JSON.stringify(input).length>50000) throw Error('Profil trop volumineux.');
  const out=defaults();
  if(input.language!==undefined){if(typeof input.language!=='string'||! /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/.test(input.language))throw Error('Langue invalide.');out.language=input.language;}
  const globalEnums={gaugeStyle:['style',...S.gaugeCatalog.map(s=>s.id)],playerOrientation:['horizontal','vertical'],unit:['kmh','mph'],quality:['economy','standard'],minimapMode:['always','vehicle'],minimapShape:['square','round'],minimapFrameStyle:['solid','dashed','dotted','double']};
  for (const [key,values] of Object.entries(globalEnums)) if (input[key]!==undefined) {if(!values.includes(input[key]))throw Error('Option globale invalide : '+key);out[key]=input[key];}
  for (const [key,min,max] of [['scale',.5,2],['step',1,30],['minimapX',-.5,.5],['minimapY',-.5,.5],['minimapScale',.5,1.5],['minimapFrameWidth',0,12],['minimapFrameOpacity',0,1],['minimapFrameRadius',0,40],['minimapShadowOpacity',0,1],['minimapShadowSize',0,30],['minimapAlignX',-100,100],['minimapAlignY',-100,100],['minimapRoundAlignX',-100,100],['minimapRoundAlignY',-100,100],['minimapRoundFrameScale',.5,1.5]]) if(input[key]!==undefined){if(!finite(input[key],min,max))throw Error('Valeur globale invalide : '+key);out[key]=input[key];}
  for(const key of ['destination','demo','grid','snap','minimap','minimapFrame','minimapShadow','carFrame','carShadow']) if(input[key]!==undefined){if(typeof input[key]!=='boolean')throw Error('Option invalide : '+key);out[key]=input[key];}
  if(input.minimapFrameColor!==undefined){if(typeof input.minimapFrameColor!=='string'||!/^#[0-9a-f]{6}$/i.test(input.minimapFrameColor))throw Error('Couleur de cadre invalide.');out.minimapFrameColor=input.minimapFrameColor;}
  if(input.name!==undefined){if(typeof input.name!=='string'||input.name.length>60)throw Error('Nom invalide.');out.name=input.name;}
  const ranges={infoLineOpacity:[0,1],"infoAccentOpacity":[0,1],"infoLineWidth":[0,12],"infoOutlineWidth":[0,8],"infoOutlineOffset":[0,16],"infoGap":[0,40],"infoBlur":[0,30],"infoCutSize":[0,40],"infoPatternOpacity":[0,1],"infoPatternSize":[2,30],"infoPatternAngle":[-360,360],"infoDecorationSize":[1,30],iconBackgroundOpacity:[0,1],iconBackgroundRadius:[0,40],iconPadding:[0,16],voiceLevels:[1,10],iconSize:[10,64],cardRadius:[0,40],cardPadding:[0,24],x:[0,1],y:[0,1],width:[24,500],height:[20,300],scale:[.4,3],opacity:[0,1],backgroundOpacity:[0,1],textOpacity:[0,1],iconOpacity:[0,1],borderOpacity:[0,1],fontSize:[8,60],rotation:[-180,180],thickness:[1,25],radius:[10,48],startAngle:[-360,360],arcAngle:[30,360],segments:[2,24],gap:[0,10],threshold:[0,100],z:[0,100],max:[1,500]};
  const enums={"infoLineStyle":["none","solid","dashed","dotted","double"],"infoIconShape":["style","round","square","hexagon"],"infoContentLayout":["style","row","column"],fontFamily:['style','segoe','arial','bahnschrift','consolas','georgia'],fontWeight:['style','400','500','600','700'],infoAppearance:S.informationCatalog.map(s=>s.id),model:models,anchor:['top-left','top-right','bottom-left','bottom-right','center'],condition:['always','vehicle','underwater','notfull','nonzero'],align:['left','center','right']};
  for (const key of Object.keys(labels)) {
   if(input.elements[key]===undefined)continue;
   const source=input.elements[key]; if(!source||typeof source!=='object'||Array.isArray(source))throw Error('Élément invalide : '+key);
   const target=out.elements[key];
   for(const [field,[min,max]] of Object.entries(ranges)) if(source[field]!==undefined){if(!finite(source[field],min,max))throw Error('Valeur invalide : '+key+'.'+field);target[field]=source[field];}
   for(const [field,values] of Object.entries(enums)) if(source[field]!==undefined){if(!values.includes(source[field]))throw Error('Option invalide : '+field);target[field]=source[field];}
   for(const field of ['enabled','showLabel','showValue','showIcon','locked','reverse','animation','alertHigh','hideAtZero','blockShadow','textShadow','iconShadow','gradientReverse','infoDecoration'])if(source[field]!==undefined){if(typeof source[field]!=='boolean')throw Error('Booléen invalide : '+field);target[field]=source[field];}
   for(const field of ['color','background','text','border','iconColor','alertColor','voiceActiveColor','iconBackground','infoAccent','infoLineColor'])if(source[field]!==undefined){if(typeof source[field]!=='string'||!/^#[0-9a-f]{6}$/i.test(source[field]))throw Error('Couleur invalide.');target[field]=source[field];}
   for(const [field,max] of [['label',40],['icon',8],['group',24]])if(source[field]!==undefined){if(typeof source[field]!=='string'||source[field].length>max||/[\x00-\x1f]/.test(source[field]))throw Error('Texte invalide.');target[field]=source[field];}
   target.segments=Math.round(target.segments);target.z=Math.round(target.z);
  }
  if(input.revision!==undefined&&(!Number.isInteger(input.revision)||input.revision<1||input.revision>6))throw Error('Révision de profil invalide.');
  if(!input.revision||input.revision<4)migrateFactory(out,input);
  for(const key of ['carStyle','playerStyle']){if(input[key]!==undefined&&!['custom',...S.ids].includes(input[key]))throw Error('Style invalide.');out[key]=input[key]??(input.revision===6?'grand':'custom');}
  if(!input.revision||input.revision<6){for(const key of ['speed','rpm']){const source=input.elements[key];if(source&&source.threshold===20&&source.alertHigh===false){out.elements[key].threshold=key==='speed'?85:90;out.elements[key].alertHigh=true;}}}
  migrateLastFactoryStyle(out,input);
  for(const [field,target] of [['playerStyle','player'],['carStyle','vehicle']])if(!S.ids.includes(out[field]))S.apply(out,'grand',target,false);
  if(input.informationLayout!==undefined&&![1,2].includes(input.informationLayout))throw Error('Disposition des informations invalide.');
  if(!input.informationLayout){
   const fresh=defaults();
   ['voice','radio','street','zone','heading','cash','bank','job','id'].forEach((key,i)=>{const old=input.elements[key];if(!old)return;
    if(Math.abs(old.x-.975)<.00001&&Math.abs(old.y-(.03+i*.047))<.00001&&old.anchor==='top-right'&&old.width===240&&old.height===50){
     for(const field of ['x','y','width','height','anchor','group'])out.elements[key][field]=fresh.elements[key][field];
     for(const [field,value] of [['align','center'],['showLabel',true],['backgroundOpacity',1]])if(old[field]===value)out.elements[key][field]=fresh.elements[key][field];
     if(key==='radio'&&old.condition==='always')out.elements[key].condition='nonzero';
    }
   });
  }
  for(const key of Object.keys(labels))if(!S.player.includes(key)&&!vehicle.includes(key)){out.elements[key].showLabel=false;out.elements[key].group='';}
  if(input.voiceGaugeVersion!==undefined&&input.voiceGaugeVersion!==1)throw Error('Version de jauge micro invalide.');
  if(input.voiceGaugeVersion!==1&&input.elements.voice){const old=input.elements.voice,e=out.elements.voice;e.model='ring';if(old.width===150&&old.height===26){e.width=60;e.height=60;e.fontSize=11;}if(old.max===100)e.max=15;}
  if(input.communicationGaugeVersion!==undefined&&![1,2].includes(input.communicationGaugeVersion))throw Error('Version des jauges de communication invalide.');
  if(input.communicationGaugeVersion!==2){const fresh=defaults();S.apply(fresh,out.playerStyle,'player',false);
   for(const key of ['voice','radio']){const e=out.elements[key],source=input.elements[key];
    if(!source)continue;
    if(source.model==='ring'&&fresh.elements[key].model!=='ring')for(const field of ['model','radius','thickness','startAngle','arcAngle'])e[field]=fresh.elements[key][field];
    if(source.width===60&&source.height===60&&out.playerStyle==='sky'){e.width=fresh.elements[key].width;e.height=fresh.elements[key].height;}
    if(key==='radio'){e.model=fresh.elements[key].model;e.showValue=true;if(source.width===150&&source.height===26){e.width=fresh.elements[key].width;e.height=fresh.elements[key].height;e.fontSize=11;}}
    const factoryVoice=key==='voice'&&Math.abs(source.x-.02)<.00001&&(Math.abs(source.y-.94)<.00001||Math.abs(source.y-.994)<.00001);
    const factoryRadio=key==='radio'&&Math.abs(source.x-.11)<.00001&&Math.abs(source.y-.94)<.00001;
    if(factoryVoice||factoryRadio)for(const field of ['x','y','width','height','anchor','scale'])e[field]=fresh.elements[key][field];
    e.group='';
   }
  }
  return out;
 }
 function migrateLastFactoryStyle(out,input){
  if(input.revision!==4||input.carStyle!==undefined||input.playerStyle!==undefined)return;
  const old={speed:[.858,.965,180,180],rpm:[.975,.855,208,60],gear:[.898,.925,64,62],fuel:[.937,.925,68,62],engine:[.975,.925,68,62],belt:[.916,.965,110,36],cruise:[.975,.965,112,36]};
  const near=(a,b)=>typeof a==='number'&&Math.abs(a-b)<.00001;
  const car=Object.keys(old).every(key=>{const e=input.elements[key],v=old[key];return e&&near(e.x,v[0])&&near(e.y,v[1])&&e.width===v[2]&&e.height===v[3]&&['square','arc','bar'].includes(e.model);});
  const player=S.player.every((key,i)=>{const e=input.elements[key];return e&&near(e.x,.025+i*.035)&&near(e.y,.965)&&e.width===60&&e.height===60&&e.model==='ring';});
  for(const [matches,target,keys] of [[car,'vehicle',S.vehicle],[player,'player',S.player]])if(matches){S.apply(out,'grand',target,false);for(const key of keys){const source=input.elements[key],e=out.elements[key];if(source.backgroundOpacity!==undefined&&![0,.8,1].includes(source.backgroundOpacity))e.backgroundOpacity=source.backgroundOpacity;if(source.borderOpacity>0&&source.border!=='#22252b')e.borderOpacity=source.borderOpacity;if(source.showLabel===true)e.showLabel=true;if(source.showIcon===false)e.showIcon=false;if(source.showValue===false)e.showValue=false;}}
 }
 function migrateFactory(out,input){
  const player=['health','armor','hunger','thirst','stamina','oxygen','stress'];
  const oldVehicle={speed:[.82,.81,180,96],rpm:[.94,.81,88,76],gear:[.975,.81,58,76],fuel:[.81,.965,76,76],engine:[.855,.965,76,76],belt:[.91,.965,80,56],cruise:[.975,.965,110,56]};
  const originalVehicle={speed:[.79,.79,160,42],rpm:[.89,.80,64,64],gear:[.94,.81,64,42],fuel:[.79,.89,64,64],engine:[.84,.89,64,64],belt:[.89,.89,64,42],cruise:[.94,.89,64,42]};
  const previousVehicle3d={speed:[.858,.965,180,180],rpm:[.975,.855,208,60],gear:[.898,.925,64,62],fuel:[.937,.925,68,62],engine:[.975,.925,68,62],belt:[.916,.965,110,36],cruise:[.975,.965,112,36]};
  const fresh=defaults();let legacy=false;
  for(const key of Object.keys(labels)){
   const source=input.elements[key];if(!source)continue;const i=player.indexOf(key);
   const same=(a,b)=>Math.abs(a-b)<.00001;
   const previousPlayer=i>=0&&((same(source.x,.025+i*.047)&&same(source.y,.965)&&source.width===80&&source.height===80)||(same(source.x,.225+i*.045)&&same(source.y,.965)&&source.width===72&&source.height===72)||(same(source.x,.025+i*.044)&&same(source.y,.925)&&source.width===64&&source.height===64));
   const previousVehicle=[oldVehicle[key],originalVehicle[key],previousVehicle3d[key]].some(v=>v&&same(source.x,v[0])&&same(source.y,v[1])&&source.width===v[2]&&source.height===v[3]);
   if(!previousPlayer&&!previousVehicle)continue;legacy=true;const e=out.elements[key],d=fresh.elements[key];
   for(const field of ['x','y','anchor','width','height'])e[field]=d[field];
   if(source.model===(key==='speed'?'bar':gauges.includes(key)?'ring':'bar')||(previousVehicle3d[key]&&source.model===(key==='speed'?'arc':['rpm','fuel','engine'].includes(key)?'bar':'bar')))e.model=d.model;
   if(source.thickness===6||source.thickness===4)e.thickness=d.thickness;
   if(vehicle.includes(key)&&source.color==='#22db80')e.color=d.color;
   if(key==='speed'&&(source.backgroundOpacity===1||source.backgroundOpacity===.8))e.backgroundOpacity=0;
   if(key==='gear'&&source.icon==='')e.icon=d.icon;
   if(source.showLabel===true)e.showLabel=d.showLabel;
   if(source.fontSize===(key==='speed'?30:gauges.includes(key)?15:13)||source.fontSize===13||source.fontSize===14||source.fontSize===48||key==='gear'&&source.fontSize===26)e.fontSize=d.fontSize;
   if(source.radius===26||source.radius===38)e.radius=d.radius;
   if(source.border==='#22252b'&&source.borderOpacity===1)e.borderOpacity=0;
   if(source.background==='#111215'&&source.backgroundOpacity===.8){e.background=d.background;e.backgroundOpacity=1;}
   if(source.opacity===.92)e.opacity=1;
   if(key==='speed'&&source.startAngle===0){e.startAngle=d.startAngle;e.arcAngle=d.arcAngle;e.thickness=d.thickness;}
  }
  for(const key of Object.keys(labels)){const e=out.elements[key],source=input.elements[key];if(!source)continue;if(source.border==='#22252b'&&source.borderOpacity===1)e.borderOpacity=0;if(source.background==='#111215'&&source.backgroundOpacity===.8){e.background=fresh.elements[key].background;e.backgroundOpacity=1;}if(source.opacity===.92)e.opacity=1;}
  if(legacy&&input.minimapY===0)out.minimapY=fresh.minimapY;
 }
 function template(profile,kind) {
  if(!['compact','circular','dual','horizontal','vertical'].includes(kind))return;
  profile.carStyle='custom';
  const layouts={
   compact:{speed:[.858,.965,180,180],rpm:[.975,.855,208,60],gear:[.898,.925,64,62],fuel:[.937,.925,68,62],engine:[.975,.925,68,62],belt:[.916,.965,110,36],cruise:[.975,.965,112,36]},
   circular:{speed:[.858,.965,180,180],rpm:[.975,.845,208,50],gear:[.898,.925,64,70],fuel:[.937,.925,68,70],engine:[.975,.925,68,70],belt:[.916,.965,110,36],cruise:[.975,.965,112,36]},
   dual:{speed:[.855,.965,180,180],rpm:[.975,.865,208,96],gear:[.898,.925,64,62],fuel:[.937,.925,68,62],engine:[.975,.925,68,62],belt:[.916,.965,110,36],cruise:[.975,.965,112,36]},
   horizontal:{speed:[.68,.965,164,124],rpm:[.78,.965,180,124],gear:[.819,.965,68,124],fuel:[.857,.965,68,124],engine:[.895,.965,68,124],belt:[.975,.897,144,50],cruise:[.975,.965,144,64]},
   vertical:{speed:[.975,.59,180,136],rpm:[.975,.66,180,64],gear:[.975,.71,180,44],fuel:[.975,.785,180,68],engine:[.975,.86,180,68],belt:[.975,.91,180,44],cruise:[.975,.965,180,44]}
  };
  vehicle.forEach(key=>{
   const e=profile.elements[key],[x,y,width,height]=layouts[kind][key]||[.72+['indicatorLeft','indicatorRight','hazards'].indexOf(key)*.035,.72,28,24];
   Object.assign(e,{group:'vehicle',anchor:'bottom-right',x,y,width,height,rotation:0,scale:1,fontSize:key==='speed'?30:gauges.includes(key)?15:13});
   if(gauges.includes(key)||key==='speed')e.model=kind==='vertical'?'bar':'ring';
   if(key==='speed')e.model=['circular','dual'].includes(kind)?'arc':'square';
   e.showLabel=false;
   if(['rpm','fuel','engine'].includes(key)&&['compact','dual','vertical'].includes(kind))e.model=kind==='compact'?'square':'bar';
   if(kind==='dual'&&key==='rpm')e.model='arc';
   if(kind==='horizontal'&&gauges.includes(key))e.model='vertical';
   if(key==='speed')Object.assign(e,{fontSize:48,radius:40,thickness:2,startAngle:-130,arcAngle:260,backgroundOpacity:0});
   if(key==='gear')e.fontSize=22;
  });
 }
 function restyle(profile){const fresh=defaults();for(const key of Object.keys(labels)){const e=profile.elements[key],d=fresh.elements[key];for(const field of ['x','y','anchor','width','height','scale','rotation','model','showLabel','fontSize','radius','thickness','startAngle','arcAngle','borderOpacity','backgroundOpacity','opacity'])e[field]=d[field];}profile.minimapY=fresh.minimapY;return profile;}
 function preset(name){const p=defaults();if(name==='minimal'){p.name='Minimal';Object.entries(p.elements).forEach(([key,e])=>{if(gauges.includes(key)) {e.model='bar';e.height=48;e.showLabel=false;e.showIcon=false;}if(['radio','zone','heading','rpm','engine','cruise'].includes(key))e.enabled=false;});template(p,'compact');}else if(name==='dashboard'){p.name='Tableau de bord';template(p,'dual');}return p;}
 function available(key,e,d,editing=false){if(editing)return true;if(!e.enabled)return false;if(e.hideAtZero&&!(Number(d[key])>0))return false;if(e.condition==='vehicle'&&!d.vehicle)return false;if(e.condition==='underwater'&&!d.underwater)return false;if(e.condition==='notfull'&&Number(d[key])>=100)return false;if(e.condition==='nonzero'&&!(Number(d[key])>0))return false;return d[key]!==undefined&&d[key]!==null&&(d[key]!==false||['belt','cruise','indicatorLeft','indicatorRight','hazards'].includes(key));}
 // Use the saved positions as slots; compact only the displayed player gauges.
 // Keeping the profile intact lets hidden gauges return and preserves editor placement.
 function playerPositions(profile,data,editing=false){
  const keys=S.player.slice().sort((a,b)=>profile.elements[a].y-profile.elements[b].y||profile.elements[a].x-profile.elements[b].x);
  const positions={};let slot=0;
  for(const key of keys){const e=profile.elements[key];const target=editing||!available(key,e,data)?e:profile.elements[keys[slot++]];positions[key]={x:target.x,y:target.y};}
  return positions;
 }
 function arrangePlayer(profile,orientation,width,height){
  if(!['horizontal','vertical'].includes(orientation))throw Error('Orientation des jauges invalide.');
  const factor=Math.max(.65,Math.min(2,height/1080))*profile.scale,gap=6*factor;
  const boxes=S.player.map(key=>bounds(profile.elements[key],width,height,profile.scale));
  let left=Math.max(0,Math.min(...boxes.map(box=>box.left))),bottom=Math.min(height,Math.max(...boxes.map(box=>box.top+box.height)));
  const totalWidth=orientation==='horizontal'?S.player.reduce((sum,key)=>sum+profile.elements[key].width*factor*profile.elements[key].scale,0)+gap*(S.player.length-1):Math.max(...S.player.map(key=>profile.elements[key].width*factor*profile.elements[key].scale));
  const totalHeight=orientation==='vertical'?S.player.reduce((sum,key)=>sum+profile.elements[key].height*factor*profile.elements[key].scale,0)+gap*(S.player.length-1):Math.max(...S.player.map(key=>profile.elements[key].height*factor*profile.elements[key].scale));
  left=Math.max(0,Math.min(left,width-totalWidth));let top=Math.max(0,bottom-totalHeight),cursor=orientation==='horizontal'?left:top;
  for(const key of S.player){const e=profile.elements[key];e.anchor='top-left';e.rotation=0;e.group='player';e.x=(orientation==='horizontal'?cursor:left)/width;e.y=(orientation==='vertical'?cursor:top)/height;cursor+=(orientation==='horizontal'?e.width:e.height)*factor*e.scale+gap;}
  profile.playerOrientation=orientation;return profile;
 }
 function parseJson(text){if(typeof text!=='string'||!text.trim())throw Error('Le JSON est vide.');if(text.length>50000)throw Error('Profil trop volumineux.');return validate(JSON.parse(text));}
 function selectInBox(boxes,rect){return boxes.filter(box=>box.left>=rect.left&&box.top>=rect.top&&box.right<=rect.right&&box.bottom<=rect.bottom).map(box=>box.key);}
 function voiceGauge(data,element){const level=Number(data.voiceLevel),distance=Number(data.voice);const fraction=Number.isFinite(level)&&level>0?level/element.voiceLevels:Math.max(0,Number.isFinite(distance)?distance:0)/element.max;return {percent:Math.max(0,Math.min(100,fraction*100)),color:data.talking===true?element.voiceActiveColor:element.color,active:data.talking===true};}
 function minimapSpace(profile,data,viewportHeight,editing=false){
  if(editing||['voice','radio'].some(key=>available(key,profile.elements[key],data)))return 0;
  return Math.min(.05,32*Math.max(.65,Math.min(2,viewportHeight/1080))/viewportHeight);
 }
 function resizeElement(element,dx,dy,viewportWidth,viewportHeight,globalScale=1){
  const e=copy(element);if(e.locked)return e;
  const factor=Math.max(.65,Math.min(2,viewportHeight/1080))*globalScale;
  const width=e.width*factor*e.scale,height=e.height*factor*e.scale,angle=e.rotation*Math.PI/180;
  const vx=width*Math.cos(angle)-height*Math.sin(angle),vy=width*Math.sin(angle)+height*Math.cos(angle);
  const scale=Math.max(.4,Math.min(3,e.scale*(1+(dx*vx+dy*vy)/(vx*vx+vy*vy))));
  const [ax,ay]=anchors[e.anchor];
  e.x=Math.max(0,Math.min(1,e.x-ax/100*e.width*factor*(scale-e.scale)/viewportWidth));
  e.y=Math.max(0,Math.min(1,e.y-ay/100*e.height*factor*(scale-e.scale)/viewportHeight));
  e.scale=scale;return e;
 }
 const anchors={'top-left':[0,0],'top-right':[-100,0],'bottom-left':[0,-100],'bottom-right':[-100,-100],center:[-50,-50]};
 function bounds(element,viewportWidth,viewportHeight,globalScale=1){const scale=Math.max(.65,Math.min(2,viewportHeight/1080))*globalScale*element.scale;const [ax,ay]=anchors[element.anchor];const width=element.width*scale,height=element.height*scale,angle=element.rotation*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);return {left:element.x*viewportWidth+ax/100*width+Math.min(0,width*c,-height*s,width*c-height*s),top:element.y*viewportHeight+ay/100*height+Math.min(0,width*s,height*c,width*s+height*c),width:Math.abs(width*c)+Math.abs(height*s),height:Math.abs(width*s)+Math.abs(height*c)};}
 function recover(element,viewportWidth,viewportHeight,globalScale=1){const e=copy(element);e.anchor='center';let b=bounds(e,viewportWidth,viewportHeight,globalScale);const ratio=Math.min(1,viewportWidth/b.width,viewportHeight/b.height);if(ratio<1){e.width=Math.max(24,e.width*ratio);e.height=Math.max(20,e.height*ratio);b=bounds(e,viewportWidth,viewportHeight,globalScale);}const dx=b.left<0?-b.left:b.left+b.width>viewportWidth?viewportWidth-b.left-b.width:0,dy=b.top<0?-b.top:b.top+b.height>viewportHeight?viewportHeight-b.top-b.height:0;e.x=Math.max(0,Math.min(1,e.x+dx/viewportWidth));e.y=Math.max(0,Math.min(1,e.y+dy/viewportHeight));return e;}
 function integrationDraft(source,allowed){const out={provider:allowed.includes(source.provider)?source.provider:allowed[0],resource:typeof source.resource==='string'?source.resource:''};for(const key of ['export','key'])if(typeof source[key]==='string')out[key]=source[key];for(const key of ['minimum','maximum'])if(finite(source[key],-100000000,100000000))out[key]=source[key];return out;}
 const api={models,labels,gauges,vehicle,defaults,builtinDefaults,validate,copy,recommendedPlayer,referenceLayout,template,preset,available,playerPositions,minimapSpace,arrangePlayer,parseJson,selectInBox,voiceGauge,resizeElement,anchors,bounds,recover,restyle,integrationDraft};
 root.HudProfile=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
