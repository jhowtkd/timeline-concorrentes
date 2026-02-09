# 🚀 Setup do Apify Instagram Scraper

Guia completo para configurar e usar o Apify Instagram Scraper no projeto Timeline de Concorrentes.

---

## 📋 Pré-requisitos

- Conta no [Apify](https://apify.com)
- Projeto rodando localmente (`npm run dev`)
- Node.js 18+ instalado

---

## 🔑 1. Obtendo o Token da API

1. Acesse [apify.com](https://apify.com) e faça login
2. Clique no seu avatar (canto superior direito) → **Settings**
3. No menu lateral, clique em **Integrations**
4. Na seção **API tokens**, copie o token existente ou clique em **+ Add token** para criar um novo
5. **Guarde este token em local seguro** (ele não será mostrado novamente)

```bash
# Exemplo de token (não é um token real)
apify_api_xxxxxxxxxxxxxxxxxxxxxx
```

---

## ⚙️ 2. Configurando as Variáveis de Ambiente

Edite o arquivo `.env.local` na raiz do projeto:

```bash
# Token da API do Apify (obrigatório)
APIFY_TOKEN=seu_token_aqui

# ID do Actor do Instagram Scraper (opcional, tem padrão)
APIFY_ACTOR_ID=apify/instagram-scraper

# URL da API de ingestão (padrão para desenvolvimento)
INGEST_API_URL=http://localhost:3000/api/ingest

# Chave da API de ingestão (já deve existir)
CLAUDBOT_API_KEY=sua_chave_aqui
```

> 💡 **Dica:** Nunca commite o arquivo `.env.local`! Ele já está no `.gitignore`.

---

## 🧪 3. Testando a Configuração

### Modo Dry-Run (simulação)

Teste sem enviar dados para a API:

```bash
npm run scrape:ig -- nike --dry-run
```

Ou com `tsx`:

```bash
npx tsx scripts/scrape-instagram.ts nike --dry-run
```

Se tudo estiver configurado corretamente, você verá o payload gerado sem erros.

---

## 🚀 4. Executando o Scraper

### Comando básico

```bash
npm run scrape:ig -- <username>
```

### Exemplos

```bash
# Scrape básico (últimos 50 posts)
npm run scrape:ig -- nike

# Scrape com limite personalizado
npm run scrape:ig -- adidas --limit 100

# Scrape apenas Reels
npm run scrape:ig -- puma --type reels

# Scrape com mais detalhes no console
npm run scrape:ig -- reebok --verbose

# Combinação de opções
npm run scrape:ig -- converse -l 200 -t posts -v
```

### Opções disponíveis

| Opção | Abreviação | Descrição | Padrão |
|-------|-----------|-----------|--------|
| `--limit` | `-l` | Número máximo de posts | 50 |
| `--type` | `-t` | Tipo: posts, reels, stories, highlights | posts |
| `--dry-run` | `-d` | Simula sem enviar dados | false |
| `--verbose` | `-v` | Mostra logs detalhados | false |
| `--help` | `-h` | Mostra ajuda | - |

---

## 💰 5. Custos Aproximados

O Apify funciona com um sistema de **Compute Units (CUs)**. Cada run consome CUs baseado no tempo de execução e recursos utilizados.

### Preço do Instagram Scraper

| Plano Apify | Custo aproximado | Observações |
|------------|------------------|-------------|
| **Free** | $0 | 5,000 CUs/mês (suficiente para testes) |
| **Starter** | ~$49/mês | 10,000 CUs/mês |
| **Scale** | ~$499/mês | 100,000 CUs/mês |

### Estimativa por scrape

| Perfil | Posts | Custo Estimado | Tempo |
|--------|-------|----------------|-------|
| Pequeno | 50 | ~$0.05 | ~2 min |
| Médio | 200 | ~$0.15 | ~5 min |
| Grande | 500 | ~$0.30 | ~10 min |
| Muito grande | 1000 | ~$0.60 | ~20 min |

> ⚠️ **Atenção:** Perfis privados ou com restrições podem consumir mais recursos.

### Como reduzir custos

1. Use `--limit` para limitar o número de posts
2. Use `--dry-run` para testar antes
3. Agende scrapes apenas quando necessário
4. Reutilize dados já coletados (cache local)

---

## 🔧 6. Solução de Problemas

### Erro: "APIFY_TOKEN não configurado"

```
❌ Erro: APIFY_TOKEN não configurado
   Configure no arquivo .env.local
```

**Solução:** Verifique se o `.env.local` existe e contém `APIFY_TOKEN=seu_token`.

### Erro: "Invalid token"

```
❌ Erro durante execução:
   Apify API error: 401 - Invalid token
```

**Solução:** O token pode estar expirado ou incorreto. Gere um novo token em [apify.com/integrations](https://console.apify.com/account/integrations).

### Erro: "Rate limit exceeded"

```
❌ Erro durante execução:
   Rate limit exceeded. Max 1 request per minute.
```

**Solução:** A API de ingestão tem rate limit. Aguarde 1 minuto antes de tentar novamente.

### Erro: "Profile not found" ou perfil privado

```
⚠️  Nenhum post encontrado. Verifique se o perfil é público.
```

**Solução:** O scraper só funciona com perfis públicos. Perfis privados retornam 0 posts.

### Erro: "Run timed out"

```
❌ Erro durante execução:
   Apify run excedeu o tempo limite. Tente aumentar o waitForFinish.
```

**Solução:** Perfis muito grandes ou com muitas mídias podem demorar. O timeout padrão é 5 minutos. Para aumentar, edite o arquivo `lib/apify.ts` e ajuste `waitForFinish`.

---

## 📊 7. Monitorando seus Runs

Você pode acompanhar todos os runs do Apify:

1. Acesse [console.apify.com](https://console.apify.com)
2. Vá em **Actors** → **apify/instagram-scraper**
3. Clique na aba **Runs**

Ou via linha de comando (futuramente implementado):

```bash
npm run apify:status
```

---

## 🔄 8. Automação com Cron

Para manter os dados atualizados automaticamente, você pode criar um cron job:

### Exemplo com cron (Linux/Mac)

```bash
# Edite o crontab
crontab -e

# Adicione (roda todo dia às 9h)
0 9 * * * cd /Users/jhonatan/Repos/Timeline\ de\ concorrentes/my-app && npm run scrape:ig -- nike --limit 50 >> /var/log/instagram-scraper.log 2>&1
```

### Exemplo com GitHub Actions

Crie `.github/workflows/scrape.yml`:

```yaml
name: Daily Instagram Scrape

on:
  schedule:
    - cron: '0 9 * * *'  # 9h UTC todo dia

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run scrape:ig -- nike --limit 50
        env:
          APIFY_TOKEN: ${{ secrets.APIFY_TOKEN }}
          CLAUDBOT_API_KEY: ${{ secrets.CLAUBOT_API_KEY }}
```

---

## 📚 9. Recursos Adicionais

- [Documentação do Apify](https://docs.apify.com)
- [Instagram Scraper no Apify Store](https://apify.com/apify/instagram-scraper)
- [Pricing do Apify](https://apify.com/pricing)
- [API Reference](https://docs.apify.com/api/client/js/)

---

## 🤝 Suporte

Em caso de problemas:

1. Verifique os logs detalhados com `--verbose`
2. Consulte a [documentação do Apify](https://docs.apify.com)
3. Abra uma issue no repositório do projeto

---

**Última atualização:** 2025-01-14
