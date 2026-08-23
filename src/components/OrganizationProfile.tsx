"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Building2, TrendingUp, GraduationCap, ChevronRight, Check,
  Loader2, Phone, Globe, Link as LinkIcon, MapPin, Layers, X, Plus, Leaf, BarChart2,
  FolderLock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  OrganizationRepository, getOrgActivaId, setOrgActivaId,
} from '@/lib/repositories/organization-repository';
import { Dataroom } from '@/components/Dataroom';
import { OrgSwitcher } from '@/components/OrgSwitcher';
import { EsgIndexPanel } from '@/components/EsgIndexPanel';
import { ImageUploader } from '@/components/ImageUploader';

// ── Types ─────────────────────────────────────────────────────────────────────

type OrgType = 'empresa' | 'proveedor' | 'academia';

const ORG_TYPES: {
  id: OrgType;
  icon: typeof Building2;
  label: string;
  sublabel: string;
  description: string;
  color: string;
  activeColor: string;
  textColor: string;
}[] = [
  {
    id: 'empresa',
    icon: Building2,
    label: 'EMPRESA / STARTUP',
    sublabel: 'Empresa',
    description: 'Quiero medir mi madurez ESG y acceder a financiamiento sostenible',
    color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100',
    activeColor: 'bg-emerald-500 border-emerald-500',
    textColor: 'text-emerald-700',
  },
  {
    id: 'proveedor',
    icon: TrendingUp,
    label: 'PROVEEDOR DE TECNOLOGÍA',
    sublabel: 'Proveedor',
    description: 'Ofrezco tecnologías industriales o servicios sostenibles',
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400 hover:bg-blue-100',
    activeColor: 'bg-blue-500 border-blue-500',
    textColor: 'text-blue-700',
  },
  {
    id: 'academia',
    icon: GraduationCap,
    label: 'ACADEMIA / ONG',
    sublabel: 'Academia',
    description: 'Uso EYWA con fines educativos o de investigación',
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400 hover:bg-purple-100',
    activeColor: 'bg-purple-500 border-purple-500',
    textColor: 'text-purple-700',
  },
];

// Full list from IMI
const INDUSTRY_SECTORS = [
  'Information Technologies',
  'Food - Agro', 'Food - Farming', 'Food - Fishing', 'Food - Gastronomy', 'Food - Nutrition',
  'Biotechnology - Medical', 'Biotechnology - Nutrition', 'Biotechnology - Equipment',
  'Construction - Real Estate', 'Construction - Architecture', 'Construction - Design',
  'Transport', 'Sports', 'Commerce', 'Tourism',
  'Energy - Non-renewable', 'Energy - Renewable',
  'Mining',
  'Manufacture - Textile', 'Manufacture - Artisan',
  'Digital Fabrication', 'Finance', 'Aerospace', 'Chemistry', 'Engineering',
  'Forestry and Paper', 'Metallurgy', 'Industrial Manufacturing', 'Logistics',
  'Electronics', 'Automotive', 'Fashion Industry', 'Education', 'Farmaceutical',
  'Mechanics', 'Leatherworking', 'Livestock', 'Environment', 'Restoration', 'Others',
];

const INSTITUTION_TYPES = ['Escuela', 'Instituto', 'Universidad', 'Otro'];

// Abbreviated country list (main + all Latin America)
const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia',
  'Australia','Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Belarus',
  'Belgium','Belize','Benin','Bolivia','Bosnia and Herzegovina','Botswana','Brazil',
  'Bulgaria','Burkina Faso','Cambodia','Cameroon','Canada','Chile','China','Colombia',
  'Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark',
  'Dominican Republic','Ecuador','Egypt','El Salvador','Estonia','Ethiopia','Finland',
  'France','Georgia','Germany','Ghana','Greece','Guatemala','Haiti','Honduras',
  'Hungary','India','Indonesia','Iran','Iraq','Ireland','Israel','Italy',
  'Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kuwait','Laos','Latvia',
  'Lebanon','Libya','Lithuania','Luxembourg','Malaysia','Mexico','Moldova',
  'Morocco','Mozambique','Myanmar','Nepal','Netherlands','New Zealand','Nicaragua',
  'Nigeria','Norway','Oman','Pakistan','Panama','Paraguay','Peru','Philippines',
  'Poland','Portugal','Qatar','Romania','Russia','Saudi Arabia','Senegal','Serbia',
  'Singapore','Slovakia','Slovenia','South Africa','South Korea','Spain','Sri Lanka',
  'Sudan','Sweden','Switzerland','Syria','Taiwan','Tanzania','Thailand','Tunisia',
  'Turkey','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States',
  'Uruguay','Uzbekistan','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

// ── Component ─────────────────────────────────────────────────────────────────

const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white placeholder-gray-400';
const labelCls = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5';

export function OrganizationProfile({ onNavigate }: { onNavigate?: (view: string) => void } = {}) {
  const { profile } = useAuth();
  const orgRepo = useMemo(() => new OrganizationRepository(), []);

  const [activeTab, setActiveTab] = useState<'perfil' | 'esg' | 'dataroom'>('perfil');
  const [step, setStep] = useState<1 | 2>(1);
  const [orgType, setOrgType] = useState<OrgType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Autocomplete states
  const [countryQuery, setCountryQuery] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [sectorQuery, setSectorQuery] = useState('');
  const [sectorOpen, setSectorOpen] = useState(false);

  // External links chip state
  const [linkInput, setLinkInput] = useState('');

  // La descripción crece con el contenido (algunas son amplias); tope 480px con scroll.
  const descRef = useRef<HTMLTextAreaElement>(null);

  const [form, setForm] = useState({
    name:            '',
    tradeName:       '',   // nombre comercial (razón social ≠ nombre comercial)
    ruc:             '',
    institutionType: '',
    description:     '',
    phone:           '',
    website:         '',
    externalLinks:   [] as string[],
    country:         '',
    sector:          '',
  });

  // Carga la organización ACTIVA (la del selector), no la predeterminada: con
  // `get()` la vista mostraba siempre la más antigua y cambiar de empresa en el
  // selector no tenía ningún efecto aquí.
  useEffect(() => {
    orgRepo.getFull(getOrgActivaId())
      .then(org => {
        if (org) {
          setOrgType((org.type as OrgType) ?? null);
          setOrgId(org.id);
          if (org.imageUrl) {
            setLogoUrl(`/api/proxy/media/organization/${org.id}/logo?v=${Date.parse(org.updatedAt) || Date.now()}`);
          }
          setCountryQuery(org.country ?? '');
          setSectorQuery(org.sector ?? '');
          setForm({
            name:            org.name ?? '',
            tradeName:       (org as { tradeName?: string | null }).tradeName ?? '',
            ruc:             (org as { ruc?: string | null }).ruc ?? '',
            institutionType: org.institutionType ?? '',
            description:     org.description ?? '',
            phone:           org.phone ?? '',
            website:         org.website ?? '',
            externalLinks:   Array.isArray(org.externalLinks) ? org.externalLinks : [],
            country:         org.country ?? '',
            sector:          org.sector ?? '',
          });
          setStep(2);
        } else if (profile?.company) {
          setForm(f => ({ ...f, name: profile.company || '' }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orgRepo, profile]);

  const set = (key: keyof typeof form, value: string | string[]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // Auto-ajusta la altura de la descripción al contenido (también al cargar datos)
  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const capped = Math.min(el.scrollHeight, 480);
    el.style.height = `${capped}px`;
    el.style.overflowY = el.scrollHeight > 480 ? 'auto' : 'hidden';
  }, [form.description, step, activeTab]);

  const addLink = () => {
    const trimmed = linkInput.trim();
    if (!trimmed || form.externalLinks.includes(trimmed)) return;
    set('externalLinks', [...form.externalLinks, trimmed]);
    setLinkInput('');
  };

  const removeLink = (link: string) =>
    set('externalLinks', form.externalLinks.filter(l => l !== link));

  const filteredCountries = COUNTRIES.filter(c =>
    c.toLowerCase().includes(countryQuery.toLowerCase())
  ).slice(0, 8);

  const filteredSectors = INDUSTRY_SECTORS.filter(s =>
    s.toLowerCase().includes(sectorQuery.toLowerCase())
  ).slice(0, 8);

  const handleSelectCountry = (c: string) => {
    setCountryQuery(c);
    set('country', c);
    setCountryOpen(false);
  };

  const handleSelectSector = (s: string) => {
    setSectorQuery(s);
    set('sector', s);
    setSectorOpen(false);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !orgType) return;
    setSaving(true);
    setError(null);
    try {
      // PATCH sobre la que se está editando. Antes usaba save() (PUT), que
      // siempre escribe sobre la predeterminada: con dos empresas, editar la
      // segunda pisaba los datos de la primera.
      const payload = {
        type:            orgType,
        institutionType: form.institutionType || null,
        name:            form.name.trim(),
        tradeName:       form.tradeName.trim() || null,
        ruc:             form.ruc.trim() || null,
        description:     form.description || null,
        phone:           form.phone || null,
        website:         form.website || null,
        externalLinks:   form.externalLinks,
        country:         form.country || null,
        sector:          form.sector || null,
      };
      const saved = orgId
        ? await orgRepo.update(orgId, payload)
        : await orgRepo.create(payload);
      if (saved?.id) {
        setOrgId(saved.id);              // habilita la subida de logo al crear
        setOrgActivaId(saved.id);        // la recién creada pasa a ser la activa
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      // Se muestra el mensaje REAL del backend. Un genérico "no se pudo guardar"
      // ocultaría justo lo que el usuario necesita saber: que el RUC no es
      // válido, que ya está registrado, o que llegó al límite de organizaciones.
      setError(e instanceof Error ? e.message : 'No se pudo guardar. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const isAcademia = orgType === 'academia';
  const nameLabel = isAcademia ? 'Nombre de la institución *' : 'Nombre de la organización *';
  const namePlaceholder = isAcademia ? 'Ej. Universidad Nacional de Lima' : 'Ej. GENES PERÚ S.A.C.';
  const descLabel = isAcademia ? 'Descripción de la institución' : 'Descripción de la organización';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-light text-gray-900">Mi Organización</h1>
              <p className="text-sm text-gray-500">Gestiona el perfil y sostenibilidad de tu organización</p>
            </div>
          </div>

          {/* Selector de organización activa. Solo aparece si hay más de una o si
              puede agregar otra: con una sola empresa la vista queda igual que antes. */}
          <OrgSwitcher
            onChange={() => window.location.reload()}
            onAdd={() => {
              // El botón existía pero no hacía nada: OrgSwitcher llama onAdd?.()
              // y aquí no se le pasaba ninguno. Ahora vacía el formulario para
              // dar de alta una empresa nueva sin tocar la actual.
              setOrgId(null);
              setOrgType(null);
              setLogoUrl(null);
              setCountryQuery('');
              setSectorQuery('');
              setError(null);
              setForm({
                name: '', tradeName: '', ruc: '', institutionType: '',
                description: '', phone: '', website: '', externalLinks: [],
                country: '', sector: '',
              });
              setStep(1);
              setActiveTab('perfil');
            }}
          />
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('perfil')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'perfil'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('esg')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'esg'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Leaf className="w-4 h-4" />
            Índice ESG
          </button>
          <button
            onClick={() => setActiveTab('dataroom')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dataroom'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FolderLock className="w-4 h-4" />
            Dataroom
          </button>
        </div>

        {/* ESG Tab */}
        {activeTab === 'esg' && <EsgIndexPanel onNavigate={onNavigate} />}

        {/* Dataroom Tab */}
        {/* El dataroom es de la empresa que se esté viendo, no de la predeterminada. */}
        {activeTab === 'dataroom' && <Dataroom orgId={orgId ?? undefined} />}

        {/* Perfil Tab content */}
        {activeTab === 'perfil' && <>

        {/* Step indicator */}
        <div className="flex items-center mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
              step > 1 ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-emerald-500 text-emerald-600'
            }`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="text-sm font-medium hidden sm:inline">Tipo de usuario</span>
          </div>
          <div className="flex-1 h-px bg-gray-200 mx-4" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
              step === 2 ? 'border-emerald-500 text-emerald-600' : 'border-gray-300 text-gray-400'
            }`}>
              2
            </div>
            <span className="text-sm font-medium hidden sm:inline">Datos de la organización</span>
          </div>
        </div>

        {/* ── STEP 1: Tipo de usuario ── */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">Regístrate como</h2>
            <p className="text-sm text-gray-400 text-center mb-8">Selecciona el tipo que mejor describe tu organización</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ORG_TYPES.map(({ id, icon: Icon, label, description, color, activeColor }) => {
                const selected = orgType === id;
                return (
                  <button
                    key={id}
                    onClick={() => { setOrgType(id); setStep(2); }}
                    className={`p-6 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                      selected ? `${activeColor} shadow-lg scale-[1.02]` : `${color} bg-white`
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      selected ? 'bg-white/20' : 'bg-white shadow-sm'
                    }`}>
                      <Icon className={`w-6 h-6 ${selected ? 'text-white' : 'text-emerald-600'}`} />
                    </div>
                    <div className={`font-bold text-sm tracking-wide mb-2 ${selected ? 'text-white' : 'text-gray-800'}`}>
                      {label}
                    </div>
                    <div className={`text-xs leading-relaxed ${selected ? 'text-white/80' : 'text-gray-500'}`}>
                      {description}
                    </div>
                    {!selected && (
                      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-emerald-600">
                        Seleccionar <ChevronRight className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 2: Datos ── */}
        {step === 2 && orgType && (
          <div>
            {/* Type badge + change button */}
            <div className="flex items-center justify-between mb-6">
              {(() => {
                const t = ORG_TYPES.find(t => t.id === orgType)!;
                return (
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${t.textColor} bg-white border border-current`}>
                    <t.icon className="w-3.5 h-3.5" />
                    {t.sublabel}
                  </span>
                );
              })()}
              <button
                onClick={() => setStep(1)}
                className="text-xs text-gray-400 hover:text-gray-700 underline transition-colors"
              >
                Cambiar tipo
              </button>
            </div>

            {/* Logo de la organización */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 mb-5">
              <label className={labelCls}>Logo de la organización</label>
              {orgId ? (
                <ImageUploader
                  currentUrl={logoUrl}
                  endpoint="/api/proxy/media/organization/logo"
                  shape="square"
                  size={96}
                  label="Subir logo"
                  onUploaded={(url) => setLogoUrl(url)}
                />
              ) : (
                <p className="text-sm text-gray-400">
                  Guarda primero los datos de la organización para poder subir el logo.
                </p>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 space-y-5">

              {/* Name */}
              <div>
                <label className={labelCls}>{nameLabel}</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder={namePlaceholder}
                  className={inputCls}
                />
              </div>

              {/* Nombre comercial — razón social ≠ nombre comercial.
                  "QORY LABORATORIOS S.A.C." opera como "Qory Lab". */}
              <div>
                <label className={labelCls}>Nombre comercial</label>
                <input
                  type="text"
                  value={form.tradeName}
                  onChange={e => set('tradeName', e.target.value)}
                  placeholder="Con el que te conocen (opcional)"
                  className={inputCls}
                />
              </div>

              {/* RUC — el tipo (natural o jurídica) lo deduce el backend del
                  prefijo, y valida el dígito verificador. */}
              <div>
                <label className={labelCls}>RUC</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.ruc}
                  onChange={e => set('ruc', e.target.value)}
                  placeholder="11 dígitos · 10… persona natural · 20… empresa"
                  className={inputCls}
                  maxLength={13}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Puedes dejarlo en blanco y completarlo después.
                </p>
              </div>

              {/* Institution type — only for academia */}
              {isAcademia && (
                <div>
                  <label className={labelCls}>Tipo de institución *</label>
                  <select
                    value={form.institutionType}
                    onChange={e => set('institutionType', e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Seleccionar tipo...</option>
                    {INSTITUTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label className={labelCls}>{descLabel}</label>
                <textarea
                  ref={descRef}
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  placeholder="Breve descripción de la organización y su misión..."
                  rows={3}
                  className={`${inputCls} resize-none overflow-hidden`}
                />
              </div>

              {/* Phone */}
              <div>
                <label className={labelCls}>Teléfono de contacto</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set('phone', e.target.value)}
                    placeholder="Solo números con prefijo internacional (+51...)"
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className={labelCls}>Sitio web</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    value={form.website}
                    onChange={e => set('website', e.target.value)}
                    placeholder="https://..."
                    className={`${inputCls} pl-10`}
                  />
                </div>
              </div>

              {/* External links — chip input */}
              <div>
                <label className={labelCls}>Links externos</label>
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={linkInput}
                      onChange={e => setLinkInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
                      placeholder="https://linkedin.com/company/..."
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={addLink}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                {form.externalLinks.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.externalLinks.map(link => (
                      <span key={link} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 max-w-full">
                        <span className="truncate max-w-[200px]">{link}</span>
                        <button onClick={() => removeLink(link)} className="text-gray-400 hover:text-red-500 flex-shrink-0">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Country — searchable autocomplete */}
              <div className="relative">
                <label className={labelCls}>País</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <input
                    type="text"
                    value={countryQuery}
                    onChange={e => { setCountryQuery(e.target.value); set('country', e.target.value); setCountryOpen(true); }}
                    onFocus={() => setCountryOpen(true)}
                    onBlur={() => setTimeout(() => setCountryOpen(false), 150)}
                    placeholder="Seleccionar país..."
                    className={`${inputCls} pl-10`}
                  />
                </div>
                {countryOpen && filteredCountries.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {filteredCountries.map(c => (
                      <button
                        key={c}
                        type="button"
                        onMouseDown={() => handleSelectCountry(c)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sector — searchable autocomplete (not shown for academia) */}
              {!isAcademia && (
                <div className="relative">
                  <label className={labelCls}>Sector industrial</label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                    <input
                      type="text"
                      value={sectorQuery}
                      onChange={e => { setSectorQuery(e.target.value); set('sector', e.target.value); setSectorOpen(true); }}
                      onFocus={() => setSectorOpen(true)}
                      onBlur={() => setTimeout(() => setSectorOpen(false), 150)}
                      placeholder="Seleccionar sector..."
                      className={`${inputCls} pl-10`}
                    />
                  </div>
                  {sectorOpen && filteredSectors.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      {filteredSectors.map(s => (
                        <button
                          key={s}
                          type="button"
                          onMouseDown={() => handleSelectSector(s)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              {/* Actions */}
              <div className="pt-2">
                <button
                  onClick={handleSave}
                  disabled={!form.name.trim() || saving || (isAcademia && !form.institutionType)}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium transition-all text-sm ${
                    saved
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed'
                  }`}
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                  ) : saved ? (
                    <><Check className="w-4 h-4" /> Perfil guardado</>
                  ) : (
                    'Guardar perfil de organización'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        </>}
      </div>
    </div>
  );
}
