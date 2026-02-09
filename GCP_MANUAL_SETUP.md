# ☁️ Google Cloud - Setup Manual (Mais Seguro)

Este guia cria a VM sem expor suas chaves no GitHub.

---

## 📋 Resumo

1. Criar VM (automático)
2. Conectar via SSH
3. Instalar tudo manualmente
4. Colocar as chaves na VM
5. Iniciar o app

---

## 1️⃣ Criar a VM

```bash
cd my-app
chmod +x gcp-scripts/create-vm.sh
./gcp-scripts/create-vm.sh
```

Isso vai:
- Criar VM Ubuntu 22.04
- Configurar firewall
- Mostrar o IP externo

**Anote o IP que aparecer!**

---

## 2️⃣ Conectar na VM

```bash
gcloud compute ssh timeline-concorrentes --zone=us-central1-a
```

Você estará dentro da VM (prompt muda para `user@timeline-concorrentes:~$`)

---

## 3️⃣ Instalar Node.js e dependências

Cole tudo de uma vez na VM:

```bash
# Atualizar sistema
sudo apt-get update
sudo apt-get install -y curl git build-essential

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação
node -v  # Deve mostrar v20.x.x
npm -v   # Deve mostrar 10.x.x

# Instalar PM2
sudo npm install -g pm2
```

---

## 4️⃣ Clonar o projeto

```bash
# Criar diretório
sudo mkdir -p /opt/timeline-concorrentes
sudo chown $USER:$USER /opt/timeline-concorrentes
cd /opt/timeline-concorrentes

# Clonar
git clone https://github.com/jhowtkd/timeline-concorrentes.git .
cd my-app
```

---

## 5️⃣ Instalar dependências e buildar

```bash
npm install
npm run build
```

---

## 6️⃣ Criar arquivo de variáveis (COM AS CHAVES)

```bash
nano .env.production
```

**Cole exatamente isso:**

```
NODE_ENV=production
PORT=3000
CLAUDBOT_API_KEY=COLOQUE_A_CHAVE_AQUI
APIFY_TOKEN=COLOQUE_O_TOKEN_AQUI
APIFY_ACTOR_ID=apify/instagram-scraper
INGEST_API_URL=/api/ingest
DATABASE_PATH=./data/dashboard.db
```

**Salvar:**
- Pressione `CTRL + O` (letra O)
- Pressione `ENTER`
- Pressione `CTRL + X` para sair

---

## 7️⃣ Criar pasta de dados

```bash
mkdir -p data
```

---

## 8️⃣ Iniciar o app

```bash
pm2 start npm --name "timeline-concorrentes" -- start

# Salvar config
pm2 save

# Configurar para iniciar automaticamente
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

---

## 9️⃣ Verificar se funcionou

```bash
pm2 status
```

Deve mostrar:
```
┌────┬─────────────────────────┬─────────┬─────────┬──────────┐
│ id │ name                    │ status  │ cpu     │ memory   │
├────┼─────────────────────────┼─────────┼─────────┼──────────┤
│ 0  │ timeline-concorrentes   │ online  │ 0%      │ 45.2mb   │
└────┴─────────────────────────┴─────────┴─────────┴──────────┘
```

---

## 🌐 Acessar o app

Abra no navegador:
```
http://IP_DA_VM:3000
```

**O IP foi mostrado no passo 1** (algo como `34.123.45.67`)

Ou descubra o IP:
```bash
# Na sua máquina local (não na VM), execute:
gcloud compute instances describe timeline-concorrentes \
  --zone=us-central1-a \
  --format="get(networkInterfaces[0].accessConfigs[0].natIP)"
```

---

## 🔄 Comandos úteis

### Ver logs
```bash
pm2 logs
```

### Reiniciar app
```bash
pm2 restart timeline-concorrentes
```

### Parar app
```bash
pm2 stop timeline-concorrentes
```

### Atualizar após git push
```bash
cd /opt/timeline-concorrentes/my-app
git pull
npm install
npm run build
pm2 restart timeline-concorrentes
```

---

## 🔗 Configurar GitHub Actions

Na sua máquina local:

```bash
cd my-app

# Descobrir IP
gcloud compute instances describe timeline-concorrentes \
  --zone=us-central1-a \
  --format="get(networkInterfaces[0].accessConfigs[0].natIP)"

# Atualizar secret (substitua SEU_IP)
gh secret set INGEST_API_URL --body "http://SEU_IP:3000/api/ingest"
```

---

## ✅ Checklist

- [ ] VM criada
- [ ] Conectado via SSH
- [ ] Node.js instalado
- [ ] Projeto clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] Build feito (`npm run build`)
- [ ] `.env.production` criado com as chaves
- [ ] App iniciado com PM2
- [ ] Acessível no navegador
- [ ] GitHub Actions atualizado com IP

---

## 🐛 Problemas?

### "Permission denied"
Use `sudo` antes dos comandos

### "Port 3000 already in use"
```bash
pm2 delete all
pm2 start npm --name "timeline-concorrentes" -- start
```

### "Cannot find module"
```bash
cd /opt/timeline-concorrentes/my-app
npm install
npm run build
```

### Não consegue acessar pelo navegador
Verifique firewall:
```bash
# Na sua máquina local
gcloud compute firewall-rules list
```

Deve aparecer `allow-http-3000`. Se não aparecer:
```bash
gcloud compute firewall-rules create allow-http-3000 \
  --allow tcp:3000 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server
```
