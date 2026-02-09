#!/bin/bash
# Script para criar e configurar VM no Google Cloud

set -e

# Configurações
PROJECT_ID="${PROJECT_ID:-SEU_PROJECT_ID}"
INSTANCE_NAME="${INSTANCE_NAME:-timeline-concorrentes}"
ZONE="${ZONE:-us-central1-a}"
MACHINE_TYPE="${MACHINE_TYPE:-e2-micro}"

echo "=========================================="
echo "🚀 Deploy no Google Cloud Compute Engine"
echo "=========================================="

# Verificar se gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI não encontrado"
    echo "Instale em: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar login
echo "🔍 Verificando autenticação..."
gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q "." || {
    echo "❌ Não logado no gcloud"
    echo "Execute: gcloud auth login"
    exit 1
}

# Configurar projeto
if [ "$PROJECT_ID" = "SEU_PROJECT_ID" ]; then
    echo ""
    echo "⚠️  PROJECT_ID não configurado"
    echo "Projetos disponíveis:"
    gcloud projects list --format="table(projectId,name)" | head -10
    echo ""
    read -p "Digite o PROJECT_ID: " PROJECT_ID
fi

gcloud config set project $PROJECT_ID
echo "✅ Projeto: $PROJECT_ID"

# Verificar se instância já existe
echo "🔍 Verificando instância..."
if gcloud compute instances describe $INSTANCE_NAME --zone=$ZONE &> /dev/null; then
    echo "✅ Instância já existe. Atualizando..."
    
    # Copiar novo startup script
    gcloud compute instances add-metadata $INSTANCE_NAME \
        --zone=$ZONE \
        --metadata-from-file startup-script=gcp-scripts/startup-script.sh
    
    # Reiniciar para aplicar
    echo "🔄 Reiniciando instância..."
    gcloud compute instances reset $INSTANCE_NAME --zone=$ZONE
else
    echo "🆕 Criando nova instância..."
    
    # Criar instância
    gcloud compute instances create $INSTANCE_NAME \
        --zone=$ZONE \
        --machine-type=$MACHINE_TYPE \
        --image-family=ubuntu-2204-lts \
        --image-project=ubuntu-os-cloud \
        --boot-disk-size=10GB \
        --boot-disk-type=pd-standard \
        --tags=http-server,https-server \
        --metadata-from-file startup-script=gcp-scripts/startup-script.sh \
        --scopes=https://www.googleapis.com/auth/cloud-platform
    
    echo "✅ Instância criada"
fi

# Configurar firewall
echo "🔥 Configurando firewall..."
gcloud compute firewall-rules create allow-http-$INSTANCE_NAME \
    --allow tcp:3000 \
    --source-ranges 0.0.0.0/0 \
    --target-tags http-server \
    --description "Allow port 3000 for $INSTANCE_NAME" \
    2>/dev/null || echo "✅ Firewall já configurado"

# Obter IP externo
echo ""
echo "⏳ Aguardando IP externo..."
sleep 5

EXTERNAL_IP=$(gcloud compute instances describe $INSTANCE_NAME \
    --zone=$ZONE \
    --format="get(networkInterfaces[0].accessConfigs[0].natIP)")

echo ""
echo "=========================================="
echo "🎉 Deploy iniciado!"
echo "=========================================="
echo ""
echo "📋 Informações:"
echo "   Nome:    $INSTANCE_NAME"
echo "   Zona:    $ZONE"
echo "   Tipo:    $MACHINE_TYPE"
echo "   IP:      $EXTERNAL_IP"
echo "   URL:     http://$EXTERNAL_IP:3000"
echo ""
echo "⏳ O setup leva ~3-5 minutos..."
echo ""
echo "Para acompanhar:"
echo "   SSH:     gcloud compute ssh $INSTANCE_NAME --zone=$ZONE"
echo "   Logs:    gcloud compute instances get-serial-port-output $INSTANCE_NAME --zone=$ZONE"
echo ""
echo "Verificando status em 60 segundos..."
sleep 60

# Verificar se app está rodando
if gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --command "pm2 status" 2>/dev/null | grep -q "online"; then
    echo "✅ App está online!"
    echo "🌐 Acesse: http://$EXTERNAL_IP:3000"
else
    echo "⏳ App ainda iniciando..."
    echo "Verifique logs: gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --command 'pm2 logs'"
fi
