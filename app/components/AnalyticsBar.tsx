'use client';

import { TrendingUp, Users, FileText, Activity, Eye } from 'lucide-react';

interface AnalyticsBarProps {
  totalBoards: number;
  totalPosts: number;
  postsToday: number;
}

export function AnalyticsBar({ totalBoards, totalPosts, postsToday }: AnalyticsBarProps) {
  const stats = [
    { 
      label: 'Concorrentes', 
      value: totalBoards, 
      icon: Users, 
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      trend: '+2 este mês'
    },
    { 
      label: 'Posts Coletados', 
      value: totalPosts.toLocaleString(), 
      icon: FileText, 
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      trend: 'Últimos 30 dias'
    },
    { 
      label: 'Posts Hoje', 
      value: postsToday, 
      icon: Activity, 
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      trend: 'Atualizado 6h'
    },
    { 
      label: 'Taxa de Engajamento', 
      value: '4.2%', 
      icon: TrendingUp, 
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      trend: '+0.8% vs ontem'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div 
          key={idx}
          className="relative overflow-hidden rounded-xl bg-slate-900/50 border border-slate-800 p-4 hover:border-slate-700 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-slate-100 mt-1">
                {stat.value}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {stat.trend}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
          
          {/* Decorative gradient */}
          <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full ${stat.bgColor} blur-2xl opacity-50`} />
        </div>
      ))}
    </div>
  );
}
