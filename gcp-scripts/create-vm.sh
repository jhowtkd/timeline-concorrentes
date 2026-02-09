#!/bin/bash
# Cria VM no Google Cloud (sem chaves - mais seguro)
# As chaves serão colocadas manualmente depois via SSH

set -e

PROJECT_ID="${PROJECT_ID:-SEU_PROJECT_ID}"
INSTANCE_NAME="${INSTANCE_NAME:-timeline-concorrentes}"
ZONE="${ZONE:-us-central1-a}"

echo "=========================================="
echo "🚀 Criando VM no Google Cloud"
echo "=========================================="

# Verificar gcloud
if ! command -v gcloud &> /dev/null; then
    echo "❌ Instale o gcloud: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Login
if ! gcloud auth list --filter=status:ACTIVE 2>/dev/null | grep -q "@"; then
    echo "🔐 Faça login:"
    gcloud auth login
fi

# Project ID
if [ "$PROJECT_ID" = "SEU_PROJECT_ID" ]; then
    echo ""
    gcloud projects list --format="table(projectId,name)" | head -10
    echo ""
    read -p "Digite seu PROJECT_ID: " PROJECT_ID
fi
gcloud config set project $PROJECT_ID

echo ""
echo "📝 Configuração:"
echo "  Nome: $INSTANCE_NAME"
echo "  Zona: $ZONE"
echo "  Tipo: e2-micro (free tier)"
echo ""
read -p "Pressione ENTER para criar..."

# Criar VM
echo ""
echo "⏳ Criando VM..."
gcloud compute instances create $INSTANCE_NAME \
  --zone=$ZONE \
  --machine-type=e2-micro \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=10GB \
  --tags=http-server \
  --quiet

# Firewall
echo "🔥 Configurando firewall..."
gcloud compute firewall-rules create allow-http-3000 \
  --allow tcp:3000 \
  --source-ranges 0.0.0.0/0 \
  --target-tags http-server \
  --quiet 2>/dev/null || echo "✅ Firewall já existe"

# IP Externo
EXTERNAL_IP=$(gcloud compute instances describe $INSTANCE_NAME \
  --zone=$ZONE \
  --format="get(networkInterfaces[0].accessConfigs[0].natIP)")

echo ""
echo "=========================================="
echo "✅ VM Criada!"
echo "=========================================="
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1️⃣  Conectar na VM:"
echo "   gcloud compute ssh $INSTANCE_NAME --zone=$ZONE"
echo ""
echo "2️⃣  Na VM, execute os comandos do passo a passo"
echo ""
echo "3️⃣  Depois acesse:"
echo "   http://$EXTERNAL_IP:3000"
echo ""
echo "IP da VM: $EXTERNAL_IP"
