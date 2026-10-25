'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '',
    email: '', username: '', password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('Bienvenue sur AfriConnect 🌍');
      router.push('/feed');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ─── Panneau gauche ─── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-900 via-emerald-700 to-teal-600 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center text-2xl">🌍</div>
          <span className="text-white text-2xl font-bold">AfriConnect</span>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-5xl font-bold text-white leading-tight">
            Rejoins la<br />
            <span className="text-teal-300">communauté</span><br />
            africaine
          </h1>
          <p className="text-emerald-200 text-lg leading-relaxed max-w-sm">
            Crée ton profil, partage tes compétences et connecte-toi avec des milliers de professionnels.
          </p>
          <div className="space-y-3">
            {[
              '✓ Profil professionnel gratuit',
              '✓ Messagerie temps réel',
              '✓ Réseau de connexions',
              '✓ Fil d\'actualité personnalisé',
            ].map(item => (
              <div key={item} className="flex items-center gap-2 text-emerald-200">
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-l-4 border-teal-400 pl-4">
          <p className="text-emerald-200 italic text-sm">
            "Seul on va vite, ensemble on va loin." — Proverbe africain
          </p>
        </div>
      </div>

      {/* ─── Panneau droit ─── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="text-2xl">🌍</span>
            <span className="text-emerald-700 text-xl font-bold">AfriConnect</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Créer un compte</h2>
            <p className="text-gray-500 mt-2">Rejoins le réseau professionnel africain</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'firstName', label: 'Prénom', placeholder: 'Amadou', type: 'text' },
                { key: 'lastName',  label: 'Nom',    placeholder: 'Niang',   type: 'text' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                  <input
                    type={type}
                    required
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder={placeholder}
                  />
                </div>
              ))}
            </div>

            {[
              { key: 'email',    label: 'Adresse email',      type: 'email',    placeholder: 'votre@email.com' },
              { key: 'username', label: "Nom d'utilisateur",  type: 'text',     placeholder: 'amadou_niang' },
              { key: 'password', label: 'Mot de passe',       type: 'password', placeholder: 'Minimum 8 caractères' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                <input
                  type={type}
                  required
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder={placeholder}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Création du compte...
                </>
              ) : 'Créer mon compte gratuitement'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-emerald-600 font-semibold hover:underline">
              Se connecter
            </Link>
          </p>

          <p className="text-center text-gray-400 text-xs mt-6">
            © 2024 AfriConnect · Dakar, Sénégal 🇸🇳
          </p>
        </div>
      </div>
    </div>
  );
}