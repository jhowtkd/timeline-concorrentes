'use client';

import { useState } from 'react';
import { Column as ColumnType } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { PostCard } from './PostCard';
import { Instagram, Linkedin, Youtube, Rss, Megaphone, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  const [isEditing, setIsEditing] = useState(false);
  const [handle, setHandle] = useState(column.handle || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/columns/${column.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: handle.trim() }),
      });
      
      if (response.ok) {
        setIsEditing(false);
        // Refresh page to show updated data
        window.location.reload();
      } else {
        alert('Erro ao salvar. Tente novamente.');
      }
    } catch (error) {
      console.error('Error saving handle:', error);
      alert('Erro ao salvar. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setHandle(column.handle || '');
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col w-80 min-w-[320px] max-w-[320px] h-full border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="p-3 flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${sourceColors[column.sourceType] || 'bg-slate-500'}`}>
          {sourceIcons[column.sourceType] || <Rss className="w-4 h-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{column.displayName}</h3>
          
          {/* Handle editor */}
          {isEditing ? (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-slate-400">@</span>
              <Input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="username"
                className="h-6 text-xs py-0 px-1 min-w-0 flex-1"
                disabled={isSaving}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Check className="w-3 h-3 text-green-500" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="w-3 h-3 text-red-500" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 mt-0.5">
              <p className="text-xs text-slate-500 truncate">
                {column.handle ? `@${column.handle}` : 'Clique para adicionar @'}
              </p>
              <Button
                size="icon"
                variant="ghost"
                className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 className="w-3 h-3 text-slate-400" />
              </Button>
            </div>
          )}
          
          <p className="text-xs text-slate-400 mt-0.5">
            {column.posts.length} posts
          </p>
        </div>
        {!isEditing && (
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0"
            onClick={() => setIsEditing(true)}
            title="Editar @username"
          >
            <Edit2 className="w-3 h-3 text-slate-400" />
          </Button>
        )}
      </div>

      <Separator />

      {/* Posts */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {column.posts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              <p>Nenhum post ainda</p>
              <p className="text-xs mt-1">
                {column.handle 
                  ? 'Aguardando atualização automática...' 
                  : 'Adicione o @username acima para começar'}
              </p>
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
