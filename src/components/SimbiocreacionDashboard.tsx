"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Network, Plus, ChevronDown, ChevronUp, Calendar, Globe,
  Tag, Lock, MapPin, Clock, ExternalLink, Leaf, Trash2,
  Pencil, Loader2, Copy, Check, MoreVertical, Users,
  BarChart2, Trophy, Search, ArrowLeft, X,
  Lightbulb, Settings, SlidersHorizontal,
} from 'lucide-react';
import { SimbiocreacionRepository } from '@/lib/repositories/simbiocreacion-repository';
import type { Simbiocreacion } from '@/lib/types/database';
import { useAuth } from '@/contexts/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────

type MainTab      = 'mis-simbios' | 'explora' | 'ranking';
type SubView      = 'lista' | 'crear' | 'editar' | 'detalle';
type ExploraFilter = 'todas' | 'proximas' | 'pasadas';
type ActivePanel  = null | 'nueva-idea' | 'mis-ideas' | 'busquedas' | 'opciones' | 'stats';

interface PublicSimbio extends Simbiocreacion {
  user?: { id: string; fullName: string | null; company: string | null };
}
interface RankingEntry {
  rank: number; userId: string; puntaje: number; total: number;
  user: { id: string; fullName: string | null; company: string | null } | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ODS_LIST = [
  { id: 1,  label: 'ODS 1 – Fin de la pobreza',               color: '#E5243B' },
  { id: 2,  label: 'ODS 2 – Hambre cero',                     color: '#DDA63A' },
  { id: 3,  label: 'ODS 3 – Salud y bienestar',               color: '#4C9F38' },
  { id: 4,  label: 'ODS 4 – Educación de calidad',            color: '#C5192D' },
  { id: 5,  label: 'ODS 5 – Igualdad de género',              color: '#FF3A21' },
  { id: 6,  label: 'ODS 6 – Agua limpia',                     color: '#26BDE2' },
  { id: 7,  label: 'ODS 7 – Energía asequible',               color: '#FCC30B' },
  { id: 8,  label: 'ODS 8 – Trabajo decente',                 color: '#A21942' },
  { id: 9,  label: 'ODS 9 – Industria e innovación',          color: '#FD6925' },
  { id: 10, label: 'ODS 10 – Reducción desigualdades',        color: '#DD1367' },
  { id: 11, label: 'ODS 11 – Ciudades sostenibles',           color: '#FD9D24' },
  { id: 12, label: 'ODS 12 – Producción responsable',         color: '#BF8B2E' },
  { id: 13, label: 'ODS 13 – Acción por el clima',            color: '#3F7E44' },
  { id: 14, label: 'ODS 14 – Vida submarina',                 color: '#0A97D9' },
  { id: 15, label: 'ODS 15 – Ecosistemas terrestres',         color: '#56C02B' },
  { id: 16, label: 'ODS 16 – Paz y justicia',                 color: '#00689D' },
  { id: 17, label: 'ODS 17 – Alianzas',                       color: '#19486A' },
];

const EMPTY_FORM = {
  nombre: '', lugar: '', fecha: '', horaInicio: '', descripcion: '',
  privado: false, establecerHora: false, link: '', tags: '', extraUrls: '', ods: [] as number[],
};

const inputClass =
  'w-full px-0 py-3 border-0 border-b border-gray-200 bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-colors';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: 'include' });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

// ── Network Graph ─────────────────────────────────────────────────────────────

interface GraphNode {
  id: string; label: string; type: 'center' | 'category' | 'group' | 'person';
  x: number; y: number; vx: number; vy: number; r: number; color: string;
}
interface GraphEdge { from: string; to: string }

function buildGraph(item: Simbiocreacion, width: number, height: number) {
  const cx = width / 2; const cy = height / 2;
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  nodes.push({ id: 'root', label: item.nombre.toUpperCase(), type: 'center',
    x: cx, y: cy, vx: 0, vy: 0, r: 52, color: '#0d9488' });

  const cats = item.ods.length > 0
    ? item.ods.slice(0, 4).map((o, i) => ({
        id: `cat-${i}`, label: `ODS ${o}`,
        color: ODS_LIST.find(l => l.id === o)?.color ?? '#f59e0b',
      }))
    : [
        { id: 'cat-0', label: 'Categoría 1', color: '#f59e0b' },
        { id: 'cat-1', label: 'Categoría 2', color: '#ec4899' },
        { id: 'cat-2', label: 'Categoría 3', color: '#8b5cf6' },
      ];

  const catAngleStep = (2 * Math.PI) / cats.length;
  cats.forEach((cat, i) => {
    const angle = catAngleStep * i - Math.PI / 2;
    const dist = Math.min(width, height) * 0.26;
    nodes.push({ id: cat.id, label: cat.label, type: 'category',
      x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist,
      vx: 0, vy: 0, r: 30, color: cat.color });
    edges.push({ from: 'root', to: cat.id });

    const groupNames = item.tags.slice(i * 2, i * 2 + 2);
    const gCount = groupNames.length > 0 ? groupNames.length : 2;
    for (let g = 0; g < gCount; g++) {
      const gId = `grp-${i}-${g}`;
      const gLabel = groupNames[g] ? `G${i * 2 + g + 1}-${groupNames[g].slice(0, 8)}` : `G${i * 2 + g + 1}`;
      const gAngle = angle + (g === 0 ? -0.55 : 0.55);
      const gDist = Math.min(width, height) * 0.44;
      nodes.push({ id: gId, label: gLabel, type: 'group',
        x: cx + Math.cos(gAngle) * gDist, y: cy + Math.sin(gAngle) * gDist,
        vx: 0, vy: 0, r: 22, color: '#ec4899' });
      edges.push({ from: cat.id, to: gId });

      for (let p = 0; p < 2; p++) {
        const pId = `prs-${i}-${g}-${p}`;
        const pAngle = gAngle + (p === 0 ? -0.45 : 0.45);
        const pDist = Math.min(width, height) * 0.58;
        nodes.push({ id: pId, label: '●', type: 'person',
          x: cx + Math.cos(pAngle) * pDist, y: cy + Math.sin(pAngle) * pDist,
          vx: 0, vy: 0, r: 12, color: '#94a3b8' });
        edges.push({ from: gId, to: pId });
      }
    }
  });

  return { nodes, edges };
}

function NetworkGraph({
  item,
  physicsForce    = 0.04,
  physicsDistance = 40,
  physicsOrder    = 0.003,
  onNodeClick,
}: {
  item: Simbiocreacion;
  physicsForce?: number;
  physicsDistance?: number;
  physicsOrder?: number;
  onNodeClick?: (node: GraphNode) => void;
}) {
  const svgRef    = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 480 });
  const animRef   = useRef<number>(0);
  const nodesRef  = useRef<GraphNode[]>([]);
  const edgesRef  = useRef<GraphEdge[]>([]);
  const [tick, setTick] = useState(0);

  // Physics refs
  const forceRef  = useRef(physicsForce);
  const distRef   = useRef(physicsDistance);
  const orderRef  = useRef(physicsOrder);
  useEffect(() => { forceRef.current = physicsForce; },    [physicsForce]);
  useEffect(() => { distRef.current  = physicsDistance; }, [physicsDistance]);
  useEffect(() => { orderRef.current = physicsOrder; },    [physicsOrder]);

  // View transform (pan + zoom)
  const [vt, setVt] = useState({ x: 0, y: 0, scale: 1 });
  const vtRef = useRef({ x: 0, y: 0, scale: 1 });
  const updateVt = useCallback((next: typeof vt) => { vtRef.current = next; setVt(next); }, []);

  // Interaction state (drag node / pan background)
  const inter = useRef({
    mode: 'idle' as 'idle' | 'drag' | 'pan',
    nodeId: '',
    startCX: 0, startCY: 0,
    startNX: 0, startNY: 0,
    startTX: 0, startTY: 0,
    moved: false,
  });
  // Node being dragged is pinned (not affected by forces)
  const pinnedRef = useRef<string | null>(null);

  // ResizeObserver
  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(es => {
      const r = es[0].contentRect;
      setDims({ w: r.width, h: Math.max(420, r.height) });
    });
    ro.observe(el);
    setDims({ w: el.clientWidth, h: Math.max(420, el.clientHeight) });
    return () => ro.disconnect();
  }, []);

  // Rebuild graph when item/dims change
  useEffect(() => {
    const { nodes, edges } = buildGraph(item, dims.w, dims.h);
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [item, dims]);

  // Physics loop
  useEffect(() => {
    const cx = dims.w / 2; const cy = dims.h / 2;
    let frame = 0;
    const step = () => {
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      if (!nodes.length) { animRef.current = requestAnimationFrame(step); return; }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x; const dy = nodes[j].y - nodes[i].y;
          const d = Math.sqrt(dx*dx + dy*dy) || 1;
          const min = nodes[i].r + nodes[j].r + 18;
          if (d < min) {
            const f = (min - d) / d * 0.12;
            nodes[i].vx -= dx*f; nodes[i].vy -= dy*f;
            nodes[j].vx += dx*f; nodes[j].vy += dy*f;
          }
        }
      }
      const nmap = Object.fromEntries(nodes.map(n => [n.id, n]));
      for (const e of edges) {
        const a = nmap[e.from]; const b = nmap[e.to]; if (!a || !b) continue;
        const dx = b.x-a.x; const dy = b.y-a.y;
        const d = Math.sqrt(dx*dx + dy*dy) || 1;
        const tgt = a.r + b.r + distRef.current;
        const f = (d - tgt) / d * forceRef.current;
        a.vx += dx*f; a.vy += dy*f; b.vx -= dx*f; b.vy -= dy*f;
      }
      for (const n of nodes) {
        if (n.type === 'center') { n.x = cx; n.y = cy; n.vx = 0; n.vy = 0; continue; }
        if (n.id === pinnedRef.current) { n.vx = 0; n.vy = 0; continue; }
        n.vx += (cx - n.x) * orderRef.current;
        n.vy += (cy - n.y) * orderRef.current;
        n.vx *= 0.85; n.vy *= 0.85;
        n.x += n.vx; n.y += n.vy;
        n.x = Math.max(n.r+4, Math.min(dims.w-n.r-4, n.x));
        n.y = Math.max(n.r+4, Math.min(dims.h-n.r-4, n.y));
      }
      frame++;
      if (frame % 3 === 0) setTick(t => t+1);
      animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [dims]);

  // Non-passive wheel listener (needed to preventDefault scroll)
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1.12 : 0.88;
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const prev = vtRef.current;
      const next = {
        scale: Math.max(0.15, Math.min(6, prev.scale * delta)),
        x: mx - (mx - prev.x) * delta,
        y: my - (my - prev.y) * delta,
      };
      updateVt(next);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [updateVt]);

  // Mouse handlers
  const handleNodeDown = (e: React.MouseEvent, node: GraphNode) => {
    e.stopPropagation();
    inter.current = { mode: 'drag', nodeId: node.id, startCX: e.clientX, startCY: e.clientY,
      startNX: node.x, startNY: node.y, startTX: 0, startTY: 0, moved: false };
    pinnedRef.current = node.id;
  };

  const handleBgDown = (e: React.MouseEvent) => {
    inter.current = { mode: 'pan', nodeId: '', startCX: e.clientX, startCY: e.clientY,
      startNX: 0, startNY: 0, startTX: vtRef.current.x, startTY: vtRef.current.y, moved: false };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const it = inter.current;
    if (it.mode === 'idle') return;
    const dx = e.clientX - it.startCX; const dy = e.clientY - it.startCY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) it.moved = true;

    if (it.mode === 'drag') {
      const node = nodesRef.current.find(n => n.id === it.nodeId);
      if (node) {
        node.x = it.startNX + dx / vtRef.current.scale;
        node.y = it.startNY + dy / vtRef.current.scale;
        setTick(t => t+1);
      }
    } else if (it.mode === 'pan') {
      updateVt({ ...vtRef.current, x: it.startTX + dx, y: it.startTY + dy });
    }
  };

  const handleMouseUp = () => {
    const it = inter.current;
    if (!it.moved && it.mode === 'drag' && onNodeClick) {
      const node = nodesRef.current.find(n => n.id === it.nodeId);
      if (node) onNodeClick(node);
    }
    pinnedRef.current = null;
    inter.current.mode = 'idle';
  };

  const nodes = nodesRef.current;
  const edges = edgesRef.current;
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  void tick;

  const cursor = inter.current.mode === 'pan' ? 'cursor-grabbing'
    : inter.current.mode === 'drag' ? 'cursor-grabbing' : 'cursor-grab';

  return (
    <svg ref={svgRef} width={dims.w} height={dims.h}
      className={`select-none ${cursor}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}>
      <g transform={`translate(${vt.x},${vt.y}) scale(${vt.scale})`}>
        {/* Background rect captures pan events */}
        <rect x={-dims.w*2} y={-dims.h*2} width={dims.w*5} height={dims.h*5}
          fill="transparent" onMouseDown={handleBgDown} />
        {/* Edges */}
        {edges.map((e, i) => {
          const a = nodeMap[e.from]; const b = nodeMap[e.to]; if (!a || !b) return null;
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke="#cbd5e1" strokeWidth={1.5} strokeOpacity={0.7} />;
        })}
        {/* Nodes */}
        {nodes.map(n => (
          <g key={n.id} style={{ cursor: n.type !== 'person' ? 'pointer' : 'grab' }}
            onMouseDown={e => handleNodeDown(e, n)}>
            <circle cx={n.x} cy={n.y} r={n.r + 6} fill="transparent" />
            <circle cx={n.x} cy={n.y} r={n.r} fill={n.color}
              fillOpacity={n.type === 'person' ? 0.45 : 0.92}
              stroke={n.type === 'center' ? '#fff' : 'transparent'}
              strokeWidth={n.type === 'center' ? 3 : 0} />
            {n.type !== 'person' && (
              <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="middle"
                fill="white" fontSize={n.type === 'center' ? 9 : n.type === 'category' ? 8 : 7}
                fontWeight={n.type === 'center' ? '700' : '500'}
                style={{ pointerEvents: 'none' }}>
                {n.label.length > 12 ? n.label.slice(0, 11) + '…' : n.label}
              </text>
            )}
          </g>
        ))}
      </g>
    </svg>
  );
}

// ── Stats Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className={`rounded-2xl p-5 text-white ${accent}`}>
      <div className="text-sm font-medium opacity-80 mb-1">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}

// ── Share Row ─────────────────────────────────────────────────────────────────

function ShareRow({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://eywa-hazel.vercel.app/?simbio=${id}`;
  const copy = () => {
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="text-xs text-gray-400">Link para compartir</span>
      <span className="text-xs text-gray-500 truncate max-w-[220px] font-mono">{url}</span>
      <button onClick={copy} className="text-gray-400 hover:text-teal-600 transition-colors flex-shrink-0">
        {copied ? <Check className="w-3.5 h-3.5 text-teal-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// ── Explora Card ──────────────────────────────────────────────────────────────

function ExploraCard({ item }: { item: PublicSimbio }) {
  const initials = (item.user?.fullName ?? item.user?.company ?? '?')
    .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const timeAgo = (() => {
    const diff = Date.now() - new Date(item.updatedAt).getTime();
    const d = Math.floor(diff / 86400000);
    if (d === 0) return 'hoy';
    if (d === 1) return 'ayer';
    if (d < 30) return `hace ${d} días`;
    const m = Math.floor(d / 30);
    if (m < 12) return `hace ${m} ${m === 1 ? 'mes' : 'meses'}`;
    return `hace ${Math.floor(m / 12)} año(s)`;
  })();
  const hasDate = !!item.fecha;
  const dateLabel = hasDate ? new Date(item.fecha!).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group">
      {hasDate && <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">{dateLabel}</div>}
      <h3 className="font-bold text-gray-900 text-sm mb-3 group-hover:text-teal-700 transition-colors line-clamp-2">{item.nombre}</h3>
      <div className="flex items-center gap-1 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
          {initials}
        </div>
        {item.ods.slice(0, 3).map(o => (
          <div key={o} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: ODS_LIST.find(l => l.id === o)?.color ?? '#94a3b8' }}>
            {o}
          </div>
        ))}
        {item.ods.length > 3 && (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">+{item.ods.length - 3}</div>
        )}
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Clock className="w-3 h-3" />{timeAgo}
      </div>
    </div>
  );
}

// ── Slider helper ─────────────────────────────────────────────────────────────

function PhysicsSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-400 text-xs">{value}</span>
      </div>
      <input type="range" min={1} max={100} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-teal-600 cursor-pointer" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SimbiocreacionDashboard() {
  const { user } = useAuth();
  const simbiRepo = useMemo(() => new SimbiocreacionRepository(), []);

  // ── Core state ─────────────────────────────────────────────────────────────
  const [mainTab,   setMainTab]   = useState<MainTab>('mis-simbios');
  const [subView,   setSubView]   = useState<SubView>('lista');
  const [items,     setItems]     = useState<Simbiocreacion[]>([]);
  const [selected,  setSelected]  = useState<Simbiocreacion | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [masDetalles, setMasDetalles] = useState(false);
  const [form,      setForm]      = useState({ ...EMPTY_FORM });
  const [openMenu,  setOpenMenu]  = useState<string | null>(null);

  // ── Idea detail (clicking a node / idea item) ─────────────────────────────
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  // helper: find hierarchy chips for a tag index
  const getTagHierarchy = useCallback((tagIdx: number, simbio: Simbiocreacion) => {
    const cats = simbio.ods.length > 0
      ? simbio.ods.slice(0, 4).map((o, i) => ({ id: `cat-${i}`, label: `ODS ${o}` }))
      : [{ id: 'cat-0', label: 'Categoría 1' }, { id: 'cat-1', label: 'Categoría 2' }, { id: 'cat-2', label: 'Categoría 3' }];
    const cat = cats[Math.floor(tagIdx / 2)] ?? cats[0];
    return { nivel1: simbio.nombre, nivel2: cat.label };
  }, []);

  // ── Panel state (detail view floating UI) ─────────────────────────────────
  const [activePanel,        setActivePanel]        = useState<ActivePanel>(null);
  const [busquedasTab,       setBusquedasTab]        = useState<'grupos' | 'participantes'>('grupos');
  const [nuevaIdeaConfirmed, setNuevaIdeaConfirmed] = useState(false);
  const [nuevaIdeaName,      setNuevaIdeaName]      = useState('');
  const [addingIdea,         setAddingIdea]         = useState(false);
  // Physics sliders (0–100)
  const [sliderForce,    setSliderForce]    = useState(50);
  const [sliderDistance, setSliderDistance] = useState(50);
  const [sliderOrder,    setSliderOrder]    = useState(50);

  // ── Explora ────────────────────────────────────────────────────────────────
  const [explora,        setExplora]        = useState<PublicSimbio[]>([]);
  const [exploraFilter,  setExploraFilter]  = useState<ExploraFilter>('todas');
  const [exploraLoading, setExploraLoading] = useState(false);

  // ── Ranking ────────────────────────────────────────────────────────────────
  const [ranking,        setRanking]        = useState<RankingEntry[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  // ── Load own simbiocreaciones ──────────────────────────────────────────────
  const loadItems = useCallback(async () => {
    try { setItems(await simbiRepo.getAll()); } catch { /* */ }
    finally { setLoading(false); }
  }, [simbiRepo]);
  useEffect(() => { loadItems(); }, [loadItems]);

  // ── Load Explora ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (mainTab !== 'explora') return;
    setExploraLoading(true);
    apiFetch<{ simbiocreaciones: PublicSimbio[] }>('/api/proxy/simbiocreacion/public')
      .then(d => setExplora(d.simbiocreaciones ?? []))
      .catch(() => {})
      .finally(() => setExploraLoading(false));
  }, [mainTab]);

  // ── Load Ranking ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (mainTab !== 'ranking') return;
    setRankingLoading(true);
    apiFetch<{ ranking: RankingEntry[] }>('/api/proxy/simbiocreacion/ranking')
      .then(d => setRanking(d.ranking ?? []))
      .catch(() => {})
      .finally(() => setRankingLoading(false));
  }, [mainTab]);

  // ── Form helpers ───────────────────────────────────────────────────────────
  const set = (key: keyof typeof form, value: unknown) =>
    setForm(prev => ({ ...prev, [key]: value }));
  const toggleOds = (id: number) =>
    setForm(prev => ({ ...prev, ods: prev.ods.includes(id) ? prev.ods.filter(o => o !== id) : [...prev.ods, id] }));
  const parseTags = (s: string) => s.split(',').map(t => t.trim()).filter(Boolean);

  const openCrear = () => { setForm({ ...EMPTY_FORM }); setMasDetalles(false); setEditingId(null); setSubView('crear'); };
  const openEditar = (item: Simbiocreacion) => {
    setForm({
      nombre: item.nombre, lugar: item.lugar ?? '', fecha: item.fecha ?? '',
      horaInicio: item.horaInicio ?? '', descripcion: item.descripcion ?? '',
      privado: item.privado, establecerHora: !!item.horaInicio,
      link: item.link ?? '', tags: item.tags.join(', '),
      extraUrls: item.extraUrls.join(', '), ods: item.ods,
    });
    setMasDetalles(false); setEditingId(item.id); setSubView('editar'); setOpenMenu(null);
  };
  const openDetalle = (item: Simbiocreacion) => {
    setSelected(item); setSubView('detalle');
    setOpenMenu(null); setActivePanel(null);
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    const payload = {
      nombre: form.nombre, privado: form.privado,
      lugar: form.lugar || null, fecha: form.fecha || null,
      horaInicio: form.establecerHora ? (form.horaInicio || null) : null,
      descripcion: form.descripcion || null, link: form.link || null,
      tags: parseTags(form.tags), extraUrls: parseTags(form.extraUrls), ods: form.ods,
    };
    try {
      if (editingId) { await simbiRepo.update(editingId, payload); await loadItems(); }
      else { const c = await simbiRepo.create(payload); setItems(p => [c, ...p]); }
      setSubView('lista');
    } catch { /* */ } finally { setSaving(false); }
  };

  const handleEliminar = async (id: string) => {
    try { await simbiRepo.delete(id); setItems(p => p.filter(i => i.id !== id)); } catch { /* */ }
    setOpenMenu(null);
  };

  // ── Add idea (Nueva idea button) ───────────────────────────────────────────
  const handleAddIdea = async () => {
    if (!nuevaIdeaName.trim() || !selected) return;
    setAddingIdea(true);
    const newTags = [...selected.tags, nuevaIdeaName.trim()];
    try {
      await simbiRepo.update(selected.id, { tags: newTags });
      const updated = { ...selected, tags: newTags };
      setSelected(updated);
      setItems(prev => prev.map(i => i.id === selected.id ? updated : i));
      setNuevaIdeaName('');
      setNuevaIdeaConfirmed(false);
      setActivePanel(null);
    } catch { /* */ } finally { setAddingIdea(false); }
  };

  // ── Derived: groups list for Búsquedas panel ───────────────────────────────
  const graphGrupos = useMemo(() => {
    if (!selected) return [];
    type GrupoItem = { id: string; label: string; nodos: number };
    const result: GrupoItem[] = [];

    const cats = selected.ods.length > 0
      ? selected.ods.slice(0, 4).map((o, i) => ({ id: `cat-${i}`, label: `ODS ${o}` }))
      : [{ id: 'cat-0', label: 'Categoría 1' }, { id: 'cat-1', label: 'Categoría 2' }, { id: 'cat-2', label: 'Categoría 3' }];

    result.push({ id: 'root', label: selected.nombre, nodos: cats.length });

    cats.forEach((cat, i) => {
      const groupTags = selected.tags.slice(i * 2, i * 2 + 2);
      const gCount = Math.max(groupTags.length, 2);
      result.push({ id: cat.id, label: cat.label, nodos: gCount });
      for (let g = 0; g < gCount; g++) {
        const gLabel = groupTags[g] ? `G${i * 2 + g + 1}-${groupTags[g]}` : `G${i * 2 + g + 1}`;
        result.push({ id: `grp-${i}-${g}`, label: gLabel, nodos: 2 });
      }
    });
    return result;
  }, [selected]);

  // ── Physics values mapped from 0–100 sliders ──────────────────────────────
  const physicsForce    = 0.01 + (sliderForce    / 100) * 0.09;   // 0.01–0.10
  const physicsDistance = 10  + (sliderDistance  / 100) * 100;    // 10–110
  const physicsOrder    = 0.001 + (sliderOrder   / 100) * 0.015;  // 0.001–0.016

  // ── Stats derived from selected ────────────────────────────────────────────
  const statsParticipantes = selected ? selected.tags.length * 2 : 0;
  const statsIdeas         = selected ? selected.tags.length : 0;
  const statsOds           = selected ? selected.ods.length : 0;

  // ── Other derived ──────────────────────────────────────────────────────────
  const totalIdeas = items.reduce((s, i) => s + i.tags.length, 0);
  const totalOds   = new Set(items.flatMap(i => i.ods)).size;
  const puntaje    = items.length * 10 + totalIdeas * 5;

  const filteredExplora = useMemo(() => {
    const now = Date.now();
    return explora.filter(e => {
      if (exploraFilter === 'todas') return true;
      if (!e.fecha) return exploraFilter === 'pasadas';
      const d = new Date(e.fecha).getTime();
      return exploraFilter === 'proximas' ? d > now : d <= now;
    });
  }, [explora, exploraFilter]);

  const goLista = () => { setSubView('lista'); setSelected(null); setActivePanel(null); setSelectedNode(null); };

  const closePanel = () => {
    setActivePanel(null);
    setNuevaIdeaConfirmed(false);
    setNuevaIdeaName('');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── TOP BAR ────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-2 py-0">

          {subView !== 'lista' && mainTab === 'mis-simbios' && (
            <button onClick={goLista}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 pr-4 border-r border-gray-200 mr-2 py-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />Mis Simbios
            </button>
          )}

          {(subView === 'lista' || mainTab !== 'mis-simbios') && (
            <div className="flex gap-0 flex-1">
              {([
                ['mis-simbios', 'Mis Simbios', Network],
                ['explora',     'Explora',     Search],
                ['ranking',     'Ranking',     Trophy],
              ] as const).map(([id, label, Icon]) => (
                <button key={id}
                  onClick={() => { setMainTab(id); if (id === 'mis-simbios') setSubView('lista'); }}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all ${
                    mainTab === id ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}>
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>
          )}

          {subView !== 'lista' && mainTab === 'mis-simbios' && (
            <div className="flex-1 flex items-center py-4">
              <span className="font-semibold text-gray-900 text-sm">
                {subView === 'crear' ? 'Nueva simbiocreación'
                  : subView === 'editar' ? 'Editar simbiocreación'
                  : selected?.nombre ?? ''}
              </span>
              {selected && !selected.privado && (
                <span className="ml-2 flex items-center gap-1 text-xs text-gray-400">
                  <Globe className="w-3.5 h-3.5" /> público
                </span>
              )}
              {selected?.privado && (
                <span className="ml-2 flex items-center gap-1 text-xs text-gray-400">
                  <Lock className="w-3.5 h-3.5" /> privado
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MIS SIMBIOS                                                         */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {mainTab === 'mis-simbios' && (
        <>
          {/* ── LISTA ── */}
          {subView === 'lista' && (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <StatCard label="Puntaje"                value={puntaje}      accent="bg-gradient-to-br from-pink-500 to-rose-600" />
                <StatCard label="Total Simbiocreaciones" value={items.length} accent="bg-gradient-to-br from-pink-400 to-pink-500" />
                <StatCard label="Total Ideas / Tags"     value={totalIdeas}   accent="bg-gradient-to-br from-pink-300 to-pink-400" />
                <StatCard label="ODS Relacionados"       value={totalOds}     accent="bg-gradient-to-br from-pink-200 to-pink-300" />
              </div>

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Mis Simbiocreaciones</h2>
                <button onClick={openCrear}
                  className="flex items-center gap-2 px-5 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-semibold hover:bg-pink-600 transition-all shadow-sm">
                  <Plus className="w-4 h-4" /> Nueva simbiocreación
                </button>
              </div>

              {items.length > 0 && (
                <div className="hidden md:grid grid-cols-[1fr_140px_160px_40px] gap-4 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <span>Nombre</span>
                  <span className="text-center">Grupos</span>
                  <span className="text-center">Última modificación</span>
                  <span />
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
                </div>
              ) : items.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
                  <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Network className="w-8 h-8 text-teal-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin simbiocreaciones aún</h3>
                  <p className="text-sm text-gray-400 mb-6">Crea tu primera sesión de co-creación colaborativa.</p>
                  <button onClick={openCrear}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-all">
                    <Plus className="w-4 h-4" /> Nueva simbiocreación
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 hover:shadow-sm hover:border-teal-200 transition-all">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_160px_40px] gap-2 items-center">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={() => openDetalle(item)}
                              className="font-semibold text-teal-700 hover:text-teal-900 text-sm transition-colors text-left">
                              {item.nombre}
                            </button>
                            {item.privado
                              ? <Lock className="w-3.5 h-3.5 text-gray-400" />
                              : <Globe className="w-3.5 h-3.5 text-gray-400" />}
                            {item.ods.length > 0 && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Leaf className="w-3 h-3" /> {item.ods.length} ODS
                              </span>
                            )}
                          </div>
                          <ShareRow id={item.id} />
                        </div>
                        <div className="text-sm text-gray-500 text-center">{item.tags.length} grupos</div>
                        <div className="text-xs text-gray-400 text-center">
                          {new Date(item.updatedAt).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="relative flex justify-end">
                          <button onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenu === item.id && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-40 py-1 text-sm">
                              <button onClick={() => openDetalle(item)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-gray-700 hover:bg-gray-50">
                                <Network className="w-4 h-4" /> Ver red
                              </button>
                              <button onClick={() => openEditar(item)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-gray-700 hover:bg-gray-50">
                                <Pencil className="w-4 h-4" /> Editar
                              </button>
                              <hr className="my-1 border-gray-100" />
                              <button onClick={() => handleEliminar(item.id)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-red-500 hover:bg-red-50">
                                <Trash2 className="w-4 h-4" /> Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 text-right pt-1">1 – {items.length} de {items.length}</p>
                </div>
              )}
            </div>
          )}

          {/* ── DETALLE / RED ── */}
          {subView === 'detalle' && selected && (
            <div className="flex flex-col md:flex-row h-[calc(100vh-57px)]">

              {/* Network canvas */}
              <div className="flex-1 bg-[#f8f9fb] relative overflow-hidden">
                <NetworkGraph
                  item={selected}
                  physicsForce={physicsForce}
                  physicsDistance={physicsDistance}
                  physicsOrder={physicsOrder}
                  onNodeClick={node => {
                    if (node.type !== 'person') setSelectedNode(node);
                  }}
                />

                {/* ══════════════════════════════════════════════════════════ */}
                {/* IDEA DETAIL PANEL (click on node)                          */}
                {/* ══════════════════════════════════════════════════════════ */}
                {selectedNode && (
                  <div className="absolute right-4 top-16 w-72 bg-white rounded-2xl shadow-2xl z-20 overflow-hidden border border-gray-100 flex flex-col max-h-[calc(100%-5rem)]">
                    {/* Header */}
                    <div className="bg-pink-500 px-4 py-3 flex-shrink-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-white text-xs font-semibold leading-tight truncate">
                          {selectedNode.type === 'center' ? 'Simbiocreación'
                            : selectedNode.type === 'category' ? 'Categoría'
                            : `Idea de ${selected?.nombre ?? ''}`}
                        </p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button onClick={() => setSelectedNode(null)}
                            className="text-white/80 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {/* Title */}
                      <h3 className="text-base font-bold text-gray-900 break-words">
                        {selectedNode.label}
                      </h3>

                      {/* Description (from simbio if center node) */}
                      {selectedNode.type === 'center' && selected?.descripcion && (
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {selected.descripcion}
                        </p>
                      )}

                      {/* Node type badge */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: selectedNode.color }}>
                          {selectedNode.type === 'center' ? 'Centro' : selectedNode.type === 'category' ? 'Categoría' : 'Grupo'}
                        </span>
                        {selectedNode.type !== 'center' && selected && (
                          <>
                            <span className="text-gray-300 text-xs">&lt;</span>
                            <span className="px-2 py-0.5 rounded-full border border-gray-300 text-xs text-gray-600">
                              Nivel 1: {selected.nombre.slice(0, 14)}
                            </span>
                            <span className="text-gray-300 text-xs">&gt;</span>
                          </>
                        )}
                      </div>

                      {/* ODS chips if category */}
                      {selectedNode.type === 'category' && selected && selected.ods.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">ODS Relacionados</p>
                          <div className="flex flex-wrap gap-1.5">
                            {selected.ods.map(o => {
                              const ods = ODS_LIST.find(l => l.id === o);
                              return (
                                <span key={o} className="px-2 py-0.5 rounded-lg text-white text-xs font-medium"
                                  style={{ backgroundColor: ods?.color ?? '#94a3b8' }}>ODS {o}</span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* External links */}
                      {selectedNode.type === 'center' && selected?.extraUrls && selected.extraUrls.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Enlaces externos</p>
                          <ul className="space-y-1">
                            {selected.extraUrls.map((url, i) => (
                              <li key={i} className="text-xs text-teal-600 flex items-center gap-1">
                                <span className="text-gray-400">•</span>
                                <a href={url.startsWith('http') ? url : `https://${url}`}
                                  target="_blank" rel="noopener noreferrer"
                                  className="truncate hover:underline">{url}</a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Comments section */}
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          0 comentarios
                        </p>
                        <div className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">
                              {(selected?.nombre ?? 'U')[0].toUpperCase()}
                            </span>
                          </div>
                          <textarea
                            placeholder="Escribe tu comentario..."
                            rows={2}
                            className="flex-1 text-xs border-0 border-b border-gray-200 bg-transparent resize-none focus:outline-none focus:border-teal-400 placeholder-gray-400 text-gray-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── 5 Floating action buttons ── */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
                  {([
                    { icon: Plus,        label: 'Nueva idea',   panel: 'nueva-idea'  },
                    { icon: Lightbulb,   label: 'Mis ideas',    panel: 'mis-ideas'   },
                    { icon: Users,       label: 'Búsquedas',    panel: 'busquedas'   },
                    { icon: Settings,    label: 'Opciones',     panel: 'opciones'    },
                    { icon: BarChart2,   label: 'Stats',        panel: 'stats'       },
                  ] as const).map(({ icon: Icon, label, panel }) => (
                    <button key={panel} title={label}
                      onClick={() => setActivePanel(activePanel === panel ? null : panel)}
                      className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all ${
                        activePanel === panel
                          ? 'bg-pink-600 text-white scale-110 ring-2 ring-pink-300'
                          : 'bg-pink-500 text-white hover:bg-pink-600'
                      }`}>
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>

                {/* ── Info overlay top-right ── */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 px-4 py-3 shadow-sm text-sm text-gray-700 space-y-1 max-w-[200px] z-10">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-600" />
                    <span className="font-medium">{statsParticipantes} participantes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Network className="w-4 h-4 text-pink-500" />
                    <span className="font-medium">{selected.tags.length} grupos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium">{selected.ods.length} ODS</span>
                  </div>
                </div>

                {/* ══════════════════════════════════════════════════════════ */}
                {/* PANEL: Nueva idea (modal centrado)                         */}
                {/* ══════════════════════════════════════════════════════════ */}
                {activePanel === 'nueva-idea' && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-6 overflow-hidden">
                      {!nuevaIdeaConfirmed ? (
                        // Step 1: confirmación
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">¿Agregar una nueva idea?</h3>
                            <button onClick={closePanel} className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2">
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-500 mb-6">
                            Se agregará una nueva idea (nodo) al grafo de la simbiocreación.
                          </p>
                          <div className="flex gap-3">
                            <button onClick={closePanel}
                              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                              Cancelar
                            </button>
                            <button onClick={() => setNuevaIdeaConfirmed(true)}
                              className="flex-1 px-4 py-2.5 text-sm font-medium bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all">
                              Confirmar
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Step 2: nombre de la idea
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Nueva idea</h3>
                            <button onClick={closePanel} className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2">
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                          <input
                            autoFocus
                            type="text"
                            placeholder="Nombre de la nueva idea"
                            value={nuevaIdeaName}
                            onChange={e => setNuevaIdeaName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleAddIdea(); }}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400 mb-4"
                          />
                          <div className="flex gap-3">
                            <button onClick={() => { setNuevaIdeaConfirmed(false); setNuevaIdeaName(''); }}
                              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                              Atrás
                            </button>
                            <button onClick={handleAddIdea}
                              disabled={!nuevaIdeaName.trim() || addingIdea}
                              className="flex-1 px-4 py-2.5 text-sm font-medium bg-pink-500 text-white rounded-xl hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                              {addingIdea ? <><Loader2 className="w-4 h-4 animate-spin" />Agregando…</> : 'Agregar'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════════════════════════════════ */}
                {/* PANEL: Opciones (modal centrado con sliders)               */}
                {/* ══════════════════════════════════════════════════════════ */}
                {activePanel === 'opciones' && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-6 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Opciones</h3>
                        <button onClick={closePanel} className="text-gray-400 hover:text-gray-600">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-6">
                        <PhysicsSlider label="Fuerza"    value={sliderForce}    onChange={setSliderForce} />
                        <PhysicsSlider label="Distancia" value={sliderDistance} onChange={setSliderDistance} />
                        <PhysicsSlider label="Orden"     value={sliderOrder}    onChange={setSliderOrder} />
                      </div>
                      <button onClick={() => { setSliderForce(50); setSliderDistance(50); setSliderOrder(50); }}
                        className="mt-6 w-full text-xs text-gray-400 hover:text-gray-600 transition-colors">
                        Restablecer valores por defecto
                      </button>
                    </div>
                  </div>
                )}

                {/* ══════════════════════════════════════════════════════════ */}
                {/* SIDE PANELS: Mis ideas / Búsquedas / Stats                 */}
                {/* ══════════════════════════════════════════════════════════ */}
                {(activePanel === 'mis-ideas' || activePanel === 'busquedas' || activePanel === 'stats') && (
                  <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-20 flex flex-col overflow-hidden border-r border-gray-100">

                    {/* Panel header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        {activePanel === 'mis-ideas'  && <Lightbulb className="w-5 h-5 text-pink-500" />}
                        {activePanel === 'busquedas'  && <Users     className="w-5 h-5 text-teal-600" />}
                        {activePanel === 'stats'      && <BarChart2  className="w-5 h-5 text-teal-600" />}
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {activePanel === 'mis-ideas' ? 'Mi(s) idea(s)'
                            : activePanel === 'busquedas' ? 'Búsquedas'
                            : 'Stats de Simbiocreación'}
                        </h3>
                      </div>
                      <button onClick={closePanel} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* ── MIS IDEAS ─────────────────────────────────────── */}
                    {activePanel === 'mis-ideas' && (
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {/* Nueva idea button */}
                        <button
                          onClick={() => { closePanel(); setTimeout(() => setActivePanel('nueva-idea'), 50); }}
                          className="flex items-center gap-2 w-full px-4 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-semibold hover:bg-pink-600 transition-all justify-center">
                          <Plus className="w-4 h-4" /> Nueva idea
                        </button>

                        {selected.tags.length === 0 ? (
                          <div className="text-center py-8">
                            <Lightbulb className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                            <p className="text-xs text-gray-400">(vacío)</p>
                            <p className="text-xs text-gray-400 mt-1">Agrega tu primera idea</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-50">
                            {selected.tags.map((tag, i) => {
                              const hier = getTagHierarchy(i, selected);
                              const grpIdx = i;
                              const fakeNode: GraphNode = {
                                id: `grp-${Math.floor(i/2)}-${i%2}`,
                                label: `G${grpIdx+1}-${tag.slice(0,8)}`,
                                type: 'group', x: 0, y: 0, vx: 0, vy: 0, r: 22, color: '#ec4899',
                              };
                              return (
                                <div key={i} className="py-3 space-y-2">
                                  <div className="flex items-center gap-2">
                                    {/* Idea name button */}
                                    <button
                                      onClick={() => { setSelectedNode(fakeNode); setActivePanel(null); }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors min-w-0 max-w-[140px] truncate">
                                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                      <span className="truncate">{tag || '(vacío)'}</span>
                                    </button>
                                    {/* Hierarchy chips */}
                                    <div className="flex items-center gap-1 flex-wrap">
                                      <span className="text-gray-300 text-xs">&lt;</span>
                                      <span className="px-1.5 py-0.5 border border-gray-300 rounded-full text-xs text-gray-500 whitespace-nowrap">
                                        Nivel 1: {hier.nivel1.slice(0, 10)}
                                      </span>
                                      <span className="text-gray-300 text-xs">&gt;</span>
                                      <span className="text-gray-300 text-xs">&lt;</span>
                                      <span className="px-1.5 py-0.5 border border-gray-300 rounded-full text-xs text-gray-500 whitespace-nowrap">
                                        Nivel 2: {hier.nivel2.slice(0, 10)}
                                      </span>
                                      <span className="text-gray-300 text-xs">&gt;</span>
                                    </div>
                                  </div>
                                  {/* Action icons row */}
                                  <div className="flex items-center gap-2 pl-1">
                                    <button title="Añadir participante"
                                      className="text-teal-500 hover:text-teal-700 transition-colors">
                                      <Users className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ── BÚSQUEDAS ─────────────────────────────────────── */}
                    {activePanel === 'busquedas' && (
                      <>
                        {/* Tabs */}
                        <div className="flex gap-2 px-4 pt-3 pb-2 flex-shrink-0">
                          <button onClick={() => setBusquedasTab('grupos')}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                              busquedasTab === 'grupos'
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>
                            Grupos
                          </button>
                          <button onClick={() => setBusquedasTab('participantes')}
                            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                              busquedasTab === 'participantes'
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>
                            Participantes
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-4 pb-4">
                          {busquedasTab === 'grupos' ? (
                            <div className="divide-y divide-gray-50">
                              {graphGrupos.map((g, i) => (
                                <div key={g.id} className="flex items-center gap-3 py-3 hover:bg-gray-50 rounded-lg px-1 transition-colors cursor-pointer">
                                  <span className="text-lg font-extrabold text-gray-300 w-6 text-center flex-shrink-0">{i + 1}</span>
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold text-teal-700 truncate">{g.label}</div>
                                    <div className="text-xs text-gray-400">{g.nodos} nodo{g.nodos !== 1 ? 's' : ''}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            /* Participantes — placeholder (no data model yet) */
                            <div className="text-center py-12">
                              <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                              <p className="text-sm font-medium text-gray-500 mb-1">{statsParticipantes} participantes estimados</p>
                              <p className="text-xs text-gray-400">La gestión individual de participantes estará disponible próximamente.</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* ── STATS ─────────────────────────────────────────── */}
                    {activePanel === 'stats' && (
                      <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {/* Main stats */}
                        <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Participantes</span>
                            <span className="text-2xl font-extrabold text-pink-600">{statsParticipantes}</span>
                          </div>
                          <div className="h-px bg-pink-100" />
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Ideas</span>
                            <span className="text-2xl font-extrabold text-pink-600">{statsIdeas}</span>
                          </div>
                        </div>

                        {/* Secondary stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-center">
                            <div className="text-xs text-teal-600 mb-1">ODS</div>
                            <div className="text-xl font-bold text-teal-700">{statsOds}</div>
                          </div>
                          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                            <div className="text-xs text-gray-500 mb-1">Grupos</div>
                            <div className="text-xl font-bold text-gray-700">{selected.tags.length}</div>
                          </div>
                        </div>

                        {/* ODS breakdown */}
                        {selected.ods.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">ODS Activos</p>
                            <div className="flex flex-wrap gap-1.5">
                              {selected.ods.map(o => {
                                const ods = ODS_LIST.find(l => l.id === o);
                                return (
                                  <span key={o} className="px-2 py-0.5 rounded-lg text-white text-xs font-semibold"
                                    style={{ backgroundColor: ods?.color ?? '#94a3b8' }}>
                                    {o}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Idea list */}
                        {selected.tags.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ideas / Tags</p>
                            <div className="flex flex-wrap gap-1.5">
                              {selected.tags.map(t => (
                                <span key={t} className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Open in simbiocreacion.com */}
                        <a href={`https://app.simbiocreacion.com/symbiocreation`}
                          target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-pink-500 text-white text-sm font-semibold rounded-xl hover:bg-pink-600 transition-all mt-2">
                          <ExternalLink className="w-4 h-4" /> Ver en Simbiocreación
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>{/* end network canvas */}

              {/* Right panel: details */}
              <div className="w-full md:w-80 bg-white border-l border-gray-200 overflow-y-auto p-5 space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">{selected.nombre}</h2>
                  {selected.descripcion && (
                    <p className="text-sm text-gray-500 leading-relaxed">{selected.descripcion}</p>
                  )}
                </div>

                {(selected.lugar || selected.fecha) && (
                  <div className="space-y-2 border-t border-gray-100 pt-4">
                    {selected.lugar && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />{selected.lugar}
                      </div>
                    )}
                    {selected.fecha && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        {new Date(selected.fecha).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        {selected.horaInicio && ` · ${selected.horaInicio}`}
                      </div>
                    )}
                  </div>
                )}

                {selected.ods.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">ODS Relacionados</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.ods.map(o => {
                        const ods = ODS_LIST.find(l => l.id === o);
                        return (
                          <span key={o} className="px-2 py-1 rounded-lg text-white text-xs font-medium"
                            style={{ backgroundColor: ods?.color ?? '#94a3b8' }}>
                            ODS {o}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selected.tags.length > 0 && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Grupos / Tags</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.tags.map(t => (
                        <span key={t} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Compartir</div>
                  <ShareRow id={selected.id} />
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <button onClick={() => openEditar(selected)}
                    className="flex items-center gap-2 w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-xl transition-all">
                    <Pencil className="w-4 h-4" /> Editar simbiocreación
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── CREAR / EDITAR ── */}
          {(subView === 'crear' || subView === 'editar') && (
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
              <div className="bg-white border border-pink-200 rounded-2xl p-6 md:p-8 mb-6">

                <div className="flex items-end gap-4 mb-4">
                  <div className="flex-1">
                    <input type="text" placeholder="Nombre de la simbiocreación*"
                      value={form.nombre} onChange={e => set('nombre', e.target.value)}
                      className={inputClass} />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pb-3 flex-shrink-0">
                    <input type="checkbox" checked={form.privado}
                      onChange={e => set('privado', e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded" />
                    <span className="text-sm text-gray-600">Privado</span>
                  </label>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input type="text" placeholder="Lugar" value={form.lugar}
                      onChange={e => set('lugar', e.target.value)} className={inputClass} />
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 flex-1">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input type="date" value={form.fecha}
                      onChange={e => set('fecha', e.target.value)} className={inputClass} />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                    <input type="checkbox" checked={form.establecerHora}
                      onChange={e => set('establecerHora', e.target.checked)}
                      className="w-4 h-4 accent-teal-600 rounded" />
                    <span className="text-sm text-gray-600">Establecer hora de inicio</span>
                  </label>
                </div>

                {form.establecerHora && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input type="time" value={form.horaInicio}
                        onChange={e => set('horaInicio', e.target.value)} className={inputClass} />
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <textarea placeholder="Descripción" value={form.descripcion}
                    onChange={e => set('descripcion', e.target.value)} rows={4}
                    className="w-full px-4 py-3 border-0 border-b border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-colors resize-y" />
                </div>

                <div className="flex justify-end mb-4">
                  <button onClick={() => setMasDetalles(v => !v)}
                    className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors">
                    {masDetalles ? <><ChevronUp className="w-4 h-4" /> Menos detalles</>
                      : <><ChevronDown className="w-4 h-4" /> Más detalles</>}
                  </button>
                </div>

                {masDetalles && (
                  <div className="space-y-4 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input type="url" placeholder="Link con información del evento"
                        value={form.link} onChange={e => set('link', e.target.value)} className={inputClass} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input type="text" placeholder="Grupos / tags (separados por comas)"
                        value={form.tags} onChange={e => set('tags', e.target.value)} className={inputClass} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input type="text" placeholder="Extra URLs (separados por comas)"
                        value={form.extraUrls} onChange={e => set('extraUrls', e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Leaf className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-500">Objetivos de Desarrollo Sostenible</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ODS_LIST.map(ods => (
                          <label key={ods.id}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-xs ${
                              form.ods.includes(ods.id)
                                ? 'border-teal-500 bg-teal-50 text-teal-800'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                            }`}>
                            <div className="w-3 h-3 rounded-sm flex-shrink-0 border-2"
                              style={{ borderColor: ods.color, backgroundColor: form.ods.includes(ods.id) ? ods.color : 'transparent' }} />
                            <input type="checkbox" checked={form.ods.includes(ods.id)}
                              onChange={() => toggleOds(ods.id)} className="sr-only" />
                            {ods.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button onClick={goLista}
                  className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all">
                  Cancelar
                </button>
                <button onClick={handleGuardar} disabled={!form.nombre.trim() || saving}
                  className="flex items-center gap-2 px-7 py-2.5 text-sm font-medium bg-pink-500 text-white rounded-xl hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                    : subView === 'editar' ? 'Guardar cambios' : 'Crear'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* EXPLORA                                                             */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {mainTab === 'explora' && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Explora</h2>
              {!exploraLoading && (
                <p className="text-sm text-gray-500 mt-0.5">1 – {filteredExplora.length} de {filteredExplora.length}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2 mb-7">
            {([['todas', 'Todas'], ['proximas', 'Próximas'], ['pasadas', 'Pasadas']] as const).map(([id, label]) => (
              <button key={id} onClick={() => setExploraFilter(id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  exploraFilter === id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-200 hover:text-teal-700'
                }`}>
                {exploraFilter === id && <Check className="w-3.5 h-3.5" />}
                {label}
              </button>
            ))}
          </div>

          {exploraLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
            </div>
          ) : filteredExplora.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay simbiocreaciones públicas disponibles.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredExplora.map(item => <ExploraCard key={item.id} item={item} />)}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* RANKING                                                             */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {mainTab === 'ranking' && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Top Usuarios</h2>

          {rankingLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
            </div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay datos de ranking aún.</p>
            </div>
          ) : (
            <div className="space-y-px">
              {ranking.map((entry, i) => {
                const rankColors = ['text-pink-500', 'text-pink-400', 'text-pink-300'];
                const isMe = entry.userId === user?.id;
                return (
                  <div key={entry.userId}
                    className={`flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0 rounded-xl transition-all ${
                      isMe ? 'bg-teal-50 border-teal-100' : 'bg-white hover:bg-gray-50'
                    }`}>
                    <span className={`text-2xl font-extrabold w-8 flex-shrink-0 ${rankColors[i] ?? 'text-gray-400'}`}>
                      {entry.rank}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">
                        {(entry.user?.fullName ?? entry.user?.company ?? '?')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-teal-700 text-sm flex items-center gap-2">
                        {entry.user?.fullName ?? entry.user?.company ?? 'Usuario'}
                        {isMe && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Tú</span>}
                      </div>
                      {entry.user?.company && entry.user.fullName && (
                        <div className="text-xs text-gray-400 truncate">{entry.user.company}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-0.5">
                        PUNTAJE: <span className="font-semibold text-gray-700">{entry.puntaje}</span>
                        <span className="mx-1">·</span>
                        {entry.total} simbiocreaci{entry.total === 1 ? 'ón' : 'ones'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
