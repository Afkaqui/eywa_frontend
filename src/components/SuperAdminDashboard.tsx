"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Shield, Search, Users, Crown, Loader2, FolderLock } from 'lucide-react';
import { ROLE_LABELS, ROLE_COLORS, PLAN_COLORS, API_ROUTES } from '@/lib/constants/roles';
import { DataroomRepository } from '@/lib/repositories/dataroom-repository';
import { VisitsPanel } from '@/components/VisitsPanel';
import type { Profile, UserRole, UserPlan } from '@/lib/types/database';

export function SuperAdminDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

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

  const updateRole = async (userId: string, role: UserRole) => {
    setUpdating(userId);
    await fetch(API_ROUTES.ADMIN_USER_ROLE(userId), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    await fetchUsers();
    setUpdating(null);
  };

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

  const filtered = profiles.filter(p =>
    p.email.toLowerCase().includes(search.toLowerCase()) ||
    (p.fullName || '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: profiles.length,
    admins: profiles.filter(p => ['superadmin', 'admin'].includes(p.role)).length,
    premium: profiles.filter(p => p.plan === 'premium').length,
    gestores: profiles.filter(p => p.role === 'gestor').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-light text-gray-900">Super Administración</h1>
              <p className="text-sm text-gray-500">Gestión completa de usuarios, roles y planes</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Usuarios', value: stats.total, icon: Users, color: 'bg-gray-900' },
            { label: 'Administradores', value: stats.admins, icon: Shield, color: 'bg-purple-600' },
            { label: 'Premium', value: stats.premium, icon: Crown, color: 'bg-amber-500' },
            { label: 'Gestores', value: stats.gestores, icon: Users, color: 'bg-blue-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-light text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Visitas a la web — exclusivo de superadmin */}
        <VisitsPanel />

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
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
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((profile) => (
                    <tr key={profile.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{profile.fullName || '—'}</div>
                        <div className="text-xs text-gray-500">{profile.email}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{profile.company || '—'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={profile.role}
                            onChange={(e) => updateRole(profile.id, e.target.value as UserRole)}
                            disabled={updating === profile.id}
                            className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${ROLE_COLORS[profile.role]}`}
                          >
                            <option value="user">Usuario</option>
                            <option value="gestor">Gestor</option>
                            <option value="admin">Administrador</option>
                            <option value="superadmin">Super Admin</option>
                          </select>
                          {updating === profile.id && <Loader2 className="w-3 h-3 animate-spin text-gray-400" />}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={profile.plan}
                          onChange={(e) => updatePlan(profile.id, e.target.value as UserPlan)}
                          disabled={updating === profile.id}
                          className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${PLAN_COLORS[profile.plan]}`}
                        >
                          <option value="free">Gratuito</option>
                          <option value="premium">Premium</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        {new Date(profile.createdAt).toLocaleDateString('es-ES')}
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

        {/* Permisos de dataroom delegados a gestores */}
        <DataroomGrantsPanel />
      </div>
    </div>
  );
}

/* ═══════════════════ PERMISOS DE DATAROOM (gestores) ═══════════════════ */
// El superadmin habilita a un gestor/admin a VER (solo lectura) el dataroom
// de una organización concreta.

function DataroomGrantsPanel() {
  const repo = useMemo(() => new DataroomRepository(), []);
  const [data, setData] = useState<Awaited<ReturnType<DataroomRepository['getGrants']>> | null>(null);
  const [orgId, setOrgId] = useState('');
  const [gestorId, setGestorId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try { setData(await repo.getGrants()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
  }, [repo]);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!orgId || !gestorId) return;
    setBusy(true); setError(null);
    try {
      await repo.createGrant(orgId, gestorId);
      setOrgId(''); setGestorId('');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear el permiso');
    } finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    setBusy(true); setError(null);
    try { await repo.deleteGrant(id); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'No se pudo revocar'); }
    finally { setBusy(false); }
  };

  return (
    <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
          <FolderLock className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Datarooms · Permisos de gestores</h2>
          <p className="text-xs text-gray-500">
            Habilita a un gestor a VER (solo lectura y descarga) el dataroom de una empresa.
          </p>
        </div>
      </div>

      {data === null ? (
        <div className="py-8 text-center"><Loader2 className="w-5 h-5 text-gray-300 mx-auto animate-spin" /></div>
      ) : (
        <>
          {/* Crear permiso */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4 mb-5">
            <select
              value={orgId}
              onChange={(e) => setOrgId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Empresa…</option>
              {data.organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <select
              value={gestorId}
              onChange={(e) => setGestorId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Gestor…</option>
              {data.gestores.map(g => (
                <option key={g.id} value={g.id}>{g.fullName || g.email} ({g.role})</option>
              ))}
            </select>
            <button
              onClick={add}
              disabled={busy || !orgId || !gestorId}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              Dar acceso
            </button>
          </div>

          {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

          {/* Lista de permisos activos */}
          {data.grants.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No hay permisos delegados.</p>
          ) : (
            <div className="divide-y divide-gray-50 border border-gray-100 rounded-lg">
              {data.grants.map(g => (
                <div key={g.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="font-medium text-gray-900">{g.organization.name}</span>
                  <span className="text-gray-400">→</span>
                  <span className="flex-1 text-gray-600 truncate">{g.gestor.name || g.gestor.email}</span>
                  <button
                    onClick={() => remove(g.id)}
                    disabled={busy}
                    className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                  >
                    Revocar
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
