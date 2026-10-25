// src/app/(main)/profile/[username]/page.tsx
'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import PostCard from '@/components/feed/PostCard';
import toast from 'react-hot-toast';
import { useState } from 'react';
import type { Post } from '@/types';
import EditProfileModal from '@/components/profile/EditProfileModal';


export default function ProfilePage() {
    const queryClient = useQueryClient();
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();
  const isOwnProfile = currentUser?.username === username;
  const [connectionStatus, setConnectionStatus] = useState<string>('NONE');
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: async () => {
      const { data } = await api.get(`/users/${username}`);
      return data.user;
    },
  });

  const { data: postsData, refetch: refetchPosts } = useQuery({
    queryKey: ['userPosts', username],
    queryFn: async () => {
      const { data } = await api.get(`/posts/user/${username}`);
      return data.posts;
    },
  });

  useQuery({
    queryKey: ['connectionStatus', profileData?.id],
    enabled: !!profileData?.id && !isOwnProfile,
    queryFn: async () => {
      const { data } = await api.get(`/connections/status/${profileData.id}`);
      setConnectionStatus(data.status);
      setConnectionId(data.connectionId || null);
      return data;
    },
  });

  const handleConnect = async () => {
    try {
      if (connectionStatus === 'NONE') {
        await api.post(`/connections/request/${profileData.id}`);
        setConnectionStatus('PENDING');
        toast.success('Demande de connexion envoyée !');
      } else if (connectionStatus === 'ACCEPTED' && connectionId) {
        await api.delete(`/connections/${connectionId}`);
        setConnectionStatus('NONE');
        toast.success('Connexion supprimée');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur');
    }
  };

  if (isLoading) return (
    <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
      <div className="bg-white rounded-2xl h-48 border border-gray-100" />
      <div className="bg-white rounded-2xl h-32 border border-gray-100" />
    </div>
  );

  const profile = profileData;
  const posts: Post[] = postsData || [];

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* ─── Carte profil ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Cover */}
        <div className="h-40 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 relative">
          {profile?.coverImage && (
            <img src={profile.coverImage} alt="" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="px-6 pb-6">
          {/* Avatar + bouton */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="" className="w-24 h-24 rounded-full border-4 border-white object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-emerald-100 border-4 border-white flex items-center justify-center text-emerald-700 text-3xl font-bold">
                {profile?.firstName?.[0]}{profile?.lastName?.[0]}
              </div>
            )}

            {!isOwnProfile && (
              <button
                onClick={handleConnect}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  connectionStatus === 'ACCEPTED'
                    ? 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                    : connectionStatus === 'PENDING'
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
                disabled={connectionStatus === 'PENDING'}
              >
                {connectionStatus === 'ACCEPTED' ? '✓ Connecté' :
                 connectionStatus === 'PENDING'  ? 'En attente...' :
                 '+ Se connecter'}
              </button>
            )}

            {isOwnProfile && (
  <>
    <button
      onClick={() => setShowEditModal(true)}
      className="px-5 py-2 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
    >
      ✏️ Modifier le profil
    </button>

    {showEditModal && (
      <EditProfileModal
        profile={profile}
        onClose={() => setShowEditModal(false)}
        onUpdated={() => {
          setShowEditModal(false);
          queryClient.invalidateQueries({ queryKey: ['profile', username] });
        }}
      />
    )}
  </>
)}
          </div>

          {/* Infos */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.firstName} {profile?.lastName}
              </h1>
              {profile?.isVerified && <span className="text-emerald-500">✓</span>}
            </div>
            <p className="text-gray-500">@{profile?.username}</p>
            {profile?.bio && <p className="text-gray-700">{profile.bio}</p>}

            <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-1">
              {profile?.location && (
                <span className="flex items-center gap-1">
                  📍 {profile.location}
                </span>
              )}
              {profile?.website && (
                <a href={profile.website} target="_blank" className="text-emerald-600 hover:underline flex items-center gap-1">
                  🔗 {profile.website}
                </a>
              )}
              <span>📅 Membre depuis {profile?.createdAt && formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true, locale: fr })}</span>
            </div>

            {/* Stats */}
            <div className="flex gap-6 pt-2">
              <div className="text-center">
                <div className="font-bold text-gray-900">{profile?._count?.posts || 0}</div>
                <div className="text-xs text-gray-400">Publications</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">{profile?._count?.sentConnections || 0}</div>
                <div className="text-xs text-gray-400">Connexions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Compétences ─── */}
      {profile?.skills?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-3">Compétences</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill: any) => (
              <span key={skill.id} className="bg-emerald-50 text-emerald-700 text-sm px-3 py-1 rounded-lg font-medium">
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ─── Expériences ─── */}
      {profile?.experiences?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-4">Expériences</h2>
          <div className="space-y-4">
            {profile.experiences.map((exp: any) => (
              <div key={exp.id} className="flex gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-bold flex-shrink-0">
                  {exp.company[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{exp.title}</p>
                  <p className="text-sm text-gray-600">{exp.company}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(exp.startDate).getFullYear()} —{' '}
                    {exp.current ? 'Présent' : exp.endDate ? new Date(exp.endDate).getFullYear() : ''}
                    {exp.location && ` · ${exp.location}`}
                  </p>
                  {exp.description && <p className="text-sm text-gray-600 mt-1">{exp.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Publications ─── */}
      <div className="space-y-4">
        <h2 className="font-bold text-gray-800">Publications</h2>
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
            Aucune publication pour l'instant
          </div>
        ) : (
          posts.map(post => (
            <PostCard key={post.id} post={post} onUpdate={refetchPosts} />
          ))
        )}
      </div>
    </div>
  );
}