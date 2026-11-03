(() => {
 'use strict';
 const $=s=>document.querySelector(s), motion=matchMedia('(prefers-reduced-motion: reduce)');
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmt=n=>Number(n).toLocaleString('en-US');
 const image=(src,alt='',cls='')=>`<img class="${cls}" src="${esc(src||'assets/images/stadium-2.jpg')}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
 const icon=(name,cls='')=>`<svg class="${cls}" width="20" height="20" aria-hidden="true"><use href="#i-${name}"/></svg>`;
 const eventHref=e=>`activity.html?id=${encodeURIComponent(e.id)}`;
 const fetchData=async name=>{if(window.__tsaFetchData)return window.__tsaFetchData(name);const r=await fetch(`assets/data/${name}.json`);if(!r.ok)throw new Error(name);return r.json();};
 const state={kind:'venues',map:null,events:null,courses:[]};
 const search=$('#hero-venue-search'),results=$('#hero-search-results'),form=$('#hero-search-form'),province=$('#home-province');
 document.addEventListener('error',e=>{const img=e.target;if(img.tagName==='IMG'&&img.closest('.assoc-logo')){img.remove();return;}if(img.tagName==='IMG'&&!img.dataset.fallback){img.dataset.fallback='1';img.src='assets/images/stadium-2.jpg';}},true);
 function matches(){
  const term=search.value.trim().toLocaleLowerCase('th'),p=province.value;
  if(term.length<2&&!p)return [];
  const test=(text,area)=>(!p||area===p)&&text.toLocaleLowerCase('th').includes(term);
  const found=[];
  if(['all','venues'].includes(state.kind))found.push(...(state.map?.venues||[]).filter(v=>test(`${v[2]} ${v[3]} ${v[4]}`,v[3])).slice(0,6).map(v=>({name:v[2],meta:`สนามกีฬา · ${v[3]}`,href:`venue.html?id=${encodeURIComponent(v[6])}`})));
  if(['all','events'].includes(state.kind))found.push(...(state.events?.events||[]).filter(e=>test(`${e.name} ${e.sport} ${e.province}`,e.province)).slice(0,6).map(e=>({name:e.name,meta:`กิจกรรม · ${e.province}`,href:eventHref(e)})));
  if(['all','courses'].includes(state.kind))found.push(...state.courses.filter(c=>(!p||(c.location_display||'').includes(p))&&`${c.name} ${c.category_name} ${c.location_display}`.toLocaleLowerCase('th').includes(term)).slice(0,6).map(c=>({name:c.name,meta:`หลักสูตร · ${c.date_display}`,href:c.url||'courses.html'})));
  return found.slice(0,8);
 }
 function closeSearch(){results.classList.remove('open');search.setAttribute('aria-expanded','false');}
 function renderSearch(){const found=matches();results.replaceChildren();if(search.value.trim().length<2&&!province.value){closeSearch();return;}if(!state.map&&!state.events)results.innerHTML='<p class="a-empty">กำลังโหลดข้อมูลค้นหา…</p>';else if(!found.length)results.innerHTML='<p class="a-empty">ไม่พบข้อมูลที่ตรงกับคำค้นหา ลองเปลี่ยนคำหรือจังหวัด</p>';else found.forEach(item=>{const a=document.createElement('a');a.className='hero-search-result';a.href=item.href;a.setAttribute('role','option');a.innerHTML=`<b>${esc(item.name)}</b><small>${esc(item.meta)}</small>`;results.append(a);});results.classList.add('open');search.setAttribute('aria-expanded','true');}
 // Preserve search IDs; handle the new categories before the legacy venue-only handler.
 search.addEventListener('input',e=>{e.stopImmediatePropagation();renderSearch();},true);
 search.addEventListener('focus',e=>{e.stopImmediatePropagation();renderSearch();},true);
 form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();renderSearch();const first=matches()[0];if(first)location.href=first.href;},true);
 search.addEventListener('keydown',e=>{if(e.key==='Escape')closeSearch();if(e.key==='ArrowDown'){e.preventDefault();results.querySelector('a')?.focus();}});
 results.addEventListener('keydown',e=>{const links=[...results.querySelectorAll('a')],i=links.indexOf(document.activeElement);if(e.key==='Escape'){closeSearch();search.focus();}if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();links[(i+(e.key==='ArrowDown'?1:-1)+links.length)%links.length]?.focus();}});
 province.addEventListener('change',renderSearch);
 document.querySelectorAll('[data-term]').forEach(b=>b.addEventListener('click',()=>{search.value=b.dataset.term;search.focus();renderSearch();}));
 document.addEventListener('click',e=>{if(!form.contains(e.target))closeSearch();});
 const kindCopy={venues:['ชนิดกีฬา หรือชื่อสนาม','เช่น ฟุตบอล, สระว่ายน้ำ, สนามกีฬากลาง'],events:['ชื่อกิจกรรม หรือชนิดกีฬา','เช่น มาราธอน, เดิน-วิ่ง, กีฬาเยาวชน'],courses:['ชื่อหลักสูตร หรือสถานที่อบรม','เช่น ผู้ฝึกสอน, นวัตกร, เชียงใหม่']};
 document.querySelectorAll('[data-search-kind]').forEach(b=>b.addEventListener('click',()=>{state.kind=b.dataset.searchKind;document.querySelectorAll('[data-search-kind]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));const [label,hint]=kindCopy[state.kind];$('#hero-search-label').textContent=label;search.placeholder=hint;renderSearch();}));

 // Shared lookups for the sections below.
 const todayKey=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok'}).format(new Date());
 const thDate=(iso,opts)=>new Date(iso+'T12:00:00+07:00').toLocaleDateString('th-TH',{timeZone:'Asia/Bangkok',...opts});
 const dateBadge=iso=>`<span class="h-date event-line-date"><b>${thDate(iso,{day:'numeric'})}</b><small>${thDate(iso,{month:'short'})}</small></span>`;
 const sportTone={'ฟุตบอล':'football','ว่ายน้ำ':'swim','ฟุตซอล':'futsal','บาสเกตบอล':'basket','แบดมินตัน':'badminton','วอลเลย์บอล':'badminton','ตะกร้อ':'basket'};
 const sportPhoto=text=>{const t=text||'',m=[['ว่าย','swimming'],['น้ำ','swimming'],['ฟุต','football'],['วอลเล','volleyball'],['บาส','basketball'],['แบด','badminton']].find(([k])=>t.includes(k));return `assets/images/sports-v4/${m?m[1]:'athletics'}.webp`;};
 const upcoming=()=>(state.events?.events||[]).filter(e=>/^\d{4}-\d{2}-\d{2}$/.test(e.start||'')&&e.start>=todayKey).sort((a,b)=>a.start.localeCompare(b.start)||(b.cover?1:0)-(a.cover?1:0));
 const eventMeta=e=>[e.province,e.sport,e.level].filter(Boolean);

 // The build embeds final KPI values; only the date-dependent note needs a tiny local calculation.
 const summaryNode=$('#home-stats-summary');
 if(summaryNode){
  try{
   const summary=JSON.parse(summaryNode.textContent);
   const count=Object.entries(summary.starts).reduce((sum,[date,n])=>sum+(date>=todayKey?n:0),0);
   $('#home-stats .hero-stat:nth-child(2) small').textContent=`${fmt(count)} กิจกรรมกำลังจะจัด`;
  }catch(error){console.error('Homepage summary:',error);}
 }

 function renderStats(){
  if(!state.map||!state.events)return;
  const d=state.map,sports=new Set(d.venues.map(v=>v[4]).filter(Boolean));
  const values=[[d.meta.totalRecords,'สนามและสถานที่กีฬา',`${fmt(d.meta.mappableVenues)} แห่งมีพิกัด`,'venues.html','stadium'],[state.events.total,'กิจกรรมที่บันทึกในระบบ',`${fmt(upcoming().length)} กิจกรรมกำลังจะจัด`,'#events','calendar'],[sports.size,'ชนิดกีฬา','','#sports','basket'],[d.provinces.features.length,'จังหวัดครอบคลุมทั่วประเทศ','','#nation','pin']];
  $('#home-stats').innerHTML=values.map(([n,label,note,href,glyph])=>`<a class="hero-stat" href="${href}">${icon(glyph,'stat-icon')}<span class="stat-text"><strong data-count="${n}">${fmt(n)}</strong><span>${label}</span>${note?`<small>${note}</small>`:''}</span></a>`).join('');
  $('#sports-all').innerHTML=`ดูทั้งหมด ${fmt(sports.size)} ชนิดกีฬา ${icon('arrow')}`;
 }
 let clearHeroRotation=()=>{};
 function renderHeroFeatured(){
  clearHeroRotation();
  const list=upcoming(),host=$('#premium-hero-featured');if(!host)return;
  if(!list.length){host.hidden=true;host.replaceChildren();return;}
  host.hidden=false;host.setAttribute('aria-live','off');host.setAttribute('role','region');host.setAttribute('aria-label','กิจกรรมใกล้เริ่ม');host.setAttribute('aria-roledescription','carousel');
  host.innerHTML='<a class="featured-alert"></a>';
  const link=host.querySelector('.featured-alert'),controller=new AbortController(),options={signal:controller.signal};
  let index=0,timer=0,visible=true,hovered=false,fade=null,revision=0;
  function show(next){
   index=(next+list.length)%list.length;const e=list[index],place=[e.place,e.province].filter(Boolean).join(' · ');
   fade?.cancel();link.href=eventHref(e);link.dataset.eventId=e.id;link.title=e.name;
   link.innerHTML=`<span class="date-block"><b>${thDate(e.start,{day:'numeric'}).padStart(2,'0')}</b><small>${thDate(e.start,{month:'short'})}</small></span><span class="alert-info"><span class="alert-label">${icon('calendar')} กิจกรรมใกล้เริ่ม</span><b>${esc(e.name)}</b><small title="${esc(place)}">${esc(place)}</small></span><span class="alert-arrow">${icon('chev-right')}</span>`;
  }
  const stopped=()=>motion.matches||document.hidden||!visible||hovered||host.contains(document.activeElement);
  function cancelFade(){revision++;fade?.cancel();fade=null;}
  async function advance(){
   const run=++revision;
   try{
    fade=link.animate([{opacity:1},{opacity:0}],{duration:420,easing:'ease-in-out',fill:'forwards'});
    await fade.finished;
    if(run!==revision||stopped())return;
    show(index+1);
    fade=link.animate([{opacity:0},{opacity:1}],{duration:520,easing:'ease-in-out'});
    await fade.finished;
   }catch(error){if(error.name!=='AbortError')console.error('Featured transition:',error);}
   finally{if(run===revision){fade?.cancel();fade=null;schedule();}}
  }
  function schedule(){
   clearTimeout(timer);
   if(stopped()){cancelFade();return;}
   if(list.length<2)return;
   timer=setTimeout(advance,6500);
  }
  host.addEventListener('pointerenter',()=>{hovered=true;schedule();},options);host.addEventListener('pointerleave',()=>{hovered=false;schedule();},options);
  host.addEventListener('focusin',schedule,options);host.addEventListener('focusout',()=>queueMicrotask(schedule),options);
  document.addEventListener('visibilitychange',schedule,options);motion.addEventListener('change',schedule,options);
  const observer='IntersectionObserver'in window?new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;schedule();},{threshold:.1}):null;observer?.observe(host);
  clearHeroRotation=()=>{clearTimeout(timer);observer?.disconnect();controller.abort();cancelFade();};
  show(0);schedule();
 }

 // Events that have not started yet: the hero teaser, then a month filter with one lead event and a short list.
 let activeMonth='';
 function renderEvents(){
  const list=upcoming().filter(e=>e.start.startsWith(activeMonth));
  if(!list.length){$('#home-events').innerHTML='<p class="h-empty">ยังไม่มีกิจกรรมในเดือนนี้</p>';return;}
  const lead=list.find(e=>e.cover)||list[0],rest=list.filter(e=>e!==lead).slice(0,3);
  const cover=lead.cover||'assets/premium-v4/event-running.webp';
  const tags=eventMeta(lead).slice(1).map(t=>`<span>${esc(t)}</span>`).join('');
  const range=lead.end&&lead.end!==lead.start?` – ${thDate(lead.end,{day:'numeric',month:'long',year:'numeric'})}`:'';
  $('#home-events').innerHTML=`<a class="h-feature event-featured" href="${eventHref(lead)}">${image(cover,lead.cover?'':'ภาพประกอบกีฬา','h-feature-img')}<span class="featured-badge">กิจกรรมแนะนำ${lead.cover?'':' · ภาพประกอบ'}</span><span class="event-featured-copy"><span class="event-meta">${thDate(lead.start,{day:'numeric',month:'long',year:'numeric'})}${range}</span><h3 class="event-title">${esc(lead.name)}</h3><span class="event-place">${icon('pin')}${esc([lead.place,lead.province].filter(Boolean).join(' · '))}</span><span class="event-tags">${tags}</span></span><span class="featured-arrow">${icon('chev-right')}</span></a>`
   +`<div class="events-right"><div class="h-event-list events-list">${rest.map(e=>`<a class="h-event event-line" href="${eventHref(e)}">${dateBadge(e.start)}<span class="h-event-text event-line-text"><b>${esc(e.name)}</b><small>${eventMeta(e).map(t=>esc(t)).join(' · ')}</small></span><span class="round-arrow">${icon('chev-right')}</span></a>`).join('')}</div><a class="view-events" href="activities.html">${icon('calendar')} ดูปฏิทินกิจกรรมทั้งหมด ${icon('arrow')}</a></div>`;
 }
 function renderEventMonths(){
  const months=[...new Set(upcoming().map(e=>e.start.slice(0,7)))].slice(0,3);
  if(!months.length){$('#home-events').innerHTML='<p class="h-empty">ยังไม่มีกิจกรรมที่กำลังจะจัด</p>';return;}
  activeMonth=months[0];
  $('#event-months').innerHTML=months.map(m=>`<button type="button" data-month="${m}" aria-pressed="${m===activeMonth}">${thDate(m+'-01',{month:'short',year:'numeric'})}</button>`).join('');
  $('#event-months').addEventListener('click',e=>{const b=e.target.closest('[data-month]');if(!b)return;activeMonth=b.dataset.month;document.querySelectorAll('[data-month]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderEvents();});
  renderEvents();
 }
 // Runs fn on an interval while the element is not hovered, focused or off-screen, and motion is allowed.
 function autoplay(el,fn,delay){
  let paused=false,visible=true;
  ['pointerenter','focusin','touchstart'].forEach(t=>el.addEventListener(t,()=>{paused=true;},{passive:true}));
  ['pointerleave','focusout'].forEach(t=>el.addEventListener(t,()=>{paused=false;}));
  if('IntersectionObserver'in window)new IntersectionObserver(([e])=>{visible=e.isIntersecting;}).observe(el);
  setInterval(()=>{if(!paused&&visible&&!document.hidden&&!motion.matches)fn();},delay);
 }
 async function loadEvents(){try{
  state.events=await fetchData('home-events-index');
  renderEventMonths();renderStats();renderHeroFeatured();
 }catch(error){console.error('Homepage events:',error);$('#home-events').innerHTML='<p class="h-empty">โหลดกิจกรรมไม่สำเร็จ กรุณารีเฟรชหน้าอีกครั้ง</p>';}}

 // Venues drift left while visible; native scrolling and arrow controls remain available.
 let covers={};
 const coverUrl=id=>{const c=covers[id];return c?.startsWith('https://')?c:c?.startsWith('/uploads/')?`https://sports-almanac.go.th/wp-content${c}`:'';};
 const km=(a,b,c,d)=>{const r=Math.PI/180,x=Math.sin((c-a)*r/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin((d-b)*r/2)**2;return 12742*Math.asin(Math.sqrt(x));};
 let clearVenueMotion=()=>{},pauseVenueMotion=()=>{};
 function renderVenues(list){
  clearVenueMotion();
  $('#home-venues').innerHTML=list.map(({v,dist})=>{const url=coverUrl(v[6]);
   return `<a class="h-venue venue-card" href="venue.html?id=${encodeURIComponent(v[6])}"><span class="venue-img">${url?image(url,v[2],'h-venue-img'):`<span class="h-venue-img h-venue-img--empty">${esc(v[4]||'สนามกีฬา')}</span>`}<span class="venue-chip">${esc(v[3])}</span></span><span class="h-venue-body venue-info"><b>${esc(v[2])}</b><small>${esc(v[3])}${dist!=null?` · ${dist<10?dist.toFixed(1):Math.round(dist)} กม.`:''}</small><span class="venue-tags"><span>${esc(v[4]||'กีฬาทั่วไป')}</span></span><span class="venue-go">${icon('chev-right')}</span></span></a>`;}).join('');
  $('#home-venues').scrollTo({left:0});
  startVenueMotion();
 }
 const rail=$('#home-venues');
 function startVenueMotion(){
  const originals=[...rail.children];if(originals.length<2)return;
  const copies=originals.map(card=>{const copy=card.cloneNode(true);copy.dataset.venueClone='';copy.setAttribute('aria-hidden','true');copy.tabIndex=-1;rail.append(copy);return copy;});
  const controller=new AbortController(),options={signal:controller.signal};
  let frame=0,last=0,position=rail.scrollLeft,visible=false,hovered=false,held=false,resumeAt=0;
  const blocked=()=>motion.matches||document.hidden||!visible||hovered||held||rail.contains(document.activeElement);
  function tick(now){
   frame=0;if(blocked())return;
   if(now>=resumeAt){
    const loop=copies[0].offsetLeft-originals[0].offsetLeft;
    position+=Math.min(now-last,50)*.025;
    if(loop>0&&position>=loop)position%=loop;
    rail.scrollLeft=position;
   }else position=rail.scrollLeft;
   last=now;frame=requestAnimationFrame(tick);
  }
  function sync(){cancelAnimationFrame(frame);frame=0;last=performance.now();position=rail.scrollLeft;if(!blocked())frame=requestAnimationFrame(tick);}
  pauseVenueMotion=()=>{resumeAt=performance.now()+4000;position=rail.scrollLeft;};
  rail.addEventListener('pointerenter',()=>{hovered=true;sync();},options);
  rail.addEventListener('pointerleave',()=>{hovered=false;sync();},options);
  rail.addEventListener('pointerdown',()=>{held=true;sync();},options);
  window.addEventListener('pointerup',()=>{held=false;pauseVenueMotion();sync();},options);
  window.addEventListener('pointercancel',()=>{held=false;sync();},options);
  rail.addEventListener('wheel',pauseVenueMotion,{...options,passive:true});
  rail.addEventListener('focusin',sync,options);rail.addEventListener('focusout',()=>queueMicrotask(sync),options);
  motion.addEventListener('change',sync,options);document.addEventListener('visibilitychange',sync,options);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(rail);
  clearVenueMotion=()=>{cancelAnimationFrame(frame);observer.disconnect();controller.abort();copies.forEach(copy=>copy.remove());pauseVenueMotion=()=>{};};
 }
 const stepRail=dir=>{const card=rail.querySelector('.h-venue');if(!card)return;
   pauseVenueMotion();
  const w=card.getBoundingClientRect().width+parseFloat(getComputedStyle(rail).columnGap||0),max=rail.scrollWidth-rail.clientWidth;
  let left=rail.scrollLeft+dir*w;if(left>max+4)left=0;else if(left<-4)left=max;
  rail.scrollTo({left,behavior:motion.matches?'auto':'smooth'});};
 $('#venue-prev').addEventListener('click',()=>stepRail(-1));
 $('#venue-next').addEventListener('click',()=>stepRail(1));

 function locate(){
  const status=$('#venue-status');$('#places').scrollIntoView({behavior:motion.matches?'auto':'smooth'});
  if(!navigator.geolocation){status.textContent='เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง';return;}
  if(!state.map){status.textContent='กำลังโหลดข้อมูลสนาม ลองอีกครั้งในอีกสักครู่';return;}
  status.textContent='กำลังหาตำแหน่งของคุณ…';
  navigator.geolocation.getCurrentPosition(pos=>{const {latitude:la,longitude:lo}=pos.coords;
   const near=state.map.venues.filter(v=>v[0]&&v[1]).map(v=>({v,dist:km(la,lo,v[0],v[1])})).sort((a,b)=>a.dist-b.dist).slice(0,10);
   renderVenues(near);$('#places-title').textContent='สนามใกล้คุณ';status.textContent='สนามที่ใกล้ตำแหน่งของคุณที่สุด เรียงจากใกล้ไปไกล';
  },()=>{$('#places-title').textContent='สำรวจสนามกีฬา';const recent=[...state.map.venues].sort((a,b)=>Number(b[6])-Number(a[6]));renderVenues(recent.filter(v=>coverUrl(v[6])).slice(0,12).map(v=>({v,dist:null})));status.textContent='ยังใช้ตำแหน่งไม่ได้ สำรวจสนามด้านล่าง หรือเลือกจังหวัดในช่องค้นหาด้านบนได้';},{timeout:10000,maximumAge:300000});
 }
 document.querySelectorAll('[data-locate]').forEach(b=>b.addEventListener('click',locate));

 // The map script fills the six category buttons; turn their counts into bar lengths.
 function syncBars(){
  const cards=[...document.querySelectorAll('.province-category-card')],nums=cards.map(c=>Number((c.querySelector('strong')?.textContent||'0').replace(/\D/g,''))||0),max=Math.max(1,...nums);
  cards.forEach((c,i)=>{c.style.setProperty('--pct',`${Math.max(nums[i]?1.5:0,nums[i]/max*100)}%`);c.style.setProperty('--bar-scale',String(nums[i]/max));});
 }
 const network=$('#province-category-network');
 if(network){new MutationObserver(syncBars).observe(network,{subtree:true,childList:true,characterData:true});syncBars();}

 async function loadMapData(){try{
  state.map=await fetchData('home-sports-index');covers=await fetchData('venue-covers').catch(()=>({}));
  const data=state.map;
  province.innerHTML='<option value="">ทุกจังหวัด</option>'+data.provinces.features.map(f=>f.properties.name).sort((a,b)=>a.localeCompare(b,'th')).map(n=>`<option>${esc(n)}</option>`).join('');
  const counts={};data.venues.forEach(v=>{counts[v[4]]=(counts[v[4]]||0)+1;});
  document.querySelectorAll('[data-sport-count]').forEach(el=>{el.textContent=fmt(counts[el.dataset.sportCount]||0);});
  const recent=[...data.venues].sort((a,b)=>Number(b[6])-Number(a[6]));
  renderVenues(recent.filter(v=>coverUrl(v[6])).slice(0,12).map(v=>({v,dist:null})));
  renderStats();
 }catch(error){console.error('Homepage places:',error);$('#home-venues').innerHTML='<p class="h-empty">โหลดข้อมูลสนามไม่สำเร็จ กรุณารีเฟรชหน้าอีกครั้ง</p>';}}

 // Courses: rounds of the same programme are grouped under one heading.
 async function loadCourses(){try{
  const data=await fetchData('training-courses');state.courses=data.courses||[];
  if(!state.courses.length){$('#training-course-grid').innerHTML='<p class="h-empty">ยังไม่มีหลักสูตรเผยแพร่</p>';return;}
  const groups=new Map();
  state.courses.forEach(c=>{const base=c.name.replace(/\s*\(\d+\/\d+\)\s*$/,'').trim();if(!groups.has(base))groups.set(base,[]);groups.get(base).push(c);});
  $('#training-course-grid').innerHTML=[...groups].map(([name,rounds])=>{rounds.sort((a,b)=>Number(a.id)-Number(b.id));const c0=rounds[0];
   return `<article class="h-course courses-panel"><div class="course-panel-head"><h3>${esc(name)}</h3><span class="course-count">ปี ${esc(c0.year)} · ${rounds.length} รุ่น</span></div><ol class="course-rows">${rounds.map((c,i)=>`<li><a href="${esc(c.url||'courses.html')}"><span class="course-icon">${icon(['run','shield','chart','users'][i%4])}</span><span class="course-text"><b>รุ่นที่ ${i+1}</b><small>${esc(c.location_display)}</small><small>${esc(c.date_display)}</small></span><em>ดูรายละเอียด</em><i>${icon('chev-right')}</i></a></li>`).join('')}</ol></article>`;}).join('');
 }catch{$('#training-course-grid').innerHTML='<p class="h-empty">โหลดหลักสูตรไม่สำเร็จ กรุณารีเฟรชหน้าอีกครั้ง</p>';}}

 const navShell=$('#tsa-home-header'),syncNav=()=>navShell?.classList.toggle('is-scrolled',scrollY>8);
 addEventListener('scroll',syncNav,{passive:true});syncNav();
 loadEvents();loadMapData();loadCourses();
})();
