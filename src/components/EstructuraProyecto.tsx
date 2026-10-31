"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, Plus, Trash2, Target, Recycle } from 'lucide-react';
import { ValidatorRepository, type ProjectPlanRow, type ProblemaDef, type MppDef } from '@/lib/repositories/validator-repository';

const repo = new ValidatorRepository();

// Definición del problema y Máximo Producto Posible (PLAN C1, C2).
//
// Lo que en las reuniones se explica de palabra, aquí queda estructurado y entra
// al análisis: primero se define el problema real (que no se "resuelve", se mitiga
// con una oportunidad de negocio) y después cuántos productos y sectores salen de
// un mismo insumo. Ver Glosario en la Academia.

const CAMPOS_PROBLEMA: { k: keyof ProblemaDef; t: string; ayuda: string }[] = [
  { k: 'actor',             t: 'Actor',                 ayuda: '¿A quién afecta? (p. ej. productores de cacao de Padre Abad)' },
  { k: 'dolor',             t: 'Dolor',                 ayuda: '¿Qué le duele, en sus palabras?' },
  { k: 'causa_raiz',        t: 'Causa raíz',            ayuda: '¿Por qué ocurre? Lo que tu solución va a atacar' },
  { k: 'urgencia',          t: 'Urgencia',              ayuda: '¿Qué tan prioritario es? ¿Es de vida o muerte?' },
  { k: 'consecuencia',      t: 'Consecuencia',          ayuda: '¿Qué pasa si no se hace nada?' },
  { k: 'unidad_validacion', t: 'Unidad de validación',  ayuda: '¿Quién lo quiere y pagaría por resolverlo?' },
];

export function EstructuraProyecto({ plan, onActualizar }: { plan: ProjectPlanRow; onActualizar: (p: ProjectPlanRow) => void }) {
  const [abierto, setAbierto] = useState(false);
  const [problema, setProblema] = useState<ProblemaDef>(plan.problema ?? {});
  const [mpp, setMpp] = useState<MppDef>(plan.mpp ?? { insumo: '', subproductos: [] });
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);

  const completos = CAMPOS_PROBLEMA.filter(({ k }) => (plan.problema?.[k] ?? '').trim()).length;
  const nSub = plan.mpp?.subproductos?.length ?? 0;

  const guardar = async () => {
    setGuardando(true); setMsg(null);
    try {
      const limpio: MppDef = { insumo: mpp.insumo || null, subproductos: mpp.subproductos.filter((s) => s.nombre.trim()) };
      onActualizar(await repo.saveEstructura(plan.id, { problema, mpp: limpio }));
      setMsg({ ok: true, t: 'Guardado. Se tendrá en cuenta en el próximo análisis.' });
    } catch (e) {
      setMsg({ ok: false, t: e instanceof Error ? e.message : 'No se pudo guardar' });
    } finally {
      setGuardando(false);
    }
  };

  const setSub = (i: number, campo: string, v: string) =>
    setMpp((m) => ({ ...m, subproductos: m.subproductos.map((s, j) => (j === i ? { ...s, [campo]: v } : s)) }));

  return (
    <div className="border border-gray-200 rounded-xl">
      <button onClick={() => setAbierto((v) => !v)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
        <Target className="w-4 h-4 text-emerald-600" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900">Problema y Máximo Producto Posible</div>
          <div className="text-xs text-gray-500">
            Problema: {completos}/6 campos · MPP: {nSub} subproducto{nSub === 1 ? '' : 's'}
          </div>
        </div>
        {abierto ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {abierto && (
        <div className="px-4 pb-4 space-y-5">
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">1 · Definición del problema</div>
            <p className="text-xs text-gray-500 mb-3">
              Un problema es una brecha que afecta a muchas personas y no desaparece del todo: tu proyecto
              ataca una <b>causa</b> y lo mitiga. Defínelo antes de la solución.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {CAMPOS_PROBLEMA.map(({ k, t, ayuda }) => (
                <label key={k} className="block">
                  <span className="text-xs font-medium text-gray-700">{t}</span>
                  <textarea
                    rows={2} value={problema[k] ?? ''} placeholder={ayuda}
                    onChange={(e) => setProblema((p) => ({ ...p, [k]: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Recycle className="w-3.5 h-3.5" /> 2 · Máximo Producto Posible
            </div>
            <p className="text-xs text-gray-500 mb-3">
              De un mismo insumo, ¿qué más puede salir y quién lo compra? Es economía circular, y es lo que
              hace atractivo el proyecto para fondos de bioeconomía.
            </p>
            <input
              value={mpp.insumo ?? ''} placeholder="Insumo principal (p. ej. mazorca de cacao)"
              onChange={(e) => setMpp((m) => ({ ...m, insumo: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {mpp.subproductos.map((s, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 mb-2">
                <input className="col-span-3 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" placeholder="Subproducto (cáscara)"
                       value={s.nombre} onChange={(e) => setSub(i, 'nombre', e.target.value)} />
                <input className="col-span-4 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" placeholder="Uso / transformación"
                       value={s.uso ?? ''} onChange={(e) => setSub(i, 'uso', e.target.value)} />
                <input className="col-span-3 border border-gray-200 rounded-lg px-2 py-1.5 text-sm" placeholder="Sector que lo compra"
                       value={s.sector ?? ''} onChange={(e) => setSub(i, 'sector', e.target.value)} />
                <select className="col-span-1 border border-gray-200 rounded-lg px-1 py-1.5 text-xs bg-white"
                        value={s.estado} onChange={(e) => setSub(i, 'estado', e.target.value)}>
                  <option value="actual">Ya</option>
                  <option value="potencial">Potencial</option>
                </select>
                <button className="col-span-1 text-gray-400 hover:text-red-600" title="Quitar"
                        onClick={() => setMpp((m) => ({ ...m, subproductos: m.subproductos.filter((_, j) => j !== i) }))}>
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setMpp((m) => ({ ...m, subproductos: [...m.subproductos, { nombre: '', uso: '', sector: '', estado: 'potencial' }] }))}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar subproducto
            </button>
          </div>

          {msg && <p className={`text-xs ${msg.ok ? 'text-emerald-700' : 'text-red-700'}`}>{msg.t}</p>}
          <button onClick={guardar} disabled={guardando}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 inline-flex items-center gap-2">
            {guardando && <Loader2 className="w-4 h-4 animate-spin" />} Guardar
          </button>
        </div>
      )}
    </div>
  );
}
