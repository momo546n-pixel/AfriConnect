// src/app/(main)/feed/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import PostCard from '@/components/feed/PostCard';
import CreatePost from '@/components/feed/CreatePost';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import type { Post } from '@/types';

export default function FeedPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['feed'],
    queryFn: async () => {
      const { data } = await api.get('/posts/feed');
      return data;
    },
  });

  const posts: Post[] = data?.posts || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* ─── Colonne gauche — Profil rapide ─── */}
      <div className="hidden lg:block lg:col-span-3">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden sticky top-24">
          <div className="h-16 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="px-4 pb-4">
            <div className="flex justify-center -mt-8 mb-3">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-16 h-16 rounded-full border-4 border-white object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-emerald-100 border-4 border-white flex items-center justify-center text-emerald-700 text-xl font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              )}
            </div>
            <div className="text-center">
              <Link href={`/profile/${user?.username}`} className="font-bold text-gray-900 hover:text-emerald-600">
                {user?.firstName} {user?.lastName}
              </Link>
              <p className="text-xs text-gray-400">@{user?.username}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <Link href="/connections" className="flex items-center justify-between text-sm text-gray-600 hover:text-emerald-600 py-1">
                <span>Connexions</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/messages" className="flex items-center justify-between text-sm text-gray-600 hover:text-emerald-600 py-1">
                <span>Messages</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Colonne centrale — Feed ─── */}
      <div className="lg:col-span-6 space-y-4">
        <CreatePost onCreated={refetch} />

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-gray-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="text-5xl mb-4">🌍</div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Votre fil est vide</h3>
            <p className="text-gray-500 text-sm mb-4">
              Connectez-vous avec des professionnels pour voir leurs publications
            </p>
            <Link
              href="/connections"
              className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              Trouver des connexions
            </Link>
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} onUpdate={refetch} />
          ))
        )}
      </div>

      {/* ─── Colonne droite — Suggestions ─── */}
      <div className="hidden lg:block lg:col-span-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24">
          <h3 className="font-bold text-gray-800 text-sm mb-4">🔥 Suggestions</h3>
          <p className="text-xs text-gray-400 text-center py-4">
            Les suggestions arrivent à l'étape 9 !
          </p>
        </div>
      </div>

    </div>
  );
}