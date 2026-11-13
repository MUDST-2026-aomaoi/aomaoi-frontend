import { useMemo } from 'react';
import { proj, caneSprite, sproutSprite, SIN, COS } from './FarmArchipelago';

// Worker hero: one small isometric field split into 4 work zones (cut / plant / water / spray).
// A zone with no pay this period is flat and dimmed, so "where did my money come from" reads at a glance.

const TILE = 100;
const GAP = 14;
const STEP = TILE + GAP;
const THICK = 10;
const ROOM = 40;

const pts = (list) => list.map((p) => p.join(',')).join(' ');

function Zone({ type, a0, b0, share, active }) {
  const P = (u, v) => proj(a0 + u, b0 + v);
  const down = (p) => [p[0], p[1] + THICK];
  const left = P(0, TILE);
  const bottom = P(TILE, TILE);
  const right = P(TILE, 0);
  const top = P(0, 0);
  const has = share > 0;

  const caneH = 10 + share * 14;
  const sprites = [];
  const add = (u, v, node) => sprites.push({ n: u * SIN + v * COS, node });
  const strips = [];

  const rows = (count, fill) =>
    Array.from({ length: count }, (_, i) => {
      const v = 24 + (i * 52) / Math.max(count - 1, 1);
      strips.push(<polygon key={`s${i}`} points={pts([P(14, v - 3), P(86, v - 3), P(86, v + 3), P(14, v + 3)])} fill={fill} opacity="0.5" />);
      return v;
    });

  if (type === 'cutting' || type === 'spraying') {
    rows(3, '#4F7A2B').forEach((v, i) => {
      for (let j = 0; j < 4; j++) add(22 + j * 18, v, has ? caneSprite(`c${i}-${j}`, P(22 + j * 18, v), caneH) : sproutSprite(`c${i}-${j}`, P(22 + j * 18, v)));
    });
  } else {
    rows(3, '#8A6A38').forEach((v, i) => {
      [24, 44, 64, 84].forEach((u) => add(u, v, sproutSprite(`p${i}-${u}`, P(u, v))));
    });
  }

  let extra = null;
  if (type === 'watering') {
    const ring = Array.from({ length: 18 }, (_, k) => {
      const ang = (k / 18) * Math.PI * 2;
      return P(70 + Math.cos(ang) * 16, 70 + Math.sin(ang) * 12);
    });
    extra = <polygon points={pts(ring)} fill="#8FD0E8" stroke="#6BB9D6" strokeWidth="1.2" />;
  }
  if (type === 'spraying' && has) {
    const [cx, cy] = P(50, 50);
    extra = (
      <g fill="#FFFFFF" opacity="0.75">
        <circle cx={cx - 10} cy={cy - 26} r="7" />
        <circle cx={cx + 4} cy={cy - 32} r="9" />
        <circle cx={cx + 16} cy={cy - 24} r="6" />
      </g>
    );
  }

  sprites.sort((x, y) => x.n - y.n);
  const padColor = type === 'planting' || type === 'watering' ? '#B58E58' : has ? '#6E9E33' : '#B58E58';

  return (
    <g style={{ transform: active ? 'translateY(-10px)' : 'translateY(0)', filter: active ? 'drop-shadow(0 10px 8px rgba(46,74,31,0.28))' : 'none', transition: 'transform .25s ease, filter .25s ease' }}>
      <polygon points={pts([left, bottom, down(bottom), down(left)])} fill="#4F7A2B" />
      <polygon points={pts([bottom, right, down(right), down(bottom)])} fill="#2E4A1F" />
      <polygon points={pts([top, right, bottom, left])} fill="#B7DA5E" stroke={active ? '#E6F58A' : 'none'} strokeWidth={active ? 3 : 0} strokeLinejoin="round" />
      <polygon points={pts([P(10, 10), P(90, 10), P(90, 90), P(10, 90)])} fill={padColor} />
      {strips}
      {type === 'watering' && extra}
      {sprites.map((s) => s.node)}
      {type === 'spraying' && extra}
    </g>
  );
}

/**
 * zones: [{ id, label, pct, color }] (4 items, in display order)
 * activeId / onActive: shared hover/selected zone id (null = none)
 */
export function TaskZones({ zones, activeId, onActive, className = '', showChips = true }) {
  const layout = useMemo(() => {
    const off = STEP / 2;
    const tiles = zones.map((z, i) => {
      const gx = i % 2;
      const gy = Math.floor(i / 2);
      const a0 = gx * STEP - off - TILE / 2;
      const b0 = gy * STEP - off - TILE / 2;
      const [cx, cy] = proj(a0 + TILE / 2, b0 + TILE / 2);
      return { ...z, a0, b0, cx, cy, order: (a0 + TILE / 2) * SIN + (b0 + TILE / 2) * COS };
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
        minY = Math.min(minY, y - ROOM);
        maxY = Math.max(maxY, y + THICK);
      });
    });
    const pad = 12;
    return { tiles, vb: { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 2, h: maxY - minY + pad * 2 } };
  }, [zones]);

  const { tiles, vb } = layout;
  const drawOrder = [...tiles].sort((a, b) => a.order - b.order);

  return (
    <div className={`relative mx-auto w-full ${className}`}>
      <svg viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} className="block w-full" role="img" aria-label="Work zones">
        {drawOrder.map((t) => (
          <g
            key={t.id}
            style={{ cursor: 'pointer', opacity: activeId && activeId !== t.id ? 0.35 : t.pct > 0 ? 1 : 0.6, transition: 'opacity .25s ease' }}
            onMouseEnter={() => onActive(t.id)}
            onMouseLeave={() => onActive(null)}
            onClick={() => onActive(activeId === t.id ? null : t.id)}
          >
            <Zone type={t.id} a0={t.a0} b0={t.b0} share={t.pct / 100} active={activeId === t.id} />
          </g>
        ))}
      </svg>

      {showChips && tiles.map((t) => (
        <button
          key={`chip-${t.id}`}
          type="button"
          onMouseEnter={() => onActive(t.id)}
          onMouseLeave={() => onActive(null)}
          onClick={() => onActive(activeId === t.id ? null : t.id)}
          className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#1A1A1A] shadow-[0_4px_14px_rgba(46,74,31,0.16)] transition duration-200 sm:text-xs ${
            activeId === t.id ? 'ring-2 ring-[#A8D04A]' : activeId ? 'opacity-40' : ''
          }`}
          style={{ left: `${((t.cx - vb.x) / vb.w) * 100}%`, top: `${((t.cy - ROOM * 0.6 - vb.y) / vb.h) * 100}%` }}
        >
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
          {t.label}
          <span className="font-extrabold text-[#2E4A1F]">{t.pct}%</span>
        </button>
      ))}
    </div>
  );
}
