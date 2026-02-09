# ☁️ Deploy no Google Cloud Compute Engine

Guia completo para hospedar o Timeline de Concorrentes no Google Cloud.

---

## ✅ Vantagens

- 🎁 **Free Tier**: 750h/mês de e2-micro (1 instância pequena grátis)
- 💳 **Use seus créditos** Google Cloud
- 💾 **SQLite funciona** perfeitamente (disco persistente)
- 🔄 **GitHub Actions** funciona normalmente
- 🚀 **Simples** - só subir a VM e rodar

---

## 📋 Pré-requisitos

1. Conta Google Cloud com créditos
2. [gcloud CLI](https://cloud.google.com/sdk/docs/install) instalado
3. Projeto criado no Google Cloud Console

---

## 🚀 Deploy Rápido (Automático)

### 1. Login no gcloud

```bash
gcloud auth login
gcloud config set project SEU_PROJECT_ID
```

### 2. Executar deploy

```bash
cd my-app
chmod +x gcp-scripts/deploy.sh
./gcp-scripts/deploy.sh
```

O script vai:
- ✅ Criar VM Ubuntu 22.04
- ✅ Instalar Node.js 20
- ✅ Clonar seu repositório
- ✅ Instalar dependências
- ✅ Buildar o app
- ✅ Iniciar com PM2
- ✅ Configurar firewall

---

## 🛠️ Deploy Manual (Passo a Passo)

### 1. Criar Instância

```bash
gcloud compute instances create timeline-concorrentes \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=10GB \
  --tags=http-server
```

### 2. Configurar Firewall

```bash
gcloud compute firewall-rules create allow-http-3000 \
  --allow tcp:3000 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server
```

### 3. Conectar via SSH

```bash
gcloud compute ssh timeline-concorrentes --zone=us-central1-a
```

### 4. Instalar na VM

```bash
# Dentro da VM, execute:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

sudo npm install -g pm2

sudo mkdir -p /opt/timeline-concorrentes
cd /opt/timeline-concorrentes
sudo git clone https://github.com/jhowtkd/timeline-concorrentes.git .
cd my-app

sudo npm install
sudo npm run build

# Configurar variáveis (⚠️ COLOQUE SUAS CHAVES)
sudo tee .env.production > /dev/null << 'EOF'
NODE_ENV=production
PORT=3000
CLAUDBOT_API_KEY=COLOQUE_SUA_CHAVE_AQUI
APIFY_TOKEN=COLOQUE_SEU_TOKEN_APIFY_AQUI
APIFY_ACTOR_ID=apify/instagram-scraper
INGEST_API_URL=/api/ingest
DATABASE_PATH=./data/dashboard.db
EOF

# Iniciar
pm2 start npm --name "timeline-concorrentes" -- start
pm2 save
pm2 startup
```

---

## 🔄 Atualizar App

Quando fizer push pro GitHub, atualize a VM:

```bash
./gcp-scripts/update.sh
```

Ou manualmente:

```bash
gcloud compute ssh timeline-concorrentes --zone=us-central1-a

cd /opt/timeline-concorrentes/my-app
git pull
npm install
npm run build
pm2 restart timeline-concorrentes
```

---

## 📊 Monitorar

### Ver logs
```bash
gcloud compute ssh timeline-concorrentes --zone=us-central1-a --command "pm2 logs"
```

### Ver status
```bash
gcloud compute instances describe timeline-concorrentes --zone=us-central1-a
```

### Acessar VM
```bash
gcloud compute ssh timeline-concorrentes --zone=us-central1-a
```

---

## 💰 Custo Estimado

| Configuração | Preço/mês | Free Tier |
|--------------|-----------|-----------|
| **e2-micro** | ~$6-8 | ✅ 750h/mês grátis |
| **e2-small** | ~$12-15 | ❌ |
| **e2-medium** | ~$25-30 | ❌ |

**Recomendação**: Comece com **e2-micro** (free tier). Se precisar de mais performance, upgrade depois.

---

## 🔗 Atualizar GitHub Actions

Após o deploy, pegue o IP externo:

```bash
gcloud compute instances describe timeline-concorrentes \
  --zone=us-central1-a \
  --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
```

Atualize o secret no GitHub:

```bash
cd my-app
gh secret set INGEST_API_URL --body "http://SEU_IP:3000/api/ingest"
```

Ou configure um IP estático:

```bash
# Criar IP estático
gcloud compute addresses create timeline-ip --region=us-central1

# Anotar o IP
gcloud compute addresses describe timeline-ip --region=us-central1 --format="value(address)"
```

---

## 🐛 Troubleshooting

### "Connection refused"
Firewall não configurado. Execute:
```bash
gcloud compute firewall-rules create allow-http-3000 --allow tcp:3000 --source-ranges 0.0.0.0/0
```

### "App não inicia"
Verifique logs:
```bash
gcloud compute ssh timeline-concorrentes --zone=us-central1-a --command "cd /opt/timeline-concorrentes/my-app && pm2 logs"
```

### "Permissão negada"
Certifique-se de usar `sudo` para comandos na VM.

### "Porta 3000 em uso"
```bash
gcloud compute ssh timeline-concorrentes --zone=us-central1-a --command "pm2 delete all && pm2 start npm --name timeline-concorrentes -- start"
```

---

## 📚 Recursos

- [Google Cloud Free Tier](https://cloud.google.com/free)
- [Compute Engine Pricing](https://cloud.google.com/compute/pricing)
- [gcloud CLI Reference](https://cloud.google.com/sdk/gcloud/reference)
