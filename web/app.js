/* Event driven: no render loop, no external libraries, no network assets. */
(() => {
 'use strict';
 const S=window.HudSkins,P=window.HudProfile,I=window.HudI18n, $=id=>document.getElementById(id), hud=$('hud');
 let profile=P.defaults(), saved=P.copy(profile), data={}, visible=false, editing=false, cinema=false, selected='health', drag=null, confirmResolve=null, notificationTimers=new Set();
 const nodes=new Map();let selectedKeys=new Set(['health']),marquee=null;const editorOptions={showHiddenInEditor:true};
 const demo={health:82,armor:65,hunger:72,thirst:60,stamina:85,oxygen:75,stress:22,speed:118,rpm:72,gear:4,fuel:64,engine:88,belt:true,cruise:false,talking:true,voice:3,voiceLevel:2,radio:1,street:'Vespucci Boulevard',zone:'Pillbox Hill',heading:180,cash:1250,bank:18500,job:'Mécanicien',id:12,vehicle:true,underwater:true,indicatorLeft:true,indicatorRight:true,hazards:false,indicatorBlink:true};
 const anchors=P.anchors;
 const globalSettings={destination:['Afficher le repère d’arrivée GPS','checkbox'],language:['Langue',I.codes()],playerOrientation:['Orientation du bloc de jauges',['horizontal','vertical']],carFrame:['Cadre autour du HUD véhicule','checkbox'],carShadow:['Ombre du HUD véhicule','checkbox'],scale:['Échelle générale','number',.5,2,.05],unit:['Unité de vitesse',['kmh','mph']],quality:['Qualité',['economy','standard']],demo:['Données de démonstration','checkbox'],grid:['Afficher la grille','checkbox'],snap:['Magnétisme (20 px)','checkbox'],step:['Pas clavier (px)','number',1,30,1],minimap:['Afficher la minimap','checkbox'],minimapMode:['Affichage minimap',['always','vehicle']],showHiddenInEditor:['Voir les éléments masqués en édition','checkbox'],minimapFrame:['Cadre de la minimap','checkbox'],minimapShadow:['Ombre de la minimap','checkbox'],minimapFrameColor:['Couleur du cadre','color'],minimapFrameStyle:['Style de bordure',['solid','dashed','dotted','double']],minimapFrameWidth:['Épaisseur de bordure (px)','number',0,12,1],minimapFrameOpacity:['Opacité de bordure (0 = transparente)','number',0,1,.05],minimapFrameRadius:['Arrondi du cadre rectangulaire (px)','number',0,40,1],minimapShadowOpacity:['Opacité de l’ombre','number',0,1,.05],minimapShadowSize:['Diffusion de l’ombre (px)','number',0,30,1],minimapAlignX:['Alignement cadre X (px à 1080p)','number',-100,100,1],minimapAlignY:['Alignement cadre Y (px à 1080p)','number',-100,100,1],minimapRoundAlignX:['Cadre circulaire : alignement X','number',-100,100,1],minimapRoundAlignY:['Cadre circulaire : alignement Y','number',-100,100,1],minimapRoundFrameScale:['Cadre circulaire : diamètre','number',.5,1.5,.01],minimapShape:['Forme minimap',['square','round']],minimapX:['Décalage minimap X','number',-.5,.5,.005],minimapY:['Décalage minimap Y','number',-.5,.5,.005],minimapScale:['Échelle minimap','number',.5,1.5,.05]};
 const settings={infoLineColor:['Couleur des contours','color'],infoLineOpacity:['Opacité des contours','number',0,1,.05],"infoAccent":["Couleur de l’accent","color"],"infoAccentOpacity":["Opacité de l’accent","number",0,1,0.05],"infoLineWidth":["Épaisseur des contours","number",0,12,0.5],"infoLineStyle":["Style des contours",["none","solid","dashed","dotted","double"]],"infoOutlineWidth":["Épaisseur du contour secondaire","number",0,8,0.5],"infoOutlineOffset":["Décalage du contour secondaire","number",0,16,1],"infoGap":["Espace entre icône et texte","number",0,40,1],"infoBlur":["Flou du fond","number",0,30,1],"infoCutSize":["Taille des découpes","number",0,40,1],"infoPatternOpacity":["Opacité du motif","number",0,1,0.05],"infoPatternSize":["Espacement du motif","number",2,30,1],"infoPatternAngle":["Angle du motif","number",-360,360,5],"infoDecoration":["Afficher les repères décoratifs","checkbox"],"infoDecorationSize":["Taille des repères","number",1,30,1],"infoIconShape":["Forme du fond de l’icône",["style","round","square","hexagon"]],"infoContentLayout":["Disposition du contenu",["style","row","column"]],iconBackground:['Fond de l’icône','color'],iconBackgroundOpacity:['Opacité du fond de l’icône','number',0,1,.05],iconBackgroundRadius:['Arrondi du fond de l’icône','number',0,40,1],iconPadding:['Espacement dans le fond de l’icône','number',0,16,1],gradientReverse:["Inverser le dégradé du bloc","checkbox"],blockShadow:['Ombre du bloc','checkbox'],textShadow:['Ombre du texte','checkbox'],iconShadow:['Ombre de l’icône','checkbox'],voiceLevels:['Nombre de portées vocales','number',1,10,1],voiceActiveColor:['Couleur quand vous parlez','color'],fontFamily:['Police',['style','segoe','arial','bahnschrift','consolas','georgia']],fontWeight:['Graisse du texte',['style','400','500','600','700']],infoAppearance:['Aspect',S.informationCatalog.map(s=>s.id)],iconSize:['Taille de l’icône','number',10,64,1],cardRadius:['Arrondi du bloc','number',0,40,1],cardPadding:['Espacement intérieur','number',0,24,1],enabled:['Afficher','checkbox'],hideAtZero:['Masquer si la jauge est à zéro','checkbox'],model:['Modèle',P.models],condition:['Condition',['always','vehicle','underwater','notfull','nonzero']],x:['X (0 → 1)','number',0,1,.001],y:['Y (0 → 1)','number',0,1,.001],anchor:['Ancrage',Object.keys(anchors)],width:['Largeur','number',24,500,1],height:['Hauteur','number',20,300,1],scale:['Taille','number',.4,3,.05],rotation:['Rotation °','number',-180,180,1],z:['Superposition','number',0,100,1],locked:['Verrouiller','checkbox'],group:['Groupe (même nom = déplacement lié)','text'],color:['Couleur','color'],background:['Fond','color'],text:['Texte','color'],iconColor:['Icône','color'],border:['Contour','color'],opacity:['Opacité globale','number',0,1,.05],backgroundOpacity:['Opacité fond','number',0,1,.05],textOpacity:['Opacité texte','number',0,1,.05],iconOpacity:['Opacité icône','number',0,1,.05],borderOpacity:['Opacité contour','number',0,1,.05],label:['Libellé','text'],icon:['Icône (texte)','text'],showLabel:['Libellé visible','checkbox'],showValue:['Valeur visible','checkbox'],showIcon:['Icône visible','checkbox'],fontSize:['Taille de texte','number',8,60,1],align:['Alignement',['left','center','right']],thickness:['Épaisseur','number',1,25,1],radius:['Rayon','number',10,48,1],startAngle:['Angle de départ','number',-360,360,1],arcAngle:['Étendue de l’arc','number',30,360,1],segments:['Nombre de segments','number',2,24,1],gap:['Espacement segments','number',0,10,1],reverse:['Inverser remplissage','checkbox'],threshold:['Seuil alerte %','number',0,100,1],alertHigh:['Alerte au-dessus du seuil','checkbox'],alertColor:['Couleur alerte','color'],animation:['Transition légère','checkbox'],max:['Maximum du cadran','number',1,500,1]};
 const pictograms={indicatorLeft:'M20 9H11V4L3 12L11 20V15H20Z',indicatorRight:'M4 9H13V4L21 12L13 20V15H4Z',hazards:'M12 3L2 21H22ZM12 9V14M12 17V18',
 gear:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1ZM9 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0',
 health:'M12 20 3.6 12a5 5 0 0 1 7-7L12 6.4 13.4 5a5 5 0 0 1 7 7Z',
 armor:'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6Z',
 hunger:'M5 3v7m3-7v7M3 7h7M6.5 10v11M17 3c-3 4-3 8 0 9h3V3m0 9v9',
 thirst:'M12 2S4 11 4 15a8 8 0 0 0 16 0c0-4-8-13-8-13ZM8 15c0 3 2 4 4 4',
 stamina:'M14 2 5 13h7l-2 9 9-13h-7Z',
 oxygen:'M10 3v7M14 3v7M10 10C8 3 3 9 3 17c0 5 7 4 7 1V10Zm4 0c2-7 7-1 7 7 0 5-7 4-7 1V10Z',
 stress:'M12 3 2 21h20ZM12 9v5m0 3v1',
 fuel:'M4 21V4h10v17M4 9h10M2 21h14M14 8h3l3 3v7c0 3-3 3-3 0v-5M17 3l4 4v4',
 engine:'M3 9h3V6h10l3 3h3v9h-3l-3 3H6v-3H3ZM8 3h6M11 3v3M1 11v5',
 belt:'M9 4a3 3 0 1 0 6 0 3 3 0 0 0-6 0M7 11h10l2 10H5ZM4 3l16 18M5 16l14-5',
 cruise:'M3 17a9 9 0 1 1 18 0M12 16l5-6M4 17h3m10 0h3M12 5v3M6 8l2 2',
 voice:'M9 4a3 3 0 0 1 6 0v8a3 3 0 0 1-6 0ZM5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8',
 radio:'M6 6h12v16H6ZM9 11h6M9 16h6M9 3v3m6-5v5',
 rpm:'M3 17a9 9 0 1 1 18 0M12 16l5-6M5 7l2 2M12 4v3M18 7l-2 2'
 };
 const imageIcons=["indicatorLeft","indicatorRight","hazards","gear", "health", "armor", "hunger", "thirst", "stamina", "oxygen", "stress", "fuel", "engine", "belt", "cruise", "voice", "radio", "rpm", "speed", "street", "zone", "heading", "cash", "bank", "job", "id"];
 const defaultIcons=P.builtinDefaults().elements;
 const translations={solid:'Continue',dashed:'Tirets',dotted:'Pointillés',double:'Double',style:'Selon le style',segoe:'Segoe UI',arial:'Arial',bahnschrift:'Bahnschrift',consolas:'Consolas',georgia:'Georgia',minimal:'Icône et texte avec accent',fade:'Fond dégradé',capsule:'Capsule arrondie',horizontal:'Horizontal',plain:'Sans fond',outline:'Contour',solid:'Fond uni','400':'Normal','500':'Moyen','600':'Semi-gras','700':'Gras',bar:'Barre horizontale',vertical:'Barre verticale',circle:'Cercle',arc:'Arc',ring:'Anneau',square:'Instrument carré',segments:'Segments',icon:'Icône remplie',always:'Toujours',vehicle:'En véhicule',underwater:'Sous l’eau',notfull:'Si inférieur au maximum',nonzero:'Si supérieur à zéro',economy:'Économique',standard:'Standard',kmh:'km/h',mph:'mph',round:'Ronde','top-left':'Haut gauche','top-right':'Haut droite','bottom-left':'Bas gauche','bottom-right':'Bas droite',center:'Centre',left:'Gauche',right:'Droite'};
 async function post(name,payload={}) {
  if(typeof GetParentResourceName!=='function')return {ok:true};
  const response=await fetch('https://'+GetParentResourceName()+'/'+name,{method:'POST',headers:{'Content-Type':'application/json; charset=UTF-8'},body:JSON.stringify(payload)});
  if(!response.ok)throw Error('Communication interrompue.');
  const result=await response.json(); if(result&&result.ok===false)throw Error(result.error||'Action refusée.');return result;
 }
 function feedback(message){$('feedback').textContent=message;}
 const rgba=(hex,alpha)=>'rgba('+[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(',')+','+alpha+')';
 function svg(tag,attrs){const node=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>node.setAttribute(k,v));return node;}
 function isDial(key,e){return P.gauges.includes(key)||key==='speed';}
 function build(key){
  const e=profile.elements[key], n=document.createElement('div');n.className='hud-element';n.dataset.key=key;n.setAttribute('aria-label',e.label);const parts={root:n};
  const gaugePreset=S.player.includes(key)?S.gaugeCatalog.find(s=>s.id===skinId(key)):null;
  if(gaugePreset?.solid){const level=document.createElement('span');level.className='solid-level';level.setAttribute('aria-hidden','true');n.append(level);parts.solidLevel=level;}
  if(isDial(key,e)){
   if(e.model==='square'){
    const art=svg('svg',{viewBox:'0 0 100 100',preserveAspectRatio:'none',class:'gauge-art square-art','aria-hidden':'true'});
    const contour=gaugePreset?.contour||'M12 88V18L18 12H82L88 18V82L82 88Z';
    const track=svg('path',{d:contour,pathLength:100,class:'gauge-track'});
    const fill=svg('path',{d:contour,pathLength:100,class:'gauge-fill'});art.append(track,fill);
    for(let i=0;i<=10;i++){const x=20+i*6;art.append(svg('path',{d:'M'+x+' 17v'+(i%5===0?5:2),class:'instrument-tick'}));}
    if(key==='speed'){
     parts.calibration=[];for(let i=0;i<=4;i++){const label=svg('text',{x:20+i*15,y:28,'text-anchor':'middle',class:'instrument-calibration'});art.append(label);parts.calibration.push({node:label,fraction:i/4});}
     const marker=svg('path',{d:'M0 14v8',class:'instrument-marker'});art.append(marker);parts.marker=marker;
    }
    n.append(art);parts.fill=fill;parts.arc=1;
   }else if(['circle','arc','ring'].includes(e.model)){
    const art=svg('svg',{viewBox:'0 0 100 100',class:'gauge-art','aria-hidden':'true'});const attrs={cx:50,cy:50,r:e.model==='circle'?e.radius/2:e.radius,pathLength:100,transform:'rotate('+(e.startAngle-90)+' 50 50)'};
    const track=svg('circle',{...attrs,class:'gauge-track'}),fill=svg('circle',{...attrs,class:'gauge-fill'});art.append(track,fill);n.append(art);parts.fill=fill;
    const arc=e.model==='arc'?e.arcAngle/360:1;track.setAttribute('stroke-dasharray',arc*100+' 100');parts.arc=arc;
    if(e.model==='circle'){track.style.strokeWidth=String(e.radius);fill.style.strokeWidth=String(e.radius);}
   }else if(e.model!=='icon'){
    const track=document.createElement('div');track.className='bar-track';n.append(track);
    if(e.model==='segments'){parts.segments=[];for(let i=0;i<e.segments;i++){const s=document.createElement('span');s.className='segment';track.append(s);parts.segments.push(s);}}
    else {const fill=document.createElement('div');fill.className='bar-fill';track.append(fill);parts.fill=fill;}
   }
  }
  for(const name of ['icon','value','label']){const item=document.createElement('span');item.className=name;n.append(item);parts[name]=item;}
  if(key==='speed'){const unit=document.createElement('span');unit.className='unit';n.append(unit);parts.unit=unit;}
  if(categoryFor(key)==='info'){const content=document.createElement('span');content.className='info-content';content.append(parts.label,parts.value);const row=document.createElement('span');row.className='info-row';row.append(parts.icon,content);n.append(row);}
  if(gaugePreset?.decoration){const art=n.querySelector('.gauge-art');if(art){
   if(gaugePreset.decoration==='orbit'){art.append(svg('circle',{cx:50,cy:50,r:47,class:'gauge-decoration'}));for(const angle of [35,155,275]){const r=angle*Math.PI/180;art.append(svg('circle',{cx:50+47*Math.cos(r),cy:50+47*Math.sin(r),r:2.4,class:'gauge-satellite'}));}}
   else for(let i=0;i<=20;i++){const angle=(135+i*13.5)*Math.PI/180;art.append(svg('path',{d:'M'+(50+46*Math.cos(angle))+' '+(50+46*Math.sin(angle))+'L'+(50+(i%5===0?41:43)*Math.cos(angle))+' '+(50+(i%5===0?41:43)*Math.sin(angle)),class:'gauge-decoration'}));}
  }}
  const grip=document.createElement('span');grip.className='resize-handle';grip.title='Glisser pour redimensionner';grip.setAttribute('aria-label','Redimensionner '+e.label);n.append(grip);
  decorate(key,parts);nodes.set(key,parts);hud.append(n);style(key);render(key,true);
 }
 function skinId(key){return S.vehicle.includes(key)?profile.carStyle:S.player.includes(key)&&profile.gaugeStyle&&profile.gaugeStyle!=='style'?profile.gaugeStyle:profile.playerStyle;}
 function decorate(key,p){
  const id=skinId(key),e=profile.elements[key];if(key==='rpm'&&['grand','sky','neon','wanted'].includes(id)&&p.root.querySelector('svg.gauge-art')){
   const art=p.root.querySelector('svg.gauge-art');for(let i=0;i<=20;i++){const angle=(e.startAngle-90+i*e.arcAngle/20)*Math.PI/180,r=e.radius;const tick=svg('path',{d:'M'+(50+Math.cos(angle)*(r-4))+' '+(50+Math.sin(angle)*(r-4))+'L'+(50+Math.cos(angle)*(r-(i%4===0?8:6)))+' '+(50+Math.sin(angle)*(r-(i%4===0?8:6))),class:'skin-tick'});art.append(tick);if(i%4===0){const label=svg('text',{x:50+Math.cos(angle)*(r-13),y:51+Math.sin(angle)*(r-13),'text-anchor':'middle',class:'skin-tick-label'});label.textContent=i*5;art.append(label);}}
  }
 }
 function rebuild(){hud.dataset.carStyle=profile.carStyle;hud.dataset.playerStyle=profile.playerStyle;hud.replaceChildren();nodes.clear();Object.keys(P.labels).forEach(build);{const housing=document.createElement('div');housing.id='car-housing';housing.setAttribute('aria-hidden','true');hud.prepend(housing);}hud.classList.toggle('editing',editing);hud.classList.toggle('grid',editing&&profile.grid);visibility();updateMinimap();}
 function updateHousing(){const housing=$('car-housing');if(!housing)return;const showPanel=profile.carStyle==='panel';const boxes=S.vehicle.filter(key=>nodes.get(key)&&!nodes.get(key).root.hidden).map(key=>P.bounds(profile.elements[key],innerWidth,innerHeight,profile.scale));if(!boxes.length||!(showPanel||profile.carFrame||profile.carShadow)){housing.hidden=true;return;}housing.hidden=false;const padding=10*viewportScale()*profile.scale,left=Math.min(...boxes.map(b=>b.left))-padding,top=Math.min(...boxes.map(b=>b.top))-padding,right=Math.max(...boxes.map(b=>b.left+b.width))+padding,bottom=Math.max(...boxes.map(b=>b.top+b.height))+padding;Object.assign(housing.style,{left:left+'px',top:top+'px',width:right-left+'px',height:bottom-top+'px',backgroundColor:showPanel?rgba(profile.elements.speed.background,profile.elements.speed.backgroundOpacity):'transparent',borderColor:showPanel||profile.carFrame?rgba(profile.elements.speed.border,profile.elements.speed.borderOpacity||.6):'transparent',boxShadow:profile.carShadow?'0 3px 12px 3px rgba(0,0,0,.7)':'none'});}
 function viewportScale(){return Math.max(.65,Math.min(2,innerHeight/1080));}
 // A contrasting edge protects custom colours as well as the supplied palettes.
 function contrastEdge(color){const rgb=color.slice(1).match(/../g).map(value=>parseInt(value,16)/255);const linear=rgb.map(value=>value<=.04045?value/12.92:Math.pow((value+.055)/1.055,2.4));return .2126*linear[0]+.7152*linear[1]+.0722*linear[2]<.18?'rgba(255,255,255,.9)':'rgba(0,0,0,.95)';}
 function style(key){const e=profile.elements[key], p=nodes.get(key),n=p.root,[ax,ay]=anchors[e.anchor];const scale=viewportScale()*profile.scale*e.scale;
  n.className='hud-element '+(P.vehicle.includes(key)?'vehicle-element ':S.player.includes(key)?'player-element ':'info-element ')+(isDial(key,e)?e.model==='icon'?'icon-model':e.model:'text-element')+(key==='speed'&&isDial(key,e)?' speed-dial':'')+(e.reverse?' reverse':'')+(e.locked?' locked':'')+(editing&&selectedKeys.has(key)?' selected':'')+(profile.quality==='standard'&&e.animation?' smooth':'');
  Object.assign(n.style,{left:e.x*100+'%',top:e.y*100+'%',width:e.width+'px',height:e.height+'px',transform:'scale('+scale+') translate('+ax+'%,'+ay+'%) rotate('+e.rotation+'deg)',opacity:e.opacity,fontSize:e.fontSize+'px',zIndex:e.z,textAlign:e.align,borderColor:rgba(e.border,e.borderOpacity),backgroundColor:rgba(e.background,e.backgroundOpacity)});
  n.style.setProperty('--gradient-turn',e.gradientReverse?'180deg':'0deg');
  const gaugePreset=categoryFor(key)==='player'?S.gaugeCatalog.find(s=>s.id===skinId(key)):null;
  n.dataset.gaugeSolid=String(Boolean(gaugePreset?.solid));n.dataset.gaugeShape=gaugePreset?.shape||'';n.dataset.gaugeValue=String(e.showValue);n.style.setProperty('--gauge-text',rgba(e.text,e.textOpacity));
  n.style.clipPath=gaugePreset?.clip||'';
  if(gaugePreset?.solid)n.style.backgroundColor=rgba(e.background,e.backgroundOpacity);
  const infoRow=n.querySelector('.info-row');
  if(infoRow)infoRow.style.flexDirection=e.align==='right'?'row-reverse':'row';
  const fonts={segoe:'"Segoe UI",sans-serif',arial:'Arial,sans-serif',bahnschrift:'Bahnschrift,"Segoe UI",sans-serif',consolas:'Consolas,monospace',georgia:'Georgia,serif'};
  for(const part of [p.value,p.label,p.unit].filter(Boolean)){
   if(fonts[e.fontFamily])part.style.setProperty('font-family',fonts[e.fontFamily],'important');else part.style.removeProperty('font-family');
   if(e.fontWeight!=='style')part.style.setProperty('font-weight',e.fontWeight,'important');else part.style.removeProperty('font-weight');
  }
  if(categoryFor(key)==='vehicle'){p.value.style.setProperty('font-size',e.fontSize+'px','important');if(p.unit)p.unit.style.setProperty('font-size',Math.max(8,e.fontSize*.23)+'px','important');}
  n.style.setProperty('--info-icon-size',e.iconSize+'px');
  if(categoryFor(key)==='info'){n.dataset.infoAppearance=e.infoAppearance;n.dataset.blockShadow=String(e.blockShadow);n.dataset.textShadow=String(e.textShadow);n.dataset.iconShadow=String(e.iconShadow);n.style.justifyContent=({left:'flex-start',center:'center',right:'flex-end'})[e.align];n.style.alignItems='center';n.style.setProperty('--card-shadow',e.blockShadow?'0 2px 7px rgba(0,0,0,.55)':'0 0 transparent');n.style.setProperty('--card-border',e.border);n.style.setProperty('--card-background',rgba(e.background,e.backgroundOpacity));n.style.setProperty('--card-radius',e.cardRadius+'px');n.style.setProperty('--card-padding',e.cardPadding+'px');}
  if(p.calibration)p.calibration.forEach(({node,fraction})=>node.textContent=Math.round(e.max*fraction*(profile.unit==='mph'?.621371:1)));
  n.style.setProperty('--track',rgba(e.background,e.backgroundOpacity));n.style.setProperty('--thickness',e.thickness+'px');n.style.setProperty('--gap',e.gap+'px');
  n.style.setProperty('--text-edge',contrastEdge(e.text));n.style.setProperty('--icon-edge',contrastEdge(e.iconColor));
  if(['street','zone'].includes(key))n.style.setProperty('--location-height',e.height+'px');
  if(p.unit){p.unit.textContent=profile.unit==='mph'?'mph':'km/h';p.unit.hidden=!e.showValue;p.unit.style.color=rgba(e.text,e.textOpacity);}
  n.style.setProperty('--info-accent',categoryFor(key)==='info'?rgba(e.infoAccent,e.infoAccentOpacity):(S.catalog.find(skin=>skin.id===profile.playerStyle)?.color||'#ffffff'));
  if(categoryFor(key)==='info'){n.dataset.contentAlign=e.align;n.dataset.infoDecoration=String(e.infoDecoration);n.dataset.infoContentLayout=e.infoContentLayout;n.dataset.infoIconShape=e.infoIconShape;for(const [field,css] of Object.entries({infoLineWidth:'info-line-width',infoOutlineWidth:'info-outline-width',infoOutlineOffset:'info-outline-offset',infoGap:'info-gap',infoBlur:'info-blur',infoCutSize:'info-cut',infoPatternSize:'info-pattern-size',infoDecorationSize:'info-decoration-size'}))n.style.setProperty('--'+css,e[field]+'px');n.style.setProperty('--info-line-style',e.infoLineStyle);n.style.setProperty('--info-line-color',rgba(e.infoLineColor,e.infoLineOpacity));n.style.setProperty('--info-pattern-alpha',e.infoPatternOpacity);n.style.setProperty('--info-pattern-angle',e.infoPatternAngle+'deg');}n.dataset.skin=skinId(key);n.dataset.category=categoryFor(key);n.classList.toggle('skin-overlay',S.vehicle.includes(key)&&['grand','zurg','wanted','sky','panel'].includes(skinId(key))&&['rpm','engine','fuel'].includes(key)&&e.width>150);
  p.label.textContent=e.label===P.labels[key]?I.translate(e.label):e.label;p.label.hidden=categoryFor(key)==='info'||!e.showLabel;p.icon.replaceChildren();
  const useImage=imageIcons.includes(key)&&e.icon===defaultIcons[key].icon;
  p.icon.classList.toggle('pictogram',useImage);p.icon.classList.toggle('image-icon',useImage);
  if(useImage){const image=document.createElement('span');image.className='icon-image';image.setAttribute('aria-hidden','true');image.style.setProperty('--icon-image','url("icons/'+key+'.svg")');p.icon.append(image);const fill=image.cloneNode(true);fill.classList.add('icon-fill');p.icon.append(fill);}else p.icon.textContent=e.icon;
  if(categoryFor(key)==='info'){p.icon.style.backgroundColor=rgba(e.iconBackground,e.iconBackgroundOpacity);p.icon.style.borderRadius=e.iconBackgroundRadius+'px';p.icon.style.padding=e.iconPadding+'px';}
  p.icon.dataset.icon=e.icon;p.icon.hidden=!e.showIcon;p.value.hidden=!e.showValue;
  p.icon.style.color=rgba(e.iconColor,e.iconOpacity);p.icon.style.setProperty('--icon-color',rgba(e.iconColor,e.iconOpacity));p.label.style.color=p.value.style.color=rgba(e.text,e.textOpacity);n.setAttribute('aria-label',e.label);
 }
 function current(){return editing&&profile.demo?{...demo,talking:data.talking===true,belt:typeof data.belt==='boolean'?data.belt:demo.belt,indicatorLeft:data.indicatorLeft??demo.indicatorLeft,indicatorRight:data.indicatorRight??demo.indicatorRight,hazards:data.hazards??demo.hazards,indicatorBlink:data.indicatorBlink??true}:data;}
 let externalVisibility={hud:false,minimap:false,elements:{}};
 function allowed(key,e,d){return !externalVisibility.elements[key]&&P.available(key,e,d,editing&&editorOptions.showHiddenInEditor);}
 function format(key,value,d){if(value===undefined||value===null)return '—';if(key==='speed'){const speed=Math.round(Number(value)*(profile.unit==='mph'?.621371:1));return ['zurg','ursu'].includes(profile.carStyle)?String(speed).padStart(3,'0'):speed;}if(['belt','cruise','indicatorLeft','indicatorRight','hazards'].includes(key))return value?'ON':'OFF';if(key==='voice')return (d.talking?'● ':'')+Number(value).toFixed(1)+' m';if(key==='radio')return Number(value)>0?'CH '+value:I.translate('Hors radio');if(key==='heading'){const compass=['N','NE','E','SE','S',I.translate('SO'),I.translate('O'),I.translate('NO')];return compass[Math.round(Number(value)/45)%8]+' '+Math.round(Number(value))+'°';}if(key==='job'&&editing&&profile.demo)return I.translate(String(value));if(key==='cash'||key==='bank')return Number(value).toLocaleString(I.language)+' $';if(P.gauges.includes(key))return Math.round(Number(value))+'%';return String(value).slice(0,['street','zone'].includes(key)?256:100);}
 function render(key,force=false){const p=nodes.get(key),e=profile.elements[key],d=current();if(!p)return;const show=allowed(key,e,d);p.root.hidden=!show;p.root.classList.toggle('disabled-preview',editing&&!e.enabled);if(!show)return;p.root.setAttribute('aria-label',I.translate(e.label)+' : '+format(key,d[key],d));p.root.classList.toggle('active-status',['belt','cruise'].includes(key)&&d[key]===true);
  const text=format(key,d[key],d);if(force||p.value.textContent!==text)p.value.textContent=text;
  if(['indicatorLeft','indicatorRight','hazards'].includes(key)){const on=d[key]===true&&d.indicatorBlink!==false;p.root.classList.toggle('signal-on',on);const color=rgba(on?e.color:e.iconColor,e.iconOpacity);p.icon.style.color=color;p.icon.style.setProperty('--icon-color',color);}
  if(key==='belt'||key==='cruise'){
   const active=d[key]===true;
   p.root.dataset.statusActive=String(active);
   const statusColor=rgba(active?'#22db80':key==='belt'?e.alertColor:e.iconColor,e.iconOpacity);p.icon.style.setProperty('--icon-color',statusColor);p.icon.style.color=statusColor;
  }
  if(isDial(key,e)){
   const voice=key==='voice'?P.voiceGauge(d,e):null;const v=key==='radio'?(Number(d.radio)>0?100:0):voice?voice.percent:Math.max(0,Math.min(100,Number(d[key]||0)/(key==='speed'?e.max:100)*100));
   if(voice){p.root.classList.toggle('voice-active',voice.active);p.root.style.setProperty('--voice-glow',rgba(e.voiceActiveColor,.5));p.root.style.setProperty('--fill',voice.color);p.icon.style.setProperty('--icon-color',rgba(voice.active&&p.root.dataset.gaugeSolid!=='true'?e.voiceActiveColor:e.iconColor,e.iconOpacity));}
   if(p.solidLevel){
    const level=Number.isFinite(v)?Math.max(0,Math.min(100,v)):0;
    const alert=e.alertHigh?level>=e.threshold:level<=e.threshold;
    p.solidLevel.style.backgroundColor=rgba(voice?voice.color:alert?e.alertColor:e.color,e.backgroundOpacity);
    p.solidLevel.style.clipPath=e.reverse?'inset(0 0 '+(100-level)+'% 0)':'inset('+(100-level)+'% 0 0 0)';
    p.root.style.setProperty('--solid-level',level+'%');
    const iconColor=e.iconColor==='#000000'&&level<55?'#eef0f6':e.iconColor;
    const textColor=e.text==='#000000'&&level<35?'#eef0f6':e.text;
    p.icon.style.setProperty('--icon-color',rgba(iconColor,e.iconOpacity));p.value.style.color=rgba(textColor,e.textOpacity);p.root.style.setProperty('--gauge-text',rgba(textColor,e.textOpacity));
   }
   if(force||p.percent!==v){p.percent=v;const fraction=v/100;p.root.style.setProperty('--fraction',fraction);if(p.marker)p.marker.setAttribute('transform','translate('+(20+60*fraction)+' 0)');
    const alert=e.alertHigh?v>=e.threshold:v<=e.threshold;if(!voice)p.root.style.setProperty('--fill',alert?e.alertColor:e.color);
    if(p.fill&&p.arc!==undefined){const length=fraction*p.arc*100;p.fill.setAttribute('stroke-dasharray',length+' '+(100-length));p.fill.setAttribute('stroke-dashoffset',e.reverse?-(p.arc*100-length):0);}
    if(p.segments)p.segments.forEach((s,i)=>s.classList.toggle('filled',(e.reverse?p.segments.length-1-i:i)<Math.ceil(fraction*p.segments.length)));
   }
  }
 }
 function compactPlayer(){const positions=P.playerPositions(profile,current(),editing),offset=P.minimapSpace(profile,current(),innerHeight,editing);for(const [key,position] of Object.entries(positions)){const node=nodes.get(key);if(node){node.root.style.left=position.x*100+'%';node.root.style.top=(position.y+offset)*100+'%';}}}
 let lastMinimapSpace=null;
 function updateMinimapSpace(){const offset=P.minimapSpace(profile,current(),innerHeight,editing);if(lastMinimapSpace===offset)return;lastMinimapSpace=offset;updateMinimap();post('minimapSpace',{offset}).catch(error=>{lastMinimapSpace=null;feedback(error.message);});}
 function layoutInformation(){
  const mapOffset=P.minimapSpace(profile,current(),innerHeight,editing);
  const keys=Object.keys(P.labels).filter(key=>categoryFor(key)==='info'&&nodes.get(key)&&!nodes.get(key).root.hidden).sort((a,b)=>profile.elements[a].y-profile.elements[b].y);
  const placed=[];
  for(const key of keys){const n=nodes.get(key).root;const offset=['street','zone','heading'].includes(key)?mapOffset:0;n.style.top=(profile.elements[key].y+offset)*100+'%';let box=n.getBoundingClientRect();
   for(const previous of editing?[]:placed){if(box.left<previous.right&&box.right>previous.left&&box.top<previous.bottom+6&&box.bottom>previous.top){const shift=previous.bottom+6-box.top;n.style.top=(parseFloat(n.style.top)+shift/innerHeight*100)+'%';box=n.getBoundingClientRect();}}
   placed.push(box);
  }
 }
 function visibility(){hud.hidden=externalVisibility.hud||cinema||!(editing||visible);if(hud.hidden){updateMinimap();return;}Object.keys(P.labels).forEach(k=>render(k));compactPlayer();layoutInformation();updateMinimapSpace();updateHousing();updateMinimap();}
 function field(container,key,spec,source,onChange){const [label,type,min,max,step]=spec,wrapper=document.createElement('label');wrapper.textContent=label;let input;
  if(Array.isArray(type)){input=document.createElement('select');type.forEach(value=>{const option=document.createElement('option');option.value=value;option.textContent=key==='language'?I.name(value):['infoIconShape','infoContentLayout'].includes(key)?value:key==='playerOrientation'?(value==='horizontal'?'Horizontal':'Vertical'):['minimapFrameStyle','infoLineStyle'].includes(key)&&value==='solid'?'Continue':key==='minimapShape'?(value==='round'?'Circulaire':'Rectangulaire'):(translations[value]||value);input.append(option);});input.value=source[key];}
  else{input=document.createElement('input');input.type=type;if(type==='checkbox')input.checked=source[key];else input.value=source[key];if(type==='number'){input.min=min;input.max=max;input.step=step;}if(type==='text')input.maxLength=key==='icon'?8:key==='group'?24:40;}
  input.dataset.field=key;input.addEventListener('change',()=>{const old=source[key];source[key]=input.type==='checkbox'?input.checked:input.type==='number'?Number(input.value):input.value;try{P.validate(profile);onChange(key);}catch(error){source[key]=old;if(input.type==='checkbox')input.checked=old;else input.value=old;feedback(error.message);}});wrapper.append(input);container.append(wrapper);
 }
 function relevant(key,e){if(selected==='voice'&&['threshold','alertHigh','alertColor'].includes(key))return false;if(['voiceLevels','voiceActiveColor'].includes(key))return selected==='voice';const info=categoryFor(selected)==='info';if(['fontFamily','fontWeight','iconSize'].includes(key))return true;if(['infoAccent','infoAccentOpacity','infoLineWidth','infoLineStyle','infoOutlineWidth','infoOutlineOffset','infoGap','infoBlur','infoCutSize','infoPatternOpacity','infoPatternSize','infoPatternAngle','infoDecoration','infoDecorationSize','infoIconShape','infoContentLayout','iconBackground','iconBackgroundOpacity','iconBackgroundRadius','iconPadding','infoAppearance','cardRadius','cardPadding','blockShadow','textShadow','iconShadow'].includes(key))return info;if(info&&['showLabel','label','group'].includes(key))return false;if(categoryFor(selected)==='vehicle'&&key==='group')return false;if(key==='hideAtZero')return P.gauges.includes(selected);if(key==='model')return selected==='voice'||selected==='radio';if(['radius','startAngle'].includes(key))return ['circle','arc','ring'].includes(e.model)&&isDial(selected,e);if(key==='arcAngle')return e.model==='arc'&&isDial(selected,e);if(['segments','gap'].includes(key))return e.model==='segments'&&isDial(selected,e);if(['thickness','reverse','threshold','alertHigh','alertColor','animation'].includes(key))return isDial(selected,e);if(key==='max')return selected==='speed'||selected==='voice';return true;}
 const categoryFor=key=>P.vehicle.includes(key)?'vehicle':['health','armor','hunger','thirst','stamina','oxygen','stress','voice','radio'].includes(key)?'player':'info';
 function updateCategory(key){const category=categoryFor(key);document.querySelectorAll('[data-category]').forEach(button=>button.classList.toggle('active',button.dataset.category===category));for(const option of $('element-list').options)option.hidden=categoryFor(option.value)!==category;}
 function select(key,keepSelection=false){
  if(!keepSelection)selectedKeys=new Set([key]);selected=key;updateCategory(key);$('element-list').value=key;$('fields').replaceChildren();
  const sections=[['Détails du bloc',['infoLineColor','infoLineOpacity',"infoAccent","infoAccentOpacity","infoLineWidth","infoLineStyle","infoOutlineWidth","infoOutlineOffset","infoGap","infoBlur","infoCutSize","infoPatternOpacity","infoPatternSize","infoPatternAngle","infoDecoration","infoDecorationSize","infoIconShape","infoContentLayout"]],['Essentiel',['enabled','hideAtZero','condition','model','scale','color','infoAppearance','voiceActiveColor','voiceLevels']],['Position et dimensions',['x','y','anchor','width','height','rotation','z','locked','group']],['Texte et apparence',['iconBackground','iconBackgroundOpacity','iconBackgroundRadius','iconPadding','gradientReverse','blockShadow','textShadow','iconShadow','fontFamily','fontWeight','iconSize','cardRadius','cardPadding','label','icon','showLabel','showValue','showIcon','fontSize','align','background','text','iconColor','border','opacity','backgroundOpacity','textOpacity','iconOpacity','borderOpacity']],['Comportement et jauge',['thickness','radius','startAngle','arcAngle','segments','gap','reverse','threshold','alertHigh','alertColor','animation','max']]];
  for(const [title,keys] of sections){const section=document.createElement(title==='Essentiel'?'section':'details');section.className='field-section';if(title!=='Essentiel'){const summary=document.createElement('summary');summary.textContent=title;section.append(summary);}const grid=document.createElement('div');grid.className='field-grid';section.append(grid);$('fields').append(section);for(const k of keys)if(relevant(k,profile.elements[key]))field(grid,k,k==='max'&&key==='voice'?['Portée maximale (m)','number',1,500,1]:settings[k],profile.elements[key],changed=>{if(changed==='infoAppearance'&&['fade','capsule','solid'].includes(profile.elements[key].infoAppearance)&&profile.elements[key].backgroundOpacity===0)profile.elements[key].backgroundOpacity=.45;if(['model','radius','startAngle','arcAngle','segments'].includes(changed))rebuild();else{style(key);render(key,true);visibility();}if(['model','infoAppearance'].includes(changed))select(key);});}
  nodes.forEach((p,k)=>p.root.classList.toggle('selected',selectedKeys.has(k)));$('selection-status').textContent=selectedKeys.size>1?selectedKeys.size+' éléments sélectionnés · Glissez pour déplacer le bloc · Réglages : '+P.labels[key]:'Réglages : '+P.labels[key];
 }
 const mapHandle=$('minimap-handle'),mapFrame=$('minimap-frame');let mapDrag=null,mapTimer=null,mapGeometry=null,radarVisible=false;
 function updateMinimap(){
  const round=profile.minimapShape==='round',offset=editing?0:(lastMinimapSpace||0),targetY=Math.min(.5,profile.minimapY+offset);
  let left,top,width,height;
  if(mapGeometry&&mapGeometry.shape===profile.minimapShape){const g=mapGeometry,ratio=profile.minimapScale/g.scale;const centerX=(g.centerX??g.left+g.width/2)+(profile.minimapX-g.x)*g.unitX+g.width*(ratio-1)/2;const centerY=(g.centerY??g.top+g.height/2)+(targetY-g.y)*g.unitY-g.height*(ratio-1)/2;width=g.width*ratio*innerWidth;height=g.height*ratio*innerHeight;left=centerX*innerWidth-width/2;top=centerY*innerHeight-height/2;}
  else{height=(round?.258:.183)*profile.minimapScale*innerHeight;width=round?height:height*(.1638*(16/9)/.183);left=(round?-.010:0)*innerWidth+profile.minimapX*innerWidth;top=(1+(round?-.030:-.047)+targetY)*innerHeight-height;}
  // Calibrate the visual window, not GTA's clipping components. Both the frame
  // and drag surface receive exactly the same correction.
  const alignmentScale=innerHeight/1080*profile.minimapScale;
  if(round){const centerX=left+width/2,centerY=top+height/2,diameter=height*profile.minimapRoundFrameScale;width=height=diameter;left=centerX-diameter/2+profile.minimapRoundAlignX*alignmentScale;top=centerY-diameter/2+profile.minimapRoundAlignY*alignmentScale;}else{left+=profile.minimapAlignX*alignmentScale;top+=profile.minimapAlignY*alignmentScale;}
  const dimensions={left:left+'px',top:top+'px',width:width+'px',height:height+'px',borderRadius:round?'50%':profile.minimapFrameRadius*alignmentScale+'px'};
  mapHandle.hidden=!editing||!profile.minimap;Object.assign(mapHandle.style,dimensions,{fontSize:13*innerHeight/1080+'px'});mapHandle.style.setProperty('--map-ui',innerHeight/1080);
  mapFrame.hidden=externalVisibility.hud||externalVisibility.minimap||!profile.minimap||!(editing||visible&&!cinema&&radarVisible)||!(profile.minimapFrame||profile.minimapShadow);
  Object.assign(mapFrame.style,dimensions,{borderStyle:profile.minimapFrameStyle,borderWidth:(profile.minimapFrame?profile.minimapFrameWidth*alignmentScale:0)+'px',borderColor:rgba(profile.minimapFrameColor,profile.minimapFrameOpacity),boxShadow:profile.minimapShadow?'0 '+2*alignmentScale+'px '+profile.minimapShadowSize*alignmentScale+'px '+3*alignmentScale+'px rgba(0,0,0,'+profile.minimapShadowOpacity+'),inset 0 0 '+profile.minimapShadowSize*.7*alignmentScale+'px rgba(0,0,0,'+(profile.minimapShadowOpacity*.73)+')':'none'});
 }

 function sendMinimapPreview(){mapTimer=null;if(!editing)return;post('previewMinimap',{profile:{minimap:profile.minimap,minimapX:profile.minimapX,minimapY:profile.minimapY,minimapScale:profile.minimapScale,minimapShape:profile.minimapShape}}).catch(error=>feedback(error.message));}
 function previewMinimap(){updateMinimap();if(editing&&mapTimer===null)mapTimer=setTimeout(sendMinimapPreview,33);}
 mapHandle.addEventListener('pointerdown',event=>{if(!editing||event.button!==0)return;mapHandle.classList.add('dragging');mapDrag={x:event.clientX,y:event.clientY,resize:Boolean(event.target.closest('.resize-handle')),scale:profile.minimapScale,width:parseFloat(mapHandle.style.width),height:parseFloat(mapHandle.style.height)};mapHandle.setPointerCapture(event.pointerId);event.preventDefault();});
 mapHandle.addEventListener('pointermove',event=>{if(!mapDrag)return;if(mapDrag.resize){const dx=event.clientX-mapDrag.x,dy=event.clientY-mapDrag.y;profile.minimapScale=Math.max(.5,Math.min(1.5,mapDrag.scale*(1+(dx*mapDrag.width+dy*mapDrag.height)/(mapDrag.width**2+mapDrag.height**2))));const input=$('global-fields').querySelector('[data-field="minimapScale"]');if(input)input.value=profile.minimapScale.toFixed(2);previewMinimap();return;}profile.minimapX=Math.max(-.5,Math.min(.5,profile.minimapX+(event.clientX-mapDrag.x)/(innerWidth*(mapGeometry?.unitX||1))));profile.minimapY=Math.max(-.5,Math.min(.5,profile.minimapY+(event.clientY-mapDrag.y)/(innerHeight*(mapGeometry?.unitY||1))));mapDrag={x:event.clientX,y:event.clientY};for(const key of ['minimapX','minimapY']){const input=$('global-fields').querySelector('[data-field="'+key+'"]');if(input)input.value=profile[key].toFixed(4);}previewMinimap();});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])mapHandle.addEventListener(event,()=>{if(!mapDrag)return;mapDrag=null;mapHandle.classList.remove('dragging');clearTimeout(mapTimer);sendMinimapPreview();});
 function globalFields(){I.setLanguage(profile.language);
  const container=$('global-fields');container.replaceChildren();
  const groups=[
   ['Affichage général',['language','destination','playerOrientation','scale','unit','quality','demo']],
   ['Édition et placement',['showHiddenInEditor','grid','snap','step']],
   ['Minimap : affichage et dimensions',['minimap','minimapMode','minimapShape','minimapScale','minimapX','minimapY']],
   ['Minimap : bordure et ombre',['minimapFrame','minimapFrameStyle','minimapFrameColor','minimapFrameWidth','minimapFrameOpacity','minimapFrameRadius','minimapShadow','minimapShadowOpacity','minimapShadowSize']],
   ['HUD véhicule : cadre et ombre',['carFrame','carShadow']],
   ['Alignement avancé de la minimap',profile.minimapShape==='round'?['minimapRoundAlignX','minimapRoundAlignY','minimapRoundFrameScale']:['minimapAlignX','minimapAlignY']]
  ];
  groups.forEach(([title,keys],index)=>{const section=document.createElement(index===5?'details':'section');section.className='settings-section';const heading=document.createElement(index===5?'summary':'h3');heading.textContent=title;section.append(heading);const grid=document.createElement('div');grid.className='field-grid';section.append(grid);container.append(section);
   keys.filter(key=>key!=='minimapFrameRadius'||profile.minimapShape==='square').forEach(key=>field(grid,key,globalSettings[key],key==='showHiddenInEditor'?editorOptions:profile,changed=>{if(changed==='language')I.setLanguage(profile.language);if(changed==='playerOrientation')P.arrangePlayer(profile,profile.playerOrientation,innerWidth,innerHeight);rebuild();previewMinimap();if(changed==='minimapShape')globalFields();}));
  });
 }

 function open(state){if(state===editing)return;if(state){saved=P.copy(profile);editing=true;const panel=$('editor');panel.classList.remove('collapsed');$('collapse').textContent='−';$('collapse').setAttribute('aria-expanded','true');$('collapse').setAttribute('aria-label','Réduire le panneau');for(const property of ['left','top','right','transform'])panel.style.removeProperty(property);previewMinimap();$('editor').hidden=false;globalFields();select(selected);renderGallery();}else{profile=P.copy(saved);I.setLanguage(profile.language);editing=false;marquee=null;$('selection-box').hidden=true;mapDrag=null;clearTimeout(mapTimer);mapTimer=null;mapHandle.classList.remove('dragging');$('editor').hidden=true;drag=null;resolveConfirm(false);previewMinimap();}rebuild();}
 async function cancel(){try{await post('close');profile=P.copy(saved);open(false);rebuild();}catch(error){feedback(error.message);}}
 async function save(){const button=$('save');button.disabled=true;try{const clean=P.validate(profile);await post('save',{profile:clean});profile=clean;saved=P.copy(clean);await post('close');open(false);}catch(error){feedback(error.message);}finally{button.disabled=false;}}
 function syncPositions(){for(const field of ['x','y']){const input=$('fields').querySelector('[data-field="'+field+'"]');if(input)input.value=Number(profile.elements[selected][field].toFixed(4));}}
 function move(key,dx,dy){const e=profile.elements[key];if(e.locked)return;const keys=selectedKeys.size>1&&selectedKeys.has(key)?[...selectedKeys].filter(k=>!profile.elements[k].locked):Object.keys(profile.elements).filter(k=>k===key||categoryFor(key)==='player'&&e.group&&profile.elements[k].group===e.group&&!profile.elements[k].locked);let lowX=-1,highX=1,lowY=-1,highY=1;keys.forEach(k=>{const v=profile.elements[k];lowX=Math.max(lowX,-v.x);highX=Math.min(highX,1-v.x);lowY=Math.max(lowY,-v.y);highY=Math.min(highY,1-v.y);});dx=Math.min(highX,Math.max(lowX,dx));dy=Math.min(highY,Math.max(lowY,dy));keys.forEach(k=>{const v=profile.elements[k];v.x+=dx;v.y+=dy;style(k);});syncPositions();updateHousing();}
 hud.addEventListener('pointerdown',event=>{if(!editing||event.button!==0)return;const node=event.target.closest('.hud-element');if(!node)return;select(node.dataset.key,selectedKeys.size>1&&selectedKeys.has(node.dataset.key));showElementSettings();if(profile.elements[selected].locked)return;drag={key:selected,x:event.clientX,y:event.clientY,resize:Boolean(event.target.closest('.resize-handle')),element:P.copy(profile.elements[selected])};node.setPointerCapture(event.pointerId);event.preventDefault();});
 hud.addEventListener('pointermove',event=>{if(!drag)return;if(drag.resize){profile.elements[drag.key]=P.resizeElement(drag.element,event.clientX-drag.x,event.clientY-drag.y,innerWidth,innerHeight,profile.scale);style(drag.key);for(const field of ['scale','x','y']){const input=$('fields').querySelector('[data-field="'+field+'"]');if(input)input.value=Number(profile.elements[drag.key][field].toFixed(4));}if(categoryFor(drag.key)==='info')layoutInformation();updateHousing();return;}const e=profile.elements[drag.key];let dx=(event.clientX-drag.x)/innerWidth,dy=(event.clientY-drag.y)/innerHeight;if(profile.snap){dx=(Math.round((e.x*innerWidth+event.clientX-drag.x)/20)*20)/innerWidth-e.x;dy=(Math.round((e.y*innerHeight+event.clientY-drag.y)/20)*20)/innerHeight-e.y;}move(drag.key,dx,dy);drag.x=event.clientX;drag.y=event.clientY;});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])hud.addEventListener(name,()=>{drag=null;});
 function showElementSettings(){
  document.querySelectorAll('.tab').forEach(tab=>tab.hidden=tab.id!=='elements');document.querySelectorAll('[data-tab]').forEach(button=>button.classList.toggle('active',button.dataset.tab==='elements'));
  const panel=$('editor');panel.classList.remove('collapsed');$('collapse').textContent='−';$('collapse').setAttribute('aria-expanded','true');$('collapse').setAttribute('aria-label','Réduire le panneau');
 }
 const selectionBox=$('selection-box');
 document.addEventListener('pointerdown',event=>{
  if(!editing||event.button!==0||event.target.closest('#editor,.hud-element,#minimap-handle'))return;
  marquee={x:event.clientX,y:event.clientY,add:event.shiftKey,previous:new Set(selectedKeys)};selectionBox.hidden=false;
  Object.assign(selectionBox.style,{left:event.clientX+'px',top:event.clientY+'px',width:'0px',height:'0px'});document.body.setPointerCapture(event.pointerId);event.preventDefault();
 });
 document.addEventListener('pointermove',event=>{
  if(!marquee)return;const left=Math.min(marquee.x,event.clientX),top=Math.min(marquee.y,event.clientY),right=Math.max(marquee.x,event.clientX),bottom=Math.max(marquee.y,event.clientY);
  Object.assign(selectionBox.style,{left:left+'px',top:top+'px',width:right-left+'px',height:bottom-top+'px'});
  const boxes=[...nodes].filter(([,p])=>!p.root.hidden).map(([key,p])=>{const box=p.root.getBoundingClientRect();return {key,left:box.left,top:box.top,right:box.right,bottom:box.bottom};});
  const contained=P.selectInBox(boxes,{left,top,right,bottom});selectedKeys=new Set(marquee.add?[...marquee.previous,...contained]:contained);
  nodes.forEach((p,key)=>p.root.classList.toggle('selected',selectedKeys.has(key)));$('selection-status').textContent=selectedKeys.size+' éléments sélectionnés';
 });
 const finishMarquee=()=>{if(!marquee)return;marquee=null;selectionBox.hidden=true;if(selectedKeys.size){select(selectedKeys.has(selected)?selected:[...selectedKeys][0],true);showElementSettings();}};
 document.addEventListener('pointerup',finishMarquee);document.addEventListener('pointercancel',finishMarquee);document.body.addEventListener('lostpointercapture',finishMarquee);
 document.addEventListener('keydown',event=>{if(!editing)return;if(event.key==='Escape'){event.preventDefault();cancel();return;}if(event.target.matches('input,textarea,select'))return;const vectors={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(vectors[event.key]){event.preventDefault();const [x,y]=vectors[event.key],step=profile.step*(event.shiftKey?5:1);move(selected,x*step/innerWidth,y*step/innerHeight);}});
 function notify(payload){if(!payload||typeof payload!=='object')return;const host=$('notifications'),maximum=Number.isFinite(payload.maximum)?Math.max(1,Math.min(8,Math.round(payload.maximum))):4;
  while(host.childElementCount>=maximum){const old=host.firstElementChild;if(old._timer){clearTimeout(old._timer);notificationTimers.delete(old._timer);}old.remove();}
  const n=document.createElement('section'),kind=payload.type||payload.kind;n.className='notification '+(['error','warning','success'].includes(kind)?kind:'info');const title=document.createElement('strong');title.textContent=String(payload.title||'CDT').slice(0,80);const content=document.createElement('p');content.textContent=String(payload.message||payload.description||'').slice(0,600);n.append(title,content);host.append(n);const ms=typeof payload.duration==='number'?Math.max(1000,Math.min(15000,payload.duration)):5000;const timer=setTimeout(()=>{n.remove();notificationTimers.delete(timer);},ms);n._timer=timer;notificationTimers.add(timer);}
 window.addEventListener('message',event=>{const m=event.data;if(!m||typeof m!=='object')return;
  if(m.action==='update'&&m.data&&typeof m.data==='object'){const changes=[];for(const key of Object.keys(demo))if(Object.prototype.hasOwnProperty.call(m.data,key)&&data[key]!==m.data[key]){data[key]=m.data[key];changes.push(key);}if(!hud.hidden&&editing&&profile.demo){if(changes.includes('talking'))render('voice');if(changes.includes('belt'))render('belt');if(changes.some(k=>['indicatorLeft','indicatorRight','hazards','indicatorBlink'].includes(k)))['indicatorLeft','indicatorRight','hazards'].forEach(k=>render(k));}if(!hud.hidden&&!(editing&&profile.demo)){if(changes.includes('vehicle')||changes.includes('underwater'))visibility();else changes.forEach(k=>{if(k==='indicatorBlink')['indicatorLeft','indicatorRight','hazards'].forEach(key=>render(key));if(nodes.has(k))render(k);if(k==='talking'||k==='voiceLevel')render('voice');});if(changes.some(key=>S.player.includes(key))){compactPlayer();layoutInformation();updateMinimapSpace();}if(changes.some(key=>categoryFor(key)==='info')){layoutInformation();updateMinimapSpace();}}}
  else if(m.action==='visibility'){visible=m.visible===true;visibility();}
  else if(m.action==='externalVisibility'){externalVisibility={hud:m.hud===true,minimap:m.minimap===true,elements:m.elements||{}};visibility();}
  else if(m.action==='edit'){if(m.open===true)personalBeforeDefault=null;open(m.open===true);}
  else if(m.action==='profile'){try{profile=P.validate(m.profile);I.setLanguage(profile.language);saved=P.copy(profile);rebuild();if(editing){globalFields();select(selected);renderGallery();}}catch(error){feedback(error.message);}}
  else if(m.action==='minimapGeometry'&&m.geometry){const g=m.geometry;if(['left','top','width','height','unitX','unitY','x','y','scale'].every(key=>Number.isFinite(g[key]))&&g.width>0&&g.height>0&&g.unitX>0&&g.unitY>0&&g.scale>0){mapGeometry=g;updateMinimap();}}
  else if(m.action==='minimapVisibility'){radarVisible=m.visible===true;updateMinimap();}
  else if(m.action==='serverDefault'&&m.profile){try{window.HudInstallationProfile=P.validate(m.profile);setDefaultAccess(m.canEdit===true);}catch(error){feedback(error.message);}}
  else if(m.action==='debug'){debugEnabled=m.enabled===true;$('debug-tab').hidden=!debugEnabled;if(!debugEnabled){$('debug-profile').hidden=true;$('debug-profile-json').value='';}}
  else if(m.action==='permissions')setDefaultAccess(m.canEdit===true);
  else if(m.action==='cinema'){cinema=m.enabled===true;document.body.classList.toggle('cinema-mode',cinema);document.documentElement.style.setProperty('--cinema-band',Math.max(0,Math.min(.3,Number(m.barHeight)||.12))*100+'vh');visibility();}
  else if(m.action==='notify')notify(m.data||m);
 });
 Object.entries(P.labels).forEach(([key,label])=>{const option=document.createElement('option');option.value=key;option.textContent=label;$('element-list').append(option);});$('element-list').addEventListener('change',e=>select(e.target.value));
 document.querySelectorAll('[data-category]').forEach(button=>button.addEventListener('click',()=>select(Object.keys(P.labels).find(key=>categoryFor(key)===button.dataset.category))));
 document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.tab').forEach(tab=>tab.hidden=tab.id!==button.dataset.tab);document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b===button));if(button.dataset.tab==='integrations')loadIntegrations();if(button.dataset.tab==='styles')renderGallery();if(button.dataset.tab==='debug-profile')refreshDebugProfile();}));
 let debugEnabled=false;
 function refreshDebugProfile(){if(!debugEnabled)return;$('debug-profile-json').value=JSON.stringify(P.validate(profile),null,2);$('debug-profile-status').textContent='Configuration actuelle actualisée.';}
 $('refresh-debug-profile').addEventListener('click',refreshDebugProfile);
 $('copy-debug-profile').addEventListener('click',async()=>{
  if(!debugEnabled)return;refreshDebugProfile();const area=$('debug-profile-json');
  try{await navigator.clipboard.writeText(area.value);$('debug-profile-status').textContent='JSON copié.';}
  catch{area.focus();area.select();$('debug-profile-status').textContent='Texte sélectionné : utilisez Ctrl+C pour le copier.';}
 });
 function liveStylePreview(target,id,compact=false){
  const container=document.createElement('span');container.className='style-live-preview';
  const previewPreset=target==='player'?S.gaugeCatalog.find(s=>s.id===id):null;
  if(previewPreset?.height>88)container.style.height=(previewPreset.height+20)+'px';
  const originalProfile=profile,originalData=data,originalEditing=editing;
  const keys=target==='player'?(compact?[S.gaugeCatalog.find(s=>s.id===id)?.sampleKey||'health']:['health','hunger','thirst']):['zone'];
  const originalNodes=new Map(keys.map(key=>[key,nodes.get(key)]));
  try{
   profile=P.copy(profile);data={health:75,armor:75,hunger:65,thirst:45,stamina:82,oxygen:80,stress:14,voice:3,voiceLevel:2,talking:false,zone:'Pillbox Hill'};editing=false;
   if(target==='player')S.applyGauge(profile,id,true);else{profile.elements.zone.background='#14232e';S.applyInformation(profile,id);}
   for(const key of keys){
    Object.assign(profile.elements[key],{enabled:true,condition:'always',hideAtZero:false,opacity:1});
    if(target==='info')Object.assign(profile.elements[key],{width:250,height:id==='stacked'?84:48,text:'#eef0f6',align:'left',scale:1,rotation:0,background:'#14232e',backgroundOpacity:.65});
    build(key);const node=nodes.get(key).root;node.removeAttribute('id');container.append(node);
   }
  }finally{profile=originalProfile;data=originalData;editing=originalEditing;for(const [key,value] of originalNodes){if(value)nodes.set(key,value);else nodes.delete(key);}}
  return container;
 }
 function renderGallery(){
  const target=$('style-target').value, list=target==='player'?S.gaugeCatalog:target==='info'?S.informationCatalog:S.catalog;
  const current=target==='vehicle'?profile.carStyle:target==='player'?(profile.gaugeStyle&&profile.gaugeStyle!=='style'?profile.gaugeStyle:profile.playerStyle):null;
  $('style-current').textContent=target==='info'?'Appliquer une présentation à tous les blocs d’informations. Chaque bloc reste personnalisable.':(target==='player'?'Jauges : ':'HUD véhicule : ')+(list.find(s=>s.id===current)?.name||'Personnalisé');
  $('style-gallery').replaceChildren();
  $('style-gallery').classList.toggle('gauge-family-gallery',target==='player');
  const addCard=(skin,container,compact=false)=>{const button=document.createElement('button');button.type='button';button.dataset.skinChoice=skin.id;button.className='skin-choice';if(target==='vehicle')button.innerHTML=S.categoryPreview(target,skin.id);else button.append(liveStylePreview(target,skin.id,compact));
   const title=document.createElement('strong');title.textContent=skin.name;const text=document.createElement('span');text.textContent=skin.detail;button.append(title,text);
   const active=target==='info'?Object.entries(profile.elements).filter(([key])=>categoryFor(key)==='info').every(([,e])=>e.infoAppearance===skin.id):current===skin.id;
   button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));
   button.addEventListener('click',()=>{if(target==='player'){S.applyGauge(profile,skin.id,!$('keep-style-colors').checked);P.arrangePlayer(profile,profile.playerOrientation,innerWidth,innerHeight);}else if(target==='info')S.applyInformation(profile,skin.id);else S.apply(profile,skin.id,'vehicle',!$('keep-style-colors').checked);replace(profile);renderGallery();});container.append(button);
  };
  if(target==='player'){
   for(const family of S.gaugeFamilies){const section=document.createElement('section');section.className='gauge-family';const heading=document.createElement('h3');heading.textContent=family.name;section.append(heading);const row=document.createElement('div');row.className='gauge-variant-row';section.append(row);list.filter(s=>s.family===family.id).forEach(s=>addCard(s,row,true));$('style-gallery').append(section);}
   const section=document.createElement('details');section.className='gauge-family';const title=document.createElement('summary');title.textContent='Autres styles et variantes existantes';section.append(title);const row=document.createElement('div');row.className='gauge-variant-row';section.append(row);list.filter(s=>!s.family).forEach(s=>addCard(s,row,true));$('style-gallery').append(section);
  }else list.forEach(skin=>addCard(skin,$('style-gallery')));
 }
 $('style-target').addEventListener('change',renderGallery);
 let personalBeforeDefault=null;
 function setDefaultAccess(allowed){
  for(const id of ['load-server-default','use-my-default','save-server-default'])$(id).disabled=!allowed;
  $('server-default-access').hidden=allowed;
 }
 async function loadServerDefault(){
  const status=$('server-default-status');status.textContent='Chargement…';
  try{const result=await post('getServerDefault');if(!personalBeforeDefault)personalBeforeDefault=P.copy(profile);replace(P.validate(result.profile));status.textContent='Défaut chargé sur votre HUD. Modifiez-le dans les onglets habituels, puis publiez votre HUD actuel.';}catch(error){status.textContent=error.message;}
 }
 $('load-server-default').addEventListener('click',loadServerDefault);
 $('use-my-default').addEventListener('click',()=>{if(personalBeforeDefault){replace(P.copy(personalBeforeDefault));personalBeforeDefault=null;}$('server-default-status').textContent='Votre HUD personnel sera utilisé. Cliquez sur Enregistrer comme HUD par défaut pour le publier.';});
 $('save-server-default').addEventListener('click',async()=>{
  const button=$('save-server-default');
  try{const clean=P.validate(profile);if(!await confirmChange('Définir ce HUD comme configuration de première connexion pour les nouveaux joueurs ? Les profils existants sont conservés.'))return;
   button.disabled=true;const result=await post('saveServerDefault',{profile:clean});window.HudInstallationProfile=P.validate(result.profile);$('server-default-status').textContent='HUD par défaut enregistré côté serveur. Il sera attribué aux nouveaux joueurs.';
  }catch(error){$('server-default-status').textContent=error.message;}finally{button.disabled=false;}
 });
 let integrationDraft=null,integrationCatalog=null;
 async function loadIntegrations(){const status=$('integration-status');status.textContent='Chargement…';$('save-integrations').hidden=true;$('integration-fields').replaceChildren();integrationDraft=null;
  try{const result=await post('getIntegrations');if(!result||!result.integrations||!result.catalog)throw Error('Configuration indisponible.');integrationDraft=P.copy(result.integrations);integrationCatalog=result.catalog;
   for(const [domain,title] of Object.entries({fuel:'Carburant',needs:'Faim et soif',stress:'Stress',voice:'Voix'})){
    const current=integrationDraft[domain]||{},allowed=Array.isArray(integrationCatalog[domain])?integrationCatalog[domain].filter(v=>typeof v==='string'&&v.length<60):[];if(!allowed.length)continue;
    integrationDraft[domain]=P.integrationDraft(current,allowed);
    const heading=document.createElement('h3');heading.textContent=title;$('integration-fields').append(heading);
    const providerLabel=document.createElement('label');providerLabel.textContent='Fournisseur';const select=document.createElement('select');for(const value of allowed){const option=document.createElement('option');option.value=value;option.textContent=value;select.append(option);}select.value=integrationDraft[domain].provider;select.addEventListener('change',()=>{integrationDraft[domain].provider=select.value;});providerLabel.append(select);
    const resourceLabel=document.createElement('label');resourceLabel.textContent='Nom de la ressource (vide = défaut du fournisseur)';const resource=document.createElement('input');resource.type='text';resource.maxLength=80;resource.value=integrationDraft[domain].resource;resource.addEventListener('change',()=>{integrationDraft[domain].resource=resource.value.trim();});resourceLabel.append(resource);$('integration-fields').append(providerLabel,resourceLabel);
    if(domain==='voice'){
     const help=document.createElement('p');help.textContent='pma : automatique. statebag : clés du joueur, avec un point pour les champs imbriqués. export : noms des exports client sans argument. Activation vide : détection Mumble.';$('integration-fields').append(help);
     for(const [key,title] of [['voiceKey','Clé de portée micro'],['radioKey','Clé du canal radio'],['talkingKey','Clé d’activation micro'],['levelKey','Clé du niveau de portée'],['voiceExport','Export de portée micro'],['radioExport','Export du canal radio'],['talkingExport','Export d’activation micro'],['levelExport','Export du niveau de portée']]){
      const label=document.createElement('label'),input=document.createElement('input');label.textContent=title;input.type='text';input.maxLength=80;input.value=current[key]||'';input.placeholder={voiceKey:'proximity.distance',radioKey:'radioChannel',levelKey:'proximity.index'}[key]||'';
      input.addEventListener('change',()=>{if(input.value.trim())integrationDraft[domain][key]=input.value.trim();else delete integrationDraft[domain][key];});label.append(input);$('integration-fields').append(label);
      const refresh=()=>{label.hidden=!['statebag','export'].includes(select.value)||(key.endsWith('Key')?select.value!=='statebag':select.value!=='export');};select.addEventListener('change',refresh);refresh();
     }
    }
    if(domain==='fuel')for(const [key,label,type] of [['export','Nom de l’export (fournisseur export)','text'],['key','Clé du state bag (fournisseur statebag)','text'],['minimum','Valeur source minimale','number'],['maximum','Valeur source maximale','number']]){
     const wrapper=document.createElement('label');wrapper.textContent=label;const input=document.createElement('input');input.type=type;input.value=current[key]??'';if(type==='text')input.maxLength=80;else{input.min=-100000000;input.max=100000000;input.step='any';}input.addEventListener('change',()=>{if(!input.value)delete integrationDraft[domain][key];else integrationDraft[domain][key]=type==='number'?Number(input.value):input.value.trim();});wrapper.append(input);$('integration-fields').append(wrapper);
    }
   }
   const crash=await post('getEjection');
   if(crash?.ejection){
    const draft=P.copy(crash.ejection),heading=document.createElement('h3');heading.textContent='Éjection sans ceinture';$('integration-fields').append(heading);
    for(const [key,title,min,max,step] of [['enabled','Activer l’éjection'],['minimumKmh','Vitesse minimale (km/h)',10,300,1],['speedDropKmh','Perte de vitesse minimale (km/h)',5,200,1],['dropRatio','Proportion minimale de perte de vitesse',.05,1,.05],['ragdollMs','Durée de chute (ms)',500,10000,100],['cooldownMs','Délai entre éjections (ms)',1000,30000,100]]){
     const label=document.createElement('label'),input=document.createElement('input');label.textContent=title;input.type=key==='enabled'?'checkbox':'number';
     if(key==='enabled')input.checked=draft[key];else{input.min=min;input.max=max;input.step=step;input.value=draft[key];}
     input.addEventListener('change',()=>{draft[key]=key==='enabled'?input.checked:Number(input.value);});label.append(input);$('integration-fields').append(label);
    }
    const button=document.createElement('button');button.type='button';button.textContent='Enregistrer les réglages d’éjection';button.addEventListener('click',async()=>{button.disabled=true;try{await post('saveEjection',{ejection:draft});status.textContent='Réglages d’éjection enregistrés.';}catch(error){status.textContent=error.message;}finally{button.disabled=false;}});$('integration-fields').append(button);
   }
   status.textContent='Choisissez auto pour une détection automatique ou custom pour votre bridge Lua configuré.';$('save-integrations').hidden=false;
  }catch(error){status.textContent=error.message;}
 }
 $('save-integrations').addEventListener('click',async()=>{const button=$('save-integrations');button.disabled=true;try{if(!integrationDraft)throw Error('Chargez la configuration avant de sauvegarder.');for(const [domain,value] of Object.entries(integrationDraft)){if(!integrationCatalog[domain]?.includes(value.provider))throw Error('Fournisseur invalide.');if(value.resource&&!/^[a-zA-Z0-9_.-]{1,80}$/.test(value.resource))throw Error('Nom de ressource invalide.');}await post('saveIntegrations',{integrations:integrationDraft});$('integration-status').textContent='Bridges du serveur enregistrés.';}catch(error){$('integration-status').textContent=error.message;}finally{button.disabled=false;}});
 for(const id of ['cancel','close'])$(id).addEventListener('click',cancel);$('save').addEventListener('click',save);
 $('collapse').addEventListener('click',()=>{const collapsed=$('editor').classList.toggle('collapsed');for(const property of ['left','top','right','transform'])$('editor').style.removeProperty(property);$('collapse').textContent=collapsed?'+':'−';$('collapse').setAttribute('aria-expanded',String(!collapsed));$('collapse').setAttribute('aria-label',collapsed?'Développer le panneau':'Réduire le panneau');});
 let panelDrag=null;
 const panelHeader=$('editor').querySelector('header');
 panelHeader.addEventListener('pointerdown',event=>{if(event.target.closest('button'))return;const rect=$('editor').getBoundingClientRect();Object.assign($('editor').style,{left:rect.left+'px',top:rect.top+'px',right:'auto',transform:'none'});panelDrag={x:event.clientX,y:event.clientY,left:rect.left,top:rect.top,width:rect.width,height:rect.height};panelHeader.setPointerCapture(event.pointerId);event.preventDefault();});
 panelHeader.addEventListener('pointermove',event=>{if(!panelDrag)return;$('editor').style.left=Math.max(0,Math.min(innerWidth-panelDrag.width,panelDrag.left+event.clientX-panelDrag.x))+'px';$('editor').style.top=Math.max(0,Math.min(innerHeight-panelDrag.height,panelDrag.top+event.clientY-panelDrag.y))+'px';});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])panelHeader.addEventListener(name,()=>{panelDrag=null;});
 $('center').addEventListener('click',()=>{const e=profile.elements[selected];if(e.locked)return;move(selected,.5-e.x,.5-e.y);});
 $('recover').addEventListener('click',()=>{profile.elements[selected]=P.recover(profile.elements[selected],innerWidth,innerHeight,profile.scale);profile.elements[selected].enabled=true;style(selected);select(selected);});
 function replace(next){profile=next;I.setLanguage(profile.language);rebuild();previewMinimap();globalFields();select(selected);renderGallery();feedback('Modification appliquée. Enregistrez pour la conserver.');}
 function confirmChange(message){resolveConfirm(false);$('confirmation-text').textContent=message;$('confirmation').hidden=false;return new Promise(resolve=>{confirmResolve=resolve;});}
 function resolveConfirm(value){$('confirmation').hidden=true;if(confirmResolve){const resolve=confirmResolve;confirmResolve=null;resolve(value);}}
 $('confirm-yes').addEventListener('click',()=>resolveConfirm(true));$('confirm-no').addEventListener('click',()=>resolveConfirm(false));
 $('reset-element').addEventListener('click',async()=>{const key=selected;if(await confirmChange('Réinitialiser cet élément ?')){const defaults=P.defaults();S.apply(defaults,profile.playerStyle,'player');S.apply(defaults,profile.carStyle,'vehicle');profile.elements[key]=defaults.elements[key];replace(profile);}});
 $('reference-layout').addEventListener('click',async()=>{if(await confirmChange('Appliquer la disposition joueur recommandée ? Style Zurg, couleurs habituelles, minimap ronde compacte et informations sans fond. Les réglages joueur seront restaurés ; ceux du véhicule sont conservés.'))replace(P.recommendedPlayer(profile));});
 $('restore-layout').addEventListener('click',async()=>{if(await confirmChange('Replacer tous les éléments ? Vos couleurs et options sont conservées.')){const defaults=P.defaults();S.apply(defaults,profile.playerStyle,'player');S.apply(defaults,profile.carStyle,'vehicle');for(const key of Object.keys(P.labels))for(const field of ['x','y','anchor','width','height','scale','rotation'])profile.elements[key][field]=defaults.elements[key][field];replace(profile);}});
 $('reset-all').addEventListener('click',async()=>{
  if(!await confirmChange('Restaurer la configuration d’origine du HUD ? Styles, couleurs, positions, jauges et minimap seront réinitialisés. Cliquez ensuite sur Enregistrer pour conserver ce choix, ou Annuler pour revenir à votre configuration.'))return;
  const button=$('reset-all');button.disabled=true;
  try{
   if(cinema){await post('cinema',{enabled:false});cinema=false;}
   $('style-target').value='player';$('keep-style-colors').checked=false;
   replace(P.defaults());
   feedback('Configuration d’origine restaurée. Cliquez sur Enregistrer pour la conserver, ou Annuler pour revenir en arrière.');
  }catch(error){feedback(error.message);}finally{button.disabled=false;}
 });
 $('cinema').addEventListener('click',async()=>{try{const next=!cinema;await post('cinema',{enabled:next});cinema=next;feedback(cinema?'Mode cinéma activé.':'Mode cinéma désactivé.');visibility();}catch(error){feedback(error.message);}});
 function resize(){const hadGeometry=Boolean(mapGeometry);mapGeometry=null;if(hadGeometry)post('refreshMinimap').catch(error=>feedback(error.message));document.documentElement.style.setProperty('--ui',Math.max(.8,Math.min(2,innerHeight/1080)));nodes.forEach((_,key)=>style(key));compactPlayer();layoutInformation();updateMinimapSpace();updateHousing();updateMinimap();}window.addEventListener('resize',resize);
 window.addEventListener('beforeunload',()=>{notificationTimers.forEach(clearTimeout);});
 async function ready(attempt=0){try{await post('ready');}catch(error){if(attempt<4)setTimeout(()=>ready(attempt+1),500*(attempt+1));}}
 rebuild();resize();ready();
})();
