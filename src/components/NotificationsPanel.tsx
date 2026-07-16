"use client";

import { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2, ArrowRight, AlertCircle, Info } from 'lucide-react';

// Notificaciones derivadas del estado del usuario (el backend las calcula al
// momento): se autoresuelven al completar la acción, no hay "marcar como leída".

export interface AppNotification {
  id: string;
  type: 'action' | 'info';
  title: string;
  message: string;
  view: string | null;
  cta: string | null;
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  try {
    const res = await fetch('/api/proxy/notifications', { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.notifications) ? data.notifications : [];
  } catch {
    return [];
  }
}

export function NotificationsPanel({ onNavigate }: { onNavigate?: (view: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [notices, setNotices] = useState<AppNotification[]>([]);

  useEffect(() => {
    let alive = true;
    fetchNotifications()
      .then((n) => { if (alive) setNotices(n); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Bell className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-light text-gray-900">Notificaciones</h1>
            <p className="text-sm text-gray-500">Avisos y acciones pendientes de tu cuenta</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : notices.length === 0 ? (
          <div className="border border-dashed border-gray-300 rounded-2xl p-12 text-center bg-white">
            <BellOff className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-700 mb-1">Todo al día</h3>
            <p className="text-sm text-gray-500">No tienes notificaciones pendientes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notices.map((n) => (
              <div key={n.id} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  n.type === 'action' ? 'bg-amber-100' : 'bg-blue-100'
                }`}>
                  {n.type === 'action'
                    ? <AlertCircle className="w-5 h-5 text-amber-600" />
                    : <Info className="w-5 h-5 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{n.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{n.message}</p>
                  {n.view && n.cta && (
                    <button
                      onClick={() => onNavigate?.(n.view!)}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      {n.cta}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
