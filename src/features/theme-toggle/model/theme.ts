/*
 * Логика темы. Синхронизирована с inline-скриптом анти-FOUC в app/layouts/base-layout.astro:
 * ключ localStorage и значения data-theme должны совпадать.
 */
export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

export function getResolvedTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}

export function initThemeToggle(button: HTMLElement): void {
  button.addEventListener('click', () => {
    applyTheme(getResolvedTheme() === 'dark' ? 'light' : 'dark');
  });
}
