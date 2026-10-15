(function(root){
 'use strict';
 const player=['health','armor','hunger','thirst','stamina','oxygen','stress','voice','radio'];
 const playerColors={health:'#ef4444',armor:'#3b82f6',hunger:'#f59e0b',thirst:'#06b6d4',stamina:'#22c55e',oxygen:'#7dd3fc',stress:'#a855f7',voice:'#cbd5e1',radio:'#06b6d4'};
 const vehicle=['speed','rpm','gear','fuel','engine','belt','cruise','indicatorLeft','indicatorRight','hazards'];
 const catalog=[
 {id:'cycle',name:'Cycle Digital',detail:'Compteur numérique en cellules, sans coque grise',color:'#ffffff',player:'square'},
 {id:'metro',name:'Metro Arc',detail:'Arche blanche et voyants compacts, sans cadre gris',color:'#ffffff',player:'ring'},
 {id:'wanted',name:'Wanted Orbit',detail:'Orbites fines, blanc et cyan',color:'#f3f5f7',player:'ring'},
 {id:'zurg',name:'Zurg Minimal',detail:'Arche ouverte, cyan et ambre',color:'#20e7be',player:'ring'},
 {id:'neon',name:'Neon Cockpit',detail:'Trois instruments bleu électrique',color:'#268cff',player:'ring'},
 {id:'sky',name:'Sky Amber',detail:'Demi-cadran orange, barres compactes',color:'#ff9a36',player:'bar'},
 {id:'ursu',name:'URSU Digital',detail:'Affichage numérique et régime segmenté',color:'#35dfcc',player:'circle'},
 {id:'panel',name:'Compact Panel',detail:'Panneau anthracite, compteurs compacts',color:'#e4e8f1',player:'square'},
 {id:'grand',name:'Grand Touring',detail:'Cadran intégré, arcs périphériques',color:'#ffffff',player:'arc'}
 ];
 const layouts={
 cycle:{speed:[0,48,230,110,'bar'],rpm:[0,160,114,54,'bar'],gear:[116,160,114,54,'bar'],fuel:[116,0,114,46,'bar'],engine:[0,0,114,46,'bar'],belt:[0,216,114,30,'bar'],cruise:[116,216,114,30,'bar']},
 metro:{speed:[0,56,164,164,'arc'],gear:[180,56,136,146,'bar'],fuel:[0,0,60,38,'bar'],rpm:[64,0,60,38,'bar'],engine:[128,0,60,38,'bar'],belt:[192,0,60,38,'bar'],cruise:[256,0,60,38,'bar']},
 grand:{speed:[0,0,260,260,'arc'],rpm:[0,0,260,260,'arc'],gear:[108,168,44,34,'bar'],fuel:[-18,-18,296,296,'arc'],engine:[-18,-18,296,296,'arc'],belt:[154,4,46,34,'bar'],cruise:[58,4,46,34,'bar']},
 wanted:{speed:[30,0,230,230,'arc'],rpm:[30,0,230,230,'arc'],gear:[122,151,46,30,'bar'],fuel:[0,23,58,58,'ring'],engine:[14,-16,262,262,'arc'],belt:[61,6,40,30,'bar'],cruise:[152,6,40,30,'bar']},
 zurg:{speed:[0,0,250,250,'arc'],rpm:[0,0,250,250,'arc'],gear:[104,159,42,30,'bar'],fuel:[-14,-14,278,278,'arc'],engine:[-14,-14,278,278,'arc'],belt:[147,0,40,30,'bar'],cruise:[63,0,40,30,'bar']},
 neon:{speed:[145,0,180,180,'ring'],rpm:[307,8,140,140,'arc'],gear:[212,123,46,28,'bar'],fuel:[0,8,140,140,'arc'],engine:[341,0,44,44,'ring'],belt:[90,0,40,30,'bar'],cruise:[278,0,40,30,'bar']},
 sky:{speed:[0,0,240,180,'arc'],rpm:[0,0,240,180,'arc'],gear:[182,55,34,30,'bar'],fuel:[-14,0,268,194,'arc'],engine:[82,4,36,30,'bar'],belt:[142,4,36,30,'bar'],cruise:[24,4,36,30,'bar']},
 ursu:{speed:[90,40,252,86,'bar'],rpm:[90,0,252,36,'segments'],gear:[0,0,76,76,'bar'],fuel:[360,0,36,112,'vertical'],engine:[200,133,60,26,'bar'],belt:[131,133,60,26,'bar'],cruise:[62,133,60,26,'bar']},
 panel:{speed:[118,0,176,176,'ring'],rpm:[118,0,176,176,'arc'],gear:[184,22,44,28,'bar'],fuel:[26,94,54,54,'ring'],engine:[26,27,54,54,'ring'],belt:[-14,100,32,32,'bar'],cruise:[-14,30,32,32,'bar']}
 };
 for(const layout of Object.values(layouts)){const [x,y,w,h]=layout.speed;layout.indicatorLeft=[x+w*.78,y+h*.72,28,24,'bar'];layout.indicatorRight=[x+w*.12,y+h*.72,28,24,'bar'];layout.hazards=[x+w*.45,y+h*.15,26,24,'bar'];}
 function apply(profile,id,target='both',palette=false){
  const skin=catalog.find(s=>s.id===id);if(!skin)throw Error('Style inconnu.');
  if(target==='both'||target==='player'){
   profile.playerStyle=id;
   player.forEach((key,i)=>{const e=profile.elements[key];Object.assign(e,{x:.025+i*(id==='sky'?.061:.035),y:.916,anchor:'bottom-left',width:id==='sky'?108:60,height:id==='sky'?34:60,scale:1,rotation:0,group:'player',model:skin.player,showLabel:false,showIcon:true,showValue:id==='sky'||key==='voice'||key==='radio',fontSize:11,radius:39,thickness:id==='grand'?5:2,startAngle:225,arcAngle:270,backgroundOpacity:id==='ursu'?1:id==='panel'?.85:.3,borderOpacity:0});
    if(['voice','radio'].includes(key))e.iconSize=id==='sky'?16:26;
    if(palette){e.color=playerColors[key];if(['voice','radio'].includes(key)){e.iconColor=id==='ursu'?'#101a21':playerColors[key];e.text=id==='ursu'?'#101a21':'#eef0f6';}}
   });
  }
  if(target==='both'||target==='vehicle'){
   profile.carStyle=id;
   if(['cycle','metro'].includes(id)){profile.carFrame=false;profile.carShadow=false;}
   vehicle.forEach(key=>{const e=profile.elements[key],[ox,oy,width,height,model]=layouts[id][key];Object.assign(e,{x:.975-ox/1920,y:.965-oy/1080,anchor:'bottom-right',width,height,scale:1,rotation:0,group:'vehicle',model,showLabel:false,showIcon:key!=='speed'&&key!=='rpm',showValue:key==='speed'||key==='gear'||(['neon','ursu','panel'].includes(id)&&['rpm','fuel','engine'].includes(key)),fontSize:key==='speed'?(id==='ursu'?54:52):key==='gear'?20:12,radius:39,thickness:id==='grand'?4:2,startAngle:225,arcAngle:270,backgroundOpacity:key==='speed'?(id==='panel'?.85:id==='grand'?.32:0):0,borderOpacity:0,z:key==='gear'?6:key==='speed'?2:['fuel','engine'].includes(key)?4:1});
    if(palette){e.text='#eef3f8';e.iconColor='#eef3f8';e.background='#171c23';}
    if(id==='grand'&&key==='gear'){e.showIcon=false;e.backgroundOpacity=.9;if(palette){e.background='#f2f7fb';e.text='#15232a';}}
    if(key==='rpm')e.showIcon=false;if(['speed','rpm'].includes(key)&&e.threshold===20&&e.alertHigh===false)Object.assign(e,{alertHigh:true,threshold:key==='speed'?85:90});
    if(palette)e.color=skin.color;
    if(['indicatorLeft','indicatorRight','hazards'].includes(key)){Object.assign(e,{showLabel:false,showValue:false,showIcon:true,backgroundOpacity:0,borderOpacity:0,iconSize:20,z:8});if(palette){e.color=key==='hazards'?'#f59e0b':'#22c55e';e.iconColor='#64748b';}}
    if(['cycle','metro'].includes(id)){
     Object.assign(e,{showValue:true,showLabel:key!=='speed',showIcon:key!=='speed'&&key!=='rpm',backgroundOpacity:id==='cycle'?.75:key==='speed'?0:.7,fontSize:key==='speed'?48:key==='gear'?28:11,thickness:7,blockShadow:false});
     if(id==='metro'&&key==='speed'){e.startAngle=225;e.arcAngle=270;e.radius=43;}
    }
    if(['grand','zurg'].includes(id)&&['fuel','engine'].includes(key)){e.radius=45;e.arcAngle=90;e.startAngle=key==='fuel'?225:45;e.showIcon=true;}
    if(id==='wanted'&&key==='engine'){e.radius=45;e.arcAngle=100;e.startAngle=225;}
    if(id==='sky'&&['speed','rpm','fuel'].includes(key)){e.startAngle=270;e.arcAngle=180;e.radius=44;}
    if(id==='ursu'){if(key==='rpm'){e.segments=24;e.gap=3;e.thickness=24;}if(key==='gear')e.backgroundOpacity=.9;}
    if(['indicatorLeft','indicatorRight','hazards'].includes(key)){e.showValue=false;e.showLabel=false;e.showIcon=true;}
   });
  }
  return profile;
 }
 function preview(id){const c=catalog.find(s=>s.id===id),color=c.color;
  const players={
   sky:'<path d="M10 90h24m10 0h24m10 0h24" stroke-width="4"/>',
   panel:'<rect x="12" y="81" width="17" height="17" rx="3"/><rect x="38" y="81" width="17" height="17" rx="3"/><rect x="64" y="81" width="17" height="17" rx="3"/>',
   grand:'<path d="M16 96a8 8 0 1 1 12 0M42 96a8 8 0 1 1 12 0M68 96a8 8 0 1 1 12 0" stroke-width="3"/>',
   ursu:'<circle cx="22" cy="90" r="8" fill="#a77aff"/><circle cx="48" cy="90" r="8" fill="#ffad55"/><circle cx="74" cy="90" r="8" fill="#46decf"/>'
  };
  const player=players[id]||'<circle cx="22" cy="90" r="8"/><circle cx="48" cy="90" r="8"/><circle cx="74" cy="90" r="8"/>';
  const cars={
   cycle:'<rect x="46" y="4" width="68" height="68" rx="5" fill="#080808" stroke="none"/><path d="M46 22h68M46 55h68M80 4v18M80 55v17" stroke="#343434" stroke-width="1"/><text x="56" y="46" font-size="25">30.0</text><text x="49" y="16" font-size="8">RPM</text><text x="87" y="16" font-size="8">GEAR</text>',
   metro:'<rect x="10" y="14" width="65" height="42" rx="5" fill="#080808" stroke="none"/><text x="19" y="29" font-size="8">RAPPORT</text><text x="25" y="48" font-size="21">D</text><path d="M94 61a29 29 0 1 1 40 0" stroke-width="6"/><text x="98" y="44" font-size="24">30</text><path d="M16 69h14M48 69h14M80 69h14M112 69h14" stroke-width="4"/>',
   wanted:'<circle cx="86" cy="42" r="29"/><circle cx="47" cy="30" r="8"/><circle cx="54" cy="10" r="8"/><circle cx="123" cy="61" r="9"/><text x="67" y="49" font-size="23">118</text>',
   zurg:'<path d="M58 68a33 33 0 1 1 46 0" stroke-width="1.4"/><path d="M53 68a40 40 0 0 1-9-30" stroke="#58ceec"/><path d="M117 38a40 40 0 0 1-9 30" stroke="#f5b849"/><text x="56" y="48" font-size="27">118</text>',
   neon:'<circle cx="35" cy="44" r="22"/><circle cx="81" cy="40" r="30"/><circle cx="126" cy="44" r="22"/><circle cx="81" cy="40" r="23" opacity=".6"/><text x="60" y="47" font-size="21">118</text>',
   sky:'<path d="M47 67a34 34 0 0 1 68 0"/><path d="M53 67a28 28 0 0 1 40-25" stroke="#ffffff" stroke-width="4"/><text x="59" y="55" font-size="25">118</text>',
   ursu:'<text x="32" y="44" font-size="29">118</text><path d="M15 62h83" stroke-dasharray="3 2" stroke-width="12"/><rect x="106" y="48" width="19" height="22" fill="'+color+'"/>',
   panel:'<rect x="31" y="6" width="106" height="66" rx="8" fill="#20232d"/><circle cx="68" cy="39" r="25"/><circle cx="116" cy="24" r="9"/><circle cx="116" cy="53" r="9"/><text x="49" y="45" font-size="21">118</text>',
   grand:'<circle cx="81" cy="40" r="30" fill="rgba(17,29,35,.6)" stroke="none"/><path d="M61 63a29 29 0 1 1 40 0" stroke-width="3"/><path d="M52 64a40 40 0 0 1 0-46M110 18a40 40 0 0 1 0 46" stroke-width="3"/><circle cx="81" cy="22" r="5" fill="#ffffff"/><text x="61" y="50" font-size="25">118</text>'
  };
  return '<svg viewBox="0 0 160 108" aria-hidden="true" fill="none" stroke="'+color+'" stroke-width="2"><g>'+cars[id]+'</g><g>'+player+'</g><style>text{fill:'+color+';stroke:none;font-family:Segoe UI,sans-serif}</style></svg>';
 }
 const gaugeCatalog=[
  {id:'gauge-tile-filled',name:'Tuiles pleines · icône blanche',detail:'Tuile colorée, icône centrée, sans valeur',model:'square',width:60,height:60,thickness:3,solid:true,shape:'tile',showValue:false,iconColor:'#ffffff'},
  {id:'gauge-square-black',name:'Carrés pleins · icône noire',detail:'Carré coloré, pictogramme noir centré',model:'square',width:60,height:60,thickness:3,solid:true,shape:'square',showValue:false,iconColor:'#000000'},
  {id:'gauge-tile-filled-value',name:'Tuiles pleines · icône et valeur',detail:'Fond coloré, icône noire et chiffre',model:'square',width:64,height:64,thickness:3,solid:true,shape:'tile',showValue:true,iconColor:'#000000'},
  {id:'gauge-tile-outline',name:'Tuiles transparentes · icône',detail:'Contour coloré, intérieur transparent, icône centrée',model:'square',width:60,height:60,thickness:3,solid:false,shape:'tile',showValue:false},
  {id:'gauge-square-outline-value',name:'Carrés transparents · valeur',detail:'Contour carré avec pictogramme et chiffre',model:'square',width:64,height:64,thickness:3,solid:false,shape:'square',showValue:true},
  {id:'gauge-disc-white',name:'Disques pleins · icône blanche',detail:'Pastille colorée, icône blanche centrée',model:'circle',width:60,height:60,thickness:3,solid:true,shape:'disc',showValue:false,iconColor:'#ffffff'},
  {id:'gauge-disc-black-value',name:'Disques pleins · valeur noire',detail:'Pastille colorée avec icône et valeur noires',model:'circle',width:64,height:64,thickness:3,solid:true,shape:'disc',showValue:true,iconColor:'#000000'},
  {id:'gauge-orbit-icon',name:'Anneaux transparents · icône',detail:'Anneau fin et icône centrée, sans chiffre',model:'ring',width:60,height:60,thickness:2,solid:false,shape:'disc',showValue:false},
  {id:'gauge-orbit',name:'Anneaux fins',detail:'Pastilles ouvertes et légères',model:'ring',width:60,height:60,thickness:2},
  {id:'gauge-segments',name:'Segments',detail:'Couronne découpée en dix graduations',model:'segments',width:64,height:64,thickness:5},
  {id:'gauge-medallion',name:'Médaillons',detail:'Disques compacts et contours épais',model:'circle',width:64,height:64,thickness:6},
  {id:'gauge-tiles',name:'Tuiles',detail:'Carrés arrondis avec pictogrammes',model:'square',width:60,height:60,thickness:3},
  {id:'gauge-ribbon',name:'Rubans',detail:'Barres horizontales avec icône et valeur',model:'bar',width:110,height:38,thickness:4},
  {id:'gauge-columns',name:'Colonnes',detail:'Jauges verticales étroites',model:'vertical',width:42,height:96,thickness:5},
  ...catalog.map(s=>({...s,detail:'Jauges '+s.name}))
 ];
 const gaugeFamilies=[
  {id:'hex',name:'Prisme · hexagones',model:'square',shape:'hex',width:72,height:72,thickness:3,contour:'M50 8L87 29V71L50 92L13 71V29Z',clip:'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)'},
  {id:'diamond',name:'Facet · losanges',model:'square',shape:'diamond',width:76,height:76,thickness:3,contour:'M50 6L94 50L50 94L6 50Z',clip:'polygon(50% 0,100% 50%,50% 100%,0 50%)'},
  {id:'shield',name:'Sentinel · écussons',model:'square',shape:'shield',width:68,height:76,thickness:3,contour:'M15 12H85V59Q85 77 50 94Q15 77 15 59Z',clip:'polygon(0 0,100% 0,100% 70%,75% 88%,50% 100%,25% 88%,0 70%)'},
  {id:'tech',name:'Circuit · coins découpés',model:'square',shape:'tech',width:76,height:64,thickness:2,contour:'M22 9H89V68L69 91H9V28Z',clip:'polygon(18% 0,100% 0,100% 72%,82% 100%,0 100%,0 28%)'},
  {id:'cushion',name:'Cushion · coussins',model:'square',shape:'cushion',width:70,height:70,thickness:3,contour:'M50 10C85 10 90 15 90 50S85 90 50 90S10 85 10 50S15 10 50 10Z'},
  {id:'dual',name:'Satellite · doubles orbites',model:'ring',shape:'dual',width:76,height:76,thickness:3,decoration:'orbit'},
  {id:'ticks',name:'Apex · cadrans gradués',model:'arc',shape:'ticks',width:78,height:78,thickness:4,decoration:'ticks'},
  {id:'pill',name:'Pulse · capsules',model:'square',shape:'pill',width:108,height:56,thickness:3,contour:'M28 12H72C96 12 96 88 72 88H28C4 88 4 12 28 12Z'},
  {id:'pill-vertical',name:'Pulse · capsules verticales',model:'square',shape:'pill-vertical',width:56,height:108,thickness:3,contour:'M12 28V72C12 96 88 96 88 72V28C88 4 12 4 12 28Z'},
  {id:'ring',name:'Anneaux',model:'ring',shape:'disc',width:60,height:60,thickness:3},
  {id:'arc',name:'Arcs ouverts',model:'arc',shape:'disc',width:64,height:64,thickness:4},
  {id:'disc',name:'Disques',model:'circle',shape:'disc',width:64,height:64,thickness:4},
  {id:'square',name:'Carrés',model:'square',shape:'square',width:60,height:60,thickness:3},
  {id:'tile',name:'Tuiles arrondies',model:'square',shape:'tile',width:60,height:60,thickness:3},
  {id:'segments',name:'Segments',model:'segments',shape:'segments',width:92,height:54,thickness:4},
  {id:'bar',name:'Barres compactes',model:'bar',shape:'bar',width:100,height:42,thickness:4}
 ];
 const gaugeSamples={hex:'armor',diamond:'hunger',shield:'health',tech:'stamina',cushion:'thirst',dual:'oxygen',ticks:'stress',pill:'voice','pill-vertical':'voice'};
 for(const family of gaugeFamilies)for(const solid of [false,true])for(const showValue of [false,true]){
  const id='gauge-'+family.id+'-'+(solid?'filled':'outline')+'-'+(showValue?'value':'icon');
  const preset={...family,id,family:family.id,sampleKey:gaugeSamples[family.id],solid,showValue,
   name:(solid?'Plein':'Contour')+' · '+(showValue?'avec valeur':'sans valeur'),
   detail:'Icône '+(showValue?'et valeur':'centrée'),iconColor:solid?'#000000':undefined};
  const existing=gaugeCatalog.find(s=>s.id===id);
  if(existing)Object.assign(existing,{family:family.id,name:preset.name,detail:preset.detail});else gaugeCatalog.push(preset);
 }
 const informationCatalog=[
  {id:'holo',name:'Hologram',detail:'Double contour lumineux et repères techniques'},
  {id:'orbit-card',name:'Orbit',detail:'Icône ronde détachée, valeur sur rail flottant'},
  {id:'notch',name:'Notch',detail:'Carte angulaire avec découpes et accent latéral'},
  {id:'rail',name:'Rail',detail:'Icône encadrée, séparateur et ligne basse'},
  {id:'seal',name:'Insigne',detail:'Emblème hexagonal et cartouche arrondi'},
  {id:'woven',name:'Carbon',detail:'Surface striée et bordure contrastée'},
  {id:'glass-cut',name:'Crystal',detail:'Verre dépoli biseauté et filet supérieur'},
  {id:'flag',name:'Étendard',detail:'Bandeau à double pointe, repère coloré'},
  {id:'wire',name:'Network',detail:'Cadre en pointillés et nœuds de connexion'},
  {id:'badge',name:'Badge rond',detail:'Icône en pastille, texte détaché'},
  {id:'split',name:'Bloc partagé',detail:'Zone colorée pour l’icône, valeur sur panneau sombre'},
  {id:'ticket',name:'Ticket',detail:'Bords découpés et contour en pointillés'},
  {id:'ribbon',name:'Bandeau biseauté',detail:'Silhouette angulaire et pointe latérale'},
  {id:'glass',name:'Verre',detail:'Surface translucide et flou du décor'},
  {id:'underline',name:'Ligne basse',detail:'Texte flottant souligné par un trait coloré'},
  {id:'brackets',name:'Coins ouverts',detail:'Repères aux extrémités, sans cadre complet'},
  {id:'terminal',name:'Terminal',detail:'Présentation technique, texte monospace'},
  {id:'stacked',name:'Totem',detail:'Icône au-dessus du texte, contenu centré'},
  {id:'tab',name:'Onglet latéral',detail:'Bloc avec languette colorée sur le côté'},
  {id:'minimal',name:'Accent minimal',detail:'Texte et icône avec un trait coloré'},
  {id:'fade',name:'Dégradé',detail:'Fond progressif, sens inversable par élément'},
  {id:'capsule',name:'Capsules',detail:'Blocs arrondis et compacts'},
  {id:'plain',name:'Texte libre',detail:'Icône et texte sans fond'},
  {id:'outline',name:'Contours fins',detail:'Encadrement léger et fond transparent'},
  {id:'solid',name:'Cartes pleines',detail:'Fond uniforme pour une lecture nette'},
  {id:'style',name:'Style d’origine',detail:'Présentation du thème des informations'}
 ];
 function applyGauge(profile,id,palette=false){
  const preset=gaugeCatalog.find(s=>s.id===id);if(!preset)throw Error('Style de jauge inconnu.');
  if(catalog.some(s=>s.id===id)){const previous=profile.playerStyle;apply(profile,id,'player',palette);profile.playerStyle=previous;}
  else for(const key of player){const e=profile.elements[key];Object.assign(e,{model:preset.model,width:preset.width,height:preset.height,scale:1,rotation:0,thickness:preset.thickness,radius:39,startAngle:225,arcAngle:270,segments:10,gap:3,showLabel:false,showValue:true,showIcon:true,fontSize:11,iconSize:22,backgroundOpacity:.25,borderOpacity:0});if(palette){e.color=playerColors[key];e.iconColor=playerColors[key];e.text='#eef0f6';}}
  if(preset.shape)for(const key of player){const e=profile.elements[key];e.showValue=preset.showValue;e.backgroundOpacity=preset.solid?1:0;e.iconColor=preset.iconColor||e.color;e.text=preset.solid?(preset.iconColor||'#ffffff'):'#eef0f6';e.iconSize=preset.showValue?24:30;}
  profile.gaugeStyle=id;return profile;
 }
 function applyInformation(profile,id){
  if(!informationCatalog.some(s=>s.id===id))throw Error('Style d’information inconnu.');
  for(const [key,e] of Object.entries(profile.elements))if(!player.includes(key)&&!vehicle.includes(key)){e.infoAppearance=id;if(['fade','capsule','solid','split','ticket','ribbon','glass','terminal','tab','stacked'].includes(id)&&e.backgroundOpacity===0)e.backgroundOpacity=.45;}
  const accent=catalog.find(s=>s.id===profile.playerStyle)?.color||'#22db80';
  for(const [key,e] of Object.entries(profile.elements))if(!player.includes(key)&&!vehicle.includes(key)){
   e.infoAccent=accent;e.infoAccentOpacity=1;e.infoLineColor=accent;e.infoLineOpacity=1;e.infoLineWidth=['rail','glass-cut','underline'].includes(id)?2:['seal','woven'].includes(id)?3:1;
   e.infoLineStyle=['ticket','terminal'].includes(id)?'dashed':id==='wire'?'dotted':id==='seal'?'double':'solid';
   const colored=['badge','split','stacked','orbit-card','seal','flag'].includes(id);
   e.iconBackground=colored?accent:e.background;e.iconBackgroundOpacity=colored?1:0;
   e.iconBackgroundRadius=['badge','orbit-card'].includes(id)?40:id==='split'?0:6;e.iconPadding=colored?(id==='split'?9:6):0;
   e.iconColor=contrastColor(colored?accent:e.background);
   if(!colored&&['plain','minimal','badge','underline','brackets'].includes(id))e.iconColor='#ffffff';
   e.iconShadow=!colored;e.showIcon=true;e.iconOpacity=1;
  }
  return profile;
 }
 function contrastColor(hex){const components=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);const l=.2126*components[0]+.7152*components[1]+.0722*components[2];return (l+.05)/.05>=1.05/(l+.05)?'#000000':'#ffffff';}
 function categoryPreview(target,id){
  if(target==='vehicle'||catalog.some(s=>s.id===id)&&target==='player')return preview(id);
  if(target==='info')return '<svg viewBox="0 0 160 108" aria-hidden="true"><defs><linearGradient id="info-'+id+'"><stop stop-color="#22db80" stop-opacity=".6"/><stop offset="1" stop-color="#22db80" stop-opacity="0"/></linearGradient></defs><rect x="12" y="28" width="136" height="48" rx="'+(id==='capsule'?24:6)+'" fill="'+(id==='plain'?'none':id==='fade'?'url(#info-'+id+')':'#192630')+'" stroke="'+(id==='outline'?'#a7c7d0':'none')+'"/><path d="M26 38v27" stroke="#22db80" stroke-width="2"/><circle cx="42" cy="51" r="6" fill="none" stroke="#eef0f6"/><text x="57" y="56" fill="#eef0f6" font-size="12">Information</text></svg>';
  const preset=gaugeCatalog.find(s=>s.id===id);
  if(preset.shape){const color=preset.iconColor||'#22db80',fill=preset.solid?'#22db80':'none',glyphY=preset.showValue?44:54;
   const shape=preset.shape==='disc'?'<circle cx="80" cy="54" r="32" fill="'+fill+'" stroke="#22db80" stroke-width="3"/>':'<rect x="48" y="22" width="64" height="64" rx="'+(preset.shape==='square'?0:9)+'" fill="'+fill+'" stroke="#22db80" stroke-width="3"/>';
   return '<svg viewBox="0 0 160 108" aria-hidden="true">'+shape+'<path d="M-11 -5C-18 -17 0 -20 0 -9C0 -20 18 -17 11 -5L0 8Z" transform="translate(80 '+glyphY+')" fill="none" stroke="'+color+'" stroke-width="2.5"/>'+(preset.showValue?'<text x="80" y="73" text-anchor="middle" fill="'+color+'" font-size="15">75%</text>':'')+'</svg>';
  }
  return '<svg viewBox="0 0 160 108" aria-hidden="true"><g fill="none" stroke="#22db80" stroke-width="'+preset.thickness+'">'+(['gauge-ribbon','gauge-columns','gauge-tiles'].includes(id)?'<rect x="35" y="30" width="90" height="48" rx="8"/><path d="M45 67h60"/>':'<circle cx="80" cy="54" r="32" '+(id==='gauge-segments'?'stroke-dasharray="12 7"':'')+'/>')+'</g><text x="80" y="60" text-anchor="middle" fill="#eef0f6" font-size="20">75</text></svg>';
 }
 const api={catalog,gaugeCatalog,gaugeFamilies,informationCatalog,applyGauge,applyInformation,categoryPreview,playerColors,ids:catalog.map(s=>s.id),player,vehicle,layouts,apply,preview};root.HudSkins=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
