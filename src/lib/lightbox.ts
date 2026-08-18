/*
 * Лайтбокс: полноэкранный просмотр фото через <dialog>.
 * Компоненты помечают ссылки <a data-lightbox-group="…" href="полноразмер">,
 * разметка диалога — components/organisms/lightbox.astro (вставляется один раз на страницу).
 */

/** Минимальный сдвиг пальца по горизонтали, чтобы засчитать свайп */
const SWIPE_THRESHOLD = 48;

export function initLightbox(root: HTMLElement): void {
  const dialog = root.querySelector<HTMLDialogElement>('[data-lightbox-dialog]');
  const image = dialog?.querySelector<HTMLImageElement>('[data-lightbox-image]');
  const counter = dialog?.querySelector<HTMLElement>('[data-lightbox-counter]');
  if (!dialog || !image || !counter) return;

  let group: HTMLAnchorElement[] = [];
  let index = 0;

  const render = (): void => {
    const link = group[index];
    if (!link) return;
    image.src = link.href;
    image.alt = link.querySelector('img')?.alt ?? '';
    counter.textContent = `${index + 1} / ${group.length}`;
  };

  const show = (shift: number): void => {
    if (group.length < 2) return;
    index = (index + shift + group.length) % group.length;
    render();
  };

  const open = (link: HTMLAnchorElement): void => {
    const selector = `a[data-lightbox-group="${link.dataset.lightboxGroup ?? ''}"]`;
    group = [...root.querySelectorAll<HTMLAnchorElement>(selector)];
    index = Math.max(0, group.indexOf(link));
    render();
    dialog.showModal();
    // Блокируем прокрутку страницы, пока открыт оверлей
    document.body.style.overflow = 'hidden';
  };

  // Делегирование: ссылки размечаются в любом компоненте внутри root
  root.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[data-lightbox-group]');
    if (!link) return;
    event.preventDefault();
    open(link);
  });

  dialog.querySelector('[data-lightbox-prev]')?.addEventListener('click', () => show(-1));
  dialog.querySelector('[data-lightbox-next]')?.addEventListener('click', () => show(1));
  dialog.querySelector('[data-lightbox-close]')?.addEventListener('click', () => dialog.close());

  // Escape закрывает <dialog> нативно; здесь — листание стрелками
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(-1);
    if (event.key === 'ArrowRight') show(1);
  });

  // Свайп на тач-устройствах (pointer events)
  let touchStartX: number | null = null;
  let swiped = false;

  dialog.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch') touchStartX = event.clientX;
  });

  dialog.addEventListener('pointerup', (event) => {
    if (touchStartX === null || event.pointerType !== 'touch') return;
    const shiftX = event.clientX - touchStartX;
    touchStartX = null;
    if (Math.abs(shiftX) >= SWIPE_THRESHOLD) {
      swiped = true;
      show(shiftX < 0 ? 1 : -1);
    }
  });

  dialog.addEventListener('pointercancel', () => {
    touchStartX = null;
  });

  // Клик по фону (мимо фото и кнопок) закрывает; клик после свайпа игнорируем
  dialog.addEventListener('click', (event) => {
    if (swiped) {
      swiped = false;
      return;
    }
    if (!(event.target as HTMLElement).closest('img, button')) dialog.close();
  });

  dialog.addEventListener('close', () => {
    document.body.style.overflow = '';
  });
}
