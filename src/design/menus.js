// The drop-down menus in the top bar are <details class="tz-menu"> so they
// work before any script runs. This makes them behave like menus once it
// does: opening one closes the others, and a click outside, a pick inside
// or Escape closes them.

const OPEN = 'details.tz-menu[open]';

function closeAll(root, except = null) {
  for (const menu of root.querySelectorAll(OPEN)) {
    if (menu !== except) menu.removeAttribute('open');
  }
}

export function watchMenus(root) {
  const onToggle = (event) => {
    const menu = event.target;
    if (menu.matches?.(OPEN)) closeAll(root, menu);
  };

  const onPointerDown = (event) => {
    if (!event.target.closest?.(OPEN)) closeAll(root);
  };

  // A link or button inside a panel is a pick: close its menu.
  const onClick = (event) => {
    const pick = event.target.closest?.('.tz-menu__panel a, .tz-menu__panel button');
    if (!pick) return;
    // The language switch redraws the page itself; leave it to do that.
    if (pick.closest('.tz-lang__pick')) return;
    pick.closest('details.tz-menu')?.removeAttribute('open');
  };

  const onKey = (event) => {
    if (event.key !== 'Escape') return;
    const open = root.querySelector(OPEN);
    if (!open) return;
    closeAll(root);
    open.querySelector('summary')?.focus();
  };

  root.addEventListener('toggle', onToggle, true);
  root.addEventListener('click', onClick);
  document.addEventListener('pointerdown', onPointerDown);
  document.addEventListener('keydown', onKey);
  return () => {
    root.removeEventListener('toggle', onToggle, true);
    root.removeEventListener('click', onClick);
    document.removeEventListener('pointerdown', onPointerDown);
    document.removeEventListener('keydown', onKey);
  };
}
