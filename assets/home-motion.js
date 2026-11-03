/* Motion explains order and interaction; content is visible without JavaScript. */
(() => {
  'use strict';
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  const backgroundSections=document.querySelectorAll('.sports-section,.courses-section');
  if('IntersectionObserver'in window){const lazyBackgrounds=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('premium-assets-ready');lazyBackgrounds.unobserve(e.target);}});},{rootMargin:'300px'});backgroundSections.forEach(el=>lazyBackgrounds.observe(el));}else backgroundSections.forEach(el=>el.classList.add('premium-assets-ready'));
  const active=new Set();
  const observed=new WeakSet();
  const ease='cubic-bezier(.16,1,.3,1)';
  // Closed dropdowns must also be hidden from assistive technology.
  const nav=document.querySelector('#tsa-home-header');
  const setHidden=(el,hidden)=>{if(el&&el.getAttribute('aria-hidden')!==String(hidden))el.setAttribute('aria-hidden',String(hidden));};
  function syncMenus(){
    nav.querySelectorAll('.nav-group').forEach(group=>setHidden(group.querySelector('.nav-dropdown'),!(group.classList.contains('open')||group.matches(':hover'))));
    nav.querySelectorAll('.mobile-accordion').forEach(group=>setHidden(group.querySelector('.mobile-submenu'),group.querySelector('button')?.getAttribute('aria-expanded')!=='true'));
  }
  nav.querySelectorAll('.nav-group').forEach(group=>{group.addEventListener('pointerenter',syncMenus);group.addEventListener('pointerleave',syncMenus);});
  new MutationObserver(syncMenus).observe(nav,{attributes:true,subtree:true,attributeFilter:['class','aria-expanded']});
  syncMenus();
  function animate(el,frames,options={}) {
    if(!el||preference.matches||!el.animate)return;
    const a=el.animate(frames,{duration:760,easing:ease,...options});
    active.add(a);a.finished.catch(()=>{}).finally(()=>active.delete(a));
  }
  // A line rise, never character splitting: Thai tone marks remain attached to their letters.
  document.querySelectorAll('.hero-line>span').forEach((el,i)=>animate(el,[{transform:'translateY(108%)'},{transform:'translateY(0)'}],{duration:800,delay:i*90}));
  if(document.body.classList.contains('tsa-premium'))animate(document.querySelector('#motion-title'),[{opacity:.45,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:750});
  const heroPhoto=document.querySelector('.h-hero-media img');
  if(matchMedia('(min-width: 761px)').matches)animate(heroPhoto,[{clipPath:'inset(0 0 12% 0)',transform:'scale(1.035)'},{clipPath:'inset(0)',transform:'scale(1)'}],{duration:1000});
  animate(document.querySelector('.h-search'),[{opacity:.55,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:650,delay:120});

  const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      observer.unobserve(entry.target);
      const el=entry.target;
      if(preference.matches)continue;
      if(el.matches('.h-sport')){
        const img=el.querySelector('img');
        if(!img){animate(el,[{opacity:.35,transform:'translateY(18px)'},{opacity:1,transform:'none'}],{duration:700});continue;}
        animate(img,[{clipPath:'inset(0 0 13% 0)',transform:'scale(1.045)'},{clipPath:'inset(0)',transform:'scale(1)'}],{duration:900});
        animate(el.querySelector(':scope > span'),[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:600,delay:100});
      }else if(el.matches('.h-event,.h-course li')){
        const i=[...el.parentElement.children].indexOf(el);
        animate(el,[{opacity:.3,transform:'translateX(18px)'},{opacity:1,transform:'none'}],{duration:600,delay:Math.min(i,4)*65});
      }else if(el.matches('.h-feature')){
        animate(el.querySelector('.h-feature-img'),[{opacity:.65,clipPath:'inset(0 0 15% 0)'},{opacity:1,clipPath:'inset(0)'}],{duration:850});
      }else{
        animate(el,[{opacity:.25,transform:'translateY(18px)'},{opacity:1,transform:'none'}],{duration:700});
      }
    }
  },{threshold:.12,rootMargin:'0px 0px -4% 0px'}):null;
  function observe(){
    document.querySelectorAll('.h-head,.h-map-copy,.h-split-intro,.h-sport,.h-event,.h-feature,.h-course li').forEach(el=>{
      if(observed.has(el))return;
      observed.add(el);observer?.observe(el);
    });
  }
  observe();
  const main=document.querySelector('#main');
  let pending=false;
  const mutations=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;observe();});});
  mutations.observe(main,{childList:true,subtree:true});
  // Keep the native scrollbar. The poster heading sticks in CSS; no scroll interception is used.
  document.addEventListener('visibilitychange',()=>{
    active.forEach(a=>{if(document.hidden)a.pause();else if(!preference.matches)a.play();});
  });
  preference.addEventListener('change',()=>{if(preference.matches)active.forEach(a=>a.finish());});

  const network=document.querySelector('#associations');
  const group=network?.querySelector('.association-ticker-group');
  if(group&&group.parentElement.children.length===1){const clone=group.cloneNode(true);clone.setAttribute('aria-hidden','true');clone.inert=true;clone.querySelectorAll('a').forEach(a=>a.tabIndex=-1);group.parentElement.append(clone);}
  // Read progress uses transforms only; the native scrollbar controls the page.
  const progress=document.querySelector('.tsa-home-progress');
  const hero=document.querySelector('#motion-hero'),heroArtwork=hero?.querySelector('.hero-bg');
  let heroVisible=true;
  function syncHeroLights(){
    hero?.classList.toggle('hero-effects-paused',document.hidden||!heroVisible);
  }
  document.addEventListener('visibilitychange',syncHeroLights);
  preference.addEventListener('change',syncHeroLights);syncHeroLights();
  // A soft surface highlight follows the pointer with the reference's 90 ms lag.
  // Only the light plane moves; text, artwork zoom and controls keep their layout.
  const spotlight=hero?.querySelector('.hero-pointer-light');
  const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  if(hero&&spotlight){
    let spotFrame=0,tracking=false,x=0,y=0,targetX=0,targetY=0,clientX=0,clientY=0,lastTime=0;
    const paintSpot=()=>{spotlight.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) translate(-50%,-50%)`;};
    function resetSpotlight(){
      tracking=false;cancelAnimationFrame(spotFrame);spotFrame=0;
      hero.classList.remove('is-pointer-lit');
    }
    function followSpot(now){
      spotFrame=0;
      if(!tracking)return;
      const blend=1-Math.exp(-Math.min(now-lastTime,50)/90);lastTime=now;
      x+=(targetX-x)*blend;y+=(targetY-y)*blend;paintSpot();
      if(Math.abs(targetX-x)+Math.abs(targetY-y)>.15)spotFrame=requestAnimationFrame(followSpot);
      else{x=targetX;y=targetY;paintSpot();}
    }
    function positionSpot(){
      if(preference.matches||!finePointer.matches||document.hidden){resetSpotlight();return;}
      const bounds=hero.getBoundingClientRect();
      targetX=clientX-bounds.left;targetY=clientY-bounds.top;
      if(targetX<0||targetY<0||targetX>bounds.width||targetY>bounds.height){resetSpotlight();return;}
      if(!tracking){x=targetX;y=targetY;paintSpot();tracking=true;hero.classList.add('is-pointer-lit');}
      if(!spotFrame){lastTime=performance.now();spotFrame=requestAnimationFrame(followSpot);}
    }
    hero.addEventListener('pointermove',event=>{
      if(event.pointerType==='touch')return;
      clientX=event.clientX;clientY=event.clientY;positionSpot();
    },{passive:true});
    hero.addEventListener('pointerleave',resetSpotlight);
    hero.addEventListener('pointercancel',resetSpotlight);
    addEventListener('scroll',()=>{if(tracking)positionSpot();},{passive:true});
    addEventListener('resize',resetSpotlight);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)resetSpotlight();});
    preference.addEventListener('change',resetSpotlight);finePointer.addEventListener('change',resetSpotlight);
  }
  function updateHeroZoom(){
    if(!heroArtwork)return;
    if(preference.matches){heroArtwork.style.setProperty('--hero-zoom','1');heroArtwork.classList.remove('is-scroll-zooming');return;}
    if(!heroVisible)return;
    const rect=hero.getBoundingClientRect(),headerHeight=nav.getBoundingClientRect().height;
    const fraction=Math.min(1,Math.max(0,(headerHeight-rect.top)/Math.max(1,heroArtwork.offsetHeight)));
    const amount=matchMedia('(max-width:690px)').matches ? .08 : .16;
    heroArtwork.style.setProperty('--hero-zoom',String(1+fraction*amount));heroArtwork.classList.add('is-scroll-zooming');
  }
  if(heroArtwork&&'IntersectionObserver'in window){const visibility=new IntersectionObserver(([entry])=>{heroVisible=entry.isIntersecting;heroArtwork.classList.toggle('is-scroll-zooming',heroVisible&&!preference.matches);syncHeroLights();queueProgress();});visibility.observe(hero);}
  let frame=0;
  const updateProgress=()=>{frame=0;const total=document.documentElement.scrollHeight-innerHeight;progress?.style.setProperty('transform',`scaleX(${total>0?Math.min(1,Math.max(0,scrollY/total)):0})`);updateHeroZoom();};
  const queueProgress=()=>{if(!frame)frame=requestAnimationFrame(updateProgress);};
  preference.addEventListener('change',queueProgress);
  addEventListener('scroll',queueProgress,{passive:true});addEventListener('resize',queueProgress);updateProgress();
})();
