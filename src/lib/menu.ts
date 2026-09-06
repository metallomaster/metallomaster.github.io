/*
 * Основная навигация одним списком: на широких экранах её показывает шапка,
 * на узких — нижний таб-бар. Пункты и подсветка текущего раздела общие,
 * чтобы разделы не разъезжались между двумя видами меню.
 */

/** Ключ иконки таб-бара; контуры лежат в самом компоненте */
export type NavIcon = 'home' | 'catalog' | 'services' | 'contacts';

export interface NavItem {
  label: string;
  href: string;
  icon: NavIcon;
}

export const navItems: NavItem[] = [
  { label: 'Главная', href: '/', icon: 'home' },
  { label: 'Каталог', href: '/catalog/', icon: 'catalog' },
  { label: 'Услуги', href: '/services/', icon: 'services' },
  { label: 'Контакты', href: '/contacts/', icon: 'contacts' },
];

/** Путь к виду с завершающим слешем — сайт живёт на trailingSlash: 'always' */
export function normalizePath(pathname: string): string {
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

/**
 * Раздел считается текущим, если путь начинается с его адреса: карточка товара
 * подсвечивает «Каталог». Главная — исключение: её адрес префикс для всего.
 */
export function isCurrentPath(href: string, currentPath: string): boolean {
  return href === '/' ? currentPath === '/' : currentPath.startsWith(href);
}
