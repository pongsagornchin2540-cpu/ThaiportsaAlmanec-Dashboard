(() => {
 'use strict';
 const $=s=>document.querySelector(s), motion=matchMedia('(prefers-reduced-motion: reduce)');
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmt=n=>Number(n).toLocaleString('en-US');
 const image=(src,alt='',cls='')=>`<img class="${cls}" src="${esc(src||'assets/images/stadium-2.jpg')}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
 const eventHref=e=>`activity.html?id=${encodeURIComponent(e.id)}`;
 const fetchData=async name=>{const r=await fetch(`assets/data/${name}.json`);if(!r.ok)throw new Error(name);return r.json();};
 const state={kind:'venues',map:null,events:null,courses:[]};
 const search=$('#hero-venue-search'),results=$('#hero-search-results'),form=$('#hero-search-form'),province=$('#home-province');
 document.addEventListener('error',e=>{const img=e.target;if(img.tagName==='IMG'&&!img.dataset.fallback){img.dataset.fallback='1';img.src='assets/images/stadium-2.jpg';}},true);
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
 const dateBadge=iso=>`<span class="h-date"><b>${thDate(iso,{day:'numeric'})}</b><small>${thDate(iso,{month:'short'})}</small></span>`;
 const sportTone={'ฟุตบอล':'football','ว่ายน้ำ':'swim','ฟุตซอล':'futsal','บาสเกตบอล':'basket','แบดมินตัน':'badminton','วอลเลย์บอล':'badminton','ตะกร้อ':'basket'};
 const sportPhoto=text=>{const t=text||'',m=[['ว่าย','swimming'],['น้ำ','swimming'],['ฟุต','football'],['วอลเล','volleyball'],['บาส','basketball'],['แบด','badminton']].find(([k])=>t.includes(k));return `assets/images/sports-v4/${m?m[1]:'athletics'}.webp`;};
 const upcoming=()=>(state.events?.events||[]).filter(e=>/^\d{4}-\d{2}-\d{2}$/.test(e.start||'')&&e.start>=todayKey).sort((a,b)=>a.start.localeCompare(b.start)||(b.cover?1:0)-(a.cover?1:0));
 const eventMeta=e=>[e.province,e.sport,e.level].filter(Boolean);

 function renderStats(){
  if(!state.map||!state.events)return;
  const d=state.map,sports=new Set(d.venues.map(v=>v[4]).filter(Boolean));
  const values=[[d.meta.totalRecords,'สนามและสถานที่กีฬา',`${fmt(d.meta.mappableVenues)} แห่งมีพิกัดบนแผนที่`,'venues.html'],[state.events.total,'กิจกรรมที่บันทึกในระบบ',`${fmt(upcoming().length)} กิจกรรมกำลังจะจัด`,'#events'],[sports.size,'ชนิดกีฬา','','#sports'],[d.provinces.features.length,'จังหวัด ครบทั่วประเทศ','','#nation']];
  $('#home-stats').innerHTML=values.map(([n,label,note,href])=>`<a href="${href}"><b data-count="${n}">${fmt(n)}</b><span>${label}</span></a>`).join('');
  countUp($('#home-stats'));
  $('#sports-all').textContent=`ดูทั้ง ${fmt(sports.size)} ชนิดกีฬา`;
 }

 // Events that have not started yet: the hero teaser, then a month filter with one lead event and a short list.
 let activeMonth='';
 function renderEvents(){
  const list=upcoming().filter(e=>e.start.startsWith(activeMonth));
  if(!list.length){$('#home-events').innerHTML='<p class="h-empty">ยังไม่มีกิจกรรมในเดือนนี้</p>';return;}
  const lead=list.find(e=>e.cover)||list[0],rest=list.filter(e=>e!==lead).slice(0,3);
  const cover=lead.cover?image(lead.cover,'','h-feature-img'):`<span class="h-feature-img h-feature-img--empty">${image(sportPhoto(`${lead.sport} ${lead.name}`),'','h-feature-photo')}${dateBadge(lead.start)}</span>`;
  const tags=[lead.sport&&`<span class="h-tag h-tag--accent">${esc(lead.sport)}</span>`,lead.level&&`<span class="h-tag">${esc(lead.level)}</span>`].filter(Boolean).join('');
  const range=lead.end&&lead.end!==lead.start?` – ${thDate(lead.end,{day:'numeric',month:'long',year:'numeric'})}`:'';
  $('#home-events').innerHTML=`<a class="h-feature" href="${eventHref(lead)}">${cover}<span class="h-feature-body">${tags?`<span class="h-tags">${tags}</span>`:''}<h3>${esc(lead.name)}</h3><span class="h-feature-date">${thDate(lead.start,{weekday:'long',day:'numeric',month:'long',year:'numeric'})}${range}</span><span class="h-feature-place"><span>สถานที่</span>${[lead.place,lead.province].filter(Boolean).map(t=>`<em>${esc(t)}</em>`).join('')}</span></span></a>`
   +`<div class="h-event-list">${rest.map(e=>`<a class="h-event" href="${eventHref(e)}">${dateBadge(e.start)}<span class="h-event-text"><b>${esc(e.name)}</b><small>${eventMeta(e).map((t,i)=>`<span${i===1&&e.sport?' class="is-sport"':''}>${esc(t)}</span>`).join('')}</small></span></a>`).join('')}<a class="h-btn h-btn--outline h-btn--block" href="activities.html">เปิดปฏิทินกิจกรรมทั้งหมด</a></div>`;
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
 function renderHeroNext(){
  const list=upcoming().slice(0,5),card=$('#hero-next'),dots=$('#hero-next-dots');
  if(!list.length){card.hidden=true;return;}
  let i=0;
  const show=n=>{i=(n+list.length)%list.length;const e=list[i];
   card.classList.remove('is-in');void card.offsetWidth;card.classList.add('is-in');
   card.href=eventHref(e);
   card.innerHTML=`${dateBadge(e.start)}<span class="h-next-text"><b>${esc(e.name)}</b><small>${eventMeta(e).map(esc).join(' · ')}</small></span>`;
   dots.querySelectorAll('button').forEach((d,j)=>d.setAttribute('aria-current',String(j===i)));};
  if(list.length>1){
   dots.innerHTML=list.map((e,j)=>`<button type="button" aria-label="กิจกรรมที่ ${j+1}: ${esc(e.name)}"></button>`).join('');
   dots.addEventListener('click',e=>{const b=e.target.closest('button');if(b)show([...dots.children].indexOf(b));});
   autoplay(card.parentElement,()=>show(i+1),5000);
  }
  show(0);
 }
 async function loadEvents(){try{
  state.events=await fetchData('events-index');
  renderHeroNext();renderEventMonths();renderStats();
  if(state.events.generatedAt)$('#data-updated').textContent=`อัปเดตข้อมูลล่าสุด ${thDate(state.events.generatedAt.slice(0,10),{day:'numeric',month:'long',year:'numeric'})}`;
 }catch(error){console.error('Homepage events:',error);$('#home-events').innerHTML='<p class="h-empty">โหลดกิจกรรมไม่สำเร็จ กรุณารีเฟรชหน้าอีกครั้ง</p>';$('#hero-next').hidden=true;}}

 // Venues: an auto-advancing rail of the newest venues with photos, re-sorted by distance once the visitor shares a location.
 let covers={};
 const coverUrl=id=>{const c=covers[id];return c?.startsWith('https://')?c:c?.startsWith('/uploads/')?`https://sports-almanac.go.th/wp-content${c}`:'';};
 const km=(a,b,c,d)=>{const r=Math.PI/180,x=Math.sin((c-a)*r/2)**2+Math.cos(a*r)*Math.cos(c*r)*Math.sin((d-b)*r/2)**2;return 12742*Math.asin(Math.sqrt(x));};
 function renderVenues(list){
  $('#home-venues').innerHTML=list.map(({v,dist})=>{const url=coverUrl(v[6]),tone=sportTone[v[4]]||'other';
   return `<a class="h-venue h-tone--${tone}" href="venue.html?id=${encodeURIComponent(v[6])}">${url?image(url,v[2],'h-venue-img'):`<span class="h-venue-img h-venue-img--empty">${esc(v[4]||'สนามกีฬา')}</span>`}<span class="h-venue-body"><small>${esc(v[4]||'กีฬาทั่วไป')}</small><b>${esc(v[2])}</b><span>${esc(v[3])}${dist!=null?` · ${dist<10?dist.toFixed(1):Math.round(dist)} กม.`:''}</span></span></a>`;}).join('');
  $('#home-venues').scrollTo({left:0});
 }
 const rail=$('#home-venues');
 const stepRail=dir=>{const card=rail.querySelector('.h-venue');if(!card)return;
  const w=card.getBoundingClientRect().width+parseFloat(getComputedStyle(rail).columnGap||0),max=rail.scrollWidth-rail.clientWidth;
  let left=rail.scrollLeft+dir*w;if(left>max+4)left=0;else if(left<-4)left=max;
  rail.scrollTo({left,behavior:motion.matches?'auto':'smooth'});};
 $('#venue-prev').addEventListener('click',()=>stepRail(-1));
 $('#venue-next').addEventListener('click',()=>stepRail(1));
 autoplay(rail,()=>stepRail(1),4000);
 function locate(){
  const status=$('#venue-status');$('#places').scrollIntoView({behavior:motion.matches?'auto':'smooth'});
  if(!navigator.geolocation){status.textContent='เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง';return;}
  if(!state.map){status.textContent='กำลังโหลดข้อมูลสนาม ลองอีกครั้งในอีกสักครู่';return;}
  status.textContent='กำลังหาตำแหน่งของคุณ…';
  navigator.geolocation.getCurrentPosition(pos=>{const {latitude:la,longitude:lo}=pos.coords;
   const near=state.map.venues.filter(v=>v[0]&&v[1]).map(v=>({v,dist:km(la,lo,v[0],v[1])})).sort((a,b)=>a.dist-b.dist).slice(0,10);
   renderVenues(near);status.textContent='สนามที่ใกล้ตำแหน่งของคุณที่สุด เรียงจากใกล้ไปไกล';
  },()=>{status.textContent='ไม่ได้รับสิทธิ์ใช้ตำแหน่ง เปิดสิทธิ์ตำแหน่งในเบราว์เซอร์แล้วลองอีกครั้ง';},{timeout:10000,maximumAge:300000});
 }
 document.querySelectorAll('[data-locate]').forEach(b=>b.addEventListener('click',locate));

 // The map script fills the six category buttons; turn their counts into bar lengths.
 function syncBars(){
  const cards=[...document.querySelectorAll('.province-category-card')],nums=cards.map(c=>Number((c.querySelector('strong')?.textContent||'0').replace(/\D/g,''))||0),max=Math.max(1,...nums);
  cards.forEach((c,i)=>c.style.setProperty('--pct',`${Math.max(nums[i]?1.5:0,nums[i]/max*100)}%`));
 }
 const network=$('#province-category-network');
 if(network){new MutationObserver(syncBars).observe(network,{subtree:true,childList:true,characterData:true});syncBars();}

 async function loadMapData(){try{
  state.map=await fetchData('national-sports-map');covers=await fetchData('venue-covers').catch(()=>({}));
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
   return `<article class="h-course"><header><h3>${esc(name)}</h3><span class="h-tag">ปี ${esc(c0.year)} · ${rounds.length} รุ่น</span></header><ol>${rounds.map(c=>`<li><a href="${esc(c.url||'courses.html')}"><span><b>${esc((c.date_display||'').split('·')[0].trim())} · ${esc(c.location_display)}</b><small>${esc([c.category_name,c.level_name].filter(Boolean).join(' · '))}</small></span></a></li>`).join('')}</ol></article>`;}).join('');
 }catch{$('#training-course-grid').innerHTML='<p class="h-empty">โหลดหลักสูตรไม่สำเร็จ กรุณารีเฟรชหน้าอีกครั้ง</p>';}}

 // Motion: count-up figures, a slow parallax on the hero photo, and sections that rise into view.
 function countUp(root){
  if(motion.matches)return;
  root.querySelectorAll('[data-count]').forEach(el=>{const n=Number(el.dataset.count),t0=performance.now();
   const tick=t=>{const p=Math.min(1,(t-t0)/1400);el.textContent=fmt(Math.round(n*(1-(1-p)**3)));if(p<1)requestAnimationFrame(tick);};requestAnimationFrame(tick);});
 }
 const navShell=$('.nav-shell'),syncNav=()=>navShell?.classList.toggle('is-scrolled',scrollY>8);
 addEventListener('scroll',syncNav,{passive:true});syncNav();
 const heroMedia=$('.h-hero-media');
 if(heroMedia&&!motion.matches){let ticking=false;addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{const y=Math.min(scrollY,900);heroMedia.style.transform=`translate3d(0,${y*.22}px,0)`;ticking=false;});},{passive:true});}
 const watermark=$('.h-watermark');
 if(watermark&&!motion.matches){let wmTick=false;const moveWm=()=>{const r=watermark.parentElement.getBoundingClientRect(),p=(innerHeight-r.top)/(innerHeight+r.height);watermark.style.setProperty('--wm-x',`${Math.round((Math.min(Math.max(p,0),1)-.5)*-260)}px`);wmTick=false;};addEventListener('scroll',()=>{if(!wmTick){wmTick=true;requestAnimationFrame(moveWm);}},{passive:true});moveWm();}
 const revealTargets='.h-head,.h-split-intro,.h-sport,#map-intro,.h-feature,.h-event,.h-event-list>.h-btn,#home-venues,.h-course,.h-footer-grid>*';
 const revealIO='IntersectionObserver'in window&&!motion.matches?new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){const el=e.target;el.classList.add('is-in');revealIO.unobserve(el);setTimeout(()=>el.classList.remove('rv','is-in'),1600);}}),{rootMargin:'0px 0px -8% 0px',threshold:.05}):null;
 function reveal(){
  if(!revealIO)return;document.documentElement.classList.add('js-reveal');
  document.querySelectorAll(revealTargets).forEach(el=>{if(el.dataset.rv)return;el.dataset.rv='1';
   const sibs=[...el.parentElement.children].filter(c=>c.matches(revealTargets));el.style.setProperty('--i',Math.min(sibs.indexOf(el),8));
   el.classList.add('rv');revealIO.observe(el);});
 }
 new MutationObserver(reveal).observe($('#main'),{childList:true,subtree:true});
 reveal();
 loadEvents();loadMapData();loadCourses();
})();
