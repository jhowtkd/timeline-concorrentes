#!/usr/bin/env tsx
/**
 * Script que busca handles configurados no banco e executa scrape
 * Uso: npx tsx scripts/scrape-from-db.ts [options]
 */

import { scrapeInstagramProfile, createApifyClient, getRunStatus, getDatasetItems, estimateCost } from '../lib/apify';
import { transformApifyToClawdBot, validateClawdBotPayload } from '../lib/transformers';

const INGEST_API_URL = process.env.INGEST_API_URL || 'http://localhost:3000/api/ingest';
const CLAUDBOT_API_KEY = process.env.CLAUBOT_API_KEY || '';

interface Column {
  id: string;
  boardId: string;
  sourceType: string;
  displayName: string;
  handle: string | null;
}

interface Board {
  id: string;
  name: string;
  columns: Column[];
}

async function getBoardsWithHandles(): Promise<Array<{ board: Board; column: Column }>> {
  try {
    const response = await fetch(`${INGEST_API_URL.replace('/ingest', '/boards')}`, {
      headers: {
        'Authorization': `Bearer ${CLAUBOT_API_KEY}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch boards: ${response.status}`);
    }
    
    const boards: Board[] = await response.json();
    
    const results: Array<{ board: Board; column: Column }> = [];
    
    for (const board of boards) {
      for (const column of board.columns) {
        if (column.handle && column.sourceType === 'instagram') {
          results.push({ board, column });
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error('❌ Error fetching boards:', error);
    return [];
  }
}

async function sendToIngest(payload: any, handle: string) {
  try {
    const response = await fetch(INGEST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CLAUBOT_API_KEY}`,
        'X-Batch-Id': `apify-${handle}-${Date.now()}`,
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }
    
    const result = await response.json();
    console.log(`✅ ${handle}: ${result.processed?.postsInserted || 0} posts inseridos`);
    return result;
  } catch (error) {
    console.error(`❌ ${handle}: Erro ao enviar`, error);
    throw error;
  }
}

async function scrapeProfile(handle: string, columnId: string, boardId: string, limit: number = 50) {
  console.log(`\n🚀 Iniciando scrape: @${handle}`);
  console.log('─'.repeat(50));
  
  try {
    const client = createApifyClient();
    const actorId = process.env.APIFY_ACTOR_ID || 'apify/instagram-scraper';
    
    const run = await scrapeInstagramProfile(client, actorId, handle, {
      resultsLimit: limit,
    });
    
    console.log(`⏳ Aguardando conclusão (Run ID: ${run.id})...`);
    
    let status = await getRunStatus(client, run.id);
    const maxAttempts = 60;
    let attempts = 0;
    
    while (status !== 'SUCCEEDED' && status !== 'FAILED' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      status = await getRunStatus(client, run.id);
      attempts++;
      process.stdout.write('.');
    }
    console.log('');
    
    if (status === 'FAILED') {
      throw new Error('Apify run falhou');
    }
    
    if (attempts >= maxAttempts) {
      throw new Error('Timeout aguardando run');
    }
    
    const items = await getDatasetItems(client, run.defaultDatasetId);
    console.log(`📊 ${items.length} posts extraídos`);
    
    if (items.length === 0) {
      console.log('⚠️  Nenhum post encontrado. Verifique se o perfil é público.');
      return;
    }
    
    const payload = transformApifyToClawdBot(items, {
      platform: 'instagram',
      handle,
      url: `https://instagram.com/${handle}`,
    });
    
    // Add column and board IDs to posts
    payload.posts = payload.posts.map((post: any) => ({
      ...post,
      columnId,
      boardId,
    }));
    
    const validation = validateClawdBotPayload(payload);
    if (!validation.valid) {
      throw new Error(`Payload inválido: ${validation.errors?.join(', ')}`);
    }
    
    await sendToIngest(payload, handle);
    
    const cost = estimateCost(items.length);
    console.log(`💰 Custo estimado: $${cost.toFixed(4)}`);
    
  } catch (error) {
    console.error(`\n❌ Erro no scrape de @${handle}:`, error);
    throw error;
  }
}

async function main() {
  console.log('========================================');
  console.log('📸 Scraper Baseado no Banco de Dados');
  console.log('========================================\n');
  
  if (!CLAUBOT_API_KEY) {
    console.error('❌ CLAUDBOT_API_KEY não configurado');
    process.exit(1);
  }
  
  console.log('🔍 Buscando colunas configuradas...');
  const configs = await getBoardsWithHandles();
  
  if (configs.length === 0) {
    console.log('\n⚠️  Nenhuma coluna configurada com @username');
    console.log('   Adicione @usernames no dashboard primeiro!');
    process.exit(0);
  }
  
  console.log(`\n✅ ${configs.length} perfis configurados:`);
  configs.forEach(({ board, column }) => {
    console.log(`   • ${board.name} / ${column.displayName}: @${column.handle}`);
  });
  console.log('');
  
  const limit = parseInt(process.argv[2] || '50', 10);
  console.log(`📋 Limite de posts por perfil: ${limit}\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const { board, column } of configs) {
    try {
      await scrapeProfile(column.handle!, column.id, board.id, limit);
      successCount++;
    } catch (error) {
      failCount++;
      console.error(`\n❌ Falha em @${column.handle}`);
    }
    
    // Aguardar entre scrapes
    if (configs.indexOf({ board, column }) < configs.length - 1) {
      console.log('\n⏳ Aguardando 30s antes do próximo...\n');
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
  }
  
  console.log('\n========================================');
  console.log('📊 RESUMO');
  console.log('========================================');
  console.log(`✅ Sucesso: ${successCount}/${configs.length}`);
  console.log(`❌ Falhas: ${failCount}/${configs.length}`);
  console.log('========================================\n');
  
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('\n❌ Erro fatal:', error);
  process.exit(1);
});
