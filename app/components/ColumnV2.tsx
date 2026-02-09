'use client';

import { Column as ColumnType } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PostCardV2 } from './PostCardV2';
import { Instagram, Linkedin, Youtube, Rss, Megaphone, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ColumnV2Props {
  column: ColumnType;
  isLoading?: boolean;
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
  instagram: 'from-pink-500 to-purple-600',
  linkedin: 'from-blue-600 to-blue-700',
  youtube: 'from-red-600 to-red-700',
  tiktok: 'from-gray-800 to-black',
  rss: 'from-orange-500 to-amber-600',
  'meta-ads': 'from-blue-800 to-indigo-900',
};

const sourceNames: Record<string, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  rss: 'Blog/RSS',
  'meta-ads': 'Meta Ads',
};

export function ColumnV2({ column, isLoading }: ColumnV2Props) {
  return (
    <div className="flex flex-col w-[340px] min-w-[340px] h-full bg-slate-950 border-r border-slate-800/50">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sourceColors[column.sourceType]} flex items-center justify-center text-white shadow-lg`}>
              {sourceIcons[column.sourceType]}
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 text-sm">
                {sourceNames[column.sourceType] || column.displayName}
              </h3>
              <p className="text-xs text-slate-500">
                {column.posts.length} posts
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-slate-600 hover:text-slate-400">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Posts */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {isLoading ? (
            // Loading skeletons
            <>
              <Skeleton className="h-48 bg-slate-900/50" />
              <Skeleton className="h-48 bg-slate-900/50" />
              <Skeleton className="h-48 bg-slate-900/50" />
            </>
          ) : column.posts.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-slate-900/50 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <p className="text-slate-400 text-sm font-medium">Nenhum post ainda</p>
              <p className="text-slate-600 text-xs mt-1">
                Aguardando próxima atualização automática
              </p>
            </div>
          ) : (
            column.posts.map((post) => (
              <PostCardV2 key={post.id} post={post} />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800/50 bg-slate-950/50">
        <p className="text-[10px] text-slate-600 text-center">
          Atualizado diariamente às 06:00
        </p>
      </div>
    </div>
  );
}
