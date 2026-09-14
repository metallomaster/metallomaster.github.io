/*
 * Все данные компании и единственный адаптер к окружению фреймворка (astro:env).
 * Контакты заданы здесь же — из окружения приходит только ключ формы.
 * При смене фреймворка переписывается только этот файл.
 */
import { WEB3FORMS_KEY } from 'astro:env/client';

/* Из человекочитаемого номера в формат для tel:/JSON-LD: только плюс и цифры. */
function telFormat(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/** Адрес по частям: так его требует PostalAddress в разметке */
export interface SiteAddress {
  /** Код страны по ISO 3166-1 alpha-2 */
  readonly country: string;
  readonly region: string;
  readonly locality: string;
  /** Улица или кооператив с номером — населённый пункт сюда не дублируем */
  readonly street: string;
  /** Почтовый индекс: его требует PostalAddress в разметке и модерация Яндекс.Бизнеса */
  readonly postalCode?: string;
  /** Готовая строка для страниц: «аг. Колодищи, ГСПК «Колодищи»» */
  readonly text: string;
}

export interface SiteConfig {
  /** Название компании для шапки, футера и разметки Organization */
  readonly name: string;
  readonly legalName: string;
  readonly unp: string;
  readonly address: SiteAddress;
  /** Координаты производства: разметка организации и ссылки на карты */
  readonly geo: {
    readonly latitude: number;
    readonly longitude: number;
  };
  readonly siteUrl: string;
  /** Телефон в человекочитаемом формате — как показываем на странице */
  readonly phone: string;
  /** Тот же номер без разделителей — для ссылки tel: и разметки */
  readonly phoneHref: string;
  readonly email: string;
  /** Ключ Web3Forms; пустая строка — форма в режиме заглушки */
  readonly web3formsKey: string;
  /**
   * Режим работы машиночитаемо: отсюда и текст на страницах (formatOpeningHours),
   * и openingHoursSpecification в разметке. График подтверждён владельцем 14.09.2026.
   * Дни — именами schema.org, время — HH:MM. Форма совпадает с OpeningHours из lib/schedule.
   */
  readonly openingHours: {
    readonly days: readonly string[];
    readonly opens: string;
    readonly closes: string;
  };
}

const TAX_ID = '690869052';
const LOCALITY = 'аг. Колодищи';
const STREET = 'ГСПК «Колодищи»';
const PHONE = '+375 (29) 322-00-10';
const EMAIL = '3220010@mail.ru';
const POSTAL_CODE = '223050';

export const siteConfig: SiteConfig = {
  name: 'METALLOMASTER',
  legalName: 'ИП Гунько Д. В.',
  unp: TAX_ID,
  address: {
    country: 'BY',
    region: 'Минская область',
    locality: LOCALITY,
    street: STREET,
    postalCode: POSTAL_CODE,
    text: `${LOCALITY}, ${STREET}`,
  },
  geo: {
    /* Точка карточки «Металломастер» в Яндекс.Картах (найдена по телефону компании,
       org/metallomaster/212145119949) — она стоит в рядах боксов ГСПК «Колодищи».
       Совпадает с полигоном ГСК «Колодищи» в OpenStreetMap (way/98723318). */
    latitude: 53.952978,
    longitude: 27.789054,
  },
  siteUrl: 'https://metallomaster.by',
  phone: PHONE,
  phoneHref: telFormat(PHONE),
  email: EMAIL,
  web3formsKey: WEB3FORMS_KEY,
  openingHours: {
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '17:00',
  },
};
