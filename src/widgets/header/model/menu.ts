/* Мобильное меню: бургер открывает/закрывает панель навигации */
export function initMobileMenu(root: HTMLElement): void {
  const toggle = root.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = root.querySelector<HTMLElement>('[data-menu-panel]');
  if (!toggle || !panel) return;

  const close = () => {
    root.dataset.menuOpen = 'false';
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = root.dataset.menuOpen === 'true';
    root.dataset.menuOpen = String(!isOpen);
    toggle.setAttribute('aria-expanded', String(!isOpen));
  });

  panel.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) close();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}
