# ☁️ Google Cloud - Container-Optimized OS

Se sua VM foi criada com **Container-Optimized OS** (padrão em algumas configurações), siga este guia.

---

## 🔍 Identificar o sistema

Na VM (terminal SSH), execute:

```bash
cat /etc/os-release
```

Se aparecer `Container-Optimized OS` ou `ID=cos`, use este guia.

---

## ⚠️ Problema

Container-Optimized OS é minimalista e **não tem apt-get, yum, nem dnf**.

## ✅ Solução - Rodar em Container

A forma mais fácil é rodar seu app dentro de um container Docker.

---

## Passo a Passo

### 1. Conectar na VM

```bash
gcloud compute ssh timeline-concorrentes --zone=us-central1-f
```

### 2. Criar Dockerfile

```bash
cat > Dockerfile << 'EOF'
FROM node:20-alpine

WORKDIR /app

# Instalar git
RUN apk add --no-cache git

# Clonar repo
RUN git clone https://github.com/jhowtkd/timeline-concorrentes.git .

WORKDIR /app/my-app

# Instalar e buildar
RUN npm install
RUN npm run build

# Criar pasta de dados
RUN mkdir -p data

# Variáveis (pode sobrescrever no run)
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=./data/dashboard.db
ENV APIFY_ACTOR_ID=apify/instagram-scraper
ENV INGEST_API_URL=/api/ingest

# Porta
EXPOSE 3000

# Comando
CMD ["npm", "start"]
EOF
```

### 3. Criar docker-compose.yml

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - CLAUDBOT_API_KEY=COLOQUE_SUA_CHAVE_AQUI
      - APIFY_TOKEN=COLOQUE_SEU_TOKEN_AQUI
      - APIFY_ACTOR_ID=apify/instagram-scraper
      - INGEST_API_URL=/api/ingest
      - DATABASE_PATH=./data/dashboard.db
    volumes:
      - ./data:/app/my-app/data
    restart: unless-stopped
EOF
```

**⚠️ EDITE** o `docker-compose.yml` e coloque suas chaves reais!

### 4. Subir o container

```bash
sudo docker-compose up -d
```

### 5. Verificar logs

```bash
sudo docker-compose logs -f
```

### 6. Atualizar (após git push)

```bash
sudo docker-compose down
sudo docker-compose pull  # Se usar imagem do registry
sudo docker-compose up -d --build  # Se buildar local
```

---

## 🔄 Alternativa: Recriar VM com Ubuntu

Se preferir usar o setup normal (sem Docker), recrie a VM com Ubuntu:

```bash
# Deletar VM atual
gcloud compute instances delete timeline-concorrentes --zone=us-central1-f --quiet

# Criar nova com Ubuntu
gcloud compute instances create timeline-concorrentes \
  --zone=us-central1-f \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=10GB \
  --tags=http-server

# Firewall
gcloud compute firewall-rules create allow-http-3000 \
  --allow tcp:3000 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server
```

Depois use o [GCP_MANUAL_SETUP.md](GCP_MANUAL_SETUP.md) normal.

---

## Qual usar?

| Opção | Complexidade | Recomendado? |
|-------|-------------|--------------|
| **Docker (este guia)** | Média | Se quer manter a VM atual |
| **Recreate com Ubuntu** | Baixa | Se quer simplicidade |

---

## Suas Chaves

```
CLAUDBOT_API_KEY: COLOQUE_SUA_CHAVE_AQUI
APIFY_TOKEN:      COLOQUE_SEU_TOKEN_AQUI
```
