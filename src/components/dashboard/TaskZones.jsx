import { useMemo } from 'react';
import { proj, caneSprite, sproutSprite, SIN, COS } from './FarmArchipelago';

// Worker hero: one small isometric field split into 4 work zones (cut / plant / water / spray).
// Each zone is drawn as its activity so it can be told apart without the label:
//   cutting  - front row cut down to stubs, a tied bundle of harvested cane
//   planting - tilled furrows with cane setts laid in them, a few shoots coming up
//   watering - furrows filled with water, drops falling
//   spraying - a drone over the cane, spraying a mist
// A zone with no pay this period is dimmed, so "where did my money come from" reads at a glance.

const TILE = 100;
const GAP = 22;
const STEP = TILE + GAP;
const THICK = 10;
const ROOM = 44;
const CHIP_ROOM = 34; // space under the field for the front plots' labels

const pts = (list) => list.map((p) => p.join(',')).join(' ');
const up = ([x, y], dy) => [x, y - dy];

/** A two-tone stick between two points (cane stalks lying down, setts). */
function stick(key, [x1, y1], [x2, y2], dark, light, width = 3.4) {
  return (
    <g key={key} strokeLinecap="round">
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={dark} strokeWidth={width} />
      <line x1={x1} y1={y1 - 0.6} x2={x2} y2={y2 - 0.6} stroke={light} strokeWidth={width * 0.55} />
    </g>
  );
}

/** Cane cut close to the ground: three short pale stumps. */
function stubSprite(key, [x, y]) {
  return (
    <g key={key} strokeLinecap="round">
      <ellipse cx={x} cy={y + 1} rx="5" ry="1.6" fill="#2E4A1F" opacity="0.18" />
      <path d={`M${x - 2.6} ${y} v-3.5 M${x} ${y} v-4.5 M${x + 2.6} ${y} v-3.5`} stroke="#A8893F" strokeWidth="2.4" />
      <path d={`M${x - 2.6} ${y - 3.5} h0.01 M${x} ${y - 4.5} h0.01 M${x + 2.6} ${y - 3.5} h0.01`} stroke="#E8D49A" strokeWidth="2" />
    </g>
  );
}

function dropSprite(key, [x, y], s = 1) {
  return (
    <path
      key={key}
      d={`M${x} ${y - 7 * s} C${x + 4 * s} ${y - 2 * s} ${x + 3.4 * s} ${y + 1.5 * s} ${x} ${y + 1.5 * s} C${x - 3.4 * s} ${y + 1.5 * s} ${x - 4 * s} ${y - 2 * s} ${x} ${y - 7 * s}Z`}
      fill="#5DB3DA"
      stroke="#FFFFFF"
      strokeWidth="0.8"
    />
  );
}

function droneSprite(key, [x, y]) {
  const rotor = (dx, dy) => (
    <g key={`${dx},${dy}`}>
      <line x1={x} y1={y} x2={x + dx} y2={y + dy} stroke="#4B5563" strokeWidth="1.6" />
      <ellipse cx={x + dx} cy={y + dy - 1.2} rx="6" ry="1.6" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="0.6" />
    </g>
  );
  return (
    <g key={key}>
      {rotor(-11, -3)}
      {rotor(11, -3)}
      {rotor(-8, 3)}
      {rotor(8, 3)}
      <rect x={x - 6} y={y - 3} width="12" height="6" rx="2.5" fill="#374151" />
      <rect x={x - 3} y={y + 2.5} width="6" height="3.5" rx="1" fill="#60A5FA" />
    </g>
  );
}

function Zone({ type, a0, b0, share, active }) {
  const P = (u, v) => proj(a0 + u, b0 + v);
  const down = (p) => [p[0], p[1] + THICK];
  const left = P(0, TILE);
  const bottom = P(TILE, TILE);
  const right = P(TILE, 0);
  const top = P(0, 0);

  const sprites = [];
  const add = (u, v, node) => sprites.push({ n: u * SIN + v * COS, node });
  const strips = [];
  const strip = (key, v, half, fill, opacity = 0.5) =>
    strips.push(<polygon key={key} points={pts([P(14, v - half), P(86, v - half), P(86, v + half), P(14, v + half)])} fill={fill} opacity={opacity} />);

  let pad = '#6E9E33';
  let overlay = null; // drawn above every sprite (drone, spray, drops)

  if (type === 'cutting') {
    const caneH = 12 + share * 14;
    [22, 46, 72].forEach((v, i) => strip(`s${i}`, v, 3, '#4F7A2B'));
    // Back two rows still standing, front row cut down to stubs.
    [22, 46].forEach((v, i) => [20, 38, 56, 74].forEach((u, j) => add(u, v, caneSprite(`c${i}-${j}`, P(u, v), caneH))));
    [20, 38].forEach((u, j) => add(u, 72, stubSprite(`st${j}`, P(u, 72))));
    // Harvested stalks tied in a bundle at the front corner.
    const bundle = [
      [80, 0], [83.5, 0], [87, 0],
      [81.8, 2.4], [85.2, 2.4],
    ].map(([v, lift], k) => stick(`b${k}`, up(P(50, v), lift), up(P(86, v), lift), '#A8893F', '#E8D49A', 3.6));
    const tie = <line key="tie" x1={P(68, 79)[0]} y1={P(68, 79)[1] - 3} x2={P(68, 88)[0]} y2={P(68, 88)[1] - 1} stroke="#6B4F2A" strokeWidth="2.2" strokeLinecap="round" />;
    add(68, 84, <g key="bundle">{bundle}{tie}</g>);
  } else if (type === 'planting') {
    pad = '#B58E58';
    [24, 50, 76].forEach((v, i) => strip(`s${i}`, v, 4, '#7A5A2C', 0.55));
    // Setts laid along each furrow; some have started to shoot.
    [24, 50, 76].forEach((v, i) =>
      [26, 50, 74].forEach((u, j) => {
        add(u, v, stick(`t${i}-${j}`, P(u - 7, v), P(u + 7, v), '#8A6A38', '#D9B86A', 3));
        if ((i + j) % 2 === 0) add(u + 1, v - 1, sproutSprite(`p${i}-${j}`, up(P(u + 1, v - 1), 1)));
      }),
    );
  } else if (type === 'watering') {
    pad = '#8F6A3E';
    // Water running along the furrows; seedlings on the ridges between them.
    [24, 50, 76].forEach((v, i) => {
      strip(`w${i}`, v, 5, '#6CC0E5', 0.95);
      strips.push(<polygon key={`h${i}`} points={pts([P(16, v - 1.5), P(84, v - 1.5), P(84, v - 0.5), P(16, v - 0.5)])} fill="#D6F1FB" opacity="0.9" />);
    });
    [37, 63].forEach((v, i) => [22, 40, 58, 76].forEach((u) => add(u, v, sproutSprite(`p${i}-${u}`, P(u, v)))));
    overlay = (
      <g>
        {dropSprite('d1', up(P(28, 28), 22))}
        {dropSprite('d2', up(P(46, 20), 30), 0.85)}
        {dropSprite('d3', up(P(20, 46), 30), 0.85)}
        {dropSprite('d4', up(P(40, 40), 16), 0.7)}
      </g>
    );
  } else if (type === 'spraying') {
    const caneH = 12 + share * 8;
    [24, 50, 76].forEach((v, i) => strip(`s${i}`, v, 3, '#4F7A2B'));
    [24, 50, 76].forEach((v, i) => [20, 40, 60, 80].forEach((u, j) => add(u, v, caneSprite(`c${i}-${j}`, P(u, v), caneH))));
    const [dx, dy] = up(P(38, 38), 40);
    const [gx, gy] = up(P(46, 46), caneH * 0.6);
    overlay = (
      <g>
        <polygon points={pts([[dx - 4, dy + 6], [dx + 4, dy + 6], [gx + 26, gy], [gx - 26, gy]])} fill="#E0F2FE" opacity="0.6" />
        <g fill="#FFFFFF" opacity="0.9">
          <circle cx={gx - 14} cy={gy - 3} r="2" />
          <circle cx={gx + 2} cy={gy - 8} r="1.6" />
          <circle cx={gx + 15} cy={gy - 2} r="2.2" />
          <circle cx={gx - 4} cy={gy - 16} r="1.4" />
          <circle cx={gx + 8} cy={gy - 18} r="1.2" />
        </g>
        {droneSprite('drone', [dx, dy])}
      </g>
    );
  }

  sprites.sort((x, y) => x.n - y.n);

  return (
    <g style={{ transform: active ? 'translateY(-10px)' : 'translateY(0)', filter: active ? 'drop-shadow(0 10px 8px rgba(46,74,31,0.28))' : 'none', transition: 'transform .25s ease, filter .25s ease' }}>
      <polygon points={pts([left, bottom, down(bottom), down(left)])} fill="#4F7A2B" />
      <polygon points={pts([bottom, right, down(right), down(bottom)])} fill="#2E4A1F" />
      <polygon points={pts([top, right, bottom, left])} fill="#B7DA5E" stroke={active ? '#E6F58A' : 'none'} strokeWidth={active ? 3 : 0} strokeLinejoin="round" />
      <polygon points={pts([P(10, 10), P(90, 10), P(90, 90), P(10, 90)])} fill={pad} />
      {strips}
      {sprites.map((s) => s.node)}
      {overlay}
    </g>
  );
}

function isLight(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

/**
 * zones: [{ id, label, pct, color, icon? }] (4 items, in display order)
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
      const P = (u, v) => proj(a0 + u, b0 + v);
      // Labels go in the empty space just outside each plot's outer edge, so they never cover the drawing:
      // back plot above its cane, right plot above its back edge, left plot below its front edge, front plot below it.
      const chip = [
        { at: up(P(12, 12), 30), below: false },
        { at: up(P(55, 0), 16), below: false },
        { at: up(P(45, TILE), -(THICK + 16)), below: true },
        { at: up(P(TILE - 12, TILE - 12), -(THICK + 14)), below: true },
      ][gy * 2 + gx];
      return { ...z, a0, b0, chip, order: (a0 + TILE / 2) * SIN + (b0 + TILE / 2) * COS };
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
        maxY = Math.max(maxY, y + THICK + (showChips ? CHIP_ROOM : 0));
      });
    });
    const pad = 12;
    const padX = showChips ? 30 : pad; // side labels reach a little past the field
    return { tiles, vb: { x: minX - padX, y: minY - pad, w: maxX - minX + padX * 2, h: maxY - minY + pad * 2 } };
  }, [zones, showChips]);

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

      {showChips && tiles.map((t) => {
        const Icon = t.icon;
        const [ax, ay] = t.chip.at;
        return (
          <button
            key={`chip-${t.id}`}
            type="button"
            data-test={`task-zone-${t.id}`}
            onMouseEnter={() => onActive(t.id)}
            onMouseLeave={() => onActive(null)}
            onClick={() => onActive(activeId === t.id ? null : t.id)}
            className={`absolute flex -translate-x-1/2 ${t.chip.below ? '' : '-translate-y-full'} items-center gap-1 whitespace-nowrap rounded-full bg-white/95 py-0.5 pl-0.5 pr-2 text-[10px] font-semibold text-[#1A1A1A] shadow-[0_3px_10px_rgba(46,74,31,0.22)] transition duration-200 sm:gap-1.5 sm:text-[11px] ${
              activeId === t.id ? 'ring-2 ring-[#A8D04A]' : activeId ? 'opacity-40' : ''
            }`}
            style={{ left: `${((ax - vb.x) / vb.w) * 100}%`, top: `${((ay - vb.y) / vb.h) * 100}%` }}
          >
            <span
              className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full sm:h-5 sm:w-5"
              style={{ backgroundColor: t.color, color: isLight(t.color) ? '#1F3C14' : '#FFFFFF' }}
            >
              {Icon ? <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" strokeWidth={2.6} /> : null}
            </span>
            {t.label}
            <span className="font-extrabold text-[#2E4A1F]">{t.pct}%</span>
          </button>
        );
      })}
    </div>
  );
}
