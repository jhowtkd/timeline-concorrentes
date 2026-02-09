'use client';

import { Eye, Search, Bell, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateBoardDialog } from './CreateBoardDialog';

interface HeaderV2Props {
  onCreateBoard: (name: string) => void;
  onSearch?: (query: string) => void;
}

export function HeaderV2({ onCreateBoard, onSearch }: HeaderV2Props) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
              Thunder Eyes
            </h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
              Inteligência Competitiva
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Buscar concorrentes, posts, hashtags..."
              className="pl-10 bg-slate-900/50 border-slate-800 text-slate-300 placeholder:text-slate-600 focus:border-slate-700 focus:ring-slate-700/20"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            <Settings className="w-5 h-5" />
          </Button>

          <div className="h-6 w-px bg-slate-800 mx-1" />

          <CreateBoardDialog onCreate={onCreateBoard} />
        </div>
      </div>
    </header>
  );
}
