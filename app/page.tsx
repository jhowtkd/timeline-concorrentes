'use client';

import { useState, useEffect } from 'react';
import { Board } from '@/lib/types';
import { HeaderV2 } from './components/HeaderV2';
import { AnalyticsBar } from './components/AnalyticsBar';
import { BoardHeader } from './components/BoardHeader';
import { ColumnV2 } from './components/ColumnV2';
import { CreateBoardDialog } from './components/CreateBoardDialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, 
  Plus, 
  TrendingUp, 
  Target, 
  Zap,
  ChevronRight,
  BarChart3
} from 'lucide-react';

export default function Dashboard() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [stats, setStats] = useState({ totalBoards: 0, totalPosts: 0, postsToday: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBoards();
    fetchStats();
  }, []);

  const fetchBoards = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/boards');
      if (res.ok) {
        const data = await res.json();
        setBoards(data);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateBoard = async (name: string) => {
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      
      if (res.ok) {
        const newBoard = await res.json();
        setBoards([newBoard, ...boards]);
        setSelectedBoard(newBoard);
        fetchStats();
      }
    } catch (error) {
      console.error('Error creating board:', error);
    }
  };

  const handleDeleteBoard = async (boardId: string) => {
    if (!confirm('Tem certeza que deseja excluir este concorrente?')) return;
    
    try {
      const res = await fetch(`/api/boards?id=${boardId}`, { method: 'DELETE' });
      if (res.ok) {
        setBoards(boards.filter(b => b.id !== boardId));
        if (selectedBoard?.id === boardId) setSelectedBoard(null);
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };

  const handleRefresh = async () => {
    if (!selectedBoard) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/boards?slug=${selectedBoard.slug}`);
      if (res.ok) {
        const updatedBoard = await res.json();
        setSelectedBoard(updatedBoard);
        setBoards(boards.map(b => b.id === updatedBoard.id ? updatedBoard : b));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Board List View
  if (!selectedBoard) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200">
        <HeaderV2 onCreateBoard={handleCreateBoard} />
        
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Analytics */}
          <AnalyticsBar 
            totalBoards={stats.totalBoards}
            totalPosts={stats.totalPosts}
            postsToday={stats.postsToday}
          />

          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-100">Concorrentes Monitorados</h2>
              <p className="text-sm text-slate-500 mt-1">
                Acompanhe a atividade dos principais players do mercado
              </p>
            </div>
            <CreateBoardDialog onCreate={handleCreateBoard} />
          </div>

          {/* Boards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-40 bg-slate-900/50" />
              ))}
            </div>
          ) : boards.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-200 mb-2">
                Nenhum concorrente adicionado
              </h3>
              <p className="text-slate-500 max-w-md mx-auto mb-8">
                Adicione seus concorrentes para começar a monitorar suas atividades 
                nas redes sociais em tempo real.
              </p>
              <CreateBoardDialog onCreate={handleCreateBoard} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map((board) => {
                const totalPosts = board.columns?.reduce((acc, col) => acc + (col.posts?.length || 0), 0) || 0;
                const lastUpdate = board.columns?.[0]?.posts?.[0]?.importedAt;
                
                return (
                  <Card
                    key={board.id}
                    className="group cursor-pointer bg-slate-900/50 border-slate-800/50 hover:border-slate-700/50 transition-all duration-200 overflow-hidden"
                    onClick={() => setSelectedBoard(board)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center text-lg font-bold text-slate-300">
                            {board.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                              {board.name}
                            </h3>
                            <p className="text-xs text-slate-500">
                              {board.columns?.length || 0} fontes • {totalPosts} posts
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex -space-x-2">
                          {board.columns?.slice(0, 4).map((col, idx) => (
                            <div 
                              key={idx}
                              className="w-6 h-6 rounded-full bg-slate-800 border border-slate-900 flex items-center justify-center text-[10px]"
                            >
                              {col.sourceType?.[0]?.toUpperCase() || '?'}
                            </div>
                          ))}
                        </div>
                        <span>
                          {lastUpdate 
                            ? `Atualizado ${new Date(lastUpdate).toLocaleDateString('pt-BR')}`
                            : 'Aguardando dados'
                          }
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    );
  }

  // Board Detail View
  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-200">
      <HeaderV2 onCreateBoard={handleCreateBoard} />
      
      <BoardHeader
        board={selectedBoard}
        onBack={() => setSelectedBoard(null)}
        onRefresh={handleRefresh}
        onDelete={() => handleDeleteBoard(selectedBoard.id)}
        isLoading={isLoading}
      />

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex h-full">
            {selectedBoard.columns?.map((column) => (
              <ColumnV2 key={column.id} column={column} isLoading={isLoading} />
            ))}
            
            {(!selectedBoard.columns || selectedBoard.columns.length === 0) && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-900/50 flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-400">Nenhuma coluna configurada</p>
                  <Button onClick={handleRefresh} variant="outline" className="mt-4">
                    Recarregar
                  </Button>
                </div>
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}
