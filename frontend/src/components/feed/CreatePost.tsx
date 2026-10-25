// src/components/feed/CreatePost.tsx
'use client';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function CreatePost({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState('PUBLIC');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      await api.post('/posts', { content, visibility });
      setContent('');
      onCreated();
      toast.success('Publication créée !');
    } catch {
      toast.error('Erreur lors de la publication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex gap-3">
        <div className="w-11 h-11 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center text-emerald-700 font-bold">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <form onSubmit={handleSubmit} className="flex-1 space-y-3">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={`Quoi de neuf ${user?.firstName} ? Partagez une actualité...`}
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none text-sm"
          />
          <div className="flex items-center justify-between">
            <select
              value={visibility}
              onChange={e => setVisibility(e.target.value)}
              className="text-xs text-gray-500 bg-gray-100 border-0 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <option value="PUBLIC">🌍 Public</option>
              <option value="CONNECTIONS">🤝 Connexions</option>
            </select>
            <button
              type="submit"
              disabled={loading || !content.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
            >
              {loading ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}