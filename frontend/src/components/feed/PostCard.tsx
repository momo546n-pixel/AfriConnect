// src/components/feed/PostCard.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import type { Post, Comment } from '@/types';
import toast from 'react-hot-toast';

export default function PostCard({ post, onUpdate }: { post: Post; onUpdate: () => void }) {
  const { user } = useAuthStore();
  const [liked, setLiked]         = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments]   = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComment, setLoadingComment] = useState(false);

  const handleLike = async () => {
    try {
      setLiked(!liked);
      setLikeCount(prev => liked ? prev - 1 : prev + 1);
      await api.post(`/posts/${post.id}/like`);
    } catch {
      setLiked(liked);
      setLikeCount(post._count.likes);
    }
  };

  const loadComments = async () => {
    if (!showComments) {
      const { data } = await api.get(`/posts/${post.id}/comments`);
      setComments(data.comments);
    }
    setShowComments(!showComments);
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoadingComment(true);
    try {
      const { data } = await api.post(`/posts/${post.id}/comments`, { content: newComment });
      setComments(prev => [...prev, data.comment]);
      setNewComment('');
      onUpdate();
    } catch {
      toast.error('Erreur lors du commentaire');
    } finally {
      setLoadingComment(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <Link href={`/profile/${post.author.username}`} className="flex items-center gap-3">
          {post.author.avatar ? (
            <img src={post.author.avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              {post.author.firstName[0]}{post.author.lastName[0]}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
              {post.author.firstName} {post.author.lastName}
            </p>
            <p className="text-xs text-gray-400">
              @{post.author.username} ·{' '}
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}
            </p>
          </div>
        </Link>
      </div>

      {/* Contenu */}
      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>

      {/* Images */}
      {post.images.length > 0 && (
        <div className={`grid gap-2 ${post.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {post.images.map((img, i) => (
            <img key={i} src={img} alt="" className="rounded-xl object-cover w-full max-h-80" />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-50">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
          }`}
        >
          <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {likeCount}
        </button>

        <button
          onClick={loadComments}
          className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-emerald-500 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {post._count.comments}
        </button>
      </div>

      {/* Commentaires */}
      {showComments && (
        <div className="space-y-3 pt-2">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-600 text-xs font-bold">
                {comment.author.firstName[0]}{comment.author.lastName[0]}
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2 flex-1">
                <p className="text-xs font-semibold text-gray-700">
                  {comment.author.firstName} {comment.author.lastName}
                </p>
                <p className="text-sm text-gray-600">{comment.content}</p>
              </div>
            </div>
          ))}

          <form onSubmit={submitComment} className="flex gap-2 mt-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center text-emerald-700 text-xs font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <input
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Écrire un commentaire..."
              className="flex-1 px-3 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              type="submit"
              disabled={loadingComment || !newComment.trim()}
              className="bg-emerald-600 text-white px-3 py-2 rounded-xl text-sm disabled:opacity-50 hover:bg-emerald-700 transition-colors"
            >
              →
            </button>
          </form>
        </div>
      )}
    </div>
  );
}