// src/app/(main)/admin/page.tsx
'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user?.role !== 'ADMIN') router.push('/feed');
  }, [user]);

  const { data: statsData } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
  });

  const { data: usersData } = useQuery({
    queryKey: ['adminUsers', search],
    queryFn: async () => (await api.get(`/admin/users?search=${search}`)).data,
  });

  const toggleStatus = async (userId: string) => {
    try {
      const { data } = await api.patch(`/admin/users/${userId}/toggle`);
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    } catch { toast.error('Erreur'); }
  };

  const stats = statsData?.stats;
  const users = usersData?.users || [];

  const statCards = [
    { label: 'Utilisateurs',  value: stats?.users       || 0, icon: '👥', color: 'bg-blue-50   text-blue-700'   },
    { label: 'Publications',  value: stats?.posts        || 0, icon: '📝', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Connexions',    value: stats?.connections  || 0, icon: '🤝', color: 'bg-purple-50  text-purple-700'  },
    { label: 'Messages',      value: stats?.messages     || 0, icon: '💬', color: 'bg-amber-50   text-amber-700'   },
  ];

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
        <p className="text-gray-500 text-sm mt-1">Gestion de la plateforme AfriConnect</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${color}`}>
              {icon}
            </div>
            <div className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Gestion des utilisateurs */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800">Utilisateurs ({usersData?.total || 0})</h2>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="px-3 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 w-48"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="pb-3 font-medium">Utilisateur</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Rôle</th>
                <th className="pb-3 font-medium">Posts</th>
                <th className="pb-3 font-medium">Inscription</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-gray-400">@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-gray-600">{u.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                      u.role === 'MODERATOR' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-gray-600">{u._count.posts}</td>
                  <td className="py-3 text-gray-400 text-xs">
                    {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true, locale: fr })}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleStatus(u.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        u.isActive
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      {u.isActive ? 'Désactiver' : 'Réactiver'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}