/* Camera-facing waypoint overlay. World positions are projected by the client. */
(() => {
 'use strict';
 const root = document.getElementById('destination');
 const panel = root.querySelector('.destination-panel');
 const distanceLabel = root.querySelector('.destination-distance');
 const caption = root.querySelector('.destination-caption');
 function translateCaption() { if (caption) caption.textContent = window.HudI18n ? window.HudI18n.translate('ARRIVÉE') : 'ARRIVÉE'; }
 window.addEventListener('hud:languageChanged', translateCaption);
 translateCaption();
 const line = root.querySelector('.destination-line');
 const ray = root.querySelector('.destination-ray');
 const beamLayers = [root.querySelector('.destination-beam-halo'), root.querySelector('.destination-beam-glow'), line].filter(Boolean);
 const endpoint = root.querySelector('.destination-endpoint');
 let latest = null, staleTimer = null;
 let lastDistance = null, lastOpacity = null, nativeRayActive = false;
 const suppression = { visibility: false, edit: false, cinema: false, external: false };
 const suppressed = () => Object.values(suppression).some(Boolean);
 const finite = value => typeof value === 'number' && Number.isFinite(value);
 const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
 function hide() {
  root.hidden = true;
  latest = null;
  if (staleTimer !== null) { clearTimeout(staleTimer); staleTimer = null; }
 }
 function position() {
  if (!latest || root.hidden) return;
  const width = window.innerWidth, height = window.innerHeight;
  const x = latest.x * width, y = latest.y * height;
  panel.style.translate = `${x}px ${y}px`;
  if (latest.worldRay === true) {
   if (!nativeRayActive) {
    ray.hidden = true;
    for (const layer of beamLayers) layer.style.display = 'none';
    endpoint.style.display = 'none';
    nativeRayActive = true;
   }
   return;
  }
  nativeRayActive = false;
  const groundVisible = latest.groundVisible === true && finite(latest.groundX) && finite(latest.groundY)
   && latest.groundX >= 0 && latest.groundX <= 1 && latest.groundY >= 0 && latest.groundY <= 1;
  const endX = groundVisible ? latest.groundX * width : x;
  const endY = groundVisible ? latest.groundY * height : y;
  const dx = endX - x, dy = endY - y;
  ray.hidden = latest.worldRay === true || !groundVisible;
  Object.assign(ray.style, {
   left: x + 'px', top: y + 'px', height: Math.hypot(dx, dy) + 'px',
   transform: `translateX(-50%) rotate(${Math.atan2(dy, dx) * 180 / Math.PI - 90}deg)`
  });
  for (const layer of beamLayers) {
   layer.style.display = groundVisible ? '' : 'none';
   layer.setAttribute('x1', x); layer.setAttribute('y1', y);
   layer.setAttribute('x2', endX); layer.setAttribute('y2', endY);
  }
  endpoint.setAttribute('transform', `translate(${endX} ${endY})`);
  endpoint.style.display = groundVisible ? '' : 'none';
 }
 window.addEventListener('message', event => {
  const message = event.data;
  if (!message || typeof message !== 'object') return;
  if (message.action === 'destination') {
   if (suppressed() || message.visible !== true || !finite(message.x) || !finite(message.y)
    || message.x < 0 || message.x > 1 || message.y < 0 || message.y > 1) { hide(); return; }
   latest = message;
   const distance = finite(message.distance) ? Math.max(0, Math.round(message.distance)) : 0;
   if (distance !== lastDistance) { distanceLabel.textContent = distance + ' m'; lastDistance = distance; }
   const opacity = finite(message.opacity) ? clamp(message.opacity, 0, 1) : 1;
   if (opacity !== lastOpacity) { root.style.opacity = opacity; lastOpacity = opacity; }
   root.hidden = false;
   position();
   if (staleTimer !== null) clearTimeout(staleTimer);
   staleTimer = setTimeout(hide, 250);
  } else {
   if (message.action === 'externalVisibility') suppression.external = message.hud === true || message.elements?.destination === true;
   else if (message.action === 'visibility') suppression.visibility = message.visible !== true;
   else if (message.action === 'edit') suppression.edit = message.open === true;
   else if (message.action === 'cinema') suppression.cinema = message.enabled === true;
   if (suppressed()) hide();
  }
 });
 window.addEventListener('resize', position);
})();
