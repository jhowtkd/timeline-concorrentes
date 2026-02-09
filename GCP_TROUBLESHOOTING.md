# 🔧 Troubleshooting - VM Offline

## Problema: Site não acessível

Se você recebeu erro `ERR_CONNECTION_TIMED_OUT`, a VM pode estar:
- ❌ Desligada
- ❌ App parou
- ❌ Firewall bloqueando

---

## 🛠️ Solução Rápida

### Passo 1: Verificar se VM está ligada

1. Acesse: https://console.cloud.google.com/compute/instances
2. Procure `timeline-concorrentes`
3. Veja o ícone de status:
   - 🟢 **Verde** = Ligada
   - 🔴 **Cinza** = Desligada

Se estiver **desligada**:
- Clique nos 3 pontos → **"Iniciar/Start"**
- Aguarde 1 minuto
- Tente acessar: http://34.58.129.196:3000

---

### Passo 2: Se VM está ligada mas app não responde

Conecte via SSH pelo console:

1. Na lista de VMs, clique em **"SSH"** na linha da sua VM
2. Execute os comandos abaixo:

```bash
# Verificar status do app
pm2 status
```

**Se aparecer "errored" ou "stopped":**

```bash
# Reiniciar o app
cd /opt/timeline-concorrentes/my-app
pm2 restart timeline-concorrentes

# Ou se não funcionar, reinicie tudo:
pm2 delete timeline-concorrentes
pm2 start npm --name "timeline-concorrentes" -- start
pm2 save
```

**Se PM2 não estiver instalado:**

```bash
# Reinstalar tudo
sudo apt-get update
sudo apt-get install -y curl git build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Reiniciar app
cd /opt/timeline-concorrentes/my-app
npm install
npm run build
pm2 start npm --name "timeline-concorrentes" -- start
pm2 save
```

---

### Passo 3: Verificar Firewall

No console do Google Cloud:

1. Vá em: **VPC Network** → **Firewall**
2. Procure por `allow-http-3000`
3. Se não existir, crie:
   - **Name**: `allow-http-3000`
   - **Targets**: `Specified target tags`
   - **Target tags**: `http-server`
   - **Source IP ranges**: `0.0.0.0/0`
   - **Protocols and ports**: `tcp:3000`

---

### Passo 4: Verificar Logs

Na VM (via SSH):

```bash
# Ver logs do app
pm2 logs

# Ou logs mais antigos
pm2 logs --lines 100
```

---

## 🔄 Prevenir que pare novamente

### Configurar startup automático

Na VM, execute:

```bash
# Garantir que PM2 inicia no boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
pm2 save
```

### Criar script de health check

```bash
cat > /opt/check-app.sh << 'EOF'
#!/bin/bash
if ! curl -s http://localhost:3000/api/ingest > /dev/null; then
  echo "App offline, reiniciando..."
  cd /opt/timeline-concorrentes/my-app
  pm2 restart timeline-concorrentes
fi
EOF
chmod +x /opt/check-app.sh

# Adicionar ao cron (verifica a cada 5 minutos)
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/check-app.sh") | crontab -
```

---

## 📞 Comandos Úteis

### Verificar se porta 3000 está aberta
```bash
sudo netstat -tlnp | grep 3000
```

### Ver processos Node
```bash
ps aux | grep node
```

### Matar processos travados
```bash
pkill -f node
pm2 start npm --name "timeline-concorrentes" -- start
```

### Ver espaço em disco
```bash
df -h
```

---

## ✅ Checklist de Verificação

- [ ] VM está ligada (ícone verde no console)
- [ ] Firewall permite porta 3000
- [ ] App está rodando (`pm2 status` mostra "online")
- [ ] Porta 3000 está aberta (`netstat`)
- [ ] Não há erros nos logs (`pm2 logs`)

---

## 🆘 Se nada funcionar

Recreate a VM do zero:

```bash
# Na sua máquina local
cd my-app
./gcp-scripts/recreate-with-ubuntu.sh
```

Depois siga o [GCP_MANUAL_SETUP.md](GCP_MANUAL_SETUP.md) novamente.
