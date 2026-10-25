// src/app/(main)/messages/page.tsx
'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Liste des conversations
  const { data: convsData } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => (await api.get('/messages')).data,
    refetchInterval: 5000, // Rafraîchit toutes les 5s
  });

  // Messages de la conversation sélectionnée
  const { data: messagesData, refetch: refetchMessages } = useQuery({
    queryKey: ['conversation', selectedUser?.id],
    enabled: !!selectedUser,
    queryFn: async () => (await api.get(`/messages/${selectedUser.id}`)).data,
    refetchInterval: 3000,
  });

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    setSending(true);
    try {
      await api.post(`/messages/${selectedUser.id}`, { content: newMessage });
      setNewMessage('');
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch {
      toast.error('Erreur envoi message');
    } finally {
      setSending(false);
    }
  };

  const conversations = convsData?.conversations || [];
  const messages = messagesData?.messages || [];

  return (
    <div className="h-[calc(100vh-5rem)] flex bg-white rounded-2xl border border-gray-100 overflow-hidden">

      {/* ─── Liste des conversations ─── */}
      <div className="w-80 border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">Messages</h2>
        </div>

        <div className="overflow-y-auto flex-1">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">
              <div className="text-4xl mb-3">💬</div>
              <p>Aucune conversation</p>
              <p className="text-xs mt-1">Connectez-vous avec des professionnels pour commencer</p>
            </div>
          ) : (
            conversations.map((conv: any) => (
              <button
                key={conv.user.id}
                onClick={() => setSelectedUser(conv.user)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${
                  selectedUser?.id === conv.user.id ? 'bg-emerald-50' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  {conv.user.avatar ? (
                    <img src={conv.user.avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                      {conv.user.firstName[0]}{conv.user.lastName[0]}
                    </div>
                  )}
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {conv.user.firstName} {conv.user.lastName}
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { locale: fr })}
                    </span>
                  </div>
                  <p className={`text-xs truncate mt-0.5 ${
                    conv.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-400'
                  }`}>
                    {conv.lastMessage.senderId === user?.id ? 'Vous : ' : ''}
                    {conv.lastMessage.content}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ─── Zone de conversation ─── */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            {selectedUser.avatar ? (
              <img src={selectedUser.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                {selectedUser.firstName[0]}{selectedUser.lastName[0]}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p className="text-xs text-gray-400">@{selectedUser.username}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg: any) => {
              const isMe = msg.sender.id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: fr })}
                      {isMe && (
                        <span className="ml-1">{msg.read ? '✓✓' : '✓'}</span>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 flex gap-3">
            <input
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder={`Message à ${selectedUser.firstName}...`}
              className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              {sending ? '...' : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div>
            <div className="text-6xl mb-4">💬</div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Vos messages</h3>
            <p className="text-gray-400 text-sm max-w-xs">
              Sélectionnez une conversation ou envoyez un message depuis un profil
            </p>
          </div>
        </div>
      )}
    </div>
  );
}