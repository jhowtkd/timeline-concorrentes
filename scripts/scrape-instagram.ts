#!/usr/bin/env tsx
/**
 * Script de scrape do Instagram via Apify
 * 
 * Uso:
 *   tsx scripts/scrape-instagram.ts <username> [options]
 *   npm run scrape:ig -- <username> [options]
 * 
 * Exemplos:
 *   tsx scripts/scrape-instagram.ts nike
 *   tsx scripts/scrape-instagram.ts adidas --limit 100
 *   tsx scripts/scrape-instagram.ts puma --type reels
 * 
 * Opções:
 *   --limit, -l      Limite de posts (padrão: 50)
 *   --type, -t       Tipo: posts | reels | stories | highlights (padrão: posts)
 *   --dry-run, -d    Apenas mostra o resultado sem enviar para a API
 *   --verbose, -v    Modo verboso com mais detalhes
 *   --help, -h       Mostra esta ajuda
 */

import { scrapeInstagramProfile, ApifyInstagramPost } from '../lib/apify';
import { 
  transformApifyToClawdBotWithStats, 
  validateClawdBotPayload 
} from '../lib/transformers';
import { ClawdBotPayload } from '../lib/types';

// Configurações
const INGEST_API_URL = process.env.INGEST_API_URL || 'http://localhost:3000/api/ingest';
const CLAUDBOT_API_KEY = process.env.CLAUDBOT_API_KEY;

// Parse de argumentos
function parseArgs(): {
  username: string;
  limit: number;
  type: 'posts' | 'reels' | 'stories' | 'highlights';
  dryRun: boolean;
  verbose: boolean;
  help: boolean;
} {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    return { 
      username: '', 
      limit: 50, 
      type: 'posts', 
      dryRun: false, 
      verbose: false, 
      help: true 
    };
  }

  const username = args[0].replace('@', ''); // Remove @ se presente
  
  const limitIndex = args.findIndex(arg => arg === '--limit' || arg === '-l');
  const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) || 50 : 50;
  
  const typeIndex = args.findIndex(arg => arg === '--type' || arg === '-t');
  const type = (typeIndex !== -1 ? args[typeIndex + 1] : 'posts') as 'posts' | 'reels' | 'stories' | 'highlights';
  
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const verbose = args.includes('--verbose') || args.includes('-v');

  return { username, limit, type, dryRun, verbose, help: false };
}

// Mostra ajuda
function showHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║       🚀 Instagram Scraper - Timeline de Concorrentes      ║
╚════════════════════════════════════════════════════════════╝

Uso:
  tsx scripts/scrape-instagram.ts <username> [options]
  npm run scrape:ig -- <username> [options]

Argumentos:
  username          Nome de usuário do Instagram (com ou sem @)

Opções:
  --limit, -l       Limite de posts a extrair (padrão: 50)
  --type, -t        Tipo de conteúdo: posts | reels | stories | highlights
  --dry-run, -d     Apenas simula, não envia para a API
  --verbose, -v     Mostra mais detalhes durante execução
  --help, -h        Mostra esta ajuda

Exemplos:
  tsx scripts/scrape-instagram.ts nike
  tsx scripts/scrape-instagram.ts @adidas --limit 100
  npm run scrape:ig -- puma --type reels --dry-run
  npm run scrape:ig -- reebok -l 200 -v

Variáveis de ambiente necessárias:
  APIFY_TOKEN       Token da API do Apify
  APIFY_ACTOR_ID    ID do actor (padrão: apify/instagram-scraper)
  CLAUDBOT_API_KEY  Chave da API de ingestão
  INGEST_API_URL    URL da API de ingestão (padrão: http://localhost:3000/api/ingest)
`);
}

// Envio para API de ingestão
async function sendToIngestApi(payload: ClawdBotPayload): Promise<{
  success: boolean;
  data?: unknown;
  error?: string;
}> {
  if (!CLAUDBOT_API_KEY) {
    return {
      success: false,
      error: 'CLAUDBOT_API_KEY não configurado',
    };
  }

  try {
    const response = await fetch(INGEST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLAUDBOT_API_KEY}`,
        'X-Batch-Id': payload.batchId,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Função principal
async function main() {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║       🚀 Instagram Scraper - Timeline de Concorrentes      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Validações
  if (!args.username) {
    console.error('❌ Erro: Username é obrigatório');
    console.log('\nUse --help para ver as opções disponíveis\n');
    process.exit(1);
  }

  if (!process.env.APIFY_TOKEN) {
    console.error('❌ Erro: APIFY_TOKEN não configurado');
    console.log('   Configure no arquivo .env.local\n');
    process.exit(1);
  }

  if (!args.dryRun && !CLAUDBOT_API_KEY) {
    console.error('❌ Erro: CLAUDBOT_API_KEY não configurado');
    console.log('   Configure no arquivo .env.local ou use --dry-run\n');
    process.exit(1);
  }

  // Configurações
  console.log('📋 Configurações:');
  console.log(`   Username: @${args.username}`);
  console.log(`   Limite: ${args.limit} posts`);
  console.log(`   Tipo: ${args.type}`);
  console.log(`   Modo: ${args.dryRun ? 'DRY-RUN (simulação)' : 'PRODUÇÃO'}`);
  console.log(`   API: ${INGEST_API_URL}\n`);

  try {
    // 1. Scrape do Instagram via Apify
    console.log('🔍 Etapa 1: Extraindo dados do Instagram...');
    const startTime = Date.now();
    
    const posts = await scrapeInstagramProfile(args.username, {
      resultsLimit: args.limit,
      resultsType: args.type,
    });

    const scrapeTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   ✅ ${posts.length} posts extraídos em ${scrapeTime}s\n`);

    if (posts.length === 0) {
      console.log('⚠️  Nenhum post encontrado. Verifique se o perfil é público.\n');
      process.exit(0);
    }

    if (args.verbose) {
      console.log('📊 Primeiros posts encontrados:');
      posts.slice(0, 3).forEach((post, i) => {
        console.log(`   ${i + 1}. ${post.url} (${post.type || 'unknown'})`);
        console.log(`      ❤️ ${post.likesCount || 0} 💬 ${post.commentsCount || 0}`);
      });
      console.log('');
    }

    // 2. Transformação dos dados
    console.log('🔄 Etapa 2: Transformando dados...');
    const { payload, stats } = transformApifyToClawdBotWithStats(posts, args.username);
    
    console.log(`   ✅ ${stats.validPosts} posts válidos transformados`);
    if (stats.invalidPosts > 0) {
      console.log(`   ⚠️  ${stats.invalidPosts} posts inválidos ignorados`);
    }
    console.log('');

    if (args.verbose) {
      console.log('📊 Estatísticas de validação:');
      stats.errors.slice(0, 5).forEach(err => console.log(`   ⚠️  ${err}`));
      if (stats.errors.length > 5) {
        console.log(`   ... e mais ${stats.errors.length - 5} erros`);
      }
      console.log('');
    }

    // 3. Validação do payload
    console.log('✅ Etapa 3: Validando payload...');
    const validation = validateClawdBotPayload(payload);
    
    if (!validation.valid) {
      console.error('   ❌ Payload inválido:');
      validation.errors.forEach(err => console.error(`      - ${err}`));
      console.log('');
      process.exit(1);
    }
    console.log('   ✅ Payload válido\n');

    if (args.verbose) {
      console.log('📦 Preview do payload:');
      console.log(`   Batch ID: ${payload.batchId}`);
      console.log(`   Source: ${payload.source.platform} / @${payload.source.handle}`);
      console.log(`   Posts: ${payload.posts.length}`);
      console.log(`   Scraped At: ${payload.scrapedAt}\n`);
    }

    // 4. Envio para API (ou dry-run)
    if (args.dryRun) {
      console.log('🧪 Etapa 4: MODO DRY-RUN (nenhum dado será enviado)');
      console.log('   📦 Payload gerado:');
      console.log(JSON.stringify(payload, null, 2));
      console.log('\n✅ Simulação concluída com sucesso!\n');
    } else {
      console.log('📤 Etapa 4: Enviando para API de ingestão...');
      const result = await sendToIngestApi(payload);

      if (!result.success) {
        console.error(`   ❌ Erro ao enviar: ${result.error}`);
        console.log('');
        process.exit(1);
      }

      console.log('   ✅ Dados enviados com sucesso!');
      if (result.data) {
        const data = result.data as {
          processed?: {
            postsReceived?: number;
            postsInserted?: number;
            postsUpdated?: number;
          };
        };
        console.log(`   📊 Posts recebidos: ${data.processed?.postsReceived || '?'}`);
        console.log(`   📊 Posts inseridos: ${data.processed?.postsInserted || '?'}`);
        console.log(`   📊 Posts atualizados: ${data.processed?.postsUpdated || '?'}`);
      }
      console.log('');
    }

    // Resumo final
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                      ✅ CONCLUÍDO                          ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  ⏱️  Tempo total: ${totalTime.toString().padEnd(43, ' ')} ║`);
    console.log(`║  📊 Posts processados: ${String(stats.validPosts).padEnd(37, ' ')} ║`);
    console.log(`║  📝 Batch ID: ${payload.batchId.slice(0, 35).padEnd(45, ' ')} ║`);
    console.log('╚════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n❌ Erro durante execução:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
      if (args.verbose && error.stack) {
        console.error('\nStack trace:');
        console.error(error.stack);
      }
    } else {
      console.error(`   ${String(error)}`);
    }
    console.log('');
    process.exit(1);
  }
}

// Executa o script
main();
