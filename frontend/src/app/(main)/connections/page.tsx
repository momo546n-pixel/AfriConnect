// src/app/(main)/connections/page.tsx
'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function ConnectionsPage() {
  const queryClient = useQueryClient();

  const { data: connections } = useQuery({
    queryKey: ['connections'],
    queryFn: async () => (await api.get('/connections')).data,
  });

  const { data: pending } = useQuery({
    queryKey: ['pending'],
    queryFn: async () => (await api.get('/connections/pending')).data,
  });

  const { data: suggestions } = useQuery({
    queryKey: ['suggestions'],
    queryFn: async () => (await api.get('/recommendations/users')).data,
  });

  const respond = async (connectionId: string, action: string) => {
    try {
      await api.patch(`/connections/${connectionId}/respond`, { action });
      toast.success(action === 'accept' ? 'Connexion acceptée !' : 'Demande refusée');
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['pending'] });
    } catch {
      toast.error('Erreur');
    }
  };

  const connect = async (userId: string) => {
    try {
      await api.post(`/connections/request/${userId}`);
      toast.success('Demande envoyée !');
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Demandes reçues */}
      {pending?.requests?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-4">
            Demandes reçues
            <span className="ml-2 bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full">
              {pending.requests.length}
            </span>
          </h2>
          <div className="space-y-3">
            {pending.requests.map((req: any) => (
              <div key={req.connectionId} className="flex items-center justify-between">
                <Link href={`/profile/${req.user.username}`} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    {req.user.firstName[0]}{req.user.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {req.user.firstName} {req.user.lastName}
                    </p>
                    <p className="text-xs text-gray-400">@{req.user.username}</p>
                  </div>
                </Link>
                <div className="flex gap-2">
                  <button
                    onClick={() => respond(req.connectionId, 'accept')}
                    className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => respond(req.connectionId, 'reject')}
                    className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions?.users?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-4">Suggestions pour vous</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestions.users.slice(0, 6).map((u: any) => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <Link href={`/profile/${u.username}`} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold">
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{u.location || `@${u.username}`}</p>
                  </div>
                </Link>
                <button
                  onClick={() => connect(u.id)}
                  className="text-emerald-600 text-xs font-semibold hover:text-emerald-700"
                >
                  + Connecter
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mes connexions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-800 mb-4">
          Mes connexions ({connections?.total || 0})
        </h2>
        {connections?.connections?.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">
            Vous n'avez pas encore de connexions
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {connections?.connections?.map((c: any) => (
              <Link
                key={c.connectionId}
                href={`/profile/${c.user.username}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  {c.user.firstName[0]}{c.user.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {c.user.firstName} {c.user.lastName}
                  </p>
                  <p className="text-xs text-gray-400">{c.user.location || `@${c.user.username}`}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}