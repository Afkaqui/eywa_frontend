"use client";

import { useState, useEffect, useCallback } from 'react';
import { Users, Search, Crown, Loader2 } from 'lucide-react';
import { ROLE_LABELS, PLAN_COLORS, API_ROUTES } from '@/lib/constants/roles';
import type { Profile, UserPlan } from '@/lib/types/database';

export function AdminDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'premium'>('all');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(API_ROUTES.ADMIN_USERS);
      const data = await res.json();
      if (data.profiles) setProfiles(data.profiles);
    } catch {
      // backend no disponible — mantener lista vacía
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updatePlan = async (userId: string, plan: UserPlan) => {
    setUpdating(userId);
    await fetch(API_ROUTES.ADMIN_USER_PLAN(userId), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    await fetchUsers();
    setUpdating(null);
  };

  const filtered = profiles.filter(p => {
    const matchesSearch = p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.full_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesPlan = filterPlan === 'all' || p.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-light text-gray-900">Gestión de Usuarios</h1>
              <p className="text-sm text-gray-500">Administra los planes de los usuarios</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-2xl font-light text-gray-900">{profiles.length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Total</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-2xl font-light text-gray-900">
                {profiles.filter(p => p.plan === 'premium').length}
              </span>
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Premium</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-2xl font-light text-gray-900">
              {profiles.filter(p => p.plan === 'free').length}
            </div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Gratuito</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'free', 'premium'] as const).map(plan => (
                <button
                  key={plan}
                  onClick={() => setFilterPlan(plan)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    filterPlan === plan ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {plan === 'all' ? 'Todos' : plan === 'premium' ? 'Premium' : 'Gratuito'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Usuario</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Empresa</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Rol</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((profile) => (
                    <tr key={profile.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{profile.full_name || '—'}</div>
                        <div className="text-xs text-gray-500">{profile.email}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{profile.company || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          {ROLE_LABELS[profile.role] || profile.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={profile.plan}
                            onChange={(e) => updatePlan(profile.id, e.target.value as UserPlan)}
                            disabled={updating === profile.id}
                            className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${PLAN_COLORS[profile.plan]}`}
                          >
                            <option value="free">Gratuito</option>
                            <option value="premium">Premium</option>
                          </select>
                          {updating === profile.id && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">No se encontraron usuarios</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
