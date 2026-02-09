# 🔥 Deploy no Firebase

Guia para hospedar o Timeline de Concorrentes no Firebase.

---

## ✅ Pré-requisitos

1. Conta no [Firebase](https://firebase.google.com)
2. Node.js 18+ instalado

---

## 1️⃣ Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

Ou use sem instalar:
```bash
npx firebase-tools <comando>
```

---

## 2️⃣ Login no Firebase

```bash
firebase login
```

Isso abrirá o navegador para você autorizar.

---

## 3️⃣ Criar Projeto Firebase

### Opção A: Via Console Web
1. Acesse: https://console.firebase.google.com
2. Clique em **"Create project"**
3. Dê um nome (ex: `timeline-concorrentes`)
4. Siga os passos (pode desabilitar Google Analytics se quiser)
5. Anote o **Project ID**

### Opção B: Via CLI
```bash
firebase projects:create timeline-concorrentes
```

---

## 4️⃣ Configurar Projeto Local

Edite `.firebaserc` e coloque seu Project ID:

```json
{
  "projects": {
    "default": "SEU_PROJECT_ID_AQUI"
  }
}
```

Exemplo:
```json
{
  "projects": {
    "default": "timeline-concorrentes-abc123"
  }
}
```

---

## 5️⃣ Configurar Next.js para Firebase

### next.config.ts

Já está configurado! O Firebase suporta Next.js via **Firebase Hosting with Cloud Functions**.

### Variáveis de Ambiente

Configure no **Firebase Console**:

1. Acesse: https://console.firebase.google.com
2. Vá em seu projeto → **Project Settings** → **Environment variables**
3. Adicione as variáveis:

```
CLAUDBOT_API_KEY=sua_chave_aqui
APIFY_TOKEN=seu_token_apify_aqui
APIFY_ACTOR_ID=apify/instagram-scraper
INGEST_API_URL=/api/ingest
```

---

## 6️⃣ Deploy

```bash
# Deploy tudo (hosting + functions)
firebase deploy

# Deploy só o hosting
firebase deploy --only hosting

# Deploy só functions
firebase deploy --only functions
```

---

## 7️⃣ Atualizar Secrets no GitHub

Após o deploy, pegue a URL do Firebase e atualize o secret:

```bash
# URL será algo como:
# https://timeline-concorrentes-abc123.web.app

# Atualize o secret no GitHub
cd my-app && gh secret set INGEST_API_URL --body "https://SEU_PROJECT_ID.web.app/api/ingest"
```

---

## 🔄 Comandos Úteis

```bash
# Ver status
firebase projects:list

# Abrir console
firebase open hosting

# Ver logs
firebase functions:log

# Emular localmente
firebase emulators:start
```

---

## 💰 Custos Firebase

| Serviço | Gratuito | Pago |
|---------|---------|------|
| **Hosting** | 1GB/transferência | $0.15/GB após |
| **Functions** | 2M execuções/mês | $0.40/milhão |
| **Firestore** | 1GB storage | $0.18/GB |

**Seu projeto:** Free tier é suficiente para começar! ✅

---

## 🐛 Troubleshooting

### "Project not found"
```bash
firebase use --add
# Selecione seu projeto
```

### "Permission denied"
```bash
firebase logout
firebase login
```

### Build falha
```bash
# Limpar cache
rm -rf .next
rm -rf node_modules/.cache
npm run build
firebase deploy
```

---

## 📚 Recursos

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Next.js on Firebase](https://firebase.google.com/docs/hosting/nextjs)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)
