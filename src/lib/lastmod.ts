/*
 * Даты последнего изменения страниц для карты сайта.
 *
 * Источник — история git: дата коммита честнее mtime, который после клонирования
 * репозитория у всех файлов одинаковый (а одинаковый lastmod на всём сайте
 * поисковики просто игнорируют). Если git недоступен или файла в истории нет
 * (новый, ещё не закоммиченный) — берём mtime, в крайнем случае дату сборки.
 *
 * Код выполняется только при сборке: карта сайта статическая.
 */
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';

/** file → ISO-дата последнего коммита, затронувшего файл */
function gitDates(): Map<string, string> {
  const dates = new Map<string, string>();
  try {
    /* Один проход по истории: даты идут от свежих к старым, первая встреча — последняя правка */
    const log = execFileSync(
      'git',
      ['log', '--date=iso-strict', '--pretty=format:%cd', '--name-only', '--', 'src'],
      { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
    );

    let current = '';
    for (const line of log.split('\n')) {
      if (line === '') continue;
      if (/^\d{4}-\d{2}-\d{2}T/.test(line)) current = line;
      else if (current && !dates.has(line)) dates.set(line, current);
    }
  } catch {
    /* Не репозиторий, git не установлен, история обрезана — молча уходим на mtime */
  }
  return dates;
}

const DATES = gitDates();

/** Дата в формате W3C (YYYY-MM-DD) — большего для карты сайта не нужно */
function day(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * Дата изменения страницы по её исходным файлам.
 * Файлов может быть несколько (страница + её контент) — берём самый свежий.
 */
export function lastModified(files: string[]): string {
  const stamps = files.map((file) => {
    const committed = DATES.get(file);
    if (committed) return day(committed);
    try {
      return day(statSync(file).mtime.toISOString());
    } catch {
      return '';
    }
  });

  const known = stamps.filter(Boolean).sort();
  return known.at(-1) ?? day(new Date().toISOString());
}
