/*
 * Режим работы. Единственный источник — машиночитаемое расписание в siteConfig:
 * из него собирается и строка для футера с контактами, и openingHoursSpecification
 * в разметке. Дублировать график строкой нельзя — разъедутся при первой же правке.
 */

/** Дни недели по schema.org DayOfWeek, в порядке недели */
export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

export interface OpeningHours {
  /**
   * Рабочие дни именами schema.org (Monday…Sunday). Порядок не важен —
   * нормализуется по WEEK_DAYS, незнакомые имена отбрасываются.
   * Тип широкий (string), потому что config/ не вправе импортировать из lib/.
   */
  readonly days: readonly string[];
  /** Время в формате HH:MM — так требует schema.org */
  readonly opens: string;
  readonly closes: string;
}

/** Рабочие дни в порядке недели, без мусора и повторов */
export function weekDays(hours: OpeningHours): WeekDay[] {
  return WEEK_DAYS.filter((day) => hours.days.includes(day));
}

const DAY_SHORT: Record<WeekDay, string> = {
  Monday: 'Пн',
  Tuesday: 'Вт',
  Wednesday: 'Ср',
  Thursday: 'Чт',
  Friday: 'Пт',
  Saturday: 'Сб',
  Sunday: 'Вс',
};

/** 09:00 → 9:00: ведущий ноль нужен разметке, а в тексте выглядит казённо */
function humanTime(time: string): string {
  return time.replace(/^0/, '');
}

/** Подряд идущие дни — в диапазон: «Пн–Пт», а не «Пн, Вт, Ср, Чт, Пт» */
function groupDays(days: readonly WeekDay[]): WeekDay[][] {
  const groups: WeekDay[][] = [];

  days.forEach((day) => {
    const current = groups[groups.length - 1];
    const previous = current?.[current.length - 1];
    if (current && previous && WEEK_DAYS.indexOf(previous) === WEEK_DAYS.indexOf(day) - 1) {
      current.push(day);
    } else {
      groups.push([day]);
    }
  });

  return groups;
}

/** «Пн–Пт 9:00–17:00» — для шапки, футера и страницы контактов */
export function formatOpeningHours(hours: OpeningHours): string {
  const days = groupDays(weekDays(hours))
    .map((group) =>
      group.length > 1
        ? `${DAY_SHORT[group[0]]}–${DAY_SHORT[group[group.length - 1]]}`
        : DAY_SHORT[group[0]],
    )
    .join(', ');

  return `${days} ${humanTime(hours.opens)}–${humanTime(hours.closes)}`;
}
