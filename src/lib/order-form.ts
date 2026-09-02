/*
 * Логика формы заявки: перехват submit, валидация, отправка в Web3Forms.
 * Разметка и подписи полей — в components/organisms/order-form.astro, здесь только поведение.
 * Пустой access_key = демо-режим: письмо не шлём, но показываем сценарий успеха.
 */

const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

/* Белорусский номер в международном виде: +375 и девять цифр. */
const PHONE_RE = /^\+375\d{9}$/;

/* Адрес без пробелов, с собакой и точкой в домене: строже проверять на клиенте нечего,
   настоящую проверку делает доставка письма. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Номер к виду +375XXXXXXXXX. Люди пишут телефон бытовыми записями — «8 029 322-00-10»,
 * «029 322-00-10», «29 322-00-10», — и все они означают один и тот же номер.
 * Отбивать такую заявку сообщением об ошибке значит терять живого клиента.
 */
function normalizePhone(raw: string): string {
  const value = raw.replace(/[^\d+]/g, '');
  /* 80 291234567 — междугородний набор внутри страны */
  if (/^80\d{9}$/.test(value)) return `+375${value.slice(2)}`;
  /* 375291234567 — тот же номер, но плюс потеряли */
  if (/^375\d{9}$/.test(value)) return `+${value}`;
  /* 0291234567 — код оператора с ведущим нулём */
  if (/^0\d{9}$/.test(value)) return `+375${value.slice(1)}`;
  /* 291234567 — только код оператора и номер */
  if (/^\d{9}$/.test(value)) return `+375${value}`;
  return value;
}

/*
 * Порог времени заполнения — вторая линия против спама: honeypot Web3Forms сам сервис
 * пометил устаревшим, а капча бьёт по конверсии B2B-заявки. Порог намеренно низкий:
 * боты отправляют форму мгновенно, а человек с автозаполнением укладывается и в две
 * секунды — из-за более высокого порога терялись бы живые заявки. Защита клиентская,
 * то есть обходится запросом в обход страницы: настоящий предел спаму ставит
 * ограничение по домену в панели Web3Forms.
 */
const MIN_FILL_MS = 1500;

const FIELD_ERRORS = {
  name: 'Напишите имя — хотя бы две буквы',
  phone: 'Нужен белорусский номер: +375 29 123-45-67 или 8 029 123-45-67',
  email: 'Проверьте адрес — похоже, в нём опечатка',
  consent: 'Без согласия мы не вправе обработать заявку',
} as const;

/* Названия полей для сводки: «Телефон: нужен номер…» понятнее, чем текст ошибки в отрыве */
const FIELD_LABELS = {
  name: 'Имя',
  phone: 'Телефон',
  email: 'Email',
  consent: 'Согласие на обработку данных',
} as const;

type Field = keyof typeof FIELD_ERRORS;

const FIELDS = Object.keys(FIELD_ERRORS) as Field[];

/* Склонение «ошибка» под число: скринридер читает сводку вслух, падеж слышно */
function errorsWord(count: number): string {
  const tail = count % 100 >= 11 && count % 100 <= 14 ? 0 : count % 10;
  if (tail === 1) return 'ошибка';
  if (tail >= 2 && tail <= 4) return 'ошибки';
  return 'ошибок';
}

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

function setSummary(form: HTMLFormElement, invalid: Field[]): void {
  const summary = form.querySelector<HTMLElement>('[data-validation-summary]');
  const title = form.querySelector<HTMLElement>('[data-validation-summary-title]');
  const list = form.querySelector<HTMLElement>('[data-validation-summary-list]');
  if (!summary || !title || !list) return;

  if (invalid.length === 0) {
    summary.hidden = true;
    title.textContent = '';
    list.replaceChildren();
    return;
  }

  title.textContent = `Заявка не отправлена: ${invalid.length} ${errorsWord(invalid.length)}`;
  list.replaceChildren(
    ...invalid.map((field) => {
      const item = document.createElement('li');
      item.textContent = `${FIELD_LABELS[field]} — ${FIELD_ERRORS[field]}`;
      return item;
    }),
  );
  summary.hidden = false;
}

function validate(form: HTMLFormElement): Field[] {
  const invalid: Field[] = [];

  if (fieldValue(form, 'name').length < 2) invalid.push('name');

  if (!PHONE_RE.test(normalizePhone(fieldValue(form, 'phone')))) invalid.push('phone');

  /* Email необязателен, но если его оставили — он должен быть рабочим: с опечаткой
     сервис доставки отклонит письмо целиком, и человек увидит невнятный сбой отправки */
  const email = fieldValue(form, 'email');
  if (email !== '' && !EMAIL_RE.test(email)) invalid.push('email');

  const consent = form.elements.namedItem('consent');
  if (!(consent instanceof HTMLInputElement) || !consent.checked) invalid.push('consent');

  FIELDS.forEach((field) => {
    setFieldError(form, field, invalid.includes(field) ? FIELD_ERRORS[field] : null);
  });
  setSummary(form, invalid);

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
    /* В письмо уходит приведённый номер: по нему сразу видно, куда звонить */
    phone: normalizePhone(fieldValue(form, 'phone')),
    ...(email ? { email } : {}),
    message,
    botcheck: fieldValue(form, 'botcheck'),
  };
}

/** Форму открыли и отправили быстрее, чем успел бы человек */
function filledTooFast(form: HTMLFormElement): boolean {
  const readyAt = Number(form.dataset.readyAt);
  return Number.isFinite(readyAt) && readyAt > 0 && Date.now() - readyAt < MIN_FILL_MS;
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
  // aria-disabled кнопку не блокирует — от повторной отправки защищаемся сами
  if (form.dataset.submitting === 'true') return;

  const invalid = validate(form);
  if (invalid.length > 0) {
    const first = form.elements.namedItem(invalid[0]);
    if (first instanceof HTMLElement) first.focus();
    return;
  }

  toggleSubmitError(form, false);

  const accessKey = form.dataset.accessKey ?? '';
  const demo = accessKey === '';

  /* Демо-режим (ключа ещё нет) и отсев бота по времени заполнения выглядят снаружи
     одинаково: письмо не уходит, но сценарий успеха показываем — скрипту незачем
     знать, на чём он споткнулся. */
  if (demo || filledTooFast(form)) {
    showSuccess(form, demo);
    return;
  }

  form.dataset.submitting = 'true';

  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const idleLabel = button?.textContent ?? '';
  /* aria-disabled, а не disabled: отключённая кнопка теряет фокус, и пользователь
     клавиатуры оказывается в начале страницы, не услышав, что происходит */
  if (button) {
    button.setAttribute('aria-disabled', 'true');
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
      button.removeAttribute('aria-disabled');
      button.textContent = idleLabel;
    }
  } finally {
    form.dataset.submitting = 'false';
  }
}

export function initOrderForm(form: HTMLFormElement): void {
  form.dataset.readyAt = String(Date.now());

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
