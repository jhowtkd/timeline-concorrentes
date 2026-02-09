/**
 * Transformadores de dados
 * 
 * Este módulo converte dados de diferentes fontes (Apify, etc.)
 * no formato ClawdBotPayload esperado pela API de ingestão.
 */

import { 
  ClawdBotPayload, 
  ClawdBotSource, 
  ClawdBotPost 
} from './types';
import { ApifyInstagramPost } from './apify';

/**
 * Gera um ID único para o batch
 */
function generateBatchId(): string {
  return `batch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Converte o tipo de mídia do Apify para o formato ClawdBot
 */
function mapMediaType(apifyType?: string): 'carousel' | 'video' | 'image' {
  switch (apifyType) {
    case 'Sidecar':
    case 'Carousel':
      return 'carousel';
    case 'Video':
      return 'video';
    case 'Image':
    default:
      return 'image';
  }
}

/**
 * Extrai menções (@usuario) de um texto
 */
function extractMentions(text: string): string[] {
  const mentions = text.match(/@([a-zA-Z0-9_.]+)/g);
  return mentions ? mentions.map(m => m.substring(1)) : [];
}

/**
 * Extrai hashtags de um texto ou usa as fornecidas
 */
function extractHashtags(text: string, providedHashtags?: string[]): string[] {
  if (providedHashtags && providedHashtags.length > 0) {
    return providedHashtags;
  }
  
  const hashtags = text.match(/#([a-zA-Z0-9_\u00C0-\u00FF]+)/g);
  return hashtags ? hashtags.map(h => h.substring(1)) : [];
}

/**
 * Formata a URL do perfil do Instagram
 */
function formatInstagramUrl(username: string): string {
  return `https://instagram.com/${username}`;
}

/**
 * Formata a URL de um post do Instagram
 */
function formatPostUrl(shortcodeOrUrl: string): string {
  if (shortcodeOrUrl.startsWith('http')) {
    return shortcodeOrUrl;
  }
  // Se for um shortcode, monta a URL
  return `https://instagram.com/p/${shortcodeOrUrl}`;
}

/**
 * Converte um post do Apify para o formato ClawdBotPost
 */
function transformApifyPost(post: ApifyInstagramPost): ClawdBotPost {
  const caption = post.caption || '';
  const mentions = post.mentions || extractMentions(caption);
  const hashtags = extractHashtags(caption, post.hashtags);
  
  return {
    id: post.id,
    url: formatPostUrl(post.url),
    content: caption,
    mediaType: mapMediaType(post.type),
    publishedAt: post.timestamp || new Date().toISOString(),
    engagement: {
      likes: post.likesCount || 0,
      comments: post.commentsCount || 0,
      // O Apify não fornece shares diretamente para posts do Instagram
      shares: undefined,
    },
    hashtags: hashtags.length > 0 ? hashtags : undefined,
    mentions: mentions.length > 0 ? mentions : undefined,
  };
}

/**
 * Transforma dados do Apify Instagram Scraper para o formato ClawdBotPayload
 * 
 * @param posts - Posts retornados pelo Apify
 * @param username - Nome de usuário do Instagram
 * @returns ClawdBotPayload formatado
 */
export function transformApifyToClawdBot(
  posts: ApifyInstagramPost[],
  username: string
): ClawdBotPayload {
  if (!posts || posts.length === 0) {
    throw new Error('Nenhum post para transformar');
  }

  const source: ClawdBotSource = {
    platform: 'instagram',
    handle: username,
    url: formatInstagramUrl(username),
  };

  const transformedPosts = posts
    .filter(post => post.id && post.url) // Filtra posts inválidos
    .map(transformApifyPost);

  if (transformedPosts.length === 0) {
    throw new Error('Nenhum post válido após transformação');
  }

  return {
    batchId: generateBatchId(),
    scrapedAt: new Date().toISOString(),
    source,
    posts: transformedPosts,
  };
}

/**
 * Valida se o payload está no formato correto
 */
export function validateClawdBotPayload(payload: ClawdBotPayload): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!payload.batchId) {
    errors.push('batchId é obrigatório');
  }

  if (!payload.scrapedAt) {
    errors.push('scrapedAt é obrigatório');
  }

  if (!payload.source) {
    errors.push('source é obrigatório');
  } else {
    if (!payload.source.platform) {
      errors.push('source.platform é obrigatório');
    }
    if (!payload.source.handle) {
      errors.push('source.handle é obrigatório');
    }
    if (!payload.source.url) {
      errors.push('source.url é obrigatório');
    }
  }

  if (!payload.posts || !Array.isArray(payload.posts)) {
    errors.push('posts deve ser um array');
  } else {
    payload.posts.forEach((post, index) => {
      if (!post.id) {
        errors.push(`Post ${index}: id é obrigatório`);
      }
      if (!post.url) {
        errors.push(`Post ${index}: url é obrigatório`);
      }
      if (!post.content && post.content !== '') {
        errors.push(`Post ${index}: content é obrigatório`);
      }
      if (!post.publishedAt) {
        errors.push(`Post ${index}: publishedAt é obrigatório`);
      }
      if (!post.engagement) {
        errors.push(`Post ${index}: engagement é obrigatório`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Estatísticas de transformação
 */
export interface TransformationStats {
  totalPosts: number;
  validPosts: number;
  invalidPosts: number;
  errors: string[];
}

/**
 * Transforma dados com estatísticas detalhadas
 */
export function transformApifyToClawdBotWithStats(
  posts: ApifyInstagramPost[],
  username: string
): {
  payload: ClawdBotPayload;
  stats: TransformationStats;
} {
  const stats: TransformationStats = {
    totalPosts: posts.length,
    validPosts: 0,
    invalidPosts: 0,
    errors: [],
  };

  const validPosts: ApifyInstagramPost[] = [];

  posts.forEach((post, index) => {
    const errors: string[] = [];

    if (!post.id) errors.push('id ausente');
    if (!post.url) errors.push('url ausente');

    if (errors.length > 0) {
      stats.invalidPosts++;
      stats.errors.push(`Post ${index}: ${errors.join(', ')}`);
    } else {
      stats.validPosts++;
      validPosts.push(post);
    }
  });

  if (validPosts.length === 0) {
    throw new Error(`Nenhum post válido encontrado. Erros: ${stats.errors.join('; ')}`);
  }

  const payload = transformApifyToClawdBot(validPosts, username);

  return { payload, stats };
}

/**
 * Transformadores para outras plataformas (placeholder para futuras integrações)
 */
export const transformers = {
  apify: {
    instagram: transformApifyToClawdBot,
    instagramWithStats: transformApifyToClawdBotWithStats,
  },
  // Futuras integrações podem ser adicionadas aqui
  // linkedin: transformLinkedInToClawdBot,
  // youtube: transformYouTubeToClawdBot,
  // tiktok: transformTikTokToClawdBot,
};
