#!/bin/bash
# Setup genérico para qualquer Linux
# Detecta o sistema e instala Node.js corretamente

set -e

echo "=========================================="
echo "🔍 Detectando sistema..."
echo "=========================================="

# Detectar sistema
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
else
    OS=$(uname -s)
fi

echo "Sistema detectado: $OS"
echo ""

# Criar diretório do app
APP_DIR="/opt/timeline-concorrentes"
if [ "$EUID" -eq 0 ]; then
    # Rodando como root
    mkdir -p $APP_DIR
else
    # Rodando como usuário comum
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR 2>/dev/null || sudo chown $USER:$(id -gn) $APP_DIR
fi

cd $APP_DIR

# Instalar Node.js baseado no sistema
echo "📦 Instalando Node.js..."

if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
    # Debian/Ubuntu
    sudo apt-get update
    sudo apt-get install -y curl git build-essential
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]] || [[ "$OS" == *"Rocky"* ]] || [[ "$OS" == *"AlmaLinux"* ]] || [[ "$OS" == *"Fedora"* ]]; then
    # RHEL/CentOS/Rocky/Fedora
    sudo yum update -y || sudo dnf update -y
    sudo yum install -y curl git gcc-c++ make || sudo dnf install -y curl git gcc-c++ make
    
    # Instalar Node.js via NodeSource
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo yum install -y nodejs || sudo dnf install -y nodejs
    
elif [[ "$OS" == *"Container-Optimized"* ]] || [[ "$OS" == *"Container OS"* ]] || [[ "$OS" == *"COS"* ]]; then
    # Container-Optimized OS - precisa usar container ou instalar manualmente
    echo "⚠️  Container-Optimized OS detectado"
    echo "Instalando Node.js manualmente..."
    
    # Baixar e extrair Node.js
    NODE_VERSION="v20.11.0"
    NODE_TARBALL="node-${NODE_VERSION}-linux-x64.tar.xz"
    
    curl -O https://nodejs.org/dist/${NODE_VERSION}/${NODE_TARBALL}
    sudo tar -xf ${NODE_TARBALL} -C /usr/local --strip-components=1
    rm ${NODE_TARBALL}
    
else
    # Fallback - tentar instalar via nvm ou manual
    echo "⚠️  Sistema não reconhecido, tentando instalação genérica..."
    
    # Tentar com nvm
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 20
    nvm use 20
fi

# Verificar instalação
echo ""
echo "✅ Node.js $(node -v) instalado"
echo "✅ NPM $(npm -v) instalado"
echo ""

# Instalar PM2
echo "📦 Instalando PM2..."
sudo npm install -g pm2

# Clonar projeto
echo ""
echo "📥 Clonando projeto..."
if [ -d ".git" ]; then
    git pull
else
    git clone https://github.com/jhowtkd/timeline-concorrentes.git .
fi

cd my-app

# Instalar dependências
echo ""
echo "📦 Instalando dependências..."
npm install

# Buildar
echo ""
echo "🔨 Buildando..."
npm run build

# Criar pasta de dados
mkdir -p data

# Criar arquivo de variáveis (template)
if [ ! -f ".env.production" ]; then
    echo ""
    echo "📝 Criando .env.production (TEMPLATE)"
    echo "⚠️  EDITE ESSE ARQUIVO E COLOQUE SUAS CHAVES!"
    echo ""
    
    cat > .env.production << 'EOF'
NODE_ENV=production
PORT=3000
CLAUDBOT_API_KEY=COLOQUE_SUA_CHAVE_AQUI
APIFY_TOKEN=COLOQUE_SEU_TOKEN_AQUI
APIFY_ACTOR_ID=apify/instagram-scraper
INGEST_API_URL=/api/ingest
DATABASE_PATH=./data/dashboard.db
EOF
    
    echo ""
    echo "❗ ARQUIVO .env.production CRIADO COM PLACEHOLDERS"
    echo "❗ EDITE O ARQUIVO ANTES DE CONTINUAR:"
    echo "   nano .env.production"
    echo ""
    echo "Pressione ENTER quando terminar de editar..."
    read
fi

# Iniciar com PM2
echo ""
echo "🚀 Iniciando app..."
pm2 delete timeline-concorrentes 2>/dev/null || true
pm2 start npm --name "timeline-concorrentes" -- start
pm2 save

# Configurar startup
pm2 startup | tail -1 | bash

echo ""
echo "=========================================="
echo "✅ Setup completo!"
echo "=========================================="
echo ""
echo "Para ver logs: pm2 logs"
echo "Para reiniciar: pm2 restart timeline-concorrentes"
echo ""
