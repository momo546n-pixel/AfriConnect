// src/components/layout/Navbar.tsx
'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useState } from 'react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } finally {
      logout();
      router.push('/login');
      toast.success('Déconnexion réussie');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const navLinks = [
    { href: '/feed',     label: 'Accueil',    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { href: '/connections', label: 'Réseau',  icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
    { href: '/messages',  label: 'Messages',  icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    )},
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/feed" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-lg">
              🌍
            </div>
            <span className="text-emerald-700 font-bold text-lg hidden sm:block">
              AfriConnect
            </span>
          </Link>

          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="flex-1 max-w-sm mx-4 hidden md:block">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher des professionnels..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-emerald-300 transition-all"
              />
            </div>
          </form>

          {/* Navigation centrale */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                  pathname === href
                    ? 'text-emerald-600 bg-emerald-50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {icon}
                {label}
              </Link>
            ))}
          </div>

          {/* Profil + menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
              )}
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-semibold text-gray-900 text-sm">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-gray-400 text-xs">@{user?.username}</p>
                </div>
                <Link
                  href={`/profile/${user?.username}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mon profil
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                    Administration
                  </Link>
                )}
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Se déconnecter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}