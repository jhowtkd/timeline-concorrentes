# 🚀 Deploy no Render

Guia para hospedar o Timeline de Concorrentes no Render.

---

## ✅ Vantagens do Render

- ✅ **SQLite funciona** (filesystem persistente)
- ✅ **Next.js suportado**
- ✅ **Free tier disponível**
- ✅ **Deploy automático** via GitHub
- ✅ **Simples de configurar**

---

## 1️⃣ Criar Serviço no Render

### Via Dashboard (Recomendado)

1. Acesse: https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório GitHub: `jhowtkd/timeline-concorrentes`
4. Configure:

| Campo | Valor |
|-------|-------|
| **Name** | `timeline-concorrentes` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | `Starter` ($7/mês) ou `Free` |

5. Clique em **"Advanced"** e adicione:

### Environment Variables

| Key | Value |
|-----|-------|
| `CLAUDBOT_API_KEY` | `sua_chave_aqui` |
| `APIFY_TOKEN` | `seu_token_apify_aqui` |
| `APIFY_ACTOR_ID` | `apify/instagram-scraper` |
| `INGEST_API_URL` | `/api/ingest` |
| `DATABASE_PATH` | `/data/database.db` |

### Disk (Para SQLite persistir)

| Campo | Valor |
|-------|-------|
| **Name** | `data` |
| **Mount Path** | `/data` |
| **Size** | `1 GB` |

6. Clique em **"Create Web Service"**

---

## 2️⃣ Via Blueprint (render.yaml)

Se preferir, o arquivo `render.yaml` já está configurado. Basta:

1. No Render Dashboard, clique em **"New +"** → **"Blueprint"**
2. Conecte o repositório
3. O Render vai ler o `render.yaml` automaticamente

---

## 3️⃣ URL do Serviço

Após o deploy, sua URL será:
```
https://timeline-concorrentes.onrender.com
```

---

## 4️⃣ Atualizar GitHub Actions

Com a URL do Render, atualize o secret:

```bash
cd my-app && gh secret set INGEST_API_URL --body "https://timeline-concorrentes.onrender.com/api/ingest"
```

Ou edite manualmente em:
```
GitHub → Settings → Secrets → INGEST_API_URL
```

---

## 5️⃣ Testar o Deploy

1. Acesse a URL do Render
2. Teste a API: `https://seu-app.onrender.com/api/ingest`
3. Deve retornar:
```json
{
  "status": "ok",
  "service": "clawd-ingest-api",
  "version": "1.0.0"
}
```

---

## 💰 Preço

| Plano | Preço | SQLite | Dorme? |
|-------|-------|--------|--------|
| **Free** | $0 | ✅ | Após 15 min inativo |
| **Starter** | $7/mês | ✅ | Nunca |

**Recomendação:** Use **Starter** se for usar o GitHub Actions, porque o Free "dorme" e demora para acordar.

---

## 🔧 Troubleshooting

### "Database locked" ou SQLite não persiste

Verifique se configurou o Disk corretamente com mount path `/data`.

### Build falha

```bash
# Limpar cache no Render
Settings → Manual Deploy → Clear build cache & deploy
```

### Variáveis de ambiente não funcionam

Verifique se foram salvas corretamente em:
```
Render Dashboard → seu serviço → Environment
```

---

## 📚 Recursos

- [Render Docs - Next.js](https://render.com/docs/deploy-nextjs-app)
- [Render Docs - Disks](https://render.com/docs/disks)
- [Render Pricing](https://render.com/pricing)
