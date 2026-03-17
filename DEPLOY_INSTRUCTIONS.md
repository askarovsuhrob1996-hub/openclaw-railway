# Инструкция деплоя на Railway

## Шаг 1: Создать GitHub репозиторий
1. Заходи: https://github.com/new
2. Название: `openclaw-railway`
3. Public репозиторий
4. Создай без README

## Шаг 2: Загрузить код
```bash
cd /Users/suhrob/.openclaw/workspace/railway-deploy
git remote add origin https://github.com/[ТВой-USERNAME]/openclaw-railway.git
git push -u origin main
```

## Шаг 3: Deploy на Railway
1. https://railway.app → Sign up with GitHub
2. New Project → Deploy from GitHub repo
3. Выбери: openclaw-railway
4. Добавь Environment Variables:
   - TELEGRAM_BOT_TOKEN=8562066344:AAERk-OzdS9Isx1Ex4qfL6kwQMEyUyh_fQM
   - ANTHROPIC_API_KEY=[твой ключ]

Готово! 🚄
