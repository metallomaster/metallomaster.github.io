/* Мобильное меню: бургер открывает/закрывает панель навигации */

/** Что в панели может принять фокус — по этому списку ищем первый элемент */
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function initMobileMenu(root: HTMLElement): void {
  const toggle = root.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const panel = root.querySelector<HTMLElement>('[data-menu-panel]');
  if (!toggle || !panel) return;

  const isOpen = () => root.dataset.menuOpen === 'true';

  const open = () => {
    root.dataset.menuOpen = 'true';
    toggle.setAttribute('aria-expanded', 'true');
    /* Панель раскрывается ниже шапки — без переноса фокуса клавиатурный
       пользователь остался бы на бургере и не понял, что меню открылось */
    panel.querySelector<HTMLElement>(FOCUSABLE)?.focus();
  };

  /**
   * returnFocus — вернуть фокус на бургер. Нужен, когда меню закрыл сам
   * пользователь (Esc, повторный клик): иначе фокус остался бы на скрытой ссылке.
   * При переходе по ссылке или уходе фокуса дальше по странице возвращать нельзя.
   */
  const close = (returnFocus = false) => {
    const wasOpen = isOpen();
    root.dataset.menuOpen = 'false';
    toggle.setAttribute('aria-expanded', 'false');
    if (wasOpen && returnFocus) toggle.focus();
  };

  toggle.addEventListener('click', () => (isOpen() ? close(true) : open()));

  panel.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('a')) close();
  });

  /* Фокус ушёл за пределы шапки — меню закрываем, но фокус не отбираем: так
     Tab из меню ведёт дальше по странице (ловушка здесь была бы лишней —
     панель не модальное окно, страница под ней остаётся доступной) */
  root.addEventListener('focusout', (e) => {
    if (!isOpen()) return;
    if (e.relatedTarget instanceof Node && !root.contains(e.relatedTarget)) close();
  });

  /* Клик по странице мимо меню — тоже закрытие: иначе панель висит поверх контента */
  document.addEventListener('pointerdown', (e) => {
    if (!isOpen()) return;
    if (e.target instanceof Node && !root.contains(e.target)) close();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) close(true);
  });

  /* Из bfcache страница возвращается с прежним состоянием DOM — открытое меню закрываем */
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) close();
  });
}
