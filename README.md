# GamePulse

[![Vue.js](https://img.shields.io/badge/Vue.js-3-42b883?logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-3-ffd859?logo=pinia&logoColor=111827)](https://pinia.vuejs.org/)
[![Vue Router](https://img.shields.io/badge/Vue_Router-5-42b883?logo=vue.js&logoColor=white)](https://router.vuejs.org/)

GamePulse — веб-приложение для поиска, изучения и анализа видеоигр. Оно собирает данные из RAWG Video Games Database и превращает их в удобный игровой каталог с рекомендациями, фильтрами, статистикой и личной библиотекой.

## Демо

[Посмотреть демо](https://game-pulse-sigma.vercel.app)

## Возможности

- главная страница с баннером и подборкой трендовых игр;
- поиск игр по названию;
- Discover с фильтрами по жанрам, платформам и тегам;
- детальная страница игры с рейтингом, описанием, платформами, скриншотами и ключевой информацией;
- сравнение двух игр;
- личная библиотека с сортировкой, статусами и прогрессом прохождения;
- статистика библиотеки: статусы, жанры, платформы и игры в процессе прохождения;
- адаптивная вёрстка для компьютеров, планшетов и мобильных устройств;
- SVG-иконки жанров и платформ;
- сохранение библиотеки в `localStorage` браузера.

## Стек

- Vue 3 с Composition API;
- TypeScript;
- Vite;
- Vue Router;
- Pinia;
- Axios;
- RAWG API;
- CSS с адаптивными media queries.

## Запуск проекта

Требуется Node.js `20.19+` или `22.12+`.

Установить зависимости:

```bash
npm install
```

Создать в корне проекта файл `.env`:

```env
VITE_RAWG_API_KEY=your_rawg_api_key
```

Получить API-ключ можно в личном кабинете [RAWG](https://rawg.io/apidocs).

Запустить dev-сервер:

```bash
npm run dev
```

После запуска приложение будет доступно по адресу, который выведет Vite, обычно `http://localhost:5173`.

## Production-сборка

Проверка типов и сборка проекта:

```bash
npm run build
```

Предварительный просмотр production-сборки:

```bash
npm run preview
```

Дополнительные команды:

```bash
npm run type-check
npm run lint
npm run format
```

## Деплой на Vercel

Проект можно импортировать из GitHub в Vercel. Для Vite используются следующие параметры:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

В настройках проекта Vercel нужно добавить переменную окружения:

```text
VITE_RAWG_API_KEY=your_rawg_api_key
```

После подключения репозитория каждый push в production-ветку будет запускать новый деплой.

## Структура проекта

```text
src/
├── api.ts                 # запросы к RAWG API
├── components/            # переиспользуемые компоненты и иконки
├── interfaces/            # TypeScript-типы
├── router/                # маршруты приложения
├── stores/                # состояние библиотеки и данных фильтров
└── views/                 # страницы приложения
public/                    # статические файлы и favicon
```

## Основные страницы

| Маршрут       | Назначение                        |
| ------------- | --------------------------------- |
| `/`           | Главная страница и трендовые игры |
| `/discover`   | Поиск и фильтрация игр            |
| `/game/:slug` | Подробная информация об игре      |
| `/compare`    | Сравнение игр                     |
| `/stats`      | Статистика личной библиотеки      |
| `/lib`        | Управление библиотекой            |

## Примечания

- API-ключ хранится только в `.env` и не должен добавляться в Git.
- Библиотека сохраняется локально в браузере и не синхронизируется между устройствами.
- Для корректной работы маршрутов при деплое SPA-сайта сервер должен возвращать `index.html` для неизвестных маршрутов.
