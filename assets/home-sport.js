// Motion extras for the sport home prototype (index-v3.html); home.js still renders all the data.
(() => {
 'use strict';
 const motion = matchMedia('(prefers-reduced-motion: reduce)');
 if (motion.matches) return;

 // Venue cards lean toward the pointer. Cards are rendered later by home.js, so delegate from the rail.
 const rail = document.querySelector('#home-venues');
 if (rail && matchMedia('(hover: hover)').matches) {
  rail.addEventListener('pointermove', e => {
   const card = e.target.closest('.h-venue');
   if (!card) return;
   const r = card.getBoundingClientRect();
   card.style.setProperty('--rx', `${((e.clientX - r.left) / r.width - .5) * 8}deg`);
   card.style.setProperty('--ry', `${((e.clientY - r.top) / r.height - .5) * -8}deg`);
  });
  rail.addEventListener('pointerout', e => {
   const card = e.target.closest('.h-venue');
   if (card && !card.contains(e.relatedTarget)) { card.style.removeProperty('--rx'); card.style.removeProperty('--ry'); }
  });
 }

 // Marquees speed up with scroll velocity, then ease back to their normal pace.
 const tracks = [...document.querySelectorAll('.sport-ribbon-track, .association-ticker-track')];
 let lastY = scrollY, boost = 0, frame = 0;
 const settle = () => {
  boost *= .92;
  tracks.forEach(t => t.getAnimations().forEach(a => { a.playbackRate = 1 + boost; }));
  frame = boost > .02 ? requestAnimationFrame(settle) : 0;
 };
 addEventListener('scroll', () => {
  boost = Math.min(6, boost + Math.abs(scrollY - lastY) / 40);
  lastY = scrollY;
  if (!frame) frame = requestAnimationFrame(settle);
 }, { passive: true });
})();
