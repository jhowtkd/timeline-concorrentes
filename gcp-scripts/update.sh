#!/bin/bash
# Script para atualizar o app na VM

INSTANCE_NAME="${INSTANCE_NAME:-timeline-concorrentes}"
ZONE="${ZONE:-us-central1-a}"

echo "🔄 Atualizando app..."

gcloud compute ssh $INSTANCE_NAME --zone=$ZONE << 'EOF'
cd /opt/timeline-concorrentes/my-app

echo "📥 Pull do repositório..."
git pull

echo "📦 Instalando dependências..."
npm install

echo "🔨 Buildando..."
npm run build

echo "🔄 Restartando PM2..."
pm2 restart timeline-concorrentes

echo "✅ Atualização completa!"
EOF

echo "🎉 App atualizado!"
