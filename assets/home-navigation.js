/* Existing TSA navigation behavior, isolated from the previous canvas home. */
(()=>{
const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
menuButton.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'ปิดเมนูหลัก' : 'เปิดเมนูหลัก');
});
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'เปิดเมนูหลัก');
}));

document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => trigger.addEventListener('click', event => {
  event.stopPropagation();
  const group = trigger.closest('.nav-group');
  document.querySelectorAll('.nav-group.open').forEach(item => {if(item !== group){item.classList.remove('open');item.querySelector('.nav-dropdown-trigger').setAttribute('aria-expanded','false')}});
  const open = group.classList.toggle('open');
  trigger.setAttribute('aria-expanded',String(open));
}));
document.querySelectorAll('.mobile-accordion-trigger').forEach(trigger => trigger.addEventListener('click', () => {
  const item = trigger.closest('.mobile-accordion');
  const open = item.classList.toggle('open');
  trigger.setAttribute('aria-expanded',String(open));
}));
document.addEventListener('click', () => document.querySelectorAll('.nav-group.open').forEach(item => {item.classList.remove('open');item.querySelector('.nav-dropdown-trigger').setAttribute('aria-expanded','false')}));
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll('.nav-group.open').forEach(item => {
    item.classList.remove('open');
    item.querySelector('.nav-dropdown-trigger').setAttribute('aria-expanded', 'false');
  });
  if (document.activeElement?.matches('.nav-dropdown-trigger')) document.activeElement.blur();
  mobileMenu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'เปิดเมนูหลัก');
});


})();