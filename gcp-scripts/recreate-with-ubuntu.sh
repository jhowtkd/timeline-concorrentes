#!/bin/bash
# Recria a VM com Ubuntu 22.04 LTS (mais fácil de configurar)

INSTANCE_NAME="timeline-concorrentes"
ZONE="us-central1-f"

echo "=========================================="
echo "🔄 Recriando VM com Ubuntu"
echo "=========================================="
echo ""
echo "⚠️  Isso vai APAGAR a VM atual e criar uma nova!"
echo ""
read -p "Tem certeza? (s/N): " confirm

if [[ ! "$confirm" =~ ^[Ss]$ ]]; then
    echo "❌ Cancelado"
    exit 1
fi

# Deletar VM existente
echo "🗑️  Deletando VM atual..."
gcloud compute instances delete $INSTANCE_NAME --zone=$ZONE --quiet 2>/dev/null || echo "VM não existia"

# Criar nova VM com Ubuntu
echo ""
echo "🆕 Criando VM com Ubuntu 22.04..."
gcloud compute instances create $INSTANCE_NAME \
  --zone=$ZONE \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=10GB \
  --tags=http-server \
  --quiet

# Configurar firewall
echo ""
echo "🔥 Configurando firewall..."
gcloud compute firewall-rules create allow-http-3000 \
  --allow tcp:3000 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server \
  --quiet 2>/dev/null || echo "Firewall já existe"

# Obter IP
EXTERNAL_IP=$(gcloud compute instances describe $INSTANCE_NAME \
  --zone=$ZONE \
  --format="get(networkInterfaces[0].accessConfigs[0].natIP)")

echo ""
echo "=========================================="
echo "✅ VM criada com Ubuntu!"
echo "=========================================="
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1️⃣  Conectar na VM:"
echo "   gcloud compute ssh $INSTANCE_NAME --zone=$ZONE"
echo ""
echo "2️⃣  Na VM, execute:"
echo "   sudo apt-get update"
echo "   sudo apt-get install -y curl git build-essential"
echo "   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
echo "   sudo apt-get install -y nodejs"
echo "   sudo npm install -g pm2"
echo ""
echo "3️⃣  Clonar e instalar:"
echo "   sudo mkdir -p /opt/timeline-concorrentes"
echo "   sudo chown \$USER:\$USER /opt/timeline-concorrentes"
echo "   cd /opt/timeline-concorrentes"
echo "   git clone https://github.com/jhowtkd/timeline-concorrentes.git ."
echo "   cd my-app && npm install && npm run build && mkdir -p data"
echo ""
echo "4️⃣  Criar .env.production:"
echo "   nano .env.production"
echo "   (cole as chaves)"
echo ""
echo "5️⃣  Iniciar:"
echo "   pm2 start npm --name timeline-concorrentes -- start"
echo "   pm2 save && pm2 startup"
echo ""
echo "🌐 IP da VM: $EXTERNAL_IP"
echo ""
