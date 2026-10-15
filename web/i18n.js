(function(root){
 'use strict';
 root.HudLocales=root.HudLocales||{};
 let language='en',observer=null,scope=null;
 const originals=new WeakMap(),patterns=new WeakMap(),fallbacks=new WeakMap();
 function translate(value){
  let dictionary=root.HudLocales[language]?.messages||root.HudLocales.en?.messages||{};
  if(language!=='fr'&&language!=='en'&&root.HudLocales.en){
   if(!fallbacks.has(dictionary))fallbacks.set(dictionary,Object.assign({},root.HudLocales.en.messages,dictionary));
   dictionary=fallbacks.get(dictionary);
  }
  const trimmed=value.trim();
  if(Object.prototype.hasOwnProperty.call(dictionary,trimmed))return value.replace(trimmed,dictionary[trimmed]);
  let result=value;
  // Dynamic statuses combine stable labels with numbers or element names.
  if(!patterns.has(dictionary))patterns.set(dictionary,Object.keys(dictionary).filter(k=>k.length>=2).sort((a,b)=>b.length-a.length).map(key=>[key,new RegExp('(^|[^\\p{L}\\p{N}_])'+key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=$|[^\\p{L}\\p{N}_])','gu')]));
  for(const [key,pattern] of patterns.get(dictionary))if(result.includes(key))result=result.replace(pattern,(_,prefix)=>prefix+dictionary[key]);
  return result;
 }
 function apply(){
  if(!scope)return;
  if(observer)observer.disconnect();
  const walker=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT);let node;
  while((node=walker.nextNode())){
   if(node.parentElement?.closest('textarea,input,script,style,svg,[data-no-i18n]'))continue;
   const previous=originals.get(node),source=previous&&node.nodeValue===previous.last?previous.source:node.nodeValue;
   if(previous&&node.nodeValue===previous.last&&previous.language===language)continue;
   const last=translate(source);originals.set(node,{source,last,language});if(node.nodeValue!==last)node.nodeValue=last;
  }
  for(const element of [scope,...scope.querySelectorAll('[title],[aria-label],[placeholder]')]){
   let record=originals.get(element)||{};
   for(const name of ['title','aria-label','placeholder'])if(element.hasAttribute(name)){
    const value=element.getAttribute(name),before=record[name],source=before&&value===before.last?before.source:value;
    const last=translate(source);record[name]={source,last};if(value!==last)element.setAttribute(name,last);
   }
   originals.set(element,record);
  }
  for(const selector of ['#hud','#minimap-handle']){
   const element=document.querySelector(selector);
   if(!element)continue;
   let record=originals.get(element)||{};
   for(const name of ['title','aria-label'])if(element.hasAttribute(name)){
    const value=element.getAttribute(name),before=record[name],source=before&&value===before.last?before.source:value;
    const last=translate(source);record[name]={source,last};if(last!==value)element.setAttribute(name,last);
   }
   originals.set(element,record);
  }
  document.documentElement.lang=language;
  if(observer)observer.observe(scope,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','aria-label','placeholder']});
 }
 const api={
  codes:()=>Object.keys(root.HudLocales),
  name:code=>root.HudLocales[code]?.name||code,
  get language(){return language;},
  translate,
  setLanguage(code){language=root.HudLocales[code]?code:'en';apply();if(typeof root.dispatchEvent==='function'&&typeof root.CustomEvent==='function')root.dispatchEvent(new root.CustomEvent('hud:languageChanged'));},
  start(){if(typeof document.querySelector!=='function'||typeof MutationObserver==='undefined')return;scope=document.querySelector('#editor');observer=new MutationObserver(apply);apply();}
 };
 root.HudI18n=api;
 if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
