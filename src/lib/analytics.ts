/*
 * Google Tag Manager: код подключения и события для рекламы.
 *
 * Сами теги (GA4, конверсии Google Ads) настраиваются в интерфейсе GTM, в коде только
 * контейнер. ID приходит из окружения при сборке (GTM_ID): пустой — тега на странице
 * нет, так локальные сборки и превью не попадают в статистику.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Код подключения Google, одной строкой. Отличие от выданного Google: gtm.js
 * вставляется скриптом и только когда страницу реально открыли. Сайт пререндерит
 * страницы при наведении (lib/speculation.ts), а Яндекс.Метрика в контейнере
 * (тег «Пользовательский HTML») сама этого не учитывает и засчитала бы просмотры
 * страниц, которые никто не открывал. Адрес gtm.js берётся из data-src этого же
 * тега — так текст скрипта не зависит от ID контейнера.
 *
 * ВАЖНО: sha256 этой строки прописан в script-src заголовка CSP в public/.htaccess.
 * Любая правка (даже пробел) меняет хеш — пересчитай его там же:
 *   printf '%s' "<строка>" | openssl dgst -sha256 -binary | base64
 */
export const GTM_INLINE_SCRIPT =
  "(function(src){function load(){window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());var s=document.createElement('script');s.async=true;s.src=src;document.head.appendChild(s);}if(document.prerendering){document.addEventListener('prerenderingchange',load,{once:true});}else{load();}})(document.currentScript.dataset.src);";

export function gtmScriptUrl(containerId: string): string {
  return `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
}

/**
 * Заявка реально ушла — событие для триггера конверсии в GTM
 * («Специальное событие» с именем generate_lead). Без GTM на странице — тихо ничего.
 */
export function trackLead(): void {
  window.dataLayer?.push({ event: 'generate_lead' });
}
