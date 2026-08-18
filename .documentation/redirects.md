# Карта URL: старый сайт → новый (301)

> Применить на сервере при деплое (этап 6): все старые адреса из индекса поисковиков
> должны отдавать `301 Moved Permanently` на новые. Форматы для конкретного сервера
> (htaccess / nginx /_redirects) сгенерируем при деплое из этой таблицы.

## Служебные страницы

| Старый URL              | Новый URL  |
| ----------------------- | ---------- |
| /index.html             | /          |
| /katalog-produkcii.html | /catalog/  |
| /kontakty.html          | /contacts/ |
| /zakazatj.html          | /order/    |

## Категории → /catalog/<category>/

| Старый URL                              | Новый URL                          |
| --------------------------------------- | ---------------------------------- |
| /dimohodi-iz-nerzhaveyuschej-stali.html | /catalog/stainless-steel-chimneys/ |
| /kolpaki-dlya-dimohodnih-trub.html      | /catalog/chimney-caps/             |
| /ocinkovannie-vozduhovodi.html          | /catalog/galvanized-air-ducts/     |
| /dobornie-elementi-dlya-krovli.html     | /catalog/roof-accessories/         |

## Товары → /catalog/<category>/<product>/

| Старый URL                                                | Новый URL                                                          |
| --------------------------------------------------------- | ------------------------------------------------------------------ |
| /uteplennie-dimohodi-iz-nerzhaveyuschej-stali.html        | /catalog/stainless-steel-chimneys/insulated-chimneys/              |
| /odnostennie-dimohodi-kruglogo-i-ovaljnogo-secheniya.html | /catalog/stainless-steel-chimneys/single-wall-chimneys/            |
| /truba-dimohoda-ovaljnaya.html                            | /catalog/stainless-steel-chimneys/oval-chimney-pipe/               |
| /montazhnie-kronshtejni-i-homuti.html                     | /catalog/stainless-steel-chimneys/brackets-and-clamps/             |
| /prohodnie-uzli-i-stenovie-opori.html                     | /catalog/stainless-steel-chimneys/wall-supports-and-pass-throughs/ |
| /zont-ventilyacionnij.html                                | /catalog/chimney-caps/vent-cap/                                    |
| /kolpak-na-stolb.html                                     | /catalog/chimney-caps/post-cap/                                    |
| /deflektor-ventilyacionnij.html                           | /catalog/chimney-caps/ventilation-deflector/                       |
| /dimnik.html                                              | /catalog/chimney-caps/brick-chimney-cap/                           |
| /vozduhovodi-iz-nerzhaveyuschej-stali.html                | /catalog/galvanized-air-ducts/stainless-steel-air-ducts/           |
| /vityazhnoj-zont.html                                     | /catalog/galvanized-air-ducts/exhaust-hood/                        |
| /truba-ventilyacionnaya-kruglaya.html                     | /catalog/galvanized-air-ducts/round-air-duct/                      |
| /truba-ventilyacionnaya-pryamougoljnaya.html              | /catalog/galvanized-air-ducts/rectangular-air-duct/                |
| /konek-krovli.html                                        | /catalog/roof-accessories/roof-ridge/                              |
| /page-56.html                                             | /catalog/roof-accessories/parapet-cap/                             |
| /otliv-okonnij.html                                       | /catalog/roof-accessories/window-flashing/                         |
| /karniznaya-planka.html                                   | /catalog/roof-accessories/eaves-flashing/                          |
| /snegovoj-barjer.html                                     | /catalog/roof-accessories/snow-guard/                              |
| /torcevaya-planka.html                                    | /catalog/roof-accessories/gable-flashing/                          |
| /endova-nizhnyaya.html                                    | /catalog/roof-accessories/valley-flashing-bottom/                  |
| /endova-verhnyaya.html                                    | /catalog/roof-accessories/valley-flashing-top/                     |

## Услуги → /services/<service>/

| Старый URL                    | Новый URL                       |
| ----------------------------- | ------------------------------- |
| /montazh-dimohoda.html        | /services/chimney-installation/ |
| /ventilyacionnie-sistemi.html | /services/ventilation-systems/  |

## Новые страницы (редирект не нужен)

- /privacy-policy/ — политика обработки персональных данных (на старом сайте не было).
