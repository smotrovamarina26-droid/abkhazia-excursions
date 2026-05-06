# Telegram booking API (Vercel)

Минимальный serverless endpoint для приёма заявок с сайта и отправки их в Telegram.

## Endpoint

- **URL:** `POST /api/telegram-booking`
- **Тело:** JSON с полями `name`, `phone`, `tour`, `source`, `page`, `date`, `comment` (значения могут быть строками; пустые опциональные поля в сообщении отображаются как «—»).

## Переменные окружения

Задайте их в Vercel: **Project → Settings → Environment Variables**. Секреты **не** коммитьте в репозиторий.

| Переменная | Описание |
|------------|----------|
| `TELEGRAM_BOT_TOKEN` | Токен бота от [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID` | ID чата (пользователь или группа), куда слать заявки |
| `ALLOWED_ORIGIN` | Разрешённый `Origin` браузера, например `https://ekskursii-v-abhaziyu.ru` (без слэша в конце) |

Пример значения `ALLOWED_ORIGIN` (подставьте свой домен):

```text
https://ekskursii-v-abhaziyu.ru
```

## Поведение

- Разрешён только метод **POST**; для CORS поддержан **OPTIONS**.
- Заголовок **`Origin`** должен совпадать с `ALLOWED_ORIGIN`, иначе ответ **403**.
- Проверяются **`name`** (непустая строка после trim, до 200 символов) и **`phone`** (после удаления нецифровых символов — разумная длина; для РФ обычно 11 цифр с ведущей `7` или 10 цифр с `9`).
- Сообщение уходит на `https://api.telegram.org/bot<token>/sendMessage` с сервера Vercel.
- Успех: `{ "ok": true }` и HTTP 200.
- Ошибка: `{ "ok": false, "error": "..." }` и соответствующий статус.

## Деплой на Vercel

1. Установите [Vercel CLI](https://vercel.com/docs/cli) или подключите репозиторий в веб-интерфейсе Vercel.
2. Укажите **root directory** проекта на папку `telegram-booking-api` (если репозиторий содержит несколько папок).
3. Добавьте переменные окружения `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `ALLOWED_ORIGIN`.
4. Задеплойте. Функция будет доступна по адресу вида:

   `https://<your-project>.vercel.app/api/telegram-booking`

5. На сайте вызывайте этот URL методом `POST` с заголовками `Content-Type: application/json` и с того домена, который указан в `ALLOWED_ORIGIN`.

## Локальная проверка (опционально)

```bash
cd telegram-booking-api
```

Создайте файл `.env.local` (не коммитьте) или экспортируйте переменные в shell, затем:

```bash
npx vercel dev
```

Пример запроса:

```bash
curl -X POST http://localhost:3000/api/telegram-booking \
  -H "Content-Type: application/json" \
  -H "Origin: https://ekskursii-v-abhaziyu.ru" \
  -d '{"name":"Иван","phone":"+7 967 800-75-52","tour":"Тест","source":"сайт","page":"/","date":"","comment":""}'
```

Замените `Origin` на значение из вашего `ALLOWED_ORIGIN`.
