# Competitor Timeline Dashboard

Dashboard estilo TweetDeck para acompanhar concorrentes em múltiplas redes sociais.

## 🚀 Arquitetura

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  ClawdBot   │──────▶│   API       │──────▶│   SQLite    │
│  (Scraper)  │ POST  │  /ingest    │       │   (Dados)   │
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  Next.js    │
                     │  Dashboard  │
                     └─────────────┘
```

## 📋 Funcionalidades

- **Boards**: Crie um board para cada concorrente
- **Colunas**: Cada board tem colunas para Instagram, LinkedIn, YouTube, TikTok
- **Posts**: Visualize posts em cards clicáveis (vai pro conteúdo original)
- **Atualização**: Dados atualizados 1x ao dia via ClawdBot

## 🛠️ Setup

```bash
# Instalar dependências
npm install

# Gerar API key (já criado em .env.local)
cat .env.local

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## 🔌 API Endpoints

### POST /api/ingest
Recebe dados do ClawdBot.

**Headers:**
```
Authorization: Bearer {CLAUDBOT_API_KEY}
X-Batch-Id: uuid-unico
Content-Type: application/json
```

**Body:**
```json
{
  "batchId": "uuid-unico",
  "scrapedAt": "2026-02-06T06:00:00Z",
  "source": {
    "platform": "instagram",
    "handle": "liberdademedicaedu",
    "url": "https://instagram.com/liberdademedicaedu"
  },
  "posts": [
    {
      "id": "post-id",
      "url": "https://instagram.com/p/ABC123",
      "content": "Texto do post...",
      "mediaType": "carousel",
      "publishedAt": "2026-02-05T14:30:00Z",
      "engagement": {
        "likes": 15420,
        "comments": 342,
        "shares": 89
      },
      "hashtags": ["medicina"],
      "mentions": ["@medico"]
    }
  ]
}
```

### POST /api/ingest/force
Força atualização manual (para testes).

```json
{
  "target": "instagram.com/liberdademedicaedu",
  "depth": 20
}
```

## 🗄️ Estrutura do Banco

- **boards**: Concorrentes monitorados
- **columns**: Fontes de cada board (IG, LI, YT, TT)
- **posts**: Posts coletados

## 🔐 Segurança

- Rate limit: 1 request/minuto
- API Key obrigatória
- Idempotência via X-Batch-Id

## 📝 Configuração ClawdBot

1. Frequência: Diário às 6h BRT
2. Posts: Últimos 20 por fonte
3. Erro: Pula e continua (não quebra o fluxo)
4. Rotação de IP + Headers realistas

## 🧪 Teste Local

```bash
# Gerar JSON de teste
curl -X POST http://localhost:3000/api/ingest \
  -H "Authorization: Bearer $(cat .env.local | cut -d= -f2)" \
  -H "Content-Type: application/json" \
  -H "X-Batch-Id: test-001" \
  -d '{
    "batchId": "test-001",
    "scrapedAt": "2026-02-06T06:00:00Z",
    "source": {
      "platform": "instagram",
      "handle": "test",
      "url": "https://instagram.com/test"
    },
    "posts": []
  }'
```
