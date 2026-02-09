'use client';

import { Column as ColumnType } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PostCard } from './PostCard';
import { Instagram, Linkedin, Youtube, Rss, Megaphone } from 'lucide-react';

interface ColumnProps {
  column: ColumnType;
}

const sourceIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  tiktok: <span className="text-xs font-bold">TT</span>,
  rss: <Rss className="w-4 h-4" />,
  'meta-ads': <Megaphone className="w-4 h-4" />,
};

const sourceColors: Record<string, string> = {
  instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
  linkedin: 'bg-blue-600',
  youtube: 'bg-red-600',
  tiktok: 'bg-black',
  rss: 'bg-orange-500',
  'meta-ads': 'bg-blue-800',
};

export function Column({ column }: ColumnProps) {
  return (
    <div className="flex flex-col w-80 min-w-[320px] max-w-[320px] h-full border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="p-3 flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${sourceColors[column.sourceType] || 'bg-slate-500'}`}>
          {sourceIcons[column.sourceType] || <Rss className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{column.displayName}</h3>
          <p className="text-xs text-slate-500">
            {column.posts.length} posts
          </p>
        </div>
      </div>

      <Separator />

      {/* Posts */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {column.posts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <p>Nenhum post ainda</p>
              <p className="text-xs mt-1">Aguardando atualização...</p>
            </div>
          ) : (
            column.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
