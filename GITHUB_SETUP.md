# 🤖 Setup do GitHub Actions

Guia rápido para configurar a automação no GitHub.

---

## 1️⃣ Adicionar Secrets

Vá no seu repositório GitHub:

```
Settings → Secrets and variables → Actions → New repository secret
```

Adicione estes 3 secrets:

| Nome | Valor |
|------|-------|
| `APIFY_TOKEN` | `seu_token_apify_aqui` |
| `CLAUBOT_API_KEY` | `sua_chave_aqui` |
| `INGEST_API_URL` | URL da sua API em produção (ex: `https://meu-app.vercel.app/api/ingest`) |

---

## 2️⃣ Configurar Concorrentes

Edite `.github/workflows/scrape-instagram.yml`:

```yaml
strategy:
  matrix:
    competitor: 
      - nike
      - adidas
      - puma
      - COLOQUE_OS_SEUS_AQUI
```

---

## 3️⃣ Testar Manualmente

1. Commit e push destes arquivos
2. Vá em **Actions** no GitHub
3. Clique em **"📸 Instagram Scraper - Concorrentes"**
4. Clique em **"Run workflow"**

---

## 4️⃣ Agendamento Automático

Já configurado! Todo dia às **9h UTC (6h BRT)**.

Para mudar o horário, edite:
```yaml
schedule:
  - cron: '0 9 * * *'  # Minuto Hora Dia Mês DiaSemana
```

Gerador de cron: https://crontab.guru

---

## 📁 Arquivos Criados

```
my-app/
├── .github/
│   └── workflows/
│       ├── scrape-instagram.yml   # Workflow principal
│       └── README.md              # Documentação
├── scripts/
│   ├── scrape-instagram.ts        # Scrape individual
│   └── scrape-all.ts              # Scrape múltiplos
└── GITHUB_SETUP.md                # Este arquivo
```

---

Pronto! 🎉 A automação vai rodar todo dia sozinha.
