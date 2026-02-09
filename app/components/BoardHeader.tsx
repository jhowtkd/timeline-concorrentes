'use client';

import { Board } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, RefreshCw, Trash2, ExternalLink } from 'lucide-react';

interface BoardHeaderProps {
  board: Board;
  onBack?: () => void;
  onRefresh?: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
}

export function BoardHeader({ 
  board, 
  onBack, 
  onRefresh, 
  onDelete,
  isLoading 
}: BoardHeaderProps) {
  const initials = board.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {onBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        
        <Avatar className="w-12 h-12 border-2 border-slate-800">
          {board.avatarUrl ? (
            <img src={board.avatarUrl} alt={board.name} />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300 font-bold">
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div>
          <h1 className="text-lg font-semibold text-slate-100">{board.name}</h1>
          <p className="text-xs text-slate-500">
            Última atualização: {new Date().toLocaleDateString('pt-BR')} às 06:00
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
            className="border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-slate-100"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onDelete}
          className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
