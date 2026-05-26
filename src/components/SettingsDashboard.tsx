"use client";

import { useState } from 'react';
import {
  User, Lock, Check, Loader2, Eye, EyeOff, AlertCircle, Settings,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { credentials: 'include', ...init });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Error ${res.status}`);
  return data as T;
}

const inputCls =
  'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white placeholder-gray-400';
const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = 'perfil' | 'seguridad';

interface StatusMsg { type: 'success' | 'error'; text: string }

// ── Sub-component: status banner ──────────────────────────────────────────────

function StatusBanner({ msg }: { msg: StatusMsg }) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
        msg.type === 'success'
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-red-50 text-red-700 border border-red-200'
      }`}
    >
      {msg.type === 'success' ? (
        <Check className="w-4 h-4 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
      )}
      {msg.text}
    </div>
  );
}

// ── Sub-component: password input ─────────────────────────────────────────────

function PasswordInput({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder ?? '••••••••'}
          className={`${inputCls} pr-12`}
          autoComplete="new-password"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function SettingsDashboard() {
  const { user, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('perfil');

  // ── Perfil form ──────────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [company,  setCompany]  = useState(user?.company ?? '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState<StatusMsg | null>(null);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) return;
    setSavingProfile(true);
    setProfileStatus(null);
    try {
      await apiFetch('/api/proxy/users/me', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ full_name: fullName.trim(), company: company.trim() || undefined }),
      });
      await refreshProfile();
      setProfileStatus({ type: 'success', text: 'Perfil actualizado correctamente' });
    } catch (err) {
      setProfileStatus({ type: 'error', text: (err as Error).message || 'No se pudo actualizar el perfil' });
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Password form ────────────────────────────────────────────────────────────
  const [currentPwd, setCurrentPwd]   = useState('');
  const [newPwd,      setNewPwd]      = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [savingPwd,   setSavingPwd]   = useState(false);
  const [pwdStatus,   setPwdStatus]   = useState<StatusMsg | null>(null);

  const pwdMismatch = newPwd.length > 0 && confirmPwd.length > 0 && newPwd !== confirmPwd;
  const pwdTooShort = newPwd.length > 0 && newPwd.length < 6;

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || newPwd !== confirmPwd || pwdTooShort) return;
    setSavingPwd(true);
    setPwdStatus(null);
    try {
      await apiFetch('/api/proxy/users/me/password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ current_password: currentPwd, new_password: newPwd }),
      });
      setPwdStatus({ type: 'success', text: 'Contraseña actualizada correctamente' });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (err) {
      setPwdStatus({ type: 'error', text: (err as Error).message || 'No se pudo cambiar la contraseña' });
    } finally {
      setSavingPwd(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <Settings className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-light text-gray-900">Configuración</h1>
            <p className="text-sm text-gray-500">Gestiona tu cuenta y seguridad</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
          {([
            { id: 'perfil',    Icon: User, label: 'Datos personales' },
            { id: 'seguridad', Icon: Lock, label: 'Contraseña'       },
          ] as const).map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── PERFIL TAB ─────────────────────────────────────────────────────── */}
        {activeTab === 'perfil' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl font-semibold text-white">
                  {(user?.name ?? user?.email ?? 'U')[0].toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-lg">{user?.name || 'Sin nombre'}</div>
                <div className="text-sm text-gray-500">{user?.email}</div>
                <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                  {user?.plan === 'premium' ? 'Plan Premium' : 'Plan Gratuito'}
                </span>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className={labelCls}>Nombre completo *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Tu nombre completo"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Correo electrónico</label>
                <input
                  type="email"
                  value={user?.email ?? ''}
                  disabled
                  className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`}
                />
                <p className="mt-1 text-xs text-gray-400">El correo no se puede cambiar</p>
              </div>

              <div>
                <label className={labelCls}>Empresa / Organización</label>
                <input
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Nombre de tu empresa u organización"
                  className={inputCls}
                />
              </div>

              {profileStatus && <StatusBanner msg={profileStatus} />}

              <div className="pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={!fullName.trim() || savingProfile}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {savingProfile ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                  ) : (
                    'Guardar cambios'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SEGURIDAD TAB ──────────────────────────────────────────────────── */}
        {activeTab === 'seguridad' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">

            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Lock className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Cambiar contraseña</div>
                <div className="text-xs text-gray-500">Usa una contraseña segura de al menos 6 caracteres</div>
              </div>
            </div>

            <div className="space-y-5">
              <PasswordInput
                label="Contraseña actual"
                value={currentPwd}
                onChange={setCurrentPwd}
                placeholder="Tu contraseña actual"
              />

              <PasswordInput
                label="Nueva contraseña"
                value={newPwd}
                onChange={setNewPwd}
                placeholder="Mínimo 6 caracteres"
              />
              {pwdTooShort && (
                <p className="text-xs text-red-500 -mt-3">Debe tener al menos 6 caracteres</p>
              )}

              <PasswordInput
                label="Confirmar nueva contraseña"
                value={confirmPwd}
                onChange={setConfirmPwd}
                placeholder="Repite la nueva contraseña"
              />
              {pwdMismatch && (
                <p className="text-xs text-red-500 -mt-3">Las contraseñas no coinciden</p>
              )}

              {pwdStatus && <StatusBanner msg={pwdStatus} />}

              <div className="pt-2">
                <button
                  onClick={handleChangePassword}
                  disabled={
                    !currentPwd || !newPwd || !confirmPwd ||
                    pwdMismatch || pwdTooShort || savingPwd
                  }
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {savingPwd ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Cambiando...</>
                  ) : (
                    'Cambiar contraseña'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
