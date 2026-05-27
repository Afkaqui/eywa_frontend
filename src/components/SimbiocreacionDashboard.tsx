"use client";

import {
  useState, useEffect, useMemo, useCallback, useRef,
  forwardRef, useImperativeHandle,
} from 'react';
import {
  Network, Plus, ChevronDown, ChevronUp, Calendar, Globe,
  Tag, Lock, MapPin, Clock, ExternalLink, Leaf, Trash2,
  Pencil, Loader2, Copy, Check, MoreVertical, Users,
  BarChart2, Trophy, Search, ArrowLeft, X,
  Lightbulb, Settings, Link2, Link2Off,
} from 'lucide-react';
import { SimbiocreacionRepository } from '@/lib/repositories/simbiocreacion-repository';
import type { Simbiocreacion, StoredGraph } from '@/lib/types/database';
import { useAuth } from '@/contexts/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────

type MainTab      = 'mis-simbios' | 'explora' | 'ranking';
type SubView      = 'lista' | 'crear' | 'editar' | 'detalle';
type ExploraFilter = 'todas' | 'proximas' | 'pasadas';
type ActivePanel  = null | 'nueva-idea' | 'mis-ideas' | 'busquedas' | 'opciones' | 'stats';
type EditInteract = 'move' | 'connect';

interface PublicSimbio extends Simbiocreacion {
  user?: { id: string; fullName: string | null; company: string | null };
}
interface RankingEntry {
  rank: number; userId: string; puntaje: number; total: number;
  user: { id: string; fullName: string | null; company: string | null } | null;
}

// ── Network graph types ───────────────────────────────────────────────────────

interface GraphNode {
  id: string; label: string; type: 'center' | 'category' | 'group' | 'person';
  x: number; y: number; vx: number; vy: number; r: number; color: string;
}
interface GraphEdge { from: string; to: string }

// Exposed imperative handle for parent to manipulate the graph
export interface GraphHandle {
  getGraph: () => { nodes: GraphNode[]; edges: GraphEdge[] };
  addNode:        (node: GraphNode, parentId?: string) => void;
  removeNode:     (id: string) => void;
  addEdge:        (from: string, to: string) => void;
  removeEdge:     (from: string, to: string) => void;
  updateNodeLabel:(id: string, label: string) => void;
  updateNodeColor:(id: string, color: string) => void;
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

const NODE_PRESETS = [
  { type: 'category' as const, label: 'Categoría',  color: '#f59e0b', r: 30 },
  { type: 'group'    as const, label: 'Grupo',       color: '#ec4899', r: 22 },
  { type: 'person'   as const, label: 'Persona',     color: '#94a3b8', r: 12 },
];

const NODE_COLORS = ['#0d9488','#f59e0b','#ec4899','#8b5cf6','#3b82f6','#ef4444','#10b981','#f97316'];

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

// ── Build graph from item ─────────────────────────────────────────────────────

function buildGraph(item: Simbiocreacion, width: number, height: number): { nodes: GraphNode[]; edges: GraphEdge[] } {
  // Use stored graphData if present
  if (item.graphData && item.graphData.nodes.length > 0) {
    const cx = width / 2; const cy = height / 2;
    const stored = item.graphData;
    const nodes: GraphNode[] = stored.nodes.map((sn, i) => {
      const angle = (2 * Math.PI * i) / stored.nodes.length;
      const dist = sn.type === 'center' ? 0 : sn.type === 'category' ? 160 : sn.type === 'group' ? 280 : 380;
      const r = sn.type === 'center' ? 52 : sn.type === 'category' ? 30 : sn.type === 'group' ? 22 : 12;
      return {
        id: sn.id, label: sn.label, type: sn.type, color: sn.color,
        x: sn.type === 'center' ? cx : cx + Math.cos(angle) * dist,
        y: sn.type === 'center' ? cy : cy + Math.sin(angle) * dist,
        vx: 0, vy: 0, r,
      };
    });
    return { nodes, edges: stored.edges.map(e => ({ from: e.from, to: e.to })) };
  }

  // Auto-generate from ods/tags
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

  const step = (2 * Math.PI) / cats.length;
  cats.forEach((cat, i) => {
    const angle = step * i - Math.PI / 2;
    const dist  = Math.min(width, height) * 0.26;
    nodes.push({ id: cat.id, label: cat.label, type: 'category',
      x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist,
      vx: 0, vy: 0, r: 30, color: cat.color });
    edges.push({ from: 'root', to: cat.id });

    const groupTags = item.tags.slice(i * 2, i * 2 + 2);
    const gCount = groupTags.length > 0 ? groupTags.length : 2;
    for (let g = 0; g < gCount; g++) {
      const gId = `grp-${i}-${g}`;
      const gLabel = groupTags[g] ? `G${i*2+g+1}-${groupTags[g].slice(0,8)}` : `G${i*2+g+1}`;
      const gAngle = angle + (g === 0 ? -0.55 : 0.55);
      const gDist  = Math.min(width, height) * 0.44;
      nodes.push({ id: gId, label: gLabel, type: 'group',
        x: cx + Math.cos(gAngle) * gDist, y: cy + Math.sin(gAngle) * gDist,
        vx: 0, vy: 0, r: 22, color: '#ec4899' });
      edges.push({ from: cat.id, to: gId });

      for (let p = 0; p < 2; p++) {
        const pId = `prs-${i}-${g}-${p}`;
        const pAngle = gAngle + (p === 0 ? -0.45 : 0.45);
        const pDist  = Math.min(width, height) * 0.58;
        nodes.push({ id: pId, label: '●', type: 'person',
          x: cx + Math.cos(pAngle) * pDist, y: cy + Math.sin(pAngle) * pDist,
          vx: 0, vy: 0, r: 12, color: '#94a3b8' });
        edges.push({ from: gId, to: pId });
      }
    }
  });
  return { nodes, edges };
}

// ── Network Graph (view + edit) ───────────────────────────────────────────────

interface NetworkGraphProps {
  item: Simbiocreacion;
  physicsForce?: number;
  physicsDistance?: number;
  physicsOrder?: number;
  onNodeClick?: (node: GraphNode) => void;
  // Edit mode
  editMode?: boolean;
  editInteract?: EditInteract;
  connectFromId?: string | null;
  onEdgeDelete?: (from: string, to: string) => void;
  onDeleteNode?: (id: string) => void;
  selectedNodeId?: string | null;
}

const NetworkGraph = forwardRef<GraphHandle, NetworkGraphProps>(function NetworkGraph({
  item,
  physicsForce    = 0.04,
  physicsDistance = 40,
  physicsOrder    = 0.003,
  onNodeClick,
  editMode        = false,
  editInteract    = 'move',
  connectFromId   = null,
  onEdgeDelete,
  onDeleteNode,
  selectedNodeId  = null,
}, ref) {
  const svgRef   = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 480 });
  const animRef  = useRef<number>(0);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const [tick, setTick] = useState(0);

  const forceRef    = useRef(physicsForce);
  const distRef     = useRef(physicsDistance);
  const orderRef    = useRef(physicsOrder);
  useEffect(() => { forceRef.current = physicsForce; },    [physicsForce]);
  useEffect(() => { distRef.current  = physicsDistance; }, [physicsDistance]);
  useEffect(() => { orderRef.current = physicsOrder; },    [physicsOrder]);

  const [vt, setVt] = useState({ x: 0, y: 0, scale: 1 });
  const vtRef = useRef({ x: 0, y: 0, scale: 1 });
  const updateVt = useCallback((n: typeof vt) => { vtRef.current = n; setVt(n); }, []);

  const inter = useRef({ mode: 'idle' as 'idle'|'drag'|'pan', nodeId: '',
    startCX: 0, startCY: 0, startNX: 0, startNY: 0, startTX: 0, startTY: 0, moved: false });
  const pinnedRef = useRef<string | null>(null);

  // Imperative handle for parent (edit mode)
  useImperativeHandle(ref, () => ({
    getGraph: () => ({
      nodes: nodesRef.current.map(n => ({ ...n })),
      edges: edgesRef.current.map(e => ({ ...e })),
    }),
    addNode: (node, parentId) => {
      nodesRef.current = [...nodesRef.current, { ...node }];
      if (parentId) edgesRef.current = [...edgesRef.current, { from: parentId, to: node.id }];
      setTick(t => t + 1);
    },
    removeNode: (id) => {
      nodesRef.current = nodesRef.current.filter(n => n.id !== id);
      edgesRef.current = edgesRef.current.filter(e => e.from !== id && e.to !== id);
      setTick(t => t + 1);
    },
    addEdge: (from, to) => {
      if (!edgesRef.current.find(e => e.from === from && e.to === to)) {
        edgesRef.current = [...edgesRef.current, { from, to }];
        setTick(t => t + 1);
      }
    },
    removeEdge: (from, to) => {
      edgesRef.current = edgesRef.current.filter(e => !(e.from === from && e.to === to));
      setTick(t => t + 1);
    },
    updateNodeLabel: (id, label) => {
      const n = nodesRef.current.find(x => x.id === id);
      if (n) { n.label = label; setTick(t => t + 1); }
    },
    updateNodeColor: (id, color) => {
      const n = nodesRef.current.find(x => x.id === id);
      if (n) { n.color = color; setTick(t => t + 1); }
    },
  }), []);

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

  useEffect(() => {
    const { nodes, edges } = buildGraph(item, dims.w, dims.h);
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [item, dims]);

  useEffect(() => {
    const cx = dims.w / 2; const cy = dims.h / 2;
    let frame = 0;
    const step = () => {
      const ns = nodesRef.current; const es = edgesRef.current;
      if (!ns.length) { animRef.current = requestAnimationFrame(step); return; }

      for (let i = 0; i < ns.length; i++) for (let j = i+1; j < ns.length; j++) {
        const dx = ns[j].x-ns[i].x; const dy = ns[j].y-ns[i].y;
        const d = Math.sqrt(dx*dx+dy*dy)||1; const min = ns[i].r+ns[j].r+90;
        if (d < min) { const f=(min-d)/d*0.22; ns[i].vx-=dx*f; ns[i].vy-=dy*f; ns[j].vx+=dx*f; ns[j].vy+=dy*f; }
      }
      const nm = Object.fromEntries(ns.map(n=>[n.id,n]));
      for (const e of es) {
        const a=nm[e.from]; const b=nm[e.to]; if (!a||!b) continue;
        const dx=b.x-a.x; const dy=b.y-a.y; const d=Math.sqrt(dx*dx+dy*dy)||1;
        const f=(d-(a.r+b.r+distRef.current))/d*forceRef.current;
        a.vx+=dx*f; a.vy+=dy*f; b.vx-=dx*f; b.vy-=dy*f;
      }
      for (const n of ns) {
        if (n.type==='center') { n.x=cx; n.y=cy; n.vx=0; n.vy=0; continue; }
        if (n.id===pinnedRef.current) { n.vx=0; n.vy=0; continue; }
        n.vx+=(cx-n.x)*orderRef.current; n.vy+=(cy-n.y)*orderRef.current;
        n.vx*=0.85; n.vy*=0.85; n.x+=n.vx; n.y+=n.vy;
        n.x=Math.max(n.r+4,Math.min(dims.w-n.r-4,n.x));
        n.y=Math.max(n.r+4,Math.min(dims.h-n.r-4,n.y));
      }
      frame++; if(frame%3===0) setTick(t=>t+1);
      animRef.current=requestAnimationFrame(step);
    };
    animRef.current=requestAnimationFrame(step);
    return ()=>cancelAnimationFrame(animRef.current);
  }, [dims]);

  useEffect(() => {
    const svg = svgRef.current; if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1.12 : 0.88;
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX-rect.left; const my = e.clientY-rect.top;
      const p = vtRef.current;
      const n = { scale: Math.max(0.15, Math.min(6, p.scale*delta)), x: mx-(mx-p.x)*delta, y: my-(my-p.y)*delta };
      updateVt(n);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [updateVt]);

  const handleNodeDown = (e: React.MouseEvent, node: GraphNode) => {
    e.stopPropagation();
    if (editMode && editInteract === 'connect') { onNodeClick?.(node); return; }
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
    const dx = e.clientX-it.startCX; const dy = e.clientY-it.startCY;
    if (Math.abs(dx)>3||Math.abs(dy)>3) it.moved=true;
    if (it.mode==='drag') {
      const n=nodesRef.current.find(x=>x.id===it.nodeId);
      if (n) { n.x=it.startNX+dx/vtRef.current.scale; n.y=it.startNY+dy/vtRef.current.scale; setTick(t=>t+1); }
    } else if (it.mode==='pan') {
      updateVt({ ...vtRef.current, x: it.startTX+dx, y: it.startTY+dy });
    }
  };
  const handleMouseUp = () => {
    const it = inter.current;
    if (!it.moved && it.mode==='drag' && onNodeClick && editInteract!=='connect') {
      const n=nodesRef.current.find(x=>x.id===it.nodeId);
      if (n) onNodeClick(n);
    }
    pinnedRef.current=null; inter.current.mode='idle';
  };

  const ns = nodesRef.current; const es = edgesRef.current;
  const nm = Object.fromEntries(ns.map(n=>[n.id,n]));
  void tick;

  return (
    <svg ref={svgRef} width={dims.w} height={dims.h}
      className="select-none"
      style={{ cursor: inter.current.mode==='pan'||inter.current.mode==='drag' ? 'grabbing' : editInteract==='connect' ? 'crosshair' : 'grab' }}
      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <g transform={`translate(${vt.x},${vt.y}) scale(${vt.scale})`}>
        <rect x={-dims.w*3} y={-dims.h*3} width={dims.w*7} height={dims.h*7}
          fill="transparent" onMouseDown={handleBgDown} />

        {/* Edges */}
        {es.map((e, i) => {
          const a=nm[e.from]; const b=nm[e.to]; if (!a||!b) return null;
          return (
            <g key={i}>
              <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="#cbd5e1" strokeWidth={1.5} strokeOpacity={0.7} />
              {editMode && (
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke="transparent" strokeWidth={14}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onEdgeDelete?.(e.from, e.to)}
                  className="hover:stroke-red-300 hover:stroke-opacity-60"
                />
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {ns.map(n => {
          const isSelected  = n.id === selectedNodeId;
          const isConnFrom  = n.id === connectFromId;
          return (
            <g key={n.id} style={{ cursor: editInteract==='connect' ? 'crosshair' : n.type!=='person' ? 'pointer' : 'grab' }}
              onMouseDown={ev => handleNodeDown(ev, n)}>
              {/* selection ring */}
              {(isSelected || isConnFrom) && (
                <circle cx={n.x} cy={n.y} r={n.r+6}
                  fill="none" stroke={isConnFrom ? '#f59e0b' : '#0d9488'}
                  strokeWidth={2.5} strokeDasharray={isConnFrom ? '6 3' : '0'} />
              )}
              {/* hit area */}
              <circle cx={n.x} cy={n.y} r={n.r+8} fill="transparent" />
              {/* node */}
              <circle cx={n.x} cy={n.y} r={n.r} fill={n.color}
                fillOpacity={n.type==='person'?0.45:0.92}
                stroke={n.type==='center'?'#fff':'transparent'}
                strokeWidth={n.type==='center'?3:0} />
              {n.type!=='person' && (
                <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="middle"
                  fill="white" fontSize={n.type==='center'?9:n.type==='category'?8:7}
                  fontWeight={n.type==='center'?'700':'500'}
                  style={{ pointerEvents:'none' }}>
                  {n.label.length>12?n.label.slice(0,11)+'…':n.label}
                </text>
              )}
              {/* Delete badge — shown on selected non-center node in edit mode */}
              {editMode && isSelected && n.type!=='center' && (
                <g onMouseDown={ev => { ev.stopPropagation(); onDeleteNode?.(n.id); }}
                  style={{ cursor: 'pointer' }}>
                  <circle cx={n.x+n.r*0.72} cy={n.y-n.r*0.72} r={9}
                    fill="#ef4444" stroke="white" strokeWidth={1.5}/>
                  <line x1={n.x+n.r*0.72-3.5} y1={n.y-n.r*0.72-3.5}
                        x2={n.x+n.r*0.72+3.5} y2={n.y-n.r*0.72+3.5}
                    stroke="white" strokeWidth={2} strokeLinecap="round"/>
                  <line x1={n.x+n.r*0.72+3.5} y1={n.y-n.r*0.72-3.5}
                        x2={n.x+n.r*0.72-3.5} y2={n.y-n.r*0.72+3.5}
                    stroke="white" strokeWidth={2} strokeLinecap="round"/>
                </g>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
});

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: number|string; accent: string }) {
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
  const copy = () => navigator.clipboard.writeText(url).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); });
  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="text-xs text-gray-400">Link compartir</span>
      <span className="text-xs text-gray-500 truncate max-w-[180px] font-mono">{url}</span>
      <button onClick={copy} className="text-gray-400 hover:text-teal-600 transition-colors flex-shrink-0">
        {copied ? <Check className="w-3.5 h-3.5 text-teal-500"/> : <Copy className="w-3.5 h-3.5"/>}
      </button>
    </div>
  );
}

// ── Explora Card ──────────────────────────────────────────────────────────────

function ExploraCard({ item }: { item: PublicSimbio }) {
  const initials = (item.user?.fullName??item.user?.company??'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const timeAgo = (() => {
    const d = Math.floor((Date.now()-new Date(item.updatedAt).getTime())/86400000);
    if (d===0) return 'hoy'; if (d===1) return 'ayer'; if (d<30) return `hace ${d} días`;
    const m = Math.floor(d/30); if (m<12) return `hace ${m} ${m===1?'mes':'meses'}`;
    return `hace ${Math.floor(m/12)} año(s)`;
  })();
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group">
      {item.fecha && <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">{new Date(item.fecha).toLocaleDateString('es',{day:'numeric',month:'short',year:'numeric'})}</div>}
      <h3 className="font-bold text-gray-900 text-sm mb-3 group-hover:text-teal-700 transition-colors line-clamp-2">{item.nombre}</h3>
      <div className="flex items-center gap-1 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">{initials}</div>
        {item.ods.slice(0,3).map(o=>(
          <div key={o} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{backgroundColor:ODS_LIST.find(l=>l.id===o)?.color??'#94a3b8'}}>{o}</div>
        ))}
        {item.ods.length>3 && <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">+{item.ods.length-3}</div>}
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3"/>{timeAgo}</div>
    </div>
  );
}

// ── Physics Slider ────────────────────────────────────────────────────────────

function PhysicsSlider({ label, value, onChange }: { label: string; value: number; onChange: (v:number)=>void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-400 text-xs">{value}</span>
      </div>
      <input type="range" min={1} max={100} value={value} onChange={e=>onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-teal-600 cursor-pointer" />
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SimbiocreacionDashboard() {
  const { user } = useAuth();
  const simbiRepo = useMemo(()=>new SimbiocreacionRepository(),[]);

  // ── Core ───────────────────────────────────────────────────────────────────
  const [mainTab,   setMainTab]   = useState<MainTab>('mis-simbios');
  const [subView,   setSubView]   = useState<SubView>('lista');
  const [items,     setItems]     = useState<Simbiocreacion[]>([]);
  const [selected,  setSelected]  = useState<Simbiocreacion|null>(null);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [masDetalles, setMasDetalles] = useState(false);
  const [form,      setForm]      = useState({...EMPTY_FORM});
  const [openMenu,  setOpenMenu]  = useState<string|null>(null);

  // ── View panel / node detail ───────────────────────────────────────────────
  const [activePanel,        setActivePanel]        = useState<ActivePanel>(null);
  const [selectedNode,       setSelectedNode]       = useState<GraphNode|null>(null);
  const [busquedasTab,       setBusquedasTab]       = useState<'grupos'|'participantes'>('grupos');
  const [busquedasQuery,     setBusquedasQuery]     = useState('');
  const [nuevaIdeaConfirmed, setNuevaIdeaConfirmed] = useState(false);
  const [nuevaIdeaName,      setNuevaIdeaName]      = useState('');
  const [addingIdea,         setAddingIdea]         = useState(false);
  const [sliderForce,        setSliderForce]        = useState(40);
  const [sliderDistance,     setSliderDistance]     = useState(55);
  const [sliderOrder,        setSliderOrder]        = useState(15);

  // ── Graph edit mode ────────────────────────────────────────────────────────
  const graphRef         = useRef<GraphHandle>(null);
  const [editMode,       setEditMode]       = useState(false);
  const [editInteract,   setEditInteract]   = useState<EditInteract>('move');
  const [editSelId,      setEditSelId]      = useState<string|null>(null);
  const [connectFromId,  setConnectFromId]  = useState<string|null>(null);
  const [editLabelDraft, setEditLabelDraft] = useState('');
  const [savingGraph,    setSavingGraph]    = useState(false);

  // ── Explora / Ranking ──────────────────────────────────────────────────────
  const [explora,        setExplora]        = useState<PublicSimbio[]>([]);
  const [exploraFilter,  setExploraFilter]  = useState<ExploraFilter>('todas');
  const [exploraLoading, setExploraLoading] = useState(false);
  const [ranking,        setRanking]        = useState<RankingEntry[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────────
  const loadItems = useCallback(async () => {
    try { setItems(await simbiRepo.getAll()); } catch { /**/ }
    finally { setLoading(false); }
  }, [simbiRepo]);
  useEffect(()=>{ loadItems(); },[loadItems]);

  useEffect(()=>{
    if (mainTab!=='explora') return;
    setExploraLoading(true);
    apiFetch<{simbiocreaciones:PublicSimbio[]}>('/api/proxy/simbiocreacion/public')
      .then(d=>setExplora(d.simbiocreaciones??[])).catch(()=>{}).finally(()=>setExploraLoading(false));
  },[mainTab]);

  useEffect(()=>{
    if (mainTab!=='ranking') return;
    setRankingLoading(true);
    apiFetch<{ranking:RankingEntry[]}>('/api/proxy/simbiocreacion/ranking')
      .then(d=>setRanking(d.ranking??[])).catch(()=>{}).finally(()=>setRankingLoading(false));
  },[mainTab]);

  // ── Form helpers ───────────────────────────────────────────────────────────
  const setF = (key: keyof typeof form, val: unknown) => setForm(p=>({...p,[key]:val}));
  const toggleOds = (id: number) => setForm(p=>({...p,ods:p.ods.includes(id)?p.ods.filter(o=>o!==id):[...p.ods,id]}));
  const parseTags = (s:string) => s.split(',').map(t=>t.trim()).filter(Boolean);

  const openCrear   = () => { setForm({...EMPTY_FORM}); setMasDetalles(false); setEditingId(null); setSubView('crear'); };
  const openEditar  = (it: Simbiocreacion) => {
    setForm({ nombre:it.nombre, lugar:it.lugar??'', fecha:it.fecha??'', horaInicio:it.horaInicio??'',
      descripcion:it.descripcion??'', privado:it.privado, establecerHora:!!it.horaInicio,
      link:it.link??'', tags:it.tags.join(', '), extraUrls:it.extraUrls.join(', '), ods:it.ods });
    setMasDetalles(false); setEditingId(it.id); setSubView('editar'); setOpenMenu(null);
  };
  const openDetalle = (it: Simbiocreacion) => { setSelected(it); setSubView('detalle'); setOpenMenu(null); setActivePanel(null); setEditMode(false); };
  const goLista     = () => { setSubView('lista'); setSelected(null); setActivePanel(null); setSelectedNode(null); setEditMode(false); };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) return;
    setSaving(true);
    const payload = { nombre:form.nombre, privado:form.privado, lugar:form.lugar||null, fecha:form.fecha||null,
      horaInicio:form.establecerHora?(form.horaInicio||null):null, descripcion:form.descripcion||null,
      link:form.link||null, tags:parseTags(form.tags), extraUrls:parseTags(form.extraUrls), ods:form.ods };
    try {
      if (editingId) { await simbiRepo.update(editingId, payload); await loadItems(); }
      else { const c=await simbiRepo.create(payload); setItems(p=>[c,...p]); }
      setSubView('lista');
    } catch {/***/} finally { setSaving(false); }
  };

  const handleEliminar = async (id: string) => {
    try { await simbiRepo.delete(id); setItems(p=>p.filter(i=>i.id!==id)); } catch {/***/}
    setOpenMenu(null);
  };

  // ── Add idea ───────────────────────────────────────────────────────────────
  const handleAddIdea = async () => {
    if (!nuevaIdeaName.trim()||!selected) return;
    setAddingIdea(true);
    const newTags = [...selected.tags, nuevaIdeaName.trim()];
    try {
      await simbiRepo.update(selected.id, { tags: newTags });
      const updated = {...selected, tags: newTags};
      setSelected(updated); setItems(p=>p.map(i=>i.id===selected.id?updated:i));
      setNuevaIdeaName(''); setNuevaIdeaConfirmed(false); setActivePanel(null);
    } catch {/***/} finally { setAddingIdea(false); }
  };

  // ── Edit mode graph functions ──────────────────────────────────────────────

  const enterEditMode = () => {
    setEditMode(true);
    setEditInteract('move');
    setEditSelId(null);
    setConnectFromId(null);
    setActivePanel(null);
    setSelectedNode(null);
  };

  // Open node editor from Búsquedas list
  const editNodeFromList = (nodeId: string, label: string) => {
    setEditMode(true);
    setEditInteract('move');
    setConnectFromId(null);
    setSelectedNode(null);
    setActivePanel(null);
    setEditSelId(nodeId);
    setEditLabelDraft(label);
  };

  // Delete node directly from Búsquedas list (enters edit mode so Save is visible)
  const deleteNodeFromList = (nodeId: string) => {
    setEditMode(true);
    setEditInteract('move');
    setConnectFromId(null);
    setSelectedNode(null);
    setActivePanel(null);
    setEditSelId(null);
    graphRef.current?.removeNode(nodeId);
  };

  const cancelEditMode = () => {
    setEditMode(false);
    setEditSelId(null);
    setConnectFromId(null);
  };

  const editSelectedNode = editSelId ? graphRef.current?.getGraph().nodes.find(n=>n.id===editSelId) ?? null : null;

  const handleEditNodeClick = (node: GraphNode) => {
    if (editInteract === 'connect') {
      if (!connectFromId) {
        setConnectFromId(node.id);
      } else if (connectFromId !== node.id) {
        graphRef.current?.addEdge(connectFromId, node.id);
        setConnectFromId(null);
      }
    } else {
      setEditSelId(node.id);
      setEditLabelDraft(node.label);
    }
  };

  const handleAddNodeToSelected = (preset: typeof NODE_PRESETS[0]) => {
    if (!editSelId) return;
    const id = `node-${Date.now()}`;
    const node: GraphNode = { id, label: preset.label, type: preset.type, color: preset.color,
      x: 400+(Math.random()-0.5)*100, y: 300+(Math.random()-0.5)*100, vx: 0, vy: 0, r: preset.r };
    graphRef.current?.addNode(node, editSelId);
    setEditSelId(id);
    setEditLabelDraft(preset.label);
  };

  const handleDeleteSelectedNode = useCallback((id?: string) => {
    const target = id ?? editSelId;
    if (!target) return;
    graphRef.current?.removeNode(target);
    setEditSelId(null);
  }, [editSelId]);

  const handleEdgeDelete = (from: string, to: string) => {
    graphRef.current?.removeEdge(from, to);
  };

  // Delete key shortcut in edit mode
  useEffect(() => {
    if (!editMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (!editSelId || editSelectedNode?.type === 'center') return;
      e.preventDefault();
      handleDeleteSelectedNode();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editMode, editSelId, editSelectedNode, handleDeleteSelectedNode]);

  const saveGraph = async () => {
    if (!selected || !graphRef.current) return;
    setSavingGraph(true);
    const { nodes, edges } = graphRef.current.getGraph();
    const graphData: StoredGraph = {
      nodes: nodes.map(n => ({ id: n.id, label: n.label, type: n.type, color: n.color })),
      edges: edges.map(e => ({ from: e.from, to: e.to })),
    };
    try {
      await simbiRepo.update(selected.id, { graphData } as Parameters<typeof simbiRepo.update>[1]);
      const updated = { ...selected, graphData };
      setSelected(updated);
      setItems(p => p.map(i => i.id === selected.id ? updated : i));
      setEditMode(false);
      setEditSelId(null);
    } catch {/***/} finally { setSavingGraph(false); }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const totalIdeas = items.reduce((s,i)=>s+i.tags.length,0);
  const totalOds   = new Set(items.flatMap(i=>i.ods)).size;
  const puntaje    = items.length*10+totalIdeas*5;

  const filteredExplora = useMemo(()=>{
    const now=Date.now();
    return explora.filter(e=>{
      if (exploraFilter==='todas') return true;
      if (!e.fecha) return exploraFilter==='pasadas';
      const d=new Date(e.fecha).getTime();
      return exploraFilter==='proximas'?d>now:d<=now;
    });
  },[explora,exploraFilter]);

  const graphGrupos = useMemo(()=>{
    if (!selected) return [];
    const cats = selected.ods.length>0
      ? selected.ods.slice(0,4).map((o,i)=>({id:`cat-${i}`,label:`ODS ${o}`}))
      : [{id:'cat-0',label:'Categoría 1'},{id:'cat-1',label:'Categoría 2'},{id:'cat-2',label:'Categoría 3'}];
    type G={id:string;label:string;nodos:number};
    const res:G[]=[{id:'root',label:selected.nombre,nodos:cats.length}];
    cats.forEach((cat,i)=>{
      const gt=selected.tags.slice(i*2,i*2+2); const gc=Math.max(gt.length,2);
      res.push({id:cat.id,label:cat.label,nodos:gc});
      for(let g=0;g<gc;g++) res.push({id:`grp-${i}-${g}`,label:gt[g]?`G${i*2+g+1}-${gt[g]}`:`G${i*2+g+1}`,nodos:2});
    });
    return res;
  },[selected]);

  const physicsForce    = 0.01+(sliderForce/100)*0.09;
  const physicsDistance = 10+(sliderDistance/100)*100;
  const physicsOrder    = 0.001+(sliderOrder/100)*0.015;

  const closePanel = () => { setActivePanel(null); setNuevaIdeaConfirmed(false); setNuevaIdeaName(''); };

  // ── get connected edges for selected node in edit mode ─────────────────────
  const editConnectedEdges = (()=>{
    if (!editSelId||!graphRef.current) return { parents: [] as Array<{id:string;label:string}>, children: [] as Array<{id:string;label:string}> };
    const { nodes, edges } = graphRef.current.getGraph();
    const nm = Object.fromEntries(nodes.map(n=>[n.id,n.label]));
    return {
      parents: edges.filter(e=>e.to===editSelId).map(e=>({ id:e.from, label:nm[e.from]??e.from })),
      children: edges.filter(e=>e.from===editSelId).map(e=>({ id:e.to, label:nm[e.to]??e.to })),
    };
  })();

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* TOP BAR */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-2 py-0">
          {subView!=='lista'&&mainTab==='mis-simbios'&&(
            <button onClick={goLista}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 pr-4 border-r border-gray-200 mr-2 py-4 transition-colors">
              <ArrowLeft className="w-4 h-4"/>Mis Simbios
            </button>
          )}
          {(subView==='lista'||mainTab!=='mis-simbios')&&(
            <div className="flex gap-0 flex-1">
              {([['mis-simbios','Mis Simbios',Network],['explora','Explora',Search],['ranking','Ranking',Trophy]] as const).map(([id,label,Icon])=>(
                <button key={id} onClick={()=>{ setMainTab(id); if(id==='mis-simbios') setSubView('lista'); }}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all ${mainTab===id?'border-teal-600 text-teal-600':'border-transparent text-gray-500 hover:text-gray-900'}`}>
                  <Icon className="w-4 h-4"/>{label}
                </button>
              ))}
            </div>
          )}
          {subView!=='lista'&&mainTab==='mis-simbios'&&(
            <div className="flex-1 flex items-center py-4">
              <span className="font-semibold text-gray-900 text-sm">
                {subView==='crear'?'Nueva simbiocreación':subView==='editar'?'Editar simbiocreación':selected?.nombre??''}
              </span>
              {selected&&!selected.privado&&<span className="ml-2 flex items-center gap-1 text-xs text-gray-400"><Globe className="w-3.5 h-3.5"/>público</span>}
              {selected?.privado&&<span className="ml-2 flex items-center gap-1 text-xs text-gray-400"><Lock className="w-3.5 h-3.5"/>privado</span>}
              {/* Edit mode toggle */}
              {subView==='detalle'&&!editMode&&(
                <button onClick={enterEditMode}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-teal-400 hover:text-teal-700 transition-all">
                  <Pencil className="w-3.5 h-3.5"/> Editar grafo
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════ MIS SIMBIOS ═════════════════════════════════════════ */}
      {mainTab==='mis-simbios'&&(
        <>
          {/* LISTA */}
          {subView==='lista'&&(
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <StatCard label="Puntaje"                value={puntaje}      accent="bg-gradient-to-br from-pink-500 to-rose-600"/>
                <StatCard label="Total Simbiocreaciones" value={items.length} accent="bg-gradient-to-br from-pink-400 to-pink-500"/>
                <StatCard label="Total Ideas / Tags"     value={totalIdeas}   accent="bg-gradient-to-br from-pink-300 to-pink-400"/>
                <StatCard label="ODS Relacionados"       value={totalOds}     accent="bg-gradient-to-br from-pink-200 to-pink-300"/>
              </div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Mis Simbiocreaciones</h2>
                <button onClick={openCrear} className="flex items-center gap-2 px-5 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-semibold hover:bg-pink-600 transition-all shadow-sm">
                  <Plus className="w-4 h-4"/>Nueva simbiocreación
                </button>
              </div>
              {items.length>0&&(
                <div className="hidden md:grid grid-cols-[1fr_140px_160px_40px] gap-4 px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <span>Nombre</span><span className="text-center">Grupos</span><span className="text-center">Última modificación</span><span/>
                </div>
              )}
              {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-gray-300 animate-spin"/></div>
              ) : items.length===0 ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
                  <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4"><Network className="w-8 h-8 text-teal-300"/></div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Sin simbiocreaciones aún</h3>
                  <p className="text-sm text-gray-400 mb-6">Crea tu primera sesión de co-creación colaborativa.</p>
                  <button onClick={openCrear} className="inline-flex items-center gap-2 px-6 py-3 bg-pink-500 text-white rounded-xl text-sm font-medium hover:bg-pink-600 transition-all">
                    <Plus className="w-4 h-4"/>Nueva simbiocreación
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map(item=>(
                    <div key={item.id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 hover:shadow-sm hover:border-teal-200 transition-all">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_140px_160px_40px] gap-2 items-center">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={()=>openDetalle(item)} className="font-semibold text-teal-700 hover:text-teal-900 text-sm transition-colors text-left">{item.nombre}</button>
                            {item.privado?<Lock className="w-3.5 h-3.5 text-gray-400"/>:<Globe className="w-3.5 h-3.5 text-gray-400"/>}
                            {item.ods.length>0&&<span className="text-xs text-gray-400 flex items-center gap-1"><Leaf className="w-3 h-3"/>{item.ods.length} ODS</span>}
                            {item.graphData&&<span className="text-xs text-teal-500 flex items-center gap-1"><Network className="w-3 h-3"/>grafo personalizado</span>}
                          </div>
                          <ShareRow id={item.id}/>
                        </div>
                        <div className="text-sm text-gray-500 text-center">{item.tags.length} grupos</div>
                        <div className="text-xs text-gray-400 text-center">{new Date(item.updatedAt).toLocaleDateString('es',{day:'numeric',month:'short',year:'numeric'})}</div>
                        <div className="relative flex justify-end">
                          <button onClick={()=>setOpenMenu(openMenu===item.id?null:item.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                            <MoreVertical className="w-4 h-4"/>
                          </button>
                          {openMenu===item.id&&(
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-44 py-1 text-sm">
                              <button onClick={()=>openDetalle(item)} className="flex items-center gap-2 w-full px-4 py-2.5 text-gray-700 hover:bg-gray-50"><Network className="w-4 h-4"/>Ver red</button>
                              <button onClick={()=>openEditar(item)} className="flex items-center gap-2 w-full px-4 py-2.5 text-gray-700 hover:bg-gray-50"><Pencil className="w-4 h-4"/>Editar info</button>
                              <hr className="my-1 border-gray-100"/>
                              <button onClick={()=>handleEliminar(item.id)} className="flex items-center gap-2 w-full px-4 py-2.5 text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4"/>Eliminar</button>
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

          {/* DETALLE / RED */}
          {subView==='detalle'&&selected&&(
            <div className="flex flex-col h-[calc(100vh-57px)]">

              {/* ── EDIT MODE BANNER ── */}
              {editMode&&(
                <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border-b border-amber-200 flex-shrink-0">
                  <Pencil className="w-4 h-4 text-amber-600 flex-shrink-0"/>
                  <span className="text-sm font-semibold text-amber-800 flex-1">Modo edición del grafo</span>

                  {/* Interaction mode */}
                  <div className="flex items-center gap-1 bg-white border border-amber-200 rounded-lg p-0.5">
                    <button onClick={()=>{ setEditInteract('move'); setConnectFromId(null); }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${editInteract==='move'?'bg-amber-500 text-white':'text-gray-600 hover:text-gray-900'}`}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 1z"/></svg>
                      Mover
                    </button>
                    <button onClick={()=>{ setEditInteract('connect'); setEditSelId(null); }}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${editInteract==='connect'?'bg-amber-500 text-white':'text-gray-600 hover:text-gray-900'}`}>
                      <Link2 className="w-3 h-3"/> Conectar
                    </button>
                  </div>

                  {connectFromId&&(
                    <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-lg flex items-center gap-1">
                      <Link2 className="w-3 h-3"/> Conectando… click en otro nodo
                      <button onClick={()=>setConnectFromId(null)} className="ml-1 text-amber-500 hover:text-amber-700"><X className="w-3 h-3"/></button>
                    </span>
                  )}

                  <button onClick={cancelEditMode}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all">
                    Cancelar
                  </button>
                  <button onClick={saveGraph} disabled={savingGraph}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-all">
                    {savingGraph?<><Loader2 className="w-3 h-3 animate-spin"/>Guardando…</>:<><Check className="w-3 h-3"/>Guardar grafo</>}
                  </button>
                </div>
              )}

              {/* ── GRAPH + PANELS ROW ── */}
              <div className="flex flex-1 overflow-hidden">

                {/* Graph canvas */}
                <div className="flex-1 bg-[#f8f9fb] relative overflow-hidden">
                  <NetworkGraph
                    ref={graphRef}
                    item={selected}
                    physicsForce={physicsForce}
                    physicsDistance={physicsDistance}
                    physicsOrder={physicsOrder}
                    onNodeClick={editMode ? handleEditNodeClick : (node)=>{ if(node.type!=='person') setSelectedNode(node); }}
                    editMode={editMode}
                    editInteract={editInteract}
                    connectFromId={connectFromId}
                    onEdgeDelete={editMode ? handleEdgeDelete : undefined}
                    onDeleteNode={editMode ? handleDeleteSelectedNode : undefined}
                    selectedNodeId={editMode ? editSelId : selectedNode?.id}
                  />

                  {/* ── 5 Floating action buttons (view mode only) ── */}
                  {!editMode&&(
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
                      {([
                        {icon:Plus,      label:'Nueva idea',  panel:'nueva-idea'  as ActivePanel},
                        {icon:Lightbulb, label:'Mis ideas',   panel:'mis-ideas'   as ActivePanel},
                        {icon:Users,     label:'Búsquedas',   panel:'busquedas'   as ActivePanel},
                        {icon:Settings,  label:'Opciones',    panel:'opciones'    as ActivePanel},
                        {icon:BarChart2, label:'Stats',       panel:'stats'       as ActivePanel},
                      ]).map(({icon:Icon,label,panel})=>(
                        <button key={panel} title={label}
                          onClick={()=>setActivePanel(activePanel===panel?null:panel)}
                          className={`w-11 h-11 rounded-full flex items-center justify-center shadow-md transition-all ${activePanel===panel?'bg-pink-600 text-white scale-110 ring-2 ring-pink-300':'bg-pink-500 text-white hover:bg-pink-600'}`}>
                          <Icon className="w-4 h-4"/>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Edit mode: Add node panel (left) */}
                  {editMode&&!editSelId&&(
                    <div className="absolute left-4 top-4 bg-white rounded-xl shadow-lg border border-amber-100 p-3 z-10 space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Agregar nodo</p>
                      {NODE_PRESETS.map(p=>(
                        <button key={p.type}
                          onClick={()=>{
                            const id=`node-${Date.now()}`;
                            const node:GraphNode={id,label:p.label,type:p.type,color:p.color,
                              x:200+(Math.random()-0.5)*80,y:200+(Math.random()-0.5)*80,vx:0,vy:0,r:p.r};
                            graphRef.current?.addNode(node);
                            setEditSelId(id); setEditLabelDraft(p.label);
                          }}
                          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                          style={{backgroundColor:p.color}}>
                          <Plus className="w-3 h-3"/> {p.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* ── Info overlay (view mode) ── */}
                  {!editMode&&(
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 px-4 py-3 shadow-sm text-sm text-gray-700 space-y-1 max-w-[200px] z-10">
                      <div className="flex items-center gap-2"><Users className="w-4 h-4 text-teal-600"/><span className="font-medium">{selected.tags.length*2} participantes</span></div>
                      <div className="flex items-center gap-2"><Network className="w-4 h-4 text-pink-500"/><span className="font-medium">{selected.tags.length} grupos</span></div>
                      <div className="flex items-center gap-2"><Leaf className="w-4 h-4 text-emerald-500"/><span className="font-medium">{selected.ods.length} ODS</span></div>
                    </div>
                  )}

                  {/* ── Node detail panel (view mode, click on node) ── */}
                  {!editMode&&selectedNode&&(
                    <div className="absolute right-4 top-16 w-72 bg-white rounded-2xl shadow-2xl z-20 overflow-hidden border border-gray-100 flex flex-col max-h-[calc(100%-5rem)]">
                      <div className="bg-pink-500 px-4 py-3 flex-shrink-0 flex items-start justify-between gap-2">
                        <p className="text-white text-xs font-semibold leading-tight truncate">
                          {selectedNode.type==='center'?'Simbiocreación':selectedNode.type==='category'?'Categoría':'Idea / Grupo'}
                        </p>
                        <button onClick={()=>setSelectedNode(null)} className="text-white/80 hover:text-white"><X className="w-4 h-4"/></button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <h3 className="text-base font-bold text-gray-900 break-words">{selectedNode.label}</h3>
                        {selectedNode.type==='center'&&selected.descripcion&&<p className="text-sm text-gray-500 leading-relaxed">{selected.descripcion}</p>}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{backgroundColor:selectedNode.color}}>
                            {selectedNode.type==='center'?'Centro':selectedNode.type==='category'?'Categoría':'Grupo'}
                          </span>
                          {selectedNode.type!=='center'&&selected&&(
                            <><span className="text-gray-300 text-xs">&lt;</span>
                            <span className="px-1.5 py-0.5 rounded-full border border-gray-300 text-xs text-gray-600">Nivel 1: {selected.nombre.slice(0,14)}</span>
                            <span className="text-gray-300 text-xs">&gt;</span></>
                          )}
                        </div>
                        {selectedNode.type==='center'&&selected.extraUrls&&selected.extraUrls.length>0&&(
                          <div>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Enlaces externos</p>
                            <ul className="space-y-1">{selected.extraUrls.map((url,i)=>(
                              <li key={i} className="text-xs text-teal-600 flex items-center gap-1">
                                <span className="text-gray-400">•</span>
                                <a href={url.startsWith('http')?url:`https://${url}`} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">{url}</a>
                              </li>
                            ))}</ul>
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">0 comentarios</p>
                          <div className="flex items-start gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-bold">{(selected.nombre??'U')[0].toUpperCase()}</span>
                            </div>
                            <textarea placeholder="Escribe tu comentario..." rows={2}
                              className="flex-1 text-xs border-0 border-b border-gray-200 bg-transparent resize-none focus:outline-none focus:border-teal-400 placeholder-gray-400 text-gray-700"/>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ══ EDIT MODE: Node editor panel (right) ══ */}
                  {editMode&&editSelId&&editSelectedNode&&(
                    <div className="absolute right-4 top-4 w-72 bg-white rounded-2xl shadow-2xl z-20 border border-amber-100 flex flex-col max-h-[calc(100%-2rem)] overflow-hidden">
                      <div className="bg-amber-500 px-4 py-3 flex items-center justify-between flex-shrink-0">
                        <span className="text-white text-sm font-semibold">Editar nodo</span>
                        <button onClick={()=>setEditSelId(null)} className="text-white/80 hover:text-white"><X className="w-4 h-4"/></button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-5">

                        {/* Delete — shown at top for easy access (not center node) */}
                        {editSelectedNode.type!=='center'&&(
                          <button onClick={()=>handleDeleteSelectedNode()}
                            className="flex items-center gap-2 w-full px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 rounded-xl text-sm font-medium transition-all justify-center border border-red-100">
                            <Trash2 className="w-4 h-4"/> Eliminar nodo
                          </button>
                        )}

                        {/* Label */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Nombre del nodo</label>
                          <input type="text" value={editLabelDraft}
                            onChange={e=>{ setEditLabelDraft(e.target.value); graphRef.current?.updateNodeLabel(editSelId, e.target.value); }}
                            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"/>
                        </div>

                        {/* Type badge */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tipo</label>
                          <span className="px-3 py-1 rounded-full text-xs font-medium text-white"
                            style={{backgroundColor:editSelectedNode.color}}>
                            {editSelectedNode.type==='center'?'Centro':editSelectedNode.type==='category'?'Categoría':editSelectedNode.type==='group'?'Grupo':'Persona'}
                          </span>
                        </div>

                        {/* Color */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Color</label>
                          <div className="flex flex-wrap gap-2">
                            {NODE_COLORS.map(c=>(
                              <button key={c} onClick={()=>graphRef.current?.updateNodeColor(editSelId,c)}
                                className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${editSelectedNode.color===c?'ring-2 ring-offset-1 ring-gray-400 scale-110':''}`}
                                style={{backgroundColor:c}}/>
                            ))}
                          </div>
                        </div>

                        {/* Add child node */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Agregar nodo hijo</label>
                          <div className="flex flex-col gap-2">
                            {NODE_PRESETS.map(p=>(
                              <button key={p.type} onClick={()=>handleAddNodeToSelected(p)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-white hover:opacity-90 transition-all"
                                style={{backgroundColor:p.color}}>
                                <Plus className="w-3 h-3"/> {p.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Connections */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Conexiones</label>
                          {(editConnectedEdges as {parents:{id:string;label:string}[];children:{id:string;label:string}[]}).parents.length===0&&
                          (editConnectedEdges as {parents:{id:string;label:string}[];children:{id:string;label:string}[]}).children.length===0&&(
                            <p className="text-xs text-gray-400">Sin conexiones</p>
                          )}
                          {(editConnectedEdges as {parents:{id:string;label:string}[];children:{id:string;label:string}[]}).parents.map((p:{id:string;label:string})=>(
                            <div key={p.id} className="flex items-center gap-2 py-1.5">
                              <span className="text-xs text-gray-400 w-10 flex-shrink-0">padre</span>
                              <span className="text-xs text-gray-700 flex-1 truncate">{p.label}</span>
                              <button onClick={()=>graphRef.current?.removeEdge(p.id,editSelId)}
                                className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                                <Link2Off className="w-3.5 h-3.5"/>
                              </button>
                            </div>
                          ))}
                          {(editConnectedEdges as {parents:{id:string;label:string}[];children:{id:string;label:string}[]}).children.map((c:{id:string;label:string})=>(
                            <div key={c.id} className="flex items-center gap-2 py-1.5">
                              <span className="text-xs text-gray-400 w-10 flex-shrink-0">hijo</span>
                              <span className="text-xs text-gray-700 flex-1 truncate">{c.label}</span>
                              <button onClick={()=>graphRef.current?.removeEdge(editSelId,c.id)}
                                className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">
                                <Link2Off className="w-3.5 h-3.5"/>
                              </button>
                            </div>
                          ))}
                          <button onClick={()=>{ setEditInteract('connect'); setConnectFromId(editSelId); setEditSelId(null); }}
                            className="mt-2 flex items-center gap-1.5 px-3 py-2 w-full border border-dashed border-teal-300 rounded-lg text-xs text-teal-600 hover:bg-teal-50 transition-all justify-center">
                            <Link2 className="w-3.5 h-3.5"/> Conectar con otro nodo
                          </button>
                        </div>

                      </div>
                    </div>
                  )}

                  {/* ══ View mode panels ══ */}
                  {/* Nueva idea */}
                  {!editMode&&activePanel==='nueva-idea'&&(
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-6 overflow-hidden">
                        {!nuevaIdeaConfirmed?(
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">¿Agregar una nueva idea?</h3>
                              <button onClick={closePanel} className="text-gray-400 hover:text-gray-600 ml-2"><X className="w-5 h-5"/></button>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">Se agregará una nueva idea (nodo) al grafo de la simbiocreación.</p>
                            <div className="flex gap-3">
                              <button onClick={closePanel} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">Cancelar</button>
                              <button onClick={()=>setNuevaIdeaConfirmed(true)} className="flex-1 px-4 py-2.5 text-sm font-medium bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all">Confirmar</button>
                            </div>
                          </div>
                        ):(
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <h3 className="text-lg font-semibold text-gray-900">Nueva idea</h3>
                              <button onClick={closePanel} className="text-gray-400 hover:text-gray-600 ml-2"><X className="w-5 h-5"/></button>
                            </div>
                            <input autoFocus type="text" placeholder="Nombre de la nueva idea" value={nuevaIdeaName}
                              onChange={e=>setNuevaIdeaName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')handleAddIdea();}}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 mb-4"/>
                            <div className="flex gap-3">
                              <button onClick={()=>{ setNuevaIdeaConfirmed(false); setNuevaIdeaName(''); }} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Atrás</button>
                              <button onClick={handleAddIdea} disabled={!nuevaIdeaName.trim()||addingIdea}
                                className="flex-1 px-4 py-2.5 text-sm font-medium bg-pink-500 text-white rounded-xl hover:bg-pink-600 disabled:opacity-40 flex items-center justify-center gap-2">
                                {addingIdea?<><Loader2 className="w-4 h-4 animate-spin"/>Agregando…</>:'Agregar'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Opciones */}
                  {!editMode&&activePanel==='opciones'&&(
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-6 p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-gray-900">Opciones</h3>
                          <button onClick={closePanel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="space-y-6">
                          <PhysicsSlider label="Fuerza"    value={sliderForce}    onChange={setSliderForce}/>
                          <PhysicsSlider label="Distancia" value={sliderDistance} onChange={setSliderDistance}/>
                          <PhysicsSlider label="Orden"     value={sliderOrder}    onChange={setSliderOrder}/>
                        </div>
                        <button onClick={()=>{ setSliderForce(50); setSliderDistance(50); setSliderOrder(50); }}
                          className="mt-6 w-full text-xs text-gray-400 hover:text-gray-600">Restablecer valores por defecto</button>
                      </div>
                    </div>
                  )}

                  {/* Side panels: mis-ideas / busquedas / stats */}
                  {!editMode&&(activePanel==='mis-ideas'||activePanel==='busquedas'||activePanel==='stats')&&(
                    <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-20 flex flex-col overflow-hidden border-r border-gray-100">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          {activePanel==='mis-ideas'&&<Lightbulb className="w-5 h-5 text-pink-500"/>}
                          {activePanel==='busquedas'&&<Users className="w-5 h-5 text-teal-600"/>}
                          {activePanel==='stats'&&<BarChart2 className="w-5 h-5 text-teal-600"/>}
                          <h3 className="font-semibold text-gray-900 text-sm">
                            {activePanel==='mis-ideas'?'Mi(s) idea(s)':activePanel==='busquedas'?'Búsquedas':'Stats de Simbiocreación'}
                          </h3>
                        </div>
                        <button onClick={closePanel} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5"/></button>
                      </div>

                      {/* Mis ideas */}
                      {activePanel==='mis-ideas'&&(
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                          <button onClick={()=>{ closePanel(); setTimeout(()=>setActivePanel('nueva-idea'),50); }}
                            className="flex items-center gap-2 w-full px-4 py-2.5 bg-pink-500 text-white rounded-xl text-sm font-semibold hover:bg-pink-600 transition-all justify-center">
                            <Plus className="w-4 h-4"/>Nueva idea
                          </button>
                          {selected.tags.length===0?(
                            <div className="text-center py-8"><Lightbulb className="w-8 h-8 text-gray-200 mx-auto mb-2"/><p className="text-xs text-gray-400">(vacío)</p></div>
                          ):(
                            <div className="divide-y divide-gray-50">
                              {selected.tags.map((tag,i)=>{
                                const cats=selected.ods.length>0?selected.ods.slice(0,4).map((o,ci)=>({id:`cat-${ci}`,label:`ODS ${o}`})):[{id:'cat-0',label:'Cat 1'},{id:'cat-1',label:'Cat 2'}];
                                const cat=cats[Math.floor(i/2)]??cats[0];
                                return (
                                  <div key={i} className="py-3 space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold min-w-0 max-w-[120px] truncate">
                                        <ExternalLink className="w-3 h-3 flex-shrink-0"/><span className="truncate">{tag||'(vacío)'}</span>
                                      </span>
                                      <span className="text-gray-300 text-xs">&lt;</span>
                                      <span className="px-1.5 py-0.5 border border-gray-300 rounded-full text-xs text-gray-500 whitespace-nowrap">Nivel 1: {selected.nombre.slice(0,10)}</span>
                                      <span className="text-gray-300 text-xs">&gt;</span>
                                      <span className="text-gray-300 text-xs">&lt;</span>
                                      <span className="px-1.5 py-0.5 border border-gray-300 rounded-full text-xs text-gray-500 whitespace-nowrap">Nivel 2: {cat.label.slice(0,10)}</span>
                                      <span className="text-gray-300 text-xs">&gt;</span>
                                    </div>
                                    <div className="flex items-center gap-2 pl-1">
                                      <button title="Añadir participante" className="text-teal-500 hover:text-teal-700 transition-colors"><Users className="w-4 h-4"/></button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Búsquedas */}
                      {activePanel==='busquedas'&&(()=>{
                        const liveNodes = graphRef.current?.getGraph().nodes ?? [];
                        const liveEdges = graphRef.current?.getGraph().edges ?? [];
                        const nodeMap   = Object.fromEntries(liveNodes.map(n=>[n.id,n]));

                        // Groups: category + group nodes (not root, not person)
                        const groupNodes = liveNodes.filter(n=>n.type==='category'||n.type==='group');
                        const filteredGroups = groupNodes.filter(n=>
                          !busquedasQuery || n.label.toLowerCase().includes(busquedasQuery.toLowerCase())
                        );

                        // Participants: person nodes
                        const personNodes = liveNodes.filter(n=>n.type==='person');
                        const filteredPersons = personNodes.filter(n=>{
                          const name = n.label==='●' ? '' : n.label;
                          return !busquedasQuery || name.toLowerCase().includes(busquedasQuery.toLowerCase());
                        });

                        // parent label for a node
                        const parentOf = (id: string) => {
                          const e = liveEdges.find(e=>e.to===id);
                          return e ? (nodeMap[e.from]?.label ?? '—') : '—';
                        };

                        return (
                          <>
                            <div className="flex gap-2 px-4 pt-3 pb-2 flex-shrink-0">
                              <button onClick={()=>{ setBusquedasTab('grupos'); setBusquedasQuery(''); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${busquedasTab==='grupos'?'bg-pink-500 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                Grupos <span className="ml-1 opacity-70 text-xs">({groupNodes.length})</span>
                              </button>
                              <button onClick={()=>{ setBusquedasTab('participantes'); setBusquedasQuery(''); }}
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${busquedasTab==='participantes'?'bg-pink-500 text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                Personas <span className="ml-1 opacity-70 text-xs">({personNodes.length})</span>
                              </button>
                            </div>

                            {/* Search */}
                            <div className="px-4 pb-2 flex-shrink-0">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"/>
                                <input type="text"
                                  placeholder={busquedasTab==='grupos'?'Buscar grupo…':'Buscar participante…'}
                                  value={busquedasQuery}
                                  onChange={e=>setBusquedasQuery(e.target.value)}
                                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 bg-gray-50"/>
                              </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 pb-4">
                              {busquedasTab==='grupos'?(
                                filteredGroups.length===0?(
                                  <p className="text-center text-xs text-gray-400 py-8">Sin resultados</p>
                                ):(
                                  <div className="divide-y divide-gray-50">
                                    {filteredGroups.map((n,i)=>{
                                      const children = liveEdges.filter(e=>e.from===n.id).length;
                                      const isCategory = n.type==='category';
                                      return (
                                        <div key={n.id} className="flex items-center gap-2 py-2.5 group">
                                          <span className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                                            style={{backgroundColor:n.color}}>{i+1}</span>
                                          <div className="min-w-0 flex-1">
                                            <div className={`text-sm font-semibold truncate ${isCategory?'text-amber-700':'text-pink-700'}`}>{n.label}</div>
                                            <div className="text-xs text-gray-400">{isCategory?'Categoría':'Grupo'} · {children} hijo{children!==1?'s':''}</div>
                                          </div>
                                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            <button onClick={()=>editNodeFromList(n.id, n.label)}
                                              title="Editar"
                                              className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                                              <Pencil className="w-3.5 h-3.5"/>
                                            </button>
                                            <button onClick={()=>deleteNodeFromList(n.id)}
                                              title="Eliminar"
                                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                              <Trash2 className="w-3.5 h-3.5"/>
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )
                              ):(
                                personNodes.length===0?(
                                  <div className="text-center py-10">
                                    <Users className="w-10 h-10 text-gray-200 mx-auto mb-3"/>
                                    <p className="text-sm text-gray-500 mb-1">Sin participantes</p>
                                    <p className="text-xs text-gray-400">Agrega personas en el editor de grafo.</p>
                                  </div>
                                ):filteredPersons.length===0?(
                                  <p className="text-center text-xs text-gray-400 py-8">Sin resultados</p>
                                ):(
                                  <div className="divide-y divide-gray-50">
                                    {filteredPersons.map((n,i)=>{
                                      const name = n.label==='●' ? `Participante ${i+1}` : n.label;
                                      const parent = parentOf(n.id);
                                      return (
                                        <div key={n.id} className="flex items-center gap-2 py-2.5 group">
                                          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                                            style={{backgroundColor:n.color||'#94a3b8'}}>
                                            {name.charAt(0).toUpperCase()||'P'}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <div className="text-sm font-semibold text-gray-800 truncate">{name}</div>
                                            <div className="text-xs text-gray-400 truncate">en {parent}</div>
                                          </div>
                                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                            <button onClick={()=>editNodeFromList(n.id, name)}
                                              title="Editar"
                                              className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors">
                                              <Pencil className="w-3.5 h-3.5"/>
                                            </button>
                                            <button onClick={()=>deleteNodeFromList(n.id)}
                                              title="Eliminar"
                                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                              <Trash2 className="w-3.5 h-3.5"/>
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )
                              )}
                            </div>
                          </>
                        );
                      })()}

                      {/* Stats */}
                      {activePanel==='stats'&&(
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                          <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Participantes</span><span className="text-2xl font-extrabold text-pink-600">{selected.tags.length*2}</span></div>
                            <div className="h-px bg-pink-100"/>
                            <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Ideas</span><span className="text-2xl font-extrabold text-pink-600">{selected.tags.length}</span></div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-teal-50 border border-teal-100 rounded-xl p-3 text-center"><div className="text-xs text-teal-600 mb-1">ODS</div><div className="text-xl font-bold text-teal-700">{selected.ods.length}</div></div>
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center"><div className="text-xs text-gray-500 mb-1">Grupos</div><div className="text-xl font-bold text-gray-700">{selected.tags.length}</div></div>
                          </div>
                          {selected.ods.length>0&&(
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">ODS Activos</p>
                              <div className="flex flex-wrap gap-1.5">
                                {selected.ods.map(o=>{const ods=ODS_LIST.find(l=>l.id===o); return (<span key={o} className="px-2 py-0.5 rounded-lg text-white text-xs font-semibold" style={{backgroundColor:ods?.color??'#94a3b8'}}>ODS {o}</span>);})}
                              </div>
                            </div>
                          )}
                          {selected.tags.length>0&&(
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Ideas / Tags</p>
                              <div className="flex flex-wrap gap-1.5">{selected.tags.map(t=>(<span key={t} className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs">{t}</span>))}</div>
                            </div>
                          )}
                          <a href="https://app.simbiocreacion.com/symbiocreation" target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-pink-500 text-white text-sm font-semibold rounded-xl hover:bg-pink-600 transition-all mt-2">
                            <ExternalLink className="w-4 h-4"/> Ver en Simbiocreación
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>{/* end graph canvas */}

                {/* Right info panel (view mode) */}
                {!editMode&&(
                  <div className="w-full md:w-72 bg-white border-l border-gray-200 overflow-y-auto p-5 space-y-5 flex-shrink-0">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-1">{selected.nombre}</h2>
                      {selected.descripcion&&<p className="text-sm text-gray-500 leading-relaxed">{selected.descripcion}</p>}
                    </div>
                    {(selected.lugar||selected.fecha)&&(
                      <div className="space-y-2 border-t border-gray-100 pt-4">
                        {selected.lugar&&<div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="w-4 h-4 text-gray-400 flex-shrink-0"/>{selected.lugar}</div>}
                        {selected.fecha&&<div className="flex items-center gap-2 text-sm text-gray-600"><Calendar className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                          {new Date(selected.fecha).toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                          {selected.horaInicio&&` · ${selected.horaInicio}`}
                        </div>}
                      </div>
                    )}
                    {selected.ods.length>0&&(
                      <div className="border-t border-gray-100 pt-4">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">ODS Relacionados</div>
                        <div className="flex flex-wrap gap-1.5">
                          {selected.ods.map(o=>{const ods=ODS_LIST.find(l=>l.id===o);return(<span key={o} className="px-2 py-1 rounded-lg text-white text-xs font-medium" style={{backgroundColor:ods?.color??'#94a3b8'}}>ODS {o}</span>);})}
                        </div>
                      </div>
                    )}
                    {selected.tags.length>0&&(
                      <div className="border-t border-gray-100 pt-4">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Grupos / Tags</div>
                        <div className="flex flex-wrap gap-1.5">{selected.tags.map(t=>(<span key={t} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs">{t}</span>))}</div>
                      </div>
                    )}
                    <div className="border-t border-gray-100 pt-4">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Compartir</div>
                      <ShareRow id={selected.id}/>
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <button onClick={()=>openEditar(selected)}
                        className="flex items-center gap-2 w-full px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-xl transition-all">
                        <Pencil className="w-4 h-4"/>Editar información
                      </button>
                    </div>
                    {selected.graphData&&(
                      <div className="border-t border-gray-100 pt-4">
                        <button onClick={()=>{ if(confirm('¿Restablecer el grafo al diseño automático? Se perderán los cambios manuales.'))
                          { simbiRepo.update(selected.id,{graphData:null} as Parameters<typeof simbiRepo.update>[1]).then(()=>{ const u={...selected,graphData:null}; setSelected(u); setItems(p=>p.map(i=>i.id===selected.id?u:i)); }); }
                        }} className="flex items-center gap-2 w-full px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-medium rounded-xl transition-all">
                          <Network className="w-4 h-4"/>Restablecer grafo automático
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CREAR / EDITAR */}
          {(subView==='crear'||subView==='editar')&&(
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
              <div className="bg-white border border-pink-200 rounded-2xl p-6 md:p-8 mb-6">
                <div className="flex items-end gap-4 mb-4">
                  <div className="flex-1">
                    <input type="text" placeholder="Nombre de la simbiocreación*" value={form.nombre}
                      onChange={e=>setF('nombre',e.target.value)} className={inputClass}/>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer pb-3 flex-shrink-0">
                    <input type="checkbox" checked={form.privado} onChange={e=>setF('privado',e.target.checked)} className="w-4 h-4 accent-teal-600 rounded"/>
                    <span className="text-sm text-gray-600">Privado</span>
                  </label>
                </div>
                <div className="mb-4"><div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                  <input type="text" placeholder="Lugar" value={form.lugar} onChange={e=>setF('lugar',e.target.value)} className={inputClass}/>
                </div></div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 flex-1"><Calendar className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                    <input type="date" value={form.fecha} onChange={e=>setF('fecha',e.target.value)} className={inputClass}/>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
                    <input type="checkbox" checked={form.establecerHora} onChange={e=>setF('establecerHora',e.target.checked)} className="w-4 h-4 accent-teal-600 rounded"/>
                    <span className="text-sm text-gray-600">Establecer hora de inicio</span>
                  </label>
                </div>
                {form.establecerHora&&(<div className="mb-4"><div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                  <input type="time" value={form.horaInicio} onChange={e=>setF('horaInicio',e.target.value)} className={inputClass}/>
                </div></div>)}
                <div className="mb-4">
                  <textarea placeholder="Descripción" value={form.descripcion} onChange={e=>setF('descripcion',e.target.value)} rows={4}
                    className="w-full px-4 py-3 border-0 border-b border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-colors resize-y"/>
                </div>
                <div className="flex justify-end mb-4">
                  <button onClick={()=>setMasDetalles(v=>!v)} className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors">
                    {masDetalles?<><ChevronUp className="w-4 h-4"/>Menos detalles</>:<><ChevronDown className="w-4 h-4"/>Más detalles</>}
                  </button>
                </div>
                {masDetalles&&(
                  <div className="space-y-4 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2"><ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                      <input type="url" placeholder="Link con información del evento" value={form.link} onChange={e=>setF('link',e.target.value)} className={inputClass}/>
                    </div>
                    <div className="flex items-center gap-2"><Tag className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                      <input type="text" placeholder="Grupos / tags (separados por comas)" value={form.tags} onChange={e=>setF('tags',e.target.value)} className={inputClass}/>
                    </div>
                    <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                      <input type="text" placeholder="Extra URLs (separados por comas)" value={form.extraUrls} onChange={e=>setF('extraUrls',e.target.value)} className={inputClass}/>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3"><Leaf className="w-4 h-4 text-gray-400 flex-shrink-0"/>
                        <span className="text-sm text-gray-500">Objetivos de Desarrollo Sostenible</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ODS_LIST.map(ods=>(
                          <label key={ods.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all text-xs ${form.ods.includes(ods.id)?'border-teal-500 bg-teal-50 text-teal-800':'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                            <div className="w-3 h-3 rounded-sm flex-shrink-0 border-2" style={{borderColor:ods.color,backgroundColor:form.ods.includes(ods.id)?ods.color:'transparent'}}/>
                            <input type="checkbox" checked={form.ods.includes(ods.id)} onChange={()=>toggleOds(ods.id)} className="sr-only"/>
                            {ods.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-3">
                <button onClick={goLista} className="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-all">Cancelar</button>
                <button onClick={handleGuardar} disabled={!form.nombre.trim()||saving}
                  className="flex items-center gap-2 px-7 py-2.5 text-sm font-medium bg-pink-500 text-white rounded-xl hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  {saving?<><Loader2 className="w-4 h-4 animate-spin"/>Guardando...</>:subView==='editar'?'Guardar cambios':'Crear'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════ EXPLORA ═════════════════════════════════════════════ */}
      {mainTab==='explora'&&(
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="text-2xl font-bold text-gray-900">Explora</h2>
              {!exploraLoading&&<p className="text-sm text-gray-500 mt-0.5">1 – {filteredExplora.length} de {filteredExplora.length}</p>}
            </div>
          </div>
          <div className="flex gap-2 mb-7">
            {([['todas','Todas'],['proximas','Próximas'],['pasadas','Pasadas']] as const).map(([id,label])=>(
              <button key={id} onClick={()=>setExploraFilter(id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${exploraFilter===id?'bg-teal-600 text-white shadow-sm':'bg-white border border-gray-200 text-gray-600 hover:border-teal-200 hover:text-teal-700'}`}>
                {exploraFilter===id&&<Check className="w-3.5 h-3.5"/>}{label}
              </button>
            ))}
          </div>
          {exploraLoading?(
            <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-gray-300 animate-spin"/></div>
          ):filteredExplora.length===0?(
            <div className="text-center py-20 text-gray-400"><Search className="w-10 h-10 mx-auto mb-3 opacity-30"/><p className="text-sm">No hay simbiocreaciones públicas disponibles.</p></div>
          ):(
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredExplora.map(item=><ExploraCard key={item.id} item={item}/>)}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ RANKING ═════════════════════════════════════════════ */}
      {mainTab==='ranking'&&(
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Top Usuarios</h2>
          {rankingLoading?(
            <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-gray-300 animate-spin"/></div>
          ):ranking.length===0?(
            <div className="text-center py-20 text-gray-400"><Trophy className="w-10 h-10 mx-auto mb-3 opacity-30"/><p className="text-sm">No hay datos de ranking aún.</p></div>
          ):(
            <div className="space-y-px">
              {ranking.map((entry,i)=>{
                const rankColors=['text-pink-500','text-pink-400','text-pink-300'];
                const isMe=entry.userId===user?.id;
                return (
                  <div key={entry.userId} className={`flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0 rounded-xl transition-all ${isMe?'bg-teal-50 border-teal-100':'bg-white hover:bg-gray-50'}`}>
                    <span className={`text-2xl font-extrabold w-8 flex-shrink-0 ${rankColors[i]??'text-gray-400'}`}>{entry.rank}</span>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">{(entry.user?.fullName??entry.user?.company??'?')[0].toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-teal-700 text-sm flex items-center gap-2">
                        {entry.user?.fullName??entry.user?.company??'Usuario'}
                        {isMe&&<span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">Tú</span>}
                      </div>
                      {entry.user?.company&&entry.user.fullName&&<div className="text-xs text-gray-400 truncate">{entry.user.company}</div>}
                      <div className="text-xs text-gray-400 mt-0.5">PUNTAJE: <span className="font-semibold text-gray-700">{entry.puntaje}</span><span className="mx-1">·</span>{entry.total} simbiocreaci{entry.total===1?'ón':'ones'}</div>
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
