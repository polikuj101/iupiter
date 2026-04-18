# Iupiter MVP Setup Guide

## Быстрый старт (30 минут)

### 0. Настрой Clerk Authentication

1. Открой [dashboard.clerk.com](https://dashboard.clerk.com) (или создай аккаунт)
2. Создай новое приложение → Next.js
3. В левом меню → **Configure** → **API Keys**
4. Скопируй:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` → в `.env.local`
   - `CLERK_SECRET_KEY` → в `.env.local`

### 1. Получи Google Gemini API ключ

1. Открой [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Нажми **"Create API Key"**
3. Скопируй ключ → вставь в `.env.local` как `GOOGLE_API_KEY`

### 2. Получи Meta токены

**WhatsApp:**
- В Meta Developer → WhatsApp → Configuration
- Нажми **"Generate access token"** → скопируй как `WHATSAPP_TOKEN`
- **Phone Number ID** → скопируй как `WHATSAPP_PHONE_NUMBER_ID`

**Instagram (опционально):**
- Graph API Explorer → выбери свою Facebook Page → **"Generate Access Token"**
- Скопируй как `META_PAGE_ACCESS_TOKEN`

### 3. Создай `.env.local`

```bash
cp .env.example .env.local
```

Заполни:

```env
# Clerk Authentication (из шага 0)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxx...
CLERK_SECRET_KEY=sk_test_xxxx...

# Meta Webhook — придумай сам
META_WEBHOOK_VERIFY_TOKEN=iupiter_verify_2026

# WhatsApp токены
WHATSAPP_TOKEN=EAAZBcHFR4Q2QBREeRGJ8hY4QRzX8Rh...
WHATSAPP_PHONE_NUMBER_ID=1049216348279946

# Google Gemini
GOOGLE_API_KEY=AIzaSy...
GOOGLE_MODEL=gemini-2.0-flash

# Optional: описание бизнеса для промпта
BUSINESS_CONTEXT=
```

### 4. Деплой на Vercel

```bash
npm install
npx vercel --prod
```

Скопируй URL, который выведет Vercel (например `https://iupiter-xxx.vercel.app`)

**После деплоя:**
1. Открой Vercel Dashboard → Settings → Environment Variables
2. Добавь все переменные из `.env.local`
3. Redeploy: нажми на последний деплой → Redeploy
4. **В Clerk Dashboard**: добавь твой Vercel URL как Allowed Redirect URL:
   - Settings → Allowed Redirect URLs
   - Add: `https://iupiter-xxx.vercel.app`
   - Add: `https://iupiter-xxx.vercel.app/api/auth/callback/clerk`

### 5. Настрой Webhook в Meta

В Meta Developer → WhatsApp → Configuration:

- **Callback URL**: `https://iupiter-xxx.vercel.app/api/webhook/meta`
- **Verify Token**: `iupiter_verify_2026`

Нажми **"Verify and save"**

### 6. Тестируй

Отправь сообщение на тестовый номер WhatsApp: **+1 555 646 2767**

Агент должен ответить за 1-3 секунды.

---

## Структура проекта

```
lib/
├── conversation-store.ts    ← История диалогов (in-memory)
├── meta-client.ts           ← Отправка через Meta API
├── llm.ts                   ← Gemini интеграция
└── agent.ts                 ← Оркестрация & задержка

app/api/
└── webhook/meta/route.ts    ← GET верификация + POST входящие сообщения
```

---

## Как работает агент

```
Входящее сообщение
    ↓
POST /api/webhook/meta
    ↓
Дедупликация (по messageId)
    ↓
Сохранить turn в историю
    ↓
Отправить typing_on (Instagram только)
    ↓
Вызвать Gemini API
    ↓
Ждать (600ms + ~8 символов/сек)  ← имитация печати
    ↓
Сохранить ответ в историю
    ↓
Отправить через Meta API
```

---

## Система Prompt (из `lib/llm.ts`)

Агент автоматически:
- Пишет коротко (1-3 предложения)
- Избегает маркированных списков
- Использует разговорный стиль
- Задаёт одно уточняющее вопрос
- Знает контекст бизнеса из `BUSINESS_CONTEXT`

Модифицировать можно прямо в `lib/llm.ts` функция `buildSystemPrompt()`.

---

## Динамическая задержка (typing simulation)

Из `lib/agent.ts`:

```typescript
BASE_MS = 600ms           // пауза перед ответом
CHARS_PER_SEC = 8         // темп печати (~48 WPM)
MAX_MS = 5000ms           // не более 5 сек

// Примеры:
"Привет!"           (8 символов)  → ~1 сек
"Окей, записал тебя на вторник в 14:00" (40 символов) → ~5 сек (cap)
```

---

## Production Notes

### Хранение истории
Сейчас: in-memory Map с TTL 24 часа
Для продакшена: добавь Redis или PostgreSQL

### Токены
- WhatsApp токен: живёт ~60 дней → обновляй регулярно
- Gemini API: бесплатно до определённого лимита запросов

### Безопасность
- ❌ Никогда не показывай токены в Git
- ✅ Используй `.env.local` (в `.gitignore`)
- ✅ Vercel автоматически шифрует Environment Variables

---

## Troubleshooting

**"The callback URL or verify token couldn't be validated"**
- Проверь, что деплоился на Vercel
- Проверь что URL правильный в webhook настройках
- Проверь `.env` переменные в Vercel Dashboard

**"No response from agent"**
- Смотри Vercel Logs: `vercel logs`
- Проверь `GOOGLE_API_KEY` — правильный ли ключ

**"WHATSAPP_TOKEN expired"**
- Пересоздай токен в Meta Developer
- Обнови `.env` в Vercel Dashboard

---

## Следующие шаги после MVP

1. **Добавь базу данных** (Supabase/PostgreSQL) для постоянного хранения истории
2. **Analytics** — отслеживай какие вопросы чаще всего
3. **Human handoff** — кнопка "говорить с человеком" в Telegram/Email
4. **Multi-tenant** — разные агенты для разных клиентов
5. **Webhook retry logic** — обработка ошибок отправки сообщений
