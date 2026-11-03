/* TSA Premium v4 map: supplied geometry + original TSA venue records. */
(async()=>{
 'use strict';
 await new Promise(resolve=>{
  const section=document.querySelector('#nation');
  if(!('IntersectionObserver'in window)){resolve();return;}
  const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();resolve();}},{rootMargin:'300px'});observer.observe(section);
 });
 const loadScript=src=>new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=resolve;script.onerror=()=>reject(new Error('Map asset unavailable: '+src));document.head.append(script);});
 await loadScript('assets/premium-v4/js/map-vendor.min.js');
 await loadScript('assets/premium-v4/data/thailand-districts.js');
 const data=await window.__tsaFetchData('home-sports-index');
 const byProvince=Object.fromEntries(data.provinces.features.map(f=>[f.properties.name,[]]));
 data.venues.forEach(v=>{(byProvince[v[3]]||=[]).push(v);});
 window.TSA_PROVINCE_STATS=Object.fromEntries(Object.entries(byProvince).map(([name,list])=>[name,{venues:list.length}]));
 const typeOf=name=>{
  if(/วิทยาศาสตร์การกีฬา|sports science/i.test(name))return 'science';
  if(/ศูนย์ฝึก|ศูนย์กีฬา|training|สถาบันกีฬา|โรงเรียนกีฬา/i.test(name))return 'training';
  if(/ฟิตเนส|fitness|ยิม|gym|ห้องออกกำลังกาย|ศูนย์ออกกำลังกาย|เพาะกาย/i.test(name))return 'fitness';
  if(/ลานกีฬา|สวนสาธารณะ|สวนสุขภาพ|สนามเด็กเล่น|ลานอเนกประสงค์/i.test(name))return 'public';
  if(/อาคารอเนกประสงค์|อเนกประสงค์|ยิมเนเซียม|gymnasium|โดมกีฬา|อาคารกีฬา/i.test(name))return 'multipurpose';
  return 'stadium';
 };
 const categories={stadium:0,public:0,fitness:0,multipurpose:0,training:0,science:0};
 data.venues.forEach(v=>categories[typeOf(v[2])]++);
 document.querySelector('#facility-count').textContent=data.meta.mappableVenues.toLocaleString('en-US');
 document.querySelector('#scope-note').textContent='สถานที่กีฬาที่มีพิกัดบนแผนที่ ทั่วประเทศ';
 const max=Math.max(...Object.values(categories));
 document.querySelectorAll('.bar-item[data-category]').forEach(row=>{const n=categories[row.dataset.category];row.querySelector('b').textContent=n.toLocaleString('en-US');row.querySelector('i').style.setProperty('--w',n/max*100+'%');});
 function geometryBounds(g){
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  const visit=c=>{if(typeof c[0]==='number'){minX=Math.min(minX,c[0]);maxX=Math.max(maxX,c[0]);minY=Math.min(minY,c[1]);maxY=Math.max(maxY,c[1]);}else c.forEach(visit);};visit(g.coordinates);return [minX,minY,maxX,maxY];
 }
 function inRing(r,x,y){let inside=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
 function contains(g,x,y){const polygons=g.type==='Polygon'?[g.coordinates]:g.coordinates;return polygons.some(rings=>inRing(rings[0],x,y)&&!rings.slice(1).some(r=>inRing(r,x,y)));}
(() => {
  'use strict';
  const V = window.TSAMapVendor, topo = window.TSA_GEO;
  const svgEl = document.getElementById('th-map');
  if (!V || !topo || !svgEl) return;
  let reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stats = window.TSA_PROVINCE_STATS || {};
  const fmt = new Intl.NumberFormat('th-TH');
  const $ = (id) => document.getElementById(id);
  const W = 520, H = 760;

  const districts = V.feature(topo, topo.objects.districts).features;
  const geomsByProv = {};
  topo.objects.districts.geometries.forEach(g => { (geomsByProv[g.properties.pro_th] ||= []).push(g); });
  const provinceNames = Object.keys(geomsByProv).sort((a, b) => a.localeCompare(b, 'th'));
  const provinces = provinceNames.map(name => ({ type: 'Feature', properties: { name, count: geomsByProv[name].length }, geometry: V.merge(topo, geomsByProv[name]) }));

  const projection = V.geoMercator().fitExtent([[18, 18], [W - 18, H - 18]], { type: 'FeatureCollection', features: provinces });
  const path = V.geoPath(projection);
  const svg = V.select(svgEl);
  const root = svg.append('g').attr('class', 'map-root');
  const provLayer = root.append('g').attr('class', 'prov-layer');
  const distLayer = root.append('g').attr('class', 'dist-layer');
  const labelLayer = root.append('g').attr('class', 'label-layer');

  const tip = $('map-tip');
  const showTip = (text, evt) => {
    tip.textContent = text; tip.hidden = false;
    const box = svgEl.parentNode.getBoundingClientRect();
    const x = (evt && evt.clientX != null) ? evt.clientX - box.left : box.width / 2;
    const y = (evt && evt.clientY != null) ? evt.clientY - box.top : 60;
    tip.style.left = Math.min(Math.max(x, 70), box.width - 70) + 'px';
    tip.style.top = Math.max(y - 14, 30) + 'px';
  };
  const hideTip = () => { tip.hidden = true; };

  let current = null, currentDistrict = null, k = 1;

  const provPaths = provLayer.selectAll('path').data(provinces).join('path')
    .attr('class', 'province').attr('d', path).attr('tabindex',0).attr('role','button').attr('aria-label',d=>'เลือกจังหวัด'+d.properties.name).attr('aria-pressed','false').on('keydown',(e,d)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectProvince(d.properties.name);}})
    .style('animation-delay', (d, i) => (reduce ? 0 : i * 12) + 'ms')
    .on('mousemove', (e, d) => {
      if (current === d.properties.name) return;
      const st = stats[d.properties.name];
      showTip(`จ.${d.properties.name} · ${d.properties.count} ${d.properties.name === 'กรุงเทพมหานคร' ? 'เขต' : 'อำเภอ'}${st && st.venues != null ? ' · ' + fmt.format(st.venues) + ' สนาม' : ''}`, e);
    })
    .on('mouseleave', hideTip)
    .on('click', (e, d) => selectProvince(d.properties.name));

  const select = $('map-province');
  provinceNames.forEach(n => select.add(new Option(n, n)));
  select.addEventListener('change', () => select.value ? selectProvince(select.value) : reset());
  $('map-reset').addEventListener('click', reset);
  $('map-crumb-home').addEventListener('click', reset);

  // px per viewBox unit and the visible viewBox area (preserveAspectRatio = meet)
  function viewport() {
    const r = svgEl.getBoundingClientRect();
    const s = Math.min(r.width / W, r.height / H) || 1;
    return { s, vw: r.width / s, vh: r.height / s };
  }
  function zoomTo(bounds, pad) {
    const [[x0, y0], [x1, y1]] = bounds;
    const { vw, vh } = viewport();
    const dx = x1 - x0, dy = y1 - y0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    k = Math.min(24, (1 - pad) * Math.min(vw / dx, (vh - 70) / dy));
    const t = `translate(${W / 2 - k * cx},${H / 2 + 12 - k * cy}) scale(${k})`;
    (reduce ? root : root.transition().duration(850)).attr('transform', t);
  }

  function selectProvince(name) {
    if (!geomsByProv[name]) return;
    current = name; currentDistrict = null; hideTip();
    select.value = name;
    const prov = provinces.find(p => p.properties.name === name);
    const list = districts.filter(d => d.properties.pro_th === name).sort((a, b) => a.properties.amp_th.localeCompare(b.properties.amp_th, 'th'));
    const isBkk = name === 'กรุงเทพมหานคร', unit = isBkk ? 'เขต' : 'อำเภอ';
    svgEl.parentNode.classList.add('is-zoomed');
    provPaths.classed('is-active', d => d.properties.name === name).classed('is-dim', d => d.properties.name !== name);
    zoomTo(path.bounds(prov), 0.14);

    const dPaths = distLayer.selectAll('path').data(list, d => d.properties.amp_code).join(
      enter => enter.append('path').attr('class', 'district').attr('d', path).style('opacity', 0)
        .call(sel => (reduce ? sel : sel.transition().delay((d, i) => 350 + i * 18).duration(300)).style('opacity', 1)),
      update => update, exit => exit.remove())
      .on('mousemove', (e, d) => showTip(`${unit}${d.properties.amp_th}${districtVenues(name, d.properties.amp_th)}`, e))
      .on('mouseleave', hideTip)
      .on('click', (e, d) => selectDistrict(d.properties.amp_th));
    dPaths.classed('is-active', false);

    const vp = viewport();
    const fs = (list.length > 30 ? 10 : 11.5) / (k * vp.s);
    labelLayer.selectAll('text').data(list, d => d.properties.amp_code).join('text')
      .attr('class', 'district-label')
      .attr('transform', d => { const c = path.centroid(d); return `translate(${c[0]},${c[1]})`; })
      .attr('font-size', fs).attr('stroke', 'none').attr('stroke-width', 0)
      .text(d => d.properties.amp_th)
      .classed('is-small', d => path.area(d) * (k * vp.s) ** 2 < 1800)
      .style('opacity', 0).call(sel => (reduce ? sel : sel.transition().delay(650).duration(300)).style('opacity', 1));

    // side panel
    $('scope-national').hidden = true; $('scope-province').hidden = false;
    $('prov-name').textContent = 'จ.' + name;
    $('prov-district-count').textContent = list.length;
    $('prov-district-label').textContent = unit;
    ensureDistrictCounts(name,list);
    const st = stats[name];
    $('prov-venues').textContent = st && st.venues != null ? fmt.format(st.venues) : '—';
    $('prov-venues').nextElementSibling.textContent='สถานที่มีพิกัด';
    provPaths.attr('aria-pressed',d=>String(d.properties.name===name));
    $('prov-note').textContent = st ? `ข้อมูลสถานที่มีพิกัดจากชุดข้อมูล TSA${st.unmatched?' · '+fmt.format(st.unmatched)+' แห่งยังระบุอำเภอจากพิกัดไม่ได้':''}` : `จำนวนสนามรายจังหวัด/${unit} รอเชื่อม API ของระบบ`;
    const area = list.reduce((s, d) => s + (d.properties.area || 0), 0);
    $('prov-area').textContent = area ? fmt.format(Math.round(area)) : '—';
    $('district-head').textContent = `${unit}ทั้งหมด ${list.length} ${unit}`;
    const box = $('district-list'); box.innerHTML = '';
    list.forEach(d => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'district-chip'; b.setAttribute('aria-pressed','false');
      b.textContent = d.properties.amp_th; b.dataset.name = d.properties.amp_th;
      b.addEventListener('click', () => selectDistrict(d.properties.amp_th));
      b.addEventListener('mouseenter', () => distLayer.selectAll('path').classed('is-hover', x => x.properties.amp_th === d.properties.amp_th));
      b.addEventListener('mouseleave', () => distLayer.selectAll('path').classed('is-hover', false));
      const item=document.createElement('div');item.setAttribute('role','listitem');item.append(b);box.append(item);
    });
    $('prov-link').href = 'venues.html?province=' + encodeURIComponent(name);
    $('map-reset').hidden = false;
    const cp = $('map-crumb-province'); cp.hidden = false; cp.textContent = 'จ.' + name;
    $('map-crumb-district').hidden = true;
    $('map-hint').textContent = `แตะ${unit}บนแผนที่เพื่อดูชื่อ หรือเลือกจังหวัดอื่น`;
  }

  function ensureDistrictCounts(name,list){
    if(stats[name].districts)return;
    const counts=Object.fromEntries(list.map(d=>[d.properties.amp_th,0]));
    const prepared=list.map(d=>({d,bounds:geometryBounds(d.geometry)}));let unmatched=0;
    for(const v of byProvince[name]||[]){
      const x=v[1],y=v[0];
      const found=prepared.find(p=>x>=p.bounds[0]&&x<=p.bounds[2]&&y>=p.bounds[1]&&y<=p.bounds[3]&&contains(p.d.geometry,x,y));
      if(found)counts[found.d.properties.amp_th]++;else unmatched++;
    }
    stats[name].districts=counts;stats[name].unmatched=unmatched;
  }
  function districtVenues(prov, amp) {
    const st = stats[prov] && stats[prov].districts && stats[prov].districts[amp];
    return st != null ? ` · ${fmt.format(st)} สนาม` : '';
  }

  function selectDistrict(amp) {
    currentDistrict = amp;
    const unit = current === 'กรุงเทพมหานคร' ? 'เขต' : 'อำเภอ';
    const sel = distLayer.selectAll('path').classed('is-active', d => d.properties.amp_th === amp);
    labelLayer.selectAll('text').classed('is-active', d => d.properties.amp_th === amp).filter(d => d.properties.amp_th === amp).raise();
    document.querySelectorAll('.district-chip').forEach(c=>{c.classList.toggle('is-active',c.dataset.name===amp);c.setAttribute('aria-pressed',String(c.dataset.name===amp));});
    const d = sel.filter(x => x.properties.amp_th === amp).datum();
    $('prov-venues').textContent=fmt.format(stats[current].districts[amp]||0);
    $('prov-venues').nextElementSibling.textContent='สถานที่มีพิกัดใน'+unit+'นี้';
    $('prov-area').textContent=d.properties.area?fmt.format(Math.round(d.properties.area)):'—';
    $('prov-note').textContent=unit+amp+' · แยกพื้นที่จากพิกัดสถานที่ในชุดข้อมูล TSA';
    const cd = $('map-crumb-district'); cd.hidden = false; cd.textContent = unit + amp;
    const place = () => {
      const c = path.centroid(d), ctm = root.node().getScreenCTM();
      const pt = svgEl.createSVGPoint(); pt.x = c[0]; pt.y = c[1];
      const s = pt.matrixTransform(ctm);
      showTip(`${unit}${amp} · จ.${current}${districtVenues(current, amp)}`, { clientX: s.x, clientY: s.y });
    };
    setTimeout(place, reduce ? 0 : 60);
  }

  function reset() {
    current = null; currentDistrict = null; hideTip(); select.value = '';
    svgEl.parentNode.classList.remove('is-zoomed');
    provPaths.attr('aria-pressed','false').classed('is-active', false).classed('is-dim', false);
    distLayer.selectAll('path').remove(); labelLayer.selectAll('text').remove();
    k = 1; (reduce ? root : root.transition().duration(750)).attr('transform', 'translate(0,0) scale(1)');
    $('scope-national').hidden = false; $('scope-province').hidden = true;
    $('map-reset').hidden = true; $('map-crumb-province').hidden = true; $('map-crumb-district').hidden = true;
    $('map-hint').textContent = 'แตะจังหวัดบนแผนที่ หรือเลือกจากรายการด้านบน';
  }
  window.__tsaPremiumMap={selectProvince,selectDistrict,reset,getState:()=>({province:current,district:currentDistrict}),getStats:()=>stats};
  svgEl.dataset.ready='true';
  svgEl.setAttribute('aria-busy','false');select.disabled=false;
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{reduce=e.matches;if(reduce){root.interrupt();distLayer.selectAll('*').interrupt();labelLayer.selectAll('*').interrupt();if(current)selectProvince(current);else reset();}});
})();
})().catch(error=>{
 console.error('TSA province explorer:',error);
 const note=document.querySelector('#map-hint');if(note)note.textContent='โหลดแผนที่ไม่สำเร็จ กรุณาลองอีกครั้ง หรือดูข้อมูลรายจังหวัดจากลิงก์ด้านข้าง';
});
