/* Shared by home search and the existing canvas map; original JSON remains the fallback. */
(() => {
 'use strict';
 const pending=new Map();
 // Give the first screen its image, fonts and entrance before transferring the national datasets.
 let release;
 const firstScreenReady=new Promise(resolve=>{release=resolve;});
 const afterFirstScreen=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
  const animations=document.querySelector('.h-hero')?.getAnimations({subtree:true}).filter(a=>Number.isFinite(a.effect?.getComputedTiming().iterations))||[];
  Promise.allSettled(animations.map(a=>a.finished)).then(()=>requestAnimationFrame(()=>requestAnimationFrame(release)));
 }));
 if(document.readyState==='complete')afterFirstScreen();else addEventListener('load',afterFirstScreen,{once:true});
 ['pointerdown','keydown'].forEach(type=>addEventListener(type,release,{once:true,passive:true}));
 window.__tsaFetchData=name=>{
  if(!/^[a-z0-9-]+$/.test(name))return Promise.reject(new Error('Invalid dataset'));
  if(!pending.has(name))pending.set(name,(async()=>{
   await firstScreenReady;
   const path=`assets/data/${name}.json`;
   if('DecompressionStream'in window){
    try{
     const response=await fetch(path+'.gz');if(!response.ok)throw Error('Compressed data unavailable');
     const bytes=new Uint8Array(await response.arrayBuffer());
     const body=new Response(bytes);
     return bytes[0]===31&&bytes[1]===139
      ?await new Response(body.body.pipeThrough(new DecompressionStream('gzip'))).json()
      :await body.json();
    }catch{/* The regular dataset also supports browsers without native gzip streams. */}
   }
   const response=await fetch(path);if(!response.ok)throw Error('Dataset unavailable: '+name);
   return response.json();
  })().catch(error=>{pending.delete(name);throw error;}));
  return pending.get(name);
 };
})();
