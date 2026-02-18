// Optimized Universal Topbar Injector - loads scripts in parallel
(function(){
'use strict';
const scripts=['js/project-links.js','js/global-auth-manager.js','js/universal-topbar.js'];
function hasScript(n){return!!document.querySelector('script[src*="'+n.replace(/.*\//,'')+'"]')}
function inject(){
try{document.querySelectorAll('header:not(.universal-topbar),.navbar:not(.universal-topbar),.topbar:not(.universal-topbar),.universal-bar,nav:not(.universal-topbar)').forEach(el=>el.remove())}catch(e){}
scripts.forEach(src=>{
if(hasScript(src.replace(/.*\//,'')))return;
const s=document.createElement('script');
s.src=src;s.async=true;
document.head.appendChild(s);
});
}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',inject)}else{inject()}
})();
