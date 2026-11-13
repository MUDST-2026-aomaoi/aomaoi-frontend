import { useMemo } from 'react';

// Super-admin hero: every farm is a small isometric plot on a shared grid (same ~28deg view as the
// single-farm illustration). Plot look is seeded by farm id, so existing farms never change when
// new ones are added; cane density/height follow the farm's payroll share.

export const YAW = (28 * Math.PI) / 180;
const PITCH = (35 * Math.PI) / 180;
export const COS = Math.cos(YAW);
export const SIN = Math.sin(YAW);
const KY = Math.sin(PITCH);
const TILE = 100;
const GAP = 36;
const STEP = TILE + GAP;
const THICK = 12;
const SPRITE_ROOM = 46; // headroom above a plot for cane/trees

export const proj = (a, b) => [a * COS - b * SIN, (a * SIN + b * COS) * KY];

function hash(value) {
  let h = 2166136261;
  for (const c of String(value)) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pts = (list) => list.map((p) => p.join(',')).join(' ');

export function caneSprite(key, [x, y], h) {
  const tops = [[-3, 0.9], [0, 1], [3, 0.85]].map(([dx, k]) => [x + dx, y - h * k]);
  const stalks = tops.map(([tx, ty], i) => `M${x + [-3, 0, 3][i]} ${y} L${tx} ${ty}`).join(' ');
  const leaves = tops.map(([tx, ty]) => `M${tx} ${ty} q-6 -1 -9 5 M${tx} ${ty} q6 -1 9 5 M${tx} ${ty} q-1 -5 -4 -8 M${tx} ${ty} q1 -5 4 -8`).join(' ');
  return (
    <g key={key}>
      <ellipse cx={x} cy={y + 1} rx="6" ry="2" fill="#2E4A1F" opacity="0.15" />
      <path d={stalks} stroke="#9ACB43" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d={leaves} stroke="#4F7A2B" strokeWidth="1.7" strokeLinecap="round" fill="none" />
    </g>
  );
}

export function sproutSprite(key, [x, y]) {
  return <path key={key} d={`M${x} ${y} l0 -5 M${x} ${y - 3} l-3 -3 M${x} ${y - 3} l3 -3`} stroke="#A8D04A" strokeWidth="1.6" strokeLinecap="round" fill="none" />;
}

export function treeSprite(key, [x, y], s = 1) {
  return (
    <g key={key} transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="1" rx="9" ry="3" fill="#2E4A1F" opacity="0.18" />
      <rect x="-2" y="-8" width="4" height="9" rx="1.5" fill="#6B4F2A" />
      <polygon points="0,-34 -11,-16 11,-16" fill="#3F6B27" />
      <polygon points="0,-26 -13,-9 13,-9" fill="#4F7A2B" />
      <polygon points="0,-34 11,-16 0,-16" fill="#2E4A1F" opacity="0.3" />
    </g>
  );
}

/** One plot. Returns the SVG for slab + contents in tile-local (u,v) coordinates. */
function Plot({ farm, a0, b0, active, ghost }) {
  const P = (u, v) => proj(a0 + u, b0 + v);
  const left = P(0, TILE);
  const bottom = P(TILE, TILE);
  const right = P(TILE, 0);
  const top = P(0, 0);
  const down = (p) => [p[0], p[1] + THICK];

  const r = rng(hash(farm.id));
  const share = Math.max(0, Math.min(1, farm.share ?? 0));
  const hasPayroll = !ghost && farm.value > 0;
  const rows = hasPayroll ? 2 + Math.round(share * 3) : 0;
  const caneH = 12 + share * 14;

  const sprites = [];
  const add = (u, v, node) => sprites.push({ n: u * SIN + v * COS, node });

  const pad = [P(10, 10), P(90, 10), P(90, 90), P(10, 90)];
  const padColor = ghost ? '#B4C58F' : hasPayroll ? '#6E9E33' : '#B58E58';

  const strips = [];
  if (rows > 0) {
    for (let i = 0; i < rows; i++) {
      const v = 22 + (i * 56) / Math.max(rows - 1, 1);
      strips.push(<polygon key={`s${i}`} points={pts([P(14, v - 3), P(86, v - 3), P(86, v + 3), P(14, v + 3)])} fill="#4F7A2B" opacity="0.5" />);
      for (let j = 0; j < 5; j++) add(20 + j * 15, v, caneSprite(`c${i}-${j}`, P(20 + j * 15, v), caneH * (0.9 + r() * 0.2)));
    }
  } else if (!ghost) {
    [28, 50, 72].forEach((v, i) => {
      strips.push(<polygon key={`f${i}`} points={pts([P(14, v - 2.5), P(86, v - 2.5), P(86, v + 2.5), P(14, v + 2.5)])} fill="#8A6A38" opacity="0.5" />);
      [24, 44, 64, 84].forEach((u) => add(u, v, sproutSprite(`sp${i}-${u}`, P(u, v))));
    });
  } else {
    [[30, 34], [62, 58], [44, 72]].forEach(([u, v], i) => add(u, v, treeSprite(`g${i}`, P(u, v), 0.55)));
  }

  // corner trees (seeded so a farm keeps its layout)
  const corners = [[8, 8], [92, 10], [8, 92], [92, 92]];
  corners.forEach(([u, v], i) => {
    if (r() > 0.45) add(u, v, treeSprite(`t${i}`, P(u, v), 0.55 + r() * 0.2));
  });

  const feature = hash(farm.id) % 3;
  let pond = null;
  if (!ghost && feature === 1) {
    const pc = [78, 78];
    const ring = Array.from({ length: 18 }, (_, k) => {
      const ang = (k / 18) * Math.PI * 2;
      return P(pc[0] + Math.cos(ang) * 11, pc[1] + Math.sin(ang) * 8);
    });
    pond = <polygon points={pts(ring)} fill="#BFE3D9" stroke="#A9D5C9" strokeWidth="1" />;
  }
  if (!ghost && feature === 0) {
    const bu = 72;
    const bv = 14;
    const w = 15;
    const d = 11;
    const h = 11;
    const lift = (p) => [p[0], p[1] - h];
    add(bu + w / 2, bv + d, (
      <g key="barn">
        <polygon points={pts([P(bu, bv + d), P(bu + w, bv + d), lift(P(bu + w, bv + d)), lift(P(bu, bv + d))])} fill="#E8A33D" />
        <polygon points={pts([P(bu + w, bv + d), P(bu + w, bv), lift(P(bu + w, bv)), lift(P(bu + w, bv + d))])} fill="#C98626" />
        <polygon points={pts([lift(P(bu, bv)), lift(P(bu + w, bv)), lift(P(bu + w, bv + d)), lift(P(bu, bv + d))])} fill="#F2B85C" />
      </g>
    ));
  }

  sprites.sort((x, y) => x.n - y.n);

  return (
    <g style={{ transform: active ? 'translateY(-14px)' : 'translateY(0)', filter: active ? 'drop-shadow(0 10px 8px rgba(46,74,31,0.28))' : 'none', transition: 'transform .25s ease, filter .25s ease' }}>
      <polygon points={pts([left, bottom, down(bottom), down(left)])} fill={ghost ? '#7F9560' : '#4F7A2B'} />
      <polygon points={pts([bottom, right, down(right), down(bottom)])} fill={ghost ? '#667A4B' : '#2E4A1F'} />
      <polygon points={pts([top, right, bottom, left])} fill={ghost ? '#C6D6A4' : '#B7DA5E'} stroke={active ? '#E6F58A' : 'none'} strokeWidth={active ? 3 : 0} strokeLinejoin="round" />
      <polygon points={pts(pad)} fill={padColor} />
      {strips}
      {pond}
      {sprites.map((s) => s.node)}
    </g>
  );
}

/**
 * farms: [{ id, name, value, share(0..1), percent, color }] (already ranked, max ~8)
 * overflow: { count, value, percent } | null  -> extra grey plot summarising the rest
 */
export function FarmArchipelago({ farms, overflow, hoveredId, onHover, onSelect, unit, moreLabel, formatValue, className = '' }) {
  const layout = useMemo(() => {
    const items = farms.map((f) => ({ ...f, ghost: false }));
    if (overflow) items.push({ id: 'others', name: moreLabel(overflow.count), value: overflow.value, percent: overflow.percent, share: 0, color: '#B9C0AE', ghost: true });
    const n = items.length || 1;
    const cols = n <= 1 ? 1 : n <= 4 ? 2 : 3;
    const rows = Math.ceil(n / cols);
    const offA = ((cols - 1) * STEP) / 2;
    const offB = ((rows - 1) * STEP) / 2;
    const tiles = items.map((it, i) => {
      const gx = i % cols;
      const gy = Math.floor(i / cols);
      const a0 = gx * STEP - offA - TILE / 2;
      const b0 = gy * STEP - offB - TILE / 2;
      const [cx, cy] = proj(a0 + TILE / 2, b0 + TILE / 2);
      return { ...it, a0, b0, cx, cy, order: (a0 + TILE / 2) * SIN + (b0 + TILE / 2) * COS };
    });
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    tiles.forEach((t) => {
      [[0, 0], [TILE, 0], [TILE, TILE], [0, TILE]].forEach(([u, v]) => {
        const [x, y] = proj(t.a0 + u, t.b0 + v);
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y - SPRITE_ROOM);
        maxY = Math.max(maxY, y + THICK);
      });
    });
    const padX = 18;
    const padY = 44; // room for chips above the back row
    const vb = { x: minX - padX, y: minY - padY, w: maxX - minX + padX * 2, h: maxY - minY + padY * 2 };
    return { tiles, vb };
  }, [farms, overflow, moreLabel]);

  const { tiles, vb } = layout;
  const drawOrder = [...tiles].sort((a, b) => a.order - b.order);

  return (
    <div className={`relative mx-auto w-full ${className}`}>
      <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} className="block w-full" role="img" aria-label="Farms">
        <ellipse cx={vb.x + vb.w / 2} cy={vb.y + vb.h - 18} rx={vb.w * 0.42} ry="14" fill="#2E4A1F" opacity="0.07" />
        {drawOrder.map((t) => (
          <g
            key={t.id}
            style={{ cursor: t.ghost ? 'default' : 'pointer', opacity: hoveredId && hoveredId !== t.id ? 0.3 : 1, transition: 'opacity .25s ease' }}
            onMouseEnter={() => onHover(t.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => !t.ghost && onSelect(t.id)}
          >
            <Plot farm={t} a0={t.a0} b0={t.b0} active={hoveredId === t.id} ghost={t.ghost} />
          </g>
        ))}
      </svg>

      {tiles.map((t) => (
        <button
          key={`chip-${t.id}`}
          type="button"
          onMouseEnter={() => onHover(t.id)}
          onMouseLeave={() => onHover(null)}
          onClick={() => !t.ghost && onSelect(t.id)}
          className={`absolute hidden -translate-x-1/2 -translate-y-1/2 items-stretch overflow-hidden rounded-xl bg-white/90 text-left shadow-[0_6px_20px_rgba(46,74,31,0.14)] backdrop-blur transition duration-200 sm:flex ${
            hoveredId === t.id ? '-translate-y-[60%] ring-2 ring-[#A8D04A]' : hoveredId ? 'opacity-30' : ''
          }`}
          style={{ left: `${((t.cx - vb.x) / vb.w) * 100}%`, top: `${((t.cy - SPRITE_ROOM - 12 - vb.y) / vb.h) * 100}%` }}
        >
          <span className="w-1.5 shrink-0" style={{ backgroundColor: t.color }} />
          <span className="flex items-center gap-2 px-2.5 py-1.5">
            <span className="min-w-0">
              <span className="block max-w-[104px] truncate text-xs font-semibold text-[#1A1A1A]">{t.name}</span>
              <span className="block whitespace-nowrap text-[10px] text-[#8A8F85]">{formatValue(t.value)} {unit}</span>
            </span>
            <span className="text-sm font-extrabold leading-none text-[#2E4A1F]">{t.percent}%</span>
          </span>
        </button>
      ))}
    </div>
  );
}
