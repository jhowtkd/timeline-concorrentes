/**
 * Apify Instagram Scraper Client
 * 
 * Este módulo fornece integração com o Apify para extrair dados do Instagram
 * usando o actor "apify/instagram-scraper".
 */

import { ApifyClient } from 'apify-client';

// Configuração do cliente Apify
const APIFY_TOKEN = process.env.APIFY_TOKEN;
const APIFY_ACTOR_ID = process.env.APIFY_ACTOR_ID || 'apify/instagram-scraper';

if (!APIFY_TOKEN) {
  console.warn('[Apify] APIFY_TOKEN não configurado. O scraper não funcionará.');
}

// Interface para os dados brutos do Apify
export interface ApifyInstagramPost {
  id: string;
  url: string;
  caption?: string;
  likesCount?: number;
  commentsCount?: number;
  timestamp?: string;
  type?: 'Image' | 'Video' | 'Sidecar' | 'Carousel';
  hashtags?: string[];
  mentions?: string[];
  ownerUsername?: string;
  ownerFullName?: string;
  displayUrl?: string;
  images?: string[];
  videoUrl?: string;
  videoViewCount?: number;
  videoPlayCount?: number;
  childPosts?: ApifyInstagramPost[];
  locationName?: string;
  locationId?: string;
  productType?: string;
  isSponsored?: boolean;
  [key: string]: unknown;
}

export interface ApifyRunInput {
  username: string[];
  resultsLimit?: number;
  resultsType?: 'posts' | 'reels' | 'stories' | 'highlights';
  maxRequestRetries?: number;
  proxy?: {
    useApifyProxy?: boolean;
    apifyProxyGroups?: string[];
    apifyProxyCountry?: string;
  };
  scrollTimeout?: number;
  addParentData?: boolean;
}

export interface ApifyRunOptions {
  waitForFinish?: number; // segundos
  timeout?: number; // milissegundos
}

/**
 * Cria uma instância do cliente Apify
 */
export function createApifyClient(): ApifyClient {
  if (!APIFY_TOKEN) {
    throw new Error(
      'APIFY_TOKEN não configurado. ' +
      'Configure a variável de ambiente APIFY_TOKEN no arquivo .env.local'
    );
  }
  
  return new ApifyClient({
    token: APIFY_TOKEN,
  });
}

/**
 * Inicia um scrape de perfil do Instagram
 * 
 * @param username - Nome de usuário do Instagram (sem @)
 * @param options - Opções de configuração do scrape
 * @returns Promise com os dados dos posts
 */
export async function scrapeInstagramProfile(
  username: string,
  options: {
    resultsLimit?: number;
    resultsType?: 'posts' | 'reels' | 'stories' | 'highlights';
    waitForFinish?: number;
  } = {}
): Promise<ApifyInstagramPost[]> {
  const client = createApifyClient();
  
  const {
    resultsLimit = 50,
    resultsType = 'posts',
    waitForFinish = 300, // 5 minutos padrão
  } = options;

  console.log(`[Apify] Iniciando scrape do perfil: @${username}`);
  console.log(`[Apify] Limite de resultados: ${resultsLimit}`);
  console.log(`[Apify] Tipo de conteúdo: ${resultsType}`);

  // Input para o actor do Apify
  const input: ApifyRunInput = {
    username: [username],
    resultsLimit,
    resultsType,
    maxRequestRetries: 3,
    proxy: {
      useApifyProxy: true,
      apifyProxyGroups: ['RESIDENTIAL'],
      apifyProxyCountry: 'BR',
    },
    scrollTimeout: 60,
    addParentData: false,
  };

  try {
    // Inicia o actor e aguarda a conclusão
    const run = await client.actor(APIFY_ACTOR_ID).call(input, {
      waitForFinish,
    });

    console.log(`[Apify] Run ID: ${run.id}`);
    console.log(`[Apify] Status: ${run.status}`);

    if (run.status === 'FAILED') {
      throw new Error(`Apify run falhou: ${run.statusMessage || 'Erro desconhecido'}`);
    }

    if (run.status === 'TIMED-OUT') {
      throw new Error('Apify run excedeu o tempo limite. Tente aumentar o waitForFinish.');
    }

    // Recupera os dados do dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    console.log(`[Apify] ${items.length} posts extraídos com sucesso`);

    return items as ApifyInstagramPost[];
  } catch (error) {
    console.error('[Apify] Erro durante o scrape:', error);
    throw error;
  }
}

/**
 * Verifica o status de um run específico
 */
export async function getRunStatus(runId: string) {
  const client = createApifyClient();
  
  try {
    const run = await client.run(runId).get();
    return run;
  } catch (error) {
    console.error(`[Apify] Erro ao verificar status do run ${runId}:`, error);
    throw error;
  }
}

/**
 * Recupera os dados de um dataset específico
 */
export async function getDatasetItems(datasetId: string): Promise<ApifyInstagramPost[]> {
  const client = createApifyClient();
  
  try {
    const { items } = await client.dataset(datasetId).listItems();
    return items as ApifyInstagramPost[];
  } catch (error) {
    console.error(`[Apify] Erro ao recuperar dados do dataset ${datasetId}:`, error);
    throw error;
  }
}

/**
 * Lista os últimos runs do actor
 */
export async function listRecentRuns(limit = 10) {
  const client = createApifyClient();
  
  try {
    const runs = await client.actor(APIFY_ACTOR_ID).runs().list({
      limit,
      desc: true,
    });
    return runs;
  } catch (error) {
    console.error('[Apify] Erro ao listar runs:', error);
    throw error;
  }
}

/**
 * Calcula o custo estimado de um scrape
 * Baseado nos preços aproximados do Apify para Instagram Scraper
 */
export function estimateCost(postsCount: number): {
  usd: number;
  computeUnits: number;
} {
  // Preço aproximado: $0.30 por 1000 posts (varia conforme configuração)
  const computeUnits = Math.ceil(postsCount / 1000);
  const usd = computeUnits * 0.30;
  
  return {
    usd: Math.round(usd * 100) / 100,
    computeUnits,
  };
}
