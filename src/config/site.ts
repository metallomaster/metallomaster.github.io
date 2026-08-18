/*
 * Единственный адаптер к окружению фреймворка (astro:env).
 * Значения различаются между dev и prod — см. .env.development / .env.production.
 * При смене фреймворка переписывается только этот файл.
 */
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_DISPLAY,
  WEB3FORMS_KEY,
} from 'astro:env/client';

export interface SiteConfig {
  /** Название компании для шапки, футера и разметки Organization */
  readonly name: string;
  readonly legalName: string;
  readonly unp: string;
  readonly address: string;
  readonly siteUrl: string;
  /** Телефон в формате для ссылки tel: */
  readonly phone: string;
  /** Телефон в человекочитаемом формате */
  readonly phoneDisplay: string;
  readonly email: string;
  readonly instagram: string;
  /** Ключ Web3Forms; пустая строка — форма в режиме заглушки */
  readonly web3formsKey: string;
  /** Режим работы (TODO: уточнить у владельца, пока заглушка) */
  readonly openingHours: string;
}

export const siteConfig: SiteConfig = {
  name: 'METALLOMASTER',
  legalName: 'ИП Гунько Д. В.',
  unp: '690869052',
  address: 'аг. Колодищи, ул. Путейская',
  siteUrl: 'https://metallomaster.by',
  phone: CONTACT_PHONE,
  phoneDisplay: CONTACT_PHONE_DISPLAY,
  email: CONTACT_EMAIL,
  instagram: 'https://www.instagram.com/vasieleek/',
  web3formsKey: WEB3FORMS_KEY,
  openingHours: 'Пн–Пт 9:00–18:00',
};
