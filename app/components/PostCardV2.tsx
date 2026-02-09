'use client';

import { Post } from '@/lib/types';
import { Heart, MessageCircle, Share2, ExternalLink, Clock, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PostCardV2Props {
  post: Post;
  variant?: 'compact' | 'full';
}

export function PostCardV2({ post, variant = 'compact' }: PostCardV2Props) {
  const formattedDate = post.publishedAt 
    ? formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true, locale: ptBR })
    : 'Data desconhecida';

  // Calcular taxa de engajamento (likes + comments / 1000 seguidores estimados)
  const engagement = post.likes + post.comments;
  const engagementRate = ((engagement / 10000) * 100).toFixed(1); // Assumindo 10k base

  const truncateContent = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <TooltipProvider>
      <div className="group relative bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800/50 hover:border-slate-700 transition-all duration-200 overflow-hidden">
        {/* Media Preview */}
        {post.mediaType && (
          <div className="relative h-36 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
            {post.mediaUrls && post.mediaUrls.length > 0 ? (
              <img 
                src={post.mediaUrls[0]} 
                alt="Post media"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  {post.mediaType === 'video' && (
                    <>
                      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-2">
                        <TrendingUp className="w-6 h-6 text-red-400" />
                      </div>
                      <span className="text-xs text-slate-500">Vídeo</span>
                    </>
                  )}
                  {post.mediaType === 'carousel' && (
                    <>
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-400 font-bold">1/5</span>
                      </div>
                      <span className="text-xs text-slate-500">Carrossel</span>
                    </>
                  )}
                  {post.mediaType === 'image' && (
                    <>
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                        <span className="text-emerald-400 font-bold">IMG</span>
                      </div>
                      <span className="text-xs text-slate-500">Imagem</span>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            
            {/* Engagement badge */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-slate-950/80 backdrop-blur text-xs font-medium text-slate-300 border border-slate-800">
                  {engagementRate}% engaj.
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Taxa de engajamento estimada</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
            {truncateContent(post.content)}
          </p>

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.hashtags.slice(0, 2).map((tag, idx) => (
                <Badge 
                  key={idx} 
                  variant="secondary" 
                  className="text-[10px] bg-slate-800/50 text-slate-400 border-0 hover:bg-slate-800"
                >
                  #{tag}
                </Badge>
              ))}
              {post.hashtags.length > 2 && (
                <Badge 
                  variant="outline" 
                  className="text-[10px] border-slate-700 text-slate-500"
                >
                  +{post.hashtags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/50">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {post.likes > 0 && (
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 hover:text-pink-400 transition-colors">
                    <Heart className="w-3.5 h-3.5" />
                    {post.likes > 1000 ? `${(post.likes / 1000).toFixed(1)}k` : post.likes}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Curtidas</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {post.comments > 0 && (
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {post.comments}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Comentários</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {post.shares > 0 && (
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 hover:text-green-400 transition-colors">
                    <Share2 className="w-3.5 h-3.5" />
                    {post.shares}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Compartilhamentos</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger className="text-xs text-slate-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formattedDate}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{post.publishedAt ? new Date(post.publishedAt).toLocaleString('pt-BR') : 'Data desconhecida'}</p>
                </TooltipContent>
              </Tooltip>
              
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Hover effect glow */}
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5 group-hover:ring-white/10 transition-all pointer-events-none" />
      </div>
    </TooltipProvider>
  );
}
