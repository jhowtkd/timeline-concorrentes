// Types for the Competitor Timeline Dashboard

export interface Post {
  id: string;
  columnId: string;
  boardId: string;
  url: string;
  content: string;
  mediaUrls: string[];
  mediaType: 'image' | 'video' | 'carousel' | null;
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
  importedAt: string;
  hashtags?: string[];
  mentions?: string[];
}

export interface Column {
  id: string;
  boardId: string;
  sourceType: 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'rss' | 'meta-ads';
  displayName: string;
  position: number;
  isActive: boolean;
  posts: Post[];
}

export interface Board {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  createdAt: string;
  columns: Column[];
}

// API Types for ClawdBot integration
export interface ClawdBotPost {
  id: string;
  url: string;
  content: string;
  mediaType: 'carousel' | 'video' | 'image';
  publishedAt: string;
  engagement: {
    likes: number;
    comments: number;
    shares?: number;
  };
  hashtags?: string[];
  mentions?: string[];
}

export interface ClawdBotSource {
  platform: 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'rss' | 'meta-ads';
  handle: string;
  url: string;
}

export interface ClawdBotPayload {
  batchId: string;
  scrapedAt: string;
  source: ClawdBotSource;
  posts: ClawdBotPost[];
}

export interface ForceUpdateRequest {
  target: string;
  depth?: number;
}
