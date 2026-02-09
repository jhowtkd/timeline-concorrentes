'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Target } from 'lucide-react';

interface CreateBoardDialogProps {
  onCreate: (name: string) => void;
}

export function CreateBoardDialog({ onCreate }: CreateBoardDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      await onCreate(name.trim());
      setName('');
      setOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4" />
          Adicionar Concorrente
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-200">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-slate-100">Adicionar Concorrente</DialogTitle>
                <DialogDescription className="text-slate-500">
                  Monitore as atividades de um novo concorrente
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-slate-400">
                Nome da empresa
              </Label>
              <Input
                id="name"
                placeholder="Ex: Cenbrap, Sanar, FGMed..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-blue-500/20"
                autoFocus
              />
            </div>
            
            <div className="text-xs text-slate-500 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
              <p className="font-medium text-slate-400 mb-1">O que será monitorado:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>Instagram (posts e engajamento)</li>
                <li>LinkedIn (atividades corporativas)</li>
                <li>YouTube (vídeos publicados)</li>
                <li>TikTok (conteúdo viral)</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!name.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {isLoading ? 'Criando...' : 'Criar Board'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
