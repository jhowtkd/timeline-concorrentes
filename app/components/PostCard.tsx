'use client';

import { Post } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const formattedDate = post.publishedAt 
    ? formatDistanceToNow(new Date(post.publishedAt), { 
        addSuffix: true, 
        locale: ptBR 
      })
    : 'Data desconhecida';

  const truncateContent = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        {/* Media Preview */}
        {post.mediaType && (
          <div className="mb-3 rounded-md bg-slate-100 dark:bg-slate-800 h-32 flex items-center justify-center overflow-hidden">
            {post.mediaUrls && post.mediaUrls.length > 0 ? (
              <img 
                src={post.mediaUrls[0]} 
                alt="Post media"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-slate-400 text-sm">
                {post.mediaType === 'video' && '🎥 Vídeo'}
                {post.mediaType === 'carousel' && '🖼️ Carrossel'}
                {post.mediaType === 'image' && '📷 Imagem'}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 line-clamp-4">
          {truncateContent(post.content)}
        </p>

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.hashtags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {post.hashtags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{post.hashtags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
          {post.likes > 0 && (
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {post.likes.toLocaleString()}
            </span>
          )}
          {post.comments > 0 && (
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {post.comments.toLocaleString()}
            </span>
          )}
          {post.shares > 0 && (
            <span className="flex items-center gap-1">
              <Share2 className="w-3 h-3" />
              {post.shares.toLocaleString()}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400">{formattedDate}</span>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors"
          >
            Ver original
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
