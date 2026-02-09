# 🤖 GitHub Actions Workflows

Este diretório contém os workflows de automação para o projeto Timeline de Concorrentes.

---

## 📸 scrape-instagram.yml

Workflow principal para scraping automático do Instagram.

### Quando executa?

- **Agendado:** Todo dia às 9h UTC (6h BRT)
- **Manual:** Você pode disparar manualmente via GitHub Actions

### Como funciona?

1. Roda um scrape para cada concorrente na lista
2. Processa em sequência (evita rate limits)
3. Envia dados diretamente para a API de ingestão

### Configuração

#### 1. Adicionar Secrets no GitHub

Vá em **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Secret | Valor | Descrição |
|--------|-------|-----------|
| `APIFY_TOKEN` | `apify_api_...` | Token da API do Apify |
| `CLAUBOT_API_KEY` | `6704fe3c...` | Chave da API de ingestão |
| `INGEST_API_URL` | `https://seu-dominio.com/api/ingest` | URL da API de ingestão em produção |

#### 2. Configurar Concorrentes

Edite o arquivo `scrape-instagram.yml` e modifique a lista:

```yaml
strategy:
  matrix:
    competitor: 
      - nike
      - adidas
      - puma
      - reebok
      - newbalance
      # Adicione mais aqui
```

#### 3. Executar Manualmente

1. Vá na aba **Actions** do GitHub
2. Clique em **"📸 Instagram Scraper - Concorrentes"**
3. Clique em **"Run workflow"**
4. (Opcional) Especifique um concorrente específico e limite de posts

---

## 📊 Scripts Auxiliares

### scrape-all.ts

Executa múltiplos scrapes localmente:

```bash
# Todos os concorrentes padrão
npx tsx scripts/scrape-all.ts

# Concorrentes específicos
npx tsx scripts/scrape-all.ts nike adidas

# Com limite personalizado
npx tsx scripts/scrape-all.ts -l 100 -v

# Simulação (dry-run)
npx tsx scripts/scrape-all.ts --dry-run
```

---

## 💰 Custos

O GitHub Actions tem **2,000 minutos gratuitas/mês** no plano Free:

| Cenário | Tempo estimado | Custo |
|---------|---------------|-------|
| 1 concorrente (50 posts) | ~3 min | Grátis |
| 5 concorrentes/dia | ~15 min/dia | Grátis |
| 30 dias × 5 concorrentes | ~450 min/mês | Grátis |

---

## 🐛 Troubleshooting

### Workflow falha com "APIFY_TOKEN not set"

Verifique se o secret foi adicionado corretamente no GitHub.

### Rate limit na API de ingestão

O workflow já tem delay de 30s entre scrapes. Se continuar falhando:
1. Aumente o delay no workflow
2. Reduza o `max-parallel` para 1

### Dados não aparecem no dashboard

1. Verifique se a `INGEST_API_URL` está correta
2. Verifique se o `CLAUBOT_API_KEY` está correto
3. Veja os logs do workflow para erros específicos
