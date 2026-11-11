/** Native details handles keyboard activation; add dismissal for the tool panel. */
const menu = document.querySelector('.sim-tools-menu');
if (menu) {
 document.addEventListener('click', event => { if (!menu.contains(event.target)) menu.open = false; });
 document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.open) {
   menu.open = false;
   menu.querySelector('summary').focus();
  }
 });
}
