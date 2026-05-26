"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Network, Plus, ChevronDown, ChevronUp, Calendar, Globe,
  Tag, Lock, Unlock, MapPin, Clock, ExternalLink, Leaf, Trash2, Pencil, Loader2
} from 'lucide-react';
import { SimbiocreacionRepository } from '@/lib/repositories/simbiocreacion-repository';
import type { Simbiocreacion } from '@/lib/types/database';

// ODS list (Agenda 2030)
const ODS_LIST = [
  { id: 1,  label: 'ODS 1 – Fin de la pobreza' },
  { id: 2,  label: 'ODS 2 – Hambre cero' },
  { id: 3,  label: 'ODS 3 – Salud y bienestar' },
  { id: 4,  label: 'ODS 4 – Educación de calidad' },
  { id: 5,  label: 'ODS 5 – Igualdad de género' },
  { id: 6,  label: 'ODS 6 – Agua limpia y saneamiento' },
  { id: 7,  label: 'ODS 7 – Energía asequible y no contaminante' },
  { id: 8,  label: 'ODS 8 – Trabajo decente y crecimiento económico' },
  { id: 9,  label: 'ODS 9 – Industria, innovación e infraestructura' },
  { id: 10, label: 'ODS 10 – Reducción de las desigualdades' },
  { id: 11, label: 'ODS 11 – Ciudades y comunidades sostenibles' },
  { id: 12, label: 'ODS 12 – Producción y consumo responsables' },
  { id: 13, label: 'ODS 13 – Acción por el clima' },
  { id: 14, label: 'ODS 14 – Vida submarina' },
  { id: 15, label: 'ODS 15 – Vida de ecosistemas terrestres' },
  { id: 16, label: 'ODS 16 – Paz, justicia e instituciones sólidas' },
  { id: 17, label: 'ODS 17 – Alianzas para lograr los objetivos' },
];

const EMPTY_FORM = {
  nombre: '',
  lugar: '',
  fecha: '',
  horaInicio: '',
  descripcion: '',
  privado: false,
  establecerHora: false,
  link: '',
  tags: '',        // comma-separated string in UI
  extraUrls: '',   // comma-separated string in UI
  ods: [] as number[],
};

const inputClass =
  'w-full px-0 py-3 border-0 border-b border-gray-200 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors';

export function SimbiocreacionDashboard() {
  const simbiRepo = useMemo(() => new SimbiocreacionRepository(), []);

  const [vista, setVista] = useState<'lista' | 'crear' | 'editar'>('lista');
  const [items, setItems] = useState<Simbiocreacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [masDetalles, setMasDetalles] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  // Load from API on mount
  useEffect(() => {
    simbiRepo.getAll()
      .then(data => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [simbiRepo]);

  const set = (key: keyof typeof form, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleOds = (id: number) =>
    setForm(prev => ({
      ...prev,
      ods: prev.ods.includes(id)
        ? prev.ods.filter(o => o !== id)
        : [...prev.ods, id],
    }));

  const openCrear = () => {
    setForm({ ...EMPTY_FORM });
    setMasDetalles(false);
    setEditingId(null);
    setVista('crear');
  };

  const openEditar = (item: Simbiocreacion) => {
    setForm({
      nombre:       item.nombre,
      lugar:        item.lugar ?? '',
      fecha:        item.fecha ?? '',
      horaInicio:   item.horaInicio ?? '',
      descripcion:  item.descripcion ?? '',
      privado:      item.privado,
      establecerHora: !!item.horaInicio,
      link:         item.link ?? '',
      tags:         item.tags.join(', '),
      extraUrls:    item.extraUrls.join(', '),
      ods:          item.ods,
    });
    setMasDetalles(false);
    setEditingId(item.id);
    setVista('editar');
  };

  // Parse comma-separated strings to arrays
  const parseTags = (s: string): string[] =>
    s.split(',').map(t => t.trim()).filter(Boolean);

  const handleGuardar = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);

    const payload = {
      nombre:      form.nombre,
      privado:     form.privado,
      lugar:       form.lugar || null,
      fecha:       form.fecha || null,
      horaInicio:  form.establecerHora ? (form.horaInicio || null) : null,
      descripcion: form.descripcion || null,
      link:        form.link || null,
      tags:        parseTags(form.tags),
      extraUrls:   parseTags(form.extraUrls),
      ods:         form.ods,
    };

    try {
      if (editingId) {
        await simbiRepo.update(editingId, payload);
        // refresh list
        const updated = await simbiRepo.getAll();
        setItems(updated);
      } else {
        const created = await simbiRepo.create(payload);
        setItems(prev => [created, ...prev]);
      }
      setVista('lista');
    } catch {
      // stay on form, optionally show error
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (id: string) => {
    try {
      await simbiRepo.delete(id);
      setItems(prev => prev.filter(it => it.id !== id));
    } catch { /* silent */ }
  };

  // ── VISTA LISTA ──────────────────────────────────────────────────────────────
  if (vista === 'lista') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                <Network className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-light text-gray-900">Simbiocreación</h1>
                <p className="text-sm text-gray-500">Gestiona tus procesos de co-creación sostenible</p>
              </div>
            </div>
            <button
              onClick={openCrear}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nueva simbiocreación
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Sin simbiocreaciones aún</h3>
              <p className="text-sm text-gray-400 mb-6">
                Crea tu primera simbiocreación para comenzar a documentar tus procesos de co-creación.
              </p>
              <button
                onClick={openCrear}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Nueva simbiocreación
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{item.nombre}</h3>
                        {item.privado ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs">
                            <Lock className="w-3 h-3" /> Privado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-50 text-teal-600 text-xs">
                            <Unlock className="w-3 h-3" /> Público
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                        {item.lugar && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {item.lugar}
                          </span>
                        )}
                        {item.fecha && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {item.fecha}
                            {item.horaInicio && ` · ${item.horaInicio}`}
                          </span>
                        )}
                        {item.ods.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" /> {item.ods.length} ODS
                          </span>
                        )}
                      </div>
                      {item.descripcion && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{item.descripcion}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEditar(item)}
                        className="p-2 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEliminar(item.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── VISTA FORMULARIO (crear / editar) ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Breadcrumb + título */}
        <div className="mb-6">
          <button
            onClick={() => setVista('lista')}
            className="text-xs text-teal-600 hover:underline mb-2 block"
          >
            ← Simbiocreaciones
          </button>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            {vista === 'editar' ? 'Editar simbiocreación' : 'Nueva simbiocreación'}
          </h1>
        </div>

        {/* Card del formulario */}
        <div className="bg-white border border-pink-200 rounded-2xl p-6 md:p-8 mb-6">

          {/* Nombre + Privado */}
          <div className="flex items-end gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Nombre de la simbiocreación*"
                value={form.nombre}
                onChange={e => set('nombre', e.target.value)}
                className={inputClass}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pb-3 flex-shrink-0">
              <input
                type="checkbox"
                checked={form.privado}
                onChange={e => set('privado', e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded"
              />
              <span className="text-sm text-gray-600">Privado</span>
            </label>
          </div>

          {/* Lugar */}
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Lugar"
                value={form.lugar}
                onChange={e => set('lugar', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Fecha + Hora de inicio */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 flex-1">
              <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="date"
                value={form.fecha}
                onChange={e => set('fecha', e.target.value)}
                className={inputClass}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={form.establecerHora}
                onChange={e => set('establecerHora', e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded"
              />
              <span className="text-sm text-gray-600">Establecer hora de inicio</span>
            </label>
          </div>

          {/* Hora (condicional) */}
          {form.establecerHora && (
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="time"
                  value={form.horaInicio}
                  onChange={e => set('horaInicio', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Descripción */}
          <div className="mb-4">
            <textarea
              placeholder="Descripción"
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
              rows={5}
              className="w-full px-4 py-3 border-0 border-b border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors resize-y"
            />
          </div>

          {/* Toggle Más detalles */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setMasDetalles(v => !v)}
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
            >
              {masDetalles ? (
                <><ChevronUp className="w-4 h-4" /> Menos detalles</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> Más detalles</>
              )}
            </button>
          </div>

          {/* Sección expandible */}
          {masDetalles && (
            <div className="space-y-4 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="url"
                  placeholder="Link con información del evento"
                  value={form.link}
                  onChange={e => set('link', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Tags (separados por comas)"
                  value={form.tags}
                  onChange={e => set('tags', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Extra URLs (separados por comas)"
                  value={form.extraUrls}
                  onChange={e => set('extraUrls', e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* ODS */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Leaf className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-500">Objetivos de Desarrollo Sostenible</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ODS_LIST.map(ods => (
                    <label
                      key={ods.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-sm ${
                        form.ods.includes(ods.id)
                          ? 'border-teal-500 bg-teal-50 text-teal-800'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.ods.includes(ods.id)}
                        onChange={() => toggleOds(ods.id)}
                        className="w-3.5 h-3.5 accent-teal-600 flex-shrink-0"
                      />
                      {ods.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setVista('lista')}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={!form.nombre.trim() || saving}
            className="flex items-center gap-2 px-7 py-2.5 text-sm font-medium bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
            ) : (
              vista === 'editar' ? 'Guardar cambios' : 'Crear'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
