// src/components/profile/EditProfileModal.tsx
'use client';
import { useState } from 'react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

interface Props {
  profile: any;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditProfileModal({ profile, onClose, onUpdated }: Props) {
  const { updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'info' | 'skills' | 'experience' | 'education'>('info');

  const [form, setForm] = useState({
    firstName: profile?.firstName || '',
    lastName:  profile?.lastName  || '',
    bio:       profile?.bio       || '',
    location:  profile?.location  || '',
    website:   profile?.website   || '',
  });

  const [skills, setSkills]       = useState<string[]>(profile?.skills?.map((s: any) => s.name) || []);
  const [newSkill, setNewSkill]   = useState('');
  const [experience, setExperience] = useState({
    title: '', company: '', location: '', startDate: '', current: false, description: '',
  });
  const [education, setEducation] = useState({
    school: '', degree: '', field: '', startDate: '', current: false,
  });

  const saveInfo = async () => {
    setLoading(true);
    try {
      const { data } = await api.patch('/users/profile/update', form);
      updateUser(data.user);
      toast.success('Profil mis à jour !');
      onUpdated();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const saveSkills = async () => {
    setLoading(true);
    try {
      await api.put('/users/profile/skills', { skills });
      toast.success('Compétences mises à jour !');
      onUpdated();
    } catch {
      toast.error('Erreur');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim()) && skills.length < 20) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const saveExperience = async () => {
    if (!experience.title || !experience.company || !experience.startDate) {
      toast.error('Titre, entreprise et date de début sont requis');
      return;
    }
    setLoading(true);
    try {
      await api.post('/users/profile/experience', experience);
      toast.success('Expérience ajoutée !');
      setExperience({ title: '', company: '', location: '', startDate: '', current: false, description: '' });
      onUpdated();
    } catch {
      toast.error('Erreur');
    } finally {
      setLoading(false);
    }
  };

  const saveEducation = async () => {
    if (!education.school || !education.degree || !education.startDate) {
      toast.error('École, diplôme et date sont requis');
      return;
    }
    setLoading(true);
    try {
      await api.post('/users/profile/education', education);
      toast.success('Formation ajoutée !');
      setEducation({ school: '', degree: '', field: '', startDate: '', current: false });
      onUpdated();
    } catch {
      toast.error('Erreur');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'info',       label: '👤 Infos' },
    { id: 'skills',     label: '⚡ Compétences' },
    { id: 'experience', label: '💼 Expérience' },
    { id: 'education',  label: '🎓 Formation' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">Modifier le profil</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`pb-3 pt-3 px-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Contenu */}
        <div className="overflow-y-auto flex-1 p-5">

          {/* ─── Infos générales ─── */}
          {tab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'firstName', label: 'Prénom' },
                  { key: 'lastName',  label: 'Nom' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                    <input
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  placeholder="Parlez de vous en quelques mots..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                />
              </div>

              {[
                { key: 'location', label: '📍 Localisation', placeholder: 'Dakar, Sénégal' },
                { key: 'website',  label: '🔗 Site web',     placeholder: 'https://monsite.com' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              ))}

              <button
                onClick={saveInfo}
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sauvegarde...' : 'Sauvegarder les infos'}
              </button>
            </div>
          )}

          {/* ─── Compétences ─── */}
          {tab === 'skills' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Ex: React, Python, Marketing..."
                  className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  onClick={addSkill}
                  className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
                >
                  + Ajouter
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span key={skill} className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                    {skill}
                    <button
                      onClick={() => setSkills(skills.filter(s => s !== skill))}
                      className="text-emerald-400 hover:text-red-500 ml-1 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {skills.length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">Aucune compétence ajoutée</p>
              )}

              <button
                onClick={saveSkills}
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Sauvegarde...' : 'Sauvegarder les compétences'}
              </button>
            </div>
          )}

          {/* ─── Expérience ─── */}
          {tab === 'experience' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Ajouter une nouvelle expérience professionnelle</p>
              {[
                { key: 'title',    label: 'Poste',      placeholder: 'Développeur Fullstack' },
                { key: 'company',  label: 'Entreprise', placeholder: 'Orange Sénégal' },
                { key: 'location', label: 'Lieu',       placeholder: 'Dakar, Sénégal' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                  <input
                    value={experience[key as keyof typeof experience] as string}
                    onChange={e => setExperience({ ...experience, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date de début</label>
                <input
                  type="date"
                  value={experience.startDate}
                  onChange={e => setExperience({ ...experience, startDate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={experience.current}
                  onChange={e => setExperience({ ...experience, current: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span className="text-sm text-gray-700">Poste actuel</span>
              </label>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  value={experience.description}
                  onChange={e => setExperience({ ...experience, description: e.target.value })}
                  rows={3}
                  placeholder="Décrivez vos responsabilités..."
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                />
              </div>

              <button
                onClick={saveExperience}
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Ajout...' : '+ Ajouter cette expérience'}
              </button>
            </div>
          )}

          {/* ─── Formation ─── */}
          {tab === 'education' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Ajouter une formation ou diplôme</p>
              {[
                { key: 'school', label: 'École / Université', placeholder: 'Université Cheikh Anta Diop' },
                { key: 'degree', label: 'Diplôme',            placeholder: 'Licence Informatique' },
                { key: 'field',  label: 'Domaine',            placeholder: 'Génie Logiciel' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
                  <input
                    value={education[key as keyof typeof education] as string}
                    onChange={e => setEducation({ ...education, [key]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Année de début</label>
                <input
                  type="date"
                  value={education.startDate}
                  onChange={e => setEducation({ ...education, startDate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={education.current}
                  onChange={e => setEducation({ ...education, current: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span className="text-sm text-gray-700">En cours</span>
              </label>

              <button
                onClick={saveEducation}
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Ajout...' : '+ Ajouter cette formation'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}