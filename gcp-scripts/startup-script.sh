#!/bin/bash
# Startup script para Google Cloud Compute Engine
# Instala Node.js, clona/configura o app e inicia com PM2

set -e

APP_NAME="timeline-concorrentes"
APP_DIR="/opt/$APP_NAME"
NODE_VERSION="20"
GITHUB_REPO="https://github.com/jhowtkd/timeline-concorrentes.git"

echo "=========================================="
echo "🚀 Iniciando setup do Timeline Concorrentes"
echo "=========================================="

# Atualizar sistema
apt-get update
apt-get install -y curl git build-essential python3

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs

echo "✅ Node.js $(node -v) instalado"

# Instalar PM2 (process manager)
npm install -g pm2

echo "✅ PM2 instalado"

# Criar diretório do app
mkdir -p $APP_DIR
cd $APP_DIR

# Clonar repositório (se não existir)
if [ ! -d ".git" ]; then
    git clone $GITHUB_REPO .
    echo "✅ Repositório clonado"
else
    cd $APP_DIR
    git pull
    echo "✅ Repositório atualizado"
fi

# Entrar na pasta do app
cd my-app

# Instalar dependências
npm install
npm run build

echo "✅ App buildado"

# Criar diretório de dados
mkdir -p data

# Configurar variáveis de ambiente
# ⚠️  COLOQUE SUAS CHAVES AQUI
cat > .env.production << 'EOF'
NODE_ENV=production
PORT=3000
CLAUDBOT_API_KEY=COLOQUE_SUA_CHAVE_AQUI
APIFY_TOKEN=COLOQUE_SEU_TOKEN_APIFY_AQUI
APIFY_ACTOR_ID=apify/instagram-scraper
INGEST_API_URL=/api/ingest
DATABASE_PATH=./data/dashboard.db
EOF

echo "✅ Variáveis de ambiente configuradas"

# Iniciar com PM2
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start npm --name "$APP_NAME" -- start
pm2 save
pm2 startup systemd -u $USER --hp $(eval echo ~$USER)

echo "=========================================="
echo "🎉 Setup completo!"
echo "=========================================="
echo "App rodando na porta 3000"
echo "Para ver logs: pm2 logs $APP_NAME"
echo "Para restart: pm2 restart $APP_NAME"
