import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { Board, Column, Post, ClawdBotPayload } from './types';

// Suporta Render (/data) e local (./data)
const DB_PATH = process.env.DATABASE_PATH || './data/dashboard.db';

// Garantir que o diretório existe
const dbDir = dirname(DB_PATH);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Initialize database schema
db.exec(`
  -- Boards table (competitors)
  CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Columns table (sources)
  CREATE TABLE IF NOT EXISTS columns (
    id TEXT PRIMARY KEY,
    board_id TEXT REFERENCES boards(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL,
    display_name TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    UNIQUE(board_id, source_type)
  );

  -- Posts table
  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    column_id TEXT REFERENCES columns(id) ON DELETE CASCADE,
    board_id TEXT REFERENCES boards(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    content TEXT,
    media_urls TEXT, -- JSON array
    media_type TEXT,
    published_at DATETIME,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    hashtags TEXT, -- JSON array
    mentions TEXT, -- JSON array
    imported_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Create indexes for performance
  CREATE INDEX IF NOT EXISTS idx_posts_board ON posts(board_id);
  CREATE INDEX IF NOT EXISTS idx_posts_column ON posts(column_id);
  CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at);
`);

// Helper to generate slugs
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Board operations
export function createBoard(name: string, avatarUrl?: string): Board {
  const id = uuidv4();
  const slug = generateSlug(name);
  
  const stmt = db.prepare(`
    INSERT INTO boards (id, name, slug, avatar_url)
    VALUES (?, ?, ?, ?)
  `);
  
  stmt.run(id, name, slug, avatarUrl || null);
  
  // Create default columns for each board
  const defaultSources: Array<{ type: string; name: string }> = [
    { type: 'instagram', name: 'Instagram' },
    { type: 'linkedin', name: 'LinkedIn' },
    { type: 'youtube', name: 'YouTube' },
    { type: 'tiktok', name: 'TikTok' },
  ];
  
  defaultSources.forEach((source, index) => {
    createColumn(id, source.type as any, source.name, index);
  });
  
  return getBoardById(id)!;
}

export function getBoards(): Board[] {
  const boards = db.prepare('SELECT * FROM boards ORDER BY created_at DESC').all() as any[];
  return boards.map(board => ({
    ...board,
    columns: getColumnsByBoard(board.id),
  }));
}

export function getBoardById(id: string): Board | null {
  const board = db.prepare('SELECT * FROM boards WHERE id = ?').get(id) as any;
  if (!board) return null;
  
  return {
    ...board,
    columns: getColumnsByBoard(board.id),
  };
}

export function getBoardBySlug(slug: string): Board | null {
  const board = db.prepare('SELECT * FROM boards WHERE slug = ?').get(slug) as any;
  if (!board) return null;
  
  return {
    ...board,
    columns: getColumnsByBoard(board.id),
  };
}

export function deleteBoard(id: string): void {
  db.prepare('DELETE FROM boards WHERE id = ?').run(id);
}

// Column operations
export function createColumn(
  boardId: string, 
  sourceType: string, 
  displayName: string, 
  position: number = 0
): Column {
  const id = uuidv4();
  
  const stmt = db.prepare(`
    INSERT INTO columns (id, board_id, source_type, display_name, position)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(board_id, source_type) DO UPDATE SET
      display_name = excluded.display_name,
      position = excluded.position
  `);
  
  stmt.run(id, boardId, sourceType, displayName, position);
  
  return {
    id,
    boardId,
    sourceType: sourceType as any,
    displayName,
    position,
    isActive: true,
    posts: [],
  };
}

export function getColumnsByBoard(boardId: string): Column[] {
  const columns = db.prepare(`
    SELECT * FROM columns 
    WHERE board_id = ? AND is_active = 1
    ORDER BY position
  `).all(boardId) as any[];
  
  return columns.map(col => ({
    ...col,
    posts: getPostsByColumn(col.id),
  }));
}

export function toggleColumn(columnId: string, isActive: boolean): void {
  db.prepare('UPDATE columns SET is_active = ? WHERE id = ?').run(isActive ? 1 : 0, columnId);
}

// Post operations
export function createPost(post: Omit<Post, 'importedAt'>): Post {
  const stmt = db.prepare(`
    INSERT INTO posts (
      id, column_id, board_id, url, content, media_urls, media_type,
      published_at, likes, comments, shares, hashtags, mentions
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      content = excluded.content,
      likes = excluded.likes,
      comments = excluded.comments,
      shares = excluded.shares,
      imported_at = CURRENT_TIMESTAMP
  `);
  
  stmt.run(
    post.id,
    post.columnId,
    post.boardId,
    post.url,
    post.content,
    JSON.stringify(post.mediaUrls),
    post.mediaType,
    post.publishedAt,
    post.likes,
    post.comments,
    post.shares,
    JSON.stringify(post.hashtags || []),
    JSON.stringify(post.mentions || [])
  );
  
  return getPostById(post.id)!;
}

export function getPostById(id: string): Post | null {
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as any;
  if (!post) return null;
  
  return {
    ...post,
    mediaUrls: JSON.parse(post.media_urls || '[]'),
    hashtags: JSON.parse(post.hashtags || '[]'),
    mentions: JSON.parse(post.mentions || '[]'),
  };
}

export function getPostsByColumn(columnId: string, limit: number = 50): Post[] {
  const posts = db.prepare(`
    SELECT * FROM posts 
    WHERE column_id = ?
    ORDER BY published_at DESC
    LIMIT ?
  `).all(columnId, limit) as any[];
  
  return posts.map(post => ({
    ...post,
    mediaUrls: JSON.parse(post.media_urls || '[]'),
    hashtags: JSON.parse(post.hashtags || '[]'),
    mentions: JSON.parse(post.mentions || '[]'),
  }));
}

export function getPostsByBoard(boardId: string, limit: number = 100): Post[] {
  const posts = db.prepare(`
    SELECT * FROM posts 
    WHERE board_id = ?
    ORDER BY published_at DESC
    LIMIT ?
  `).all(boardId, limit) as any[];
  
  return posts.map(post => ({
    ...post,
    mediaUrls: JSON.parse(post.media_urls || '[]'),
    hashtags: JSON.parse(post.hashtags || '[]'),
    mentions: JSON.parse(post.mentions || '[]'),
  }));
}

// ClawdBot ingestion
export function ingestClawdBotData(payload: ClawdBotPayload): { 
  inserted: number; 
  updated: number; 
  errors: string[];
} {
  const errors: string[] = [];
  let inserted = 0;
  let updated = 0;
  
  // Try to find board by source URL or handle
  const handle = payload.source.handle;
  const board = db.prepare(`
    SELECT b.* FROM boards b
    JOIN columns c ON c.board_id = b.id
    WHERE c.source_type = ? AND (
      b.name LIKE ? OR 
      b.slug LIKE ? OR
      ? LIKE '%' || b.slug || '%'
    )
    LIMIT 1
  `).get(payload.source.platform, `%${handle}%`, `%${handle}%`, payload.source.url) as any;
  
  if (!board) {
    errors.push(`Board not found for handle: ${handle} (${payload.source.platform})`);
    return { inserted, updated, errors };
  }
  
  // Find the column for this source
  const column = db.prepare(`
    SELECT * FROM columns 
    WHERE board_id = ? AND source_type = ?
  `).get(board.id, payload.source.platform) as any;
  
  if (!column) {
    errors.push(`Column not found for board ${board.name} and source ${payload.source.platform}`);
    return { inserted, updated, errors };
  }
  
  // Process posts
  for (const post of payload.posts) {
    try {
      const postId = `${payload.source.platform}_${post.id}`;
      const existing = getPostById(postId);
      
      createPost({
        id: postId,
        columnId: column.id,
        boardId: board.id,
        url: post.url,
        content: post.content,
        mediaUrls: [], // ClawdBot doesn't send media URLs directly
        mediaType: post.mediaType as any,
        publishedAt: post.publishedAt,
        likes: post.engagement.likes,
        comments: post.engagement.comments,
        shares: post.engagement.shares || 0,
        hashtags: post.hashtags || [],
        mentions: post.mentions || [],
      });
      
      if (existing) {
        updated++;
      } else {
        inserted++;
      }
    } catch (error) {
      errors.push(`Failed to process post ${post.id}: ${error}`);
    }
  }
  
  return { inserted, updated, errors };
}

// Stats
export function getStats(): { 
  totalBoards: number; 
  totalPosts: number; 
  postsToday: number;
} {
  const totalBoards = (db.prepare('SELECT COUNT(*) as count FROM boards').get() as any).count;
  const totalPosts = (db.prepare('SELECT COUNT(*) as count FROM posts').get() as any).count;
  const postsToday = (db.prepare(`
    SELECT COUNT(*) as count FROM posts 
    WHERE DATE(imported_at) = DATE('now')
  `).get() as any).count;
  
  return { totalBoards, totalPosts, postsToday };
}

export default db;
