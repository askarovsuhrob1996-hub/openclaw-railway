# OpenClaw on Railway.app

Деплой OpenClaw на Railway.app с оптимизацией для их бесплатного tier.

## Ресурсы Railway Free Tier:
- **$5 кредитов/месяц** (~150 часов работы)
- **512MB-1GB RAM** (автоскейлинг) 
- **1 vCPU**
- **1GB диск**

## Деплой инструкция:

### 1. Подготовка репозитория
```bash
cd railway-deploy/
git init
git add .
git commit -m "Initial OpenClaw Railway deploy"
```

### 2. Push на GitHub
```bash
# Создай новый репозиторий на GitHub: openclaw-railway
git remote add origin https://github.com/suhrob/openclaw-railway.git
git push -u origin main
```

### 3. Deploy на Railway
1. Заходи на https://railway.app
2. Sign up through GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Выбери репозиторий `openclaw-railway`

### 4. Environment Variables
В Railway Dashboard → Settings → Environment:
```
TELEGRAM_BOT_TOKEN=8562066344:AAERk-OzdS9Isx1Ex4qfL6kwQMEyUyh_fQM
ANTHROPIC_API_KEY=sk-ant-oat01-IVMvfQgueK4RhWIj_c_9znlmuyxfOd6m_3ozCEQAgVvZHRA048mpVSdjTRgqZgz82HBoCHgWAkmMRFj2Bkb
NODE_ENV=production
```

### 5. Deploy
Railway автоматически:
- Установит Node.js + dependencies
- Запустит `npm start` 
- Даст публичный URL

## Мониторинг
- **Логи:** Railway Dashboard → Deployments → View Logs
- **Метрики:** Dashboard → Metrics (CPU/RAM usage)
- **Health:** https://your-app.railway.app/health

## Стоимость
~150 часов работы бесплатно = **~5 часов в день**  
Для 24/7 работы потребуется ~$15-20/месяц