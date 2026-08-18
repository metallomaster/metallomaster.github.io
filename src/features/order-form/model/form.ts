/*
 * Логика формы заявки: перехват submit, валидация, отправка в Web3Forms.
 * Разметка и подписи полей — в ui/order-form.astro, здесь только поведение.
 * Пустой access_key = демо-режим: письмо не шлём, но показываем сценарий успеха.
 */

const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

/* Белорусский номер: +375 и девять цифр. Пробелы, скобки и дефисы не мешают. */
const PHONE_RE = /^\+375\d{9}$/;

const FIELD_ERRORS = {
  name: 'Напишите имя — хотя бы две буквы',
  phone: 'Нужен номер в формате +375 (29) 123-45-67',
  consent: 'Без согласия мы не вправе обработать заявку',
} as const;

type Field = keyof typeof FIELD_ERRORS;

const FIELDS = Object.keys(FIELD_ERRORS) as Field[];

function fieldValue(form: HTMLFormElement, name: string): string {
  const control = form.elements.namedItem(name);
  if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) {
    return control.value.trim();
  }
  return '';
}

function setFieldError(form: HTMLFormElement, field: Field, message: string | null): void {
  const control = form.elements.namedItem(field);
  if (control instanceof HTMLElement) {
    if (message) control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');
  }

  const note = form.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
  if (note) {
    note.textContent = message ?? '';
    note.hidden = message === null;
  }
}

function validate(form: HTMLFormElement): Field[] {
  const invalid: Field[] = [];

  if (fieldValue(form, 'name').length < 2) invalid.push('name');

  const phone = fieldValue(form, 'phone').replace(/[\s()-]/g, '');
  if (!PHONE_RE.test(phone)) invalid.push('phone');

  const consent = form.elements.namedItem('consent');
  if (!(consent instanceof HTMLInputElement) || !consent.checked) invalid.push('consent');

  FIELDS.forEach((field) => {
    setFieldError(form, field, invalid.includes(field) ? FIELD_ERRORS[field] : null);
  });

  return invalid;
}

interface OrderPayload {
  access_key: string;
  subject: string;
  from_name: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  /* Honeypot: у людей поле пустое, у ботов — нет, Web3Forms такие письма отбрасывает */
  botcheck: string;
}

function buildPayload(form: HTMLFormElement, accessKey: string): OrderPayload {
  const product = fieldValue(form, 'product');
  const comment = fieldValue(form, 'comment');
  const email = fieldValue(form, 'email');

  const message =
    [product && `Что изготовить: ${product}`, comment && `Комментарий: ${comment}`]
      .filter(Boolean)
      .join('\n\n') || 'Клиент не оставил описание — уточните по телефону.';

  return {
    access_key: accessKey,
    subject: `Заявка с metallomaster.by: ${product || 'изделие из металла'}`,
    from_name: 'Сайт METALLOMASTER',
    name: fieldValue(form, 'name'),
    phone: fieldValue(form, 'phone'),
    ...(email ? { email } : {}),
    message,
    botcheck: fieldValue(form, 'botcheck'),
  };
}

/* Заменяем форму на блок «Спасибо» из <template data-success-template> */
function showSuccess(form: HTMLFormElement, demo: boolean): void {
  const template = form.querySelector<HTMLTemplateElement>('[data-success-template]');
  const success = template?.content.firstElementChild?.cloneNode(true);
  if (!(success instanceof HTMLElement)) return;

  if (demo) success.querySelector<HTMLElement>('[data-demo-note]')?.removeAttribute('hidden');

  form.replaceWith(success);
  success.focus();
}

function toggleSubmitError(form: HTMLFormElement, visible: boolean): void {
  const alert = form.querySelector<HTMLElement>('[data-submit-error]');
  if (alert) alert.hidden = !visible;
}

async function submitOrder(form: HTMLFormElement): Promise<void> {
  const invalid = validate(form);
  if (invalid.length > 0) {
    const first = form.elements.namedItem(invalid[0]);
    if (first instanceof HTMLElement) first.focus();
    return;
  }

  toggleSubmitError(form, false);

  const accessKey = form.dataset.accessKey ?? '';
  if (accessKey === '') {
    // Демо-режим: ключа ещё нет, письмо не отправляем
    showSuccess(form, true);
    return;
  }

  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const idleLabel = button?.textContent ?? '';
  if (button) {
    button.disabled = true;
    button.textContent = 'Отправляем…';
  }

  try {
    const response = await fetch(WEB3FORMS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(buildPayload(form, accessKey)),
    });
    const result: unknown = await response.json();
    const delivered =
      response.ok &&
      typeof result === 'object' &&
      result !== null &&
      (result as { success?: boolean }).success === true;

    if (!delivered) throw new Error('Web3Forms отклонил заявку');
    showSuccess(form, false);
  } catch {
    toggleSubmitError(form, true);
    if (button) {
      button.disabled = false;
      button.textContent = idleLabel;
    }
  }
}

export function initOrderForm(form: HTMLFormElement): void {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    void submitOrder(form);
  });

  // Ошибка у поля гаснет, как только его начали исправлять
  FIELDS.forEach((field) => {
    const control = form.elements.namedItem(field);
    if (control instanceof HTMLElement) {
      control.addEventListener('input', () => setFieldError(form, field, null));
    }
  });
}
