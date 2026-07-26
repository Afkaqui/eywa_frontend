"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  DataroomRepository,
  type DataroomData, type DataroomFolder, type DataroomItem, type DataroomDoc,
} from '@/lib/repositories/dataroom-repository';
import { DataroomInvitations } from '@/components/DataroomInvitations';
import {
  FolderClosed, FolderOpen, CheckCircle2, Circle, Upload, Download, Trash2,
  Loader2, ShieldCheck, AlertTriangle, FileText, Globe, Lock, Copy, Check, ExternalLink,
  Eye, Sparkles, History,
} from 'lucide-react';
import type { LandingState } from '@/lib/repositories/dataroom-repository';

const repo = new DataroomRepository();

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Dataroom({ orgId }: { orgId?: string } = {}) {
  const [data, setData] = useState<DataroomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFolder, setOpenFolder] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const d = await repo.get(orgId);
      setData(d);
      setOpenFolder(prev => prev ?? d.folders[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el dataroom');
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <Loader2 className="w-8 h-8 text-emerald-500 mx-auto mb-3 animate-spin" />
        <p className="text-sm text-gray-500">Cargando dataroom…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 mb-3">{error}</p>
        <button onClick={() => { setLoading(true); load(); }} className="text-emerald-600 font-medium text-sm">Reintentar</button>
      </div>
    );
  }

  if (!data?.has_organization) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
        <FolderClosed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Aún no tienes organización</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Completa el perfil de tu organización (pestaña <strong>Perfil</strong>) para habilitar tu dataroom.
        </p>
      </div>
    );
  }

  const pct = data.completeness.percentage;
  const readOnly = Boolean(data.read_only);
  const publicDocsCount = data.folders
    .flatMap(f => f.items)
    .flatMap(i => i.documents)
    .filter(d => d.is_public).length;

  return (
    <div className="space-y-6">
      {/* Vista delegada (gestor/superadmin): solo ver y descargar */}
      {readOnly && (
        <div className="flex items-center gap-2.5 text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <Eye className="w-4 h-4 flex-shrink-0" />
          <p>
            Vista de <strong>solo lectura</strong> del dataroom de{' '}
            <strong>{data.organization?.name}</strong>. Puedes revisar y descargar; subir,
            eliminar y publicar es exclusivo del dueño.
          </p>
        </div>
      )}

      {/* Resumen de completitud */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <div className="flex items-center gap-4 flex-1">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
              pct === 100 ? 'bg-emerald-100' : pct >= 50 ? 'bg-amber-100' : 'bg-gray-100'
            }`}>
              <ShieldCheck className={`w-7 h-7 ${
                pct === 100 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-gray-400'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{pct}%</span>
                <span className="text-sm text-gray-500">
                  {data.completeness.completed_items} de {data.completeness.total_items} documentos
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 max-w-xs">
            Un dataroom completo genera confianza inmediata ante inversores, bancos y auditores.
          </p>
        </div>
      </div>

      {/* Aviso de privacidad (solo al dueño) */}
      {!readOnly && (
        <div className="flex items-start gap-2.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <Lock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <p>
            Todos los documentos son <strong>privados</strong> por defecto. Solo tú (y el equipo de EYWA
            para soporte) pueden verlos. Nada se publica salvo que lo marques explícitamente.
          </p>
        </div>
      )}

      {/* Perfil público (solo el dueño lo gestiona) */}
      {!readOnly && <LandingPanel publicDocs={publicDocsCount} />}

      {/* Invitaciones a terceros. Solo el DUEÑO: un gestor con acceso delegado
          tiene permiso de lectura, no de repartir accesos a documentos ajenos. */}
      {!readOnly && <DataroomInvitations />}

      {/* Carpetas */}
      <div className="space-y-3">
        {data.folders.map(folder => (
          <FolderCard
            key={folder.id}
            folder={folder}
            open={openFolder === folder.id}
            onToggle={() => setOpenFolder(openFolder === folder.id ? null : folder.id)}
            onChanged={load}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* Bitácora de accesos (solo el dueño) */}
      {!readOnly && <AccessLogPanel />}
    </div>
  );
}

// Bitácora: quién descargó qué y cuándo (dueño).
function AccessLogPanel() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<import('@/lib/repositories/dataroom-repository').AccessLogEntry[] | null>(null);

  useEffect(() => {
    if (open && logs === null) {
      repo.getAccessLog().then(setLogs).catch(() => setLogs([]));
    }
  }, [open, logs]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
          <History className="w-5 h-5 text-gray-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">Registro de accesos</h3>
          <p className="text-xs text-gray-500">Quién descargó tus documentos y cuándo</p>
        </div>
        <span className="text-xs text-gray-400">{open ? 'Ocultar' : 'Ver'}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100">
          {logs === null ? (
            <div className="p-6 text-center"><Loader2 className="w-5 h-5 text-gray-300 mx-auto animate-spin" /></div>
          ) : logs.length === 0 ? (
            <p className="p-6 text-center text-xs text-gray-400">Aún no hay descargas registradas.</p>
          ) : (
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {logs.map(l => (
                <div key={l.id} className="flex items-center gap-3 px-5 py-2.5 text-xs">
                  <Download className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                  <span className="flex-1 truncate text-gray-700">{l.file_name}</span>
                  <span className={`flex-shrink-0 ${l.action === 'download_public' ? 'text-blue-600' : 'text-gray-500'}`}>
                    {l.user}
                  </span>
                  <span className="text-gray-400 flex-shrink-0">
                    {new Date(l.created_at).toLocaleString('es-PE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Panel para activar la mini-landing pública de la empresa.
function LandingPanel({ publicDocs }: { publicDocs: number }) {
  const [state, setState] = useState<LandingState | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    repo.getLanding().then(setState).catch(() => setState({ enabled: false, slug: null }));
  }, []);

  const url = state?.slug && typeof window !== 'undefined'
    ? `${window.location.origin}/empresa/${state.slug}`
    : '';

  const toggle = async () => {
    if (!state) return;
    setBusy(true);
    try { setState(await repo.setLanding(!state.enabled)); }
    catch { /* sin cambios */ }
    finally { setBusy(false); }
  };

  const copy = () => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!state) return null;

  return (
    <div className={`rounded-xl border p-5 ${state.enabled ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${state.enabled ? 'bg-emerald-100' : 'bg-gray-100'}`}>
          <Globe className={`w-5 h-5 ${state.enabled ? 'text-emerald-600' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Perfil público de tu empresa</h3>
          <p className="text-xs text-gray-500 mb-3">
            {state.enabled
              ? <>Tu página está <strong className="text-emerald-700">activa</strong>. Muestra tu perfil, tu % de dataroom completo y los {publicDocs} documento{publicDocs === 1 ? '' : 's'} que marcaste como públicos. <strong>Los privados nunca aparecen.</strong></>
              : <>Publica una página con el perfil de tu empresa y solo los documentos que marques como públicos. Útil para compartir con inversores y bancos.</>}
          </p>

          {state.enabled && url && (
            <div className="flex items-center gap-2 mb-3">
              <span className="flex-1 text-xs font-mono text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2 truncate">{url}</span>
              <button onClick={copy} title="Copiar enlace" className="p-2 text-gray-400 hover:text-emerald-600 transition-colors">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <a href={url} target="_blank" rel="noopener noreferrer" title="Abrir" className="p-2 text-gray-400 hover:text-emerald-600 transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {state.enabled && publicDocs === 0 && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
              Aún no has marcado ningún documento como público, así que tu página solo muestra el perfil y el sello de completitud.
            </p>
          )}

          <button
            onClick={toggle}
            disabled={busy}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
              state.enabled
                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {busy ? 'Guardando…' : state.enabled ? 'Desactivar página pública' : 'Activar página pública'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FolderCard({ folder, open, onToggle, onChanged, readOnly = false }: {
  folder: DataroomFolder; open: boolean; onToggle: () => void; onChanged: () => Promise<void>; readOnly?: boolean;
}) {
  const done = folder.completed_items === folder.total_items && folder.total_items > 0;

  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-colors ${done ? 'border-emerald-200' : 'border-gray-200'}`}>
      <button onClick={onToggle} className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-100' : 'bg-gray-100'}`}>
          {open
            ? <FolderOpen className={`w-5 h-5 ${done ? 'text-emerald-600' : 'text-gray-500'}`} />
            : <FolderClosed className={`w-5 h-5 ${done ? 'text-emerald-600' : 'text-gray-500'}`} />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm">{folder.name}</h3>
          {folder.description && <p className="text-xs text-gray-500 truncate">{folder.description}</p>}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-xs font-semibold ${done ? 'text-emerald-600' : 'text-gray-400'}`}>
            {folder.completed_items}/{folder.total_items}
          </span>
          <div className="w-16 bg-gray-100 rounded-full h-1.5 hidden md:block">
            <div className={`h-1.5 rounded-full ${done ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${folder.percentage}%` }} />
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 divide-y divide-gray-50">
          {folder.items.map(item => <ItemRow key={item.id} item={item} onChanged={onChanged} readOnly={readOnly} />)}
        </div>
      )}
    </div>
  );
}

function ItemRow({ item, onChanged, readOnly = false }: {
  item: DataroomItem; onChanged: () => Promise<void>; readOnly?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setBusy(true); setErr(null);
    try {
      await repo.upload(item.id, file);
      await onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Error al subir');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (doc: DataroomDoc) => {
    if (!confirm(`¿Eliminar "${doc.file_name}"?`)) return;
    setBusy(true);
    try { await repo.remove(doc.id); await onChanged(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Error al eliminar'); }
    finally { setBusy(false); }
  };

  const togglePublic = async (doc: DataroomDoc) => {
    setBusy(true);
    try { await repo.setPublic(doc.id, !doc.is_public); await onChanged(); }
    catch (e) { setErr(e instanceof Error ? e.message : 'Error'); }
    finally { setBusy(false); }
  };

  return (
    <div className="px-5 py-3.5">
      <div className="flex items-center gap-3">
        {item.completed
          ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          : <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />}
        <span className={`flex-1 text-sm ${item.completed ? 'text-gray-900' : 'text-gray-500'}`}>{item.name}</span>

        {item.platform_complete && (
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0"
            title={item.platform_note ?? undefined}
          >
            <Sparkles className="w-3 h-3" />
            Completo vía plataforma
          </span>
        )}

        {!readOnly && (
          <>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <button
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Subir
            </button>
          </>
        )}
      </div>

      {item.platform_complete && item.platform_note && (
        <p className="text-xs text-emerald-600 mt-1.5 ml-7">{item.platform_note}</p>
      )}

      {err && <p className="text-xs text-red-600 mt-2 ml-7">{err}</p>}

      {item.documents.length > 0 && (
        <div className="mt-2.5 ml-7 space-y-1.5">
          {item.documents.map(doc => (
            <div key={doc.id} className="flex items-center gap-2 text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="flex-1 truncate text-gray-700">{doc.file_name}</span>
              <span className="text-gray-400 flex-shrink-0">{formatSize(doc.size)}</span>

              {readOnly ? (
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded flex-shrink-0 ${
                  doc.is_public ? 'text-emerald-700 bg-emerald-100' : 'text-gray-400'
                }`}>
                  {doc.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {doc.is_public ? 'Público' : 'Privado'}
                </span>
              ) : (
                <button
                  onClick={() => togglePublic(doc)}
                  disabled={busy}
                  title={doc.is_public ? 'Público en la landing — clic para hacerlo privado' : 'Privado — clic para publicarlo'}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors flex-shrink-0 ${
                    doc.is_public ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {doc.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {doc.is_public ? 'Público' : 'Privado'}
                </button>
              )}

              <a
                href={repo.downloadUrl(doc.id)}
                className="p-1 text-gray-400 hover:text-emerald-600 transition-colors flex-shrink-0"
                title="Descargar"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
              {!readOnly && (
                <button
                  onClick={() => handleDelete(doc)}
                  disabled={busy}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
