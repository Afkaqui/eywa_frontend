"use client";

import { useState } from 'react';
import { Building2, TrendingUp, GraduationCap, Cpu, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type OrgType = 'empresa' | 'inversor' | 'academia' | 'proveedor' | null;

const ORG_TYPES: {
  id: OrgType;
  icon: typeof Building2;
  label: string;
  description: string;
  bg: string;
  activeBg: string;
}[] = [
  {
    id: 'empresa',
    icon: Building2,
    label: 'Empresa / Startup',
    description: 'Quiero medir mi madurez ESG y acceder a financiamiento',
    bg: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
    activeBg: 'bg-emerald-500 border-emerald-500',
  },
  {
    id: 'inversor',
    icon: TrendingUp,
    label: 'Inversor / Fondo',
    description: 'Quiero evaluar portafolios de empresas sostenibles',
    bg: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    activeBg: 'bg-blue-500 border-blue-500',
  },
  {
    id: 'academia',
    icon: GraduationCap,
    label: 'Academia / ONG',
    description: 'Uso EYWA con fines educativos o de investigación',
    bg: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    activeBg: 'bg-purple-500 border-purple-500',
  },
  {
    id: 'proveedor',
    icon: Cpu,
    label: 'Proveedor de Tecnología',
    description: 'Ofrezco soluciones tecnológicas o servicios sostenibles',
    bg: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    activeBg: 'bg-amber-500 border-amber-500',
  },
];

const SECTORS = [
  'Agrotech', 'Banca y Finanzas', 'Construcción', 'Educación',
  'Energía Renovable', 'Manufactura', 'Minería', 'Retail',
  'Salud', 'Servicios', 'Transporte', 'Otro',
];

const SIZES = ['1–10', '11–50', '51–200', '201–500', '500+'];

export function OrganizationProfile() {
  const { profile } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);
  const [orgType, setOrgType] = useState<OrgType>(null);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name:        profile?.company || '',
    description: '',
    phone:       '',
    website:     '',
    country:     'Perú',
    sector:      '',
    size:        '',
    founded:     '',
  });

  const handleSave = () => {
    // TODO: persistir mediante API cuando el endpoint esté disponible
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const set = (key: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const inputClass =
    'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white';
  const labelClass =
    'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-light text-gray-900">Mi Organización</h1>
              <p className="text-sm text-gray-500">Completa el perfil de tu organización</p>
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          {/* Step 1 */}
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${
              step > 1
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-emerald-500 text-emerald-600'
            }`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-sm font-medium hidden sm:inline">Tipo de organización</span>
          </div>

          <div className="flex-1 h-px bg-gray-200 mx-4" />

          {/* Step 2 */}
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${
              step === 2 ? 'border-emerald-500 text-emerald-600' : 'border-gray-300 text-gray-400'
            }`}>
              2
            </div>
            <span className="text-sm font-medium hidden sm:inline">Datos de la organización</span>
          </div>
        </div>

        {/* ── STEP 1: Tipo de organización ── */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-6 text-center">
              ¿Cómo describes tu organización?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ORG_TYPES.map(({ id, icon: Icon, label, description, bg, activeBg }) => {
                const selected = orgType === id;
                return (
                  <button
                    key={id}
                    onClick={() => setOrgType(id)}
                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-200 ${
                      selected
                        ? `${activeBg} shadow-lg scale-[1.02]`
                        : `${bg} bg-white`
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-3 ${selected ? 'text-white' : 'text-emerald-600'}`} />
                    <div className={`font-semibold text-base mb-1 ${selected ? 'text-white' : 'text-gray-900'}`}>
                      {label}
                    </div>
                    <div className={`text-sm leading-snug ${selected ? 'text-white/80' : 'text-gray-500'}`}>
                      {description}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!orgType}
                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Datos de la organización ── */}
        {step === 2 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Nombre */}
              <div className="md:col-span-2">
                <label className={labelClass}>Nombre de la organización *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Ej. GENES PERÚ S.A.C."
                  className={inputClass}
                />
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className={labelClass}>Descripción</label>
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Breve descripción de la organización y su misión..."
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className={labelClass}>Teléfono de contacto</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+51 999 999 999"
                  className={inputClass}
                />
              </div>

              {/* Sitio web */}
              <div>
                <label className={labelClass}>Sitio web</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={e => set('website', e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>

              {/* País */}
              <div>
                <label className={labelClass}>País</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={e => set('country', e.target.value)}
                  placeholder="Perú"
                  className={inputClass}
                />
              </div>

              {/* Año de fundación */}
              <div>
                <label className={labelClass}>Año de fundación</label>
                <input
                  type="number"
                  value={form.founded}
                  onChange={e => set('founded', e.target.value)}
                  placeholder="2020"
                  min={1900}
                  max={2026}
                  className={inputClass}
                />
              </div>

              {/* Sector */}
              <div>
                <label className={labelClass}>Sector / Industria</label>
                <select
                  value={form.sector}
                  onChange={e => set('sector', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Seleccionar...</option>
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Tamaño */}
              <div>
                <label className={labelClass}>Número de empleados</label>
                <select
                  value={form.size}
                  onChange={e => set('size', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Seleccionar...</option>
                  {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-5 py-2.5 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" /> Atrás
              </button>

              <button
                onClick={handleSave}
                disabled={!form.name}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  saved
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                {saved ? (
                  <><Check className="w-4 h-4" /> Guardado</>
                ) : (
                  'Guardar perfil'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
