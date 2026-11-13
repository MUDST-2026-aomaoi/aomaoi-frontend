import { createContext, useContext } from 'react';

// Sugarcane farm diorama: 4 work zones (planting, cutting, watering, spraying).
// Ground plane coords (u,v) in 0..100 are rotated by YAW around the vertical axis and
// squashed by sin(PITCH): a gentle ~28deg three-quarter view (long edge faces the viewer)
// instead of the 45deg isometric diamond.
const YAW = (28 * Math.PI) / 180;
const PITCH = (35 * Math.PI) / 180;
const COS = Math.cos(YAW);
const SIN = Math.sin(YAW);
const KX = 4.0;
const KY = KX * Math.sin(PITCH);
const project = (u, v) => {
  const a = u - 50;
  const b = v - 50;
  return [300 + (a * COS - b * SIN) * KX, 236 + (a * SIN + b * COS) * KY];
};
/** Larger = nearer to the viewer (painter's order). */
const nearness = (u, v) => (u - 50) * SIN + (v - 50) * COS;

export const FARM_VIEWS = {
  iso: { P: project, box: '0 8 600 432', aspect: '600/432', shadowY: 424 },
};

const ViewCtx = createContext(FARM_VIEWS.iso);
const usePoint = () => useContext(ViewCtx).P;
const toPts = (P, list) => list.map(([u, v]) => P(u, v).join(',')).join(' ');
const lift = ([x, y], h) => [x, y - h];
const str = (list) => list.map((p) => p.join(',')).join(' ');

const WATER = '#9FD6CC';
const WATER_DARK = '#7CC2B8';

function Ground({ u1, v1, u2, v2, fill, opacity = 1 }) {
  const P = usePoint();
  return <polygon points={toPts(P, [[u1, v1], [u2, v1], [u2, v2], [u1, v2]])} fill={fill} opacity={opacity} />;
}

/** Iso box. (u,v) = back corner, w along u, d along v, h height, z elevation. */
function Box({ u, v, w, d, h, z = 0, top, left, right }) {
  const P = usePoint();
  const g = (a, b, hh) => lift(P(a, b), hh);
  return (
    <g>
      <polygon points={str([g(u, v + d, z), g(u + w, v + d, z), g(u + w, v + d, z + h), g(u, v + d, z + h)])} fill={left} />
      <polygon points={str([g(u + w, v + d, z), g(u + w, v, z), g(u + w, v, z + h), g(u + w, v + d, z + h)])} fill={right} />
      <polygon points={str([g(u, v, z + h), g(u + w, v, z + h), g(u + w, v + d, z + h), g(u, v + d, z + h)])} fill={top} />
    </g>
  );
}

function Cane({ u, v, h = 34, lean = 0 }) {
  const P = usePoint();
  const [x, y] = P(u, v);
  const stalks = [[-4, 0.92], [0, 1], [4, 0.88]];
  const d = stalks.map(([dx, k]) => `M${x + dx} ${y} L${x + dx + lean} ${y - h * k}`).join(' ');
  const tops = stalks.map(([dx, k]) => [x + dx + lean, y - h * k]);
  const leaves = tops
    .map(([tx, ty]) => `M${tx} ${ty} q-9 -1 -13 8 M${tx} ${ty} q9 -1 13 8 M${tx} ${ty} q-2 -7 -6 -11 M${tx} ${ty} q2 -7 6 -11`)
    .join(' ');
  return (
    <g>
      <ellipse cx={x} cy={y + 1} rx="11" ry="3.4" fill="#2E4A1F" opacity="0.14" />
      <path d={d} stroke="#A8D04A" strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <path d={d} stroke="#6F9A2C" strokeWidth="3.6" fill="none" strokeDasharray="1.2 8" />
      <path d={leaves} stroke="#4F7A2B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </g>
  );
}

function Sprout({ u, v }) {
  const P = usePoint();
  const [x, y] = P(u, v);
  return <path d={`M${x} ${y} l0 -6 M${x} ${y - 4} l-4 -4 M${x} ${y - 4} l4 -4`} stroke="#A8D04A" strokeWidth="2" strokeLinecap="round" fill="none" />;
}

function Stubble({ u, v }) {
  const P = usePoint();
  const [x, y] = P(u, v);
  return <path d={`M${x - 3} ${y} l0 -4 M${x} ${y} l0 -5 M${x + 3} ${y} l0 -4`} stroke="#D8C27A" strokeWidth="2.4" strokeLinecap="round" fill="none" />;
}

/** Pile of cut cane lying along u. */
function Bundle({ u, v, len = 11 }) {
  const P = usePoint();
  const rows = [
    [0, 0], [1.8, 0], [3.6, 0],
    [0.9, 1], [2.7, 1],
    [1.8, 2],
  ];
  return (
    <g>
      {rows.map(([dv, layer], i) => {
        const [x1, y1] = lift(P(u, v + dv), layer * 3.1 + 2);
        const [x2, y2] = lift(P(u + len, v + dv), layer * 3.1 + 2);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8FBF3C" strokeWidth="3.2" strokeLinecap="round" />
            <circle cx={x2} cy={y2} r="1.7" fill="#EFF3B0" />
          </g>
        );
      })}
      <path
        d={`M${lift(P(u + len * 0.5, v - 1), 1).join(' ')} L${lift(P(u + len * 0.5, v + 7), 9).join(' ')}`}
        stroke="#8A6A38"
        strokeWidth="1.6"
        opacity="0.8"
      />
    </g>
  );
}

function Worker({ u, v, shirt = '#E8A33D', tool = 'none', s = 1 }) {
  const P = usePoint();
  const [x, y] = P(u, v);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="1" rx="8" ry="3" fill="#2E4A1F" opacity="0.2" />
      {tool === 'tank' && (
        <g>
          <rect x="-11" y="-27" width="9" height="15" rx="3" fill="#E8A33D" stroke="#B87A1E" strokeWidth="0.8" />
          <path d="M-7 -14 q6 8 16 -2 l6 -6" stroke="#3A3A3A" strokeWidth="1.4" fill="none" />
        </g>
      )}
      <rect x="-4.5" y="-12" width="3.4" height="12" rx="1.4" fill="#3B4A2A" />
      <rect x="1.1" y="-12" width="3.4" height="12" rx="1.4" fill="#2F3C22" />
      <rect x="-6" y="-28" width="12" height="17" rx="4" fill={shirt} />
      {tool === 'machete' && (
        <g>
          <path d="M5 -24 L14 -36" stroke="#C99A6B" strokeWidth="3" strokeLinecap="round" />
          <path d="M13 -37 L22 -46" stroke="#D9DDD2" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      )}
      {tool === 'seed' && (
        <g>
          <path d="M5 -20 L12 -14" stroke="#C99A6B" strokeWidth="3" strokeLinecap="round" />
          <path d="M12 -14 l7 3 M12 -14 l6 -5" stroke="#A8D04A" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      )}
      {tool === 'tank' && <path d="M5 -22 L13 -26" stroke="#C99A6B" strokeWidth="3" strokeLinecap="round" />}
      <circle cx="0" cy="-33" r="5" fill="#E8B98A" />
      <ellipse cx="0" cy="-36" rx="10" ry="3.4" fill="#E2BB5C" />
      <path d="M-5 -36 q5 -8 10 0 z" fill="#D2A641" />
    </g>
  );
}

function Tree({ u, v, s = 1 }) {
  const P = usePoint();
  const [x, y] = P(u, v);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="2" rx="16" ry="6" fill="#2E4A1F" opacity="0.18" />
      <rect x="-3" y="-14" width="6" height="16" rx="2" fill="#6B4F2A" />
      <polygon points="0,-62 -20,-30 20,-30" fill="#3F6B27" />
      <polygon points="0,-48 -24,-16 24,-16" fill="#4F7A2B" />
      <polygon points="0,-62 20,-30 0,-30" fill="#2E4A1F" opacity="0.35" />
      <polygon points="0,-48 24,-16 0,-16" fill="#2E4A1F" opacity="0.3" />
    </g>
  );
}

function Wheel({ x, y, r = 5 }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#2B2B2B" />
      <circle cx={x} cy={y} r={r * 0.45} fill="#D9DDD2" />
    </g>
  );
}

function Truck({ u, v }) {
  const P = usePoint();
  const a = P(u + 3, v + 12);
  const b = P(u + 15, v + 12);
  return (
    <g>
      <ellipse cx={P(u + 8, v + 6)[0]} cy={P(u + 8, v + 6)[1] + 4} rx="34" ry="11" fill="#2E4A1F" opacity="0.16" />
      <Box u={u} v={v} w={16} d={12} h={6} z={5} top="#CFC6A0" left="#A89F78" right="#8F8764" />
      <Box u={u + 16} v={v + 1} w={7} d={10} h={11} z={5} top="#F2B85C" left="#E8A33D" right="#C98626" />
      <Box u={u + 1} v={v + 1} w={14} d={10} h={7} z={11} top="#9ACB43" left="#7FB03A" right="#659A2A" />
      <Wheel x={a[0]} y={a[1] - 3} />
      <Wheel x={b[0]} y={b[1] - 3} />
    </g>
  );
}

function Tractor({ u, v }) {
  const P = usePoint();
  const a = P(u + 2, v + 6);
  const b = P(u + 11, v + 6);
  return (
    <g>
      <ellipse cx={P(u + 6, v + 3)[0]} cy={P(u + 6, v + 3)[1] + 5} rx="26" ry="9" fill="#2E4A1F" opacity="0.18" />
      <Box u={u} v={v} w={14} d={6} h={8} z={4} top="#F2B85C" left="#E8A33D" right="#C98626" />
      <Box u={u + 7} v={v + 0.5} w={6} d={5} h={9} z={12} top="#EFF3E4" left="#DDE3CF" right="#C3CBB2" />
      <Box u={u + 15} v={v + 1} w={4} d={4} h={4} z={4} top="#F2B85C" left="#E8A33D" right="#C98626" />
      <Wheel x={a[0] + 1} y={a[1] - 4} r={6.5} />
      <Wheel x={b[0] + 4} y={b[1] - 4} r={8} />
    </g>
  );
}

function Sprinkler({ u, v }) {
  const P = usePoint();
  const [x, y] = P(u, v);
  const top = y - 30;
  const arcs = [
    `M${x} ${top} q-16 -14 -34 2`,
    `M${x} ${top} q-12 -20 -24 -6`,
    `M${x} ${top} q16 -14 34 2`,
    `M${x} ${top} q12 -20 24 -6`,
  ];
  return (
    <g>
      <rect x={x - 1.2} y={top} width="2.4" height="30" fill="#8A8F85" />
      <circle cx={x} cy={top} r="3" fill="#4F7A2B" />
      {arcs.map((d, i) => (
        <path key={i} d={d} stroke={WATER} strokeWidth="2" fill="none" strokeLinecap="round" strokeDasharray="4 3">
          <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="1.1s" repeatCount="indefinite" />
        </path>
      ))}
      {[[-34, 2], [-24, -6], [34, 2], [24, -6]].map(([dx, dy], i) => (
        <circle key={i} cx={x + dx} cy={top + dy + 3} r="1.6" fill={WATER_DARK} />
      ))}
    </g>
  );
}

function SprayBoom({ u, v1, v2, horizontal = false, v = 0, u1 = 0, u2 = 0 }) {
  const P = usePoint();
  const n = 7;
  const along = (i) => (horizontal ? u1 + ((u2 - u1) * i) / (n - 1) : v1 + ((v2 - v1) * i) / (n - 1));
  const at = (t) => (horizontal ? P(t, v) : P(u, t));
  const nozzles = Array.from({ length: n }, (_, i) => along(i));
  const h = 22;
  const a = lift(at(horizontal ? u1 : v1), h);
  const b = lift(at(horizontal ? u2 : v2), h);
  return (
    <g>
      <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#8A8F85" strokeWidth="2.4" strokeLinecap="round" />
      {nozzles.map((nv, i) => {
        const [x, y] = lift(at(nv), h);
        return (
          <g key={i}>
            <polygon points={`${x},${y} ${x - 7},${y + 24} ${x + 7},${y + 24}`} fill="#E6F0D6" opacity="0.5" />
            <circle cx={x - 3} cy={y + 10} r="1.5" fill="#fff" opacity="0.9" />
            <circle cx={x + 3} cy={y + 15} r="1.4" fill="#fff" opacity="0.9" />
            <circle cx={x} cy={y + 20} r="1.3" fill="#fff" opacity="0.9" />
          </g>
        );
      })}
    </g>
  );
}

export function FarmIsometric({ className = '' }) {
  const V = FARM_VIEWS.iso;
  const P = V.P;
  const pts = (list) => toPts(P, list);
  const top = P(0, 0);
  const right = P(100, 0);
  const bottom = P(100, 100);
  const left = P(0, 100);

  const items = [];
  const add = (d, node) => items.push({ d, node });

  // Q1 planting (u 4-48, v 4-48): furrows, young sprouts, cane sets
  [10, 16.5, 23, 29.5, 36, 42].forEach((fv, i) => {
    for (let fu = 10; fu <= 44; fu += 6) {
      if (fu <= 32) add(fu + fv, <Sprout key={`s${i}-${fu}`} u={fu} v={fv} />);
    }
  });
  add(10 + 47, <Bundle key="q1b" u={38} v={7} len={9} />);
  add(30 + 30, <Worker key="q1w" u={33} v={26.5} shirt="#E8A33D" tool="seed" />);

  // Q2 cutting (u 52-96, v 4-48): standing cane, harvested area, truck
  [56, 64].forEach((cu) => {
    [10, 18, 26, 34, 42].forEach((cv) => add(cu + cv, <Cane key={`c2-${cu}-${cv}`} u={cu} v={cv} h={36} lean={(cv % 3) - 1} />));
  });
  [78, 84, 90].forEach((su) => {
    [8, 13, 18, 23, 28, 33, 38, 43].forEach((sv) => add(su + sv, <Stubble key={`st-${su}-${sv}`} u={su} v={sv} />));
  });
  add(74 + 22, <Worker key="q2w" u={73} v={21} shirt="#D9633B" tool="machete" />);
  add(80 + 8, <Bundle key="q2b1" u={79} v={9} len={9} />);
  add(80 + 28, <Bundle key="q2b2" u={80} v={28} len={9} />);
  add(76 + 34, <Truck key="q2t" u={75} v={33} />);

  // Q3 watering (u 4-48, v 52-96): cane + irrigation channel + sprinklers
  [10, 24, 38].forEach((cu) => {
    [58, 66, 88].forEach((cv) => add(cu + cv, <Cane key={`c3-${cu}-${cv}`} u={cu} v={cv} h={32} lean={(cu % 3) - 1} />));
  });
  [16, 36].forEach((su) => add(998, <Sprinkler key={`sp-${su}`} u={su} v={74} />));

  // Q4 spraying (u 52-96, v 52-96): cane + tractor with boom + backpack sprayer
  [58, 70, 82].forEach((cu) => {
    [58, 66, 88].forEach((cv) => add(cu + cv, <Cane key={`c4-${cu}-${cv}`} u={cu} v={cv} h={32} lean={(cv % 3) - 1} />));
  });
  add(90 + 61, <Worker key="q4w" u={91} v={62} shirt="#EFF3E4" tool="tank" />);
  add(998, <SprayBoom key="boom" u={64} v1={56} v2={92} />);
  add(999, <Tractor key="tractor" u={66} v={71} />);

  // Border trees
  add(2 + 4, <Tree key="t1" u={2} v={3} s={0.8} />);
  add(98 + 2, <Tree key="t2" u={98} v={3} s={0.9} />);
  add(2 + 98, <Tree key="t3" u={2} v={97} s={0.9} />);
  add(97 + 97, <Tree key="t4" u={99} v={99} s={0.8} />);

  // Boom, tractor and sprinklers (d >= 998) always paint last; the rest by distance from viewer.
  const depth = (it) => {
    if (it.d >= 998) return it.d;
    const pr = it.node.props;
    return nearness(pr.u, pr.v);
  };
  items.sort((a, b) => depth(a) - depth(b));

  return (
    <svg viewBox={V.box} className={className} role="img" aria-label="Isometric sugarcane farm">
      <defs>
        <linearGradient id="fi-grass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B7DA5E" />
          <stop offset="1" stopColor="#86B63F" />
        </linearGradient>
        <linearGradient id="fi-soil" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B58E58" />
          <stop offset="1" stopColor="#93703F" />
        </linearGradient>
      </defs>

      <ellipse cx="300" cy={V.shadowY} rx="270" ry="14" fill="#2E4A1F" opacity="0.09" />

      {/* slab */}
      <polygon points={`${left.join(',')} ${bottom.join(',')} ${bottom[0]},${bottom[1] + 34} ${left[0]},${left[1] + 34}`} fill="#4F7A2B" />
      <polygon points={`${bottom.join(',')} ${right.join(',')} ${right[0]},${right[1] + 34} ${bottom[0]},${bottom[1] + 34}`} fill="#2E4A1F" />
      <polygon points={`${top.join(',')} ${right.join(',')} ${bottom.join(',')} ${left.join(',')}`} fill="url(#fi-grass)" />

      <ViewCtx.Provider value={V}>
      {/* dirt paths between zones */}
      <Ground u1={0} v1={48} u2={100} v2={52} fill="#E9E0BC" />
      <Ground u1={48} v1={0} u2={52} v2={100} fill="#E9E0BC" />

      {/* Q1 planting soil */}
      <Ground u1={4} v1={4} u2={48} v2={48} fill="url(#fi-soil)" />
      {[10, 16.5, 23, 29.5, 36, 42].map((fv) => (
        <Ground key={fv} u1={6} v1={fv - 1} u2={46} v2={fv + 1} fill="#6B4F2A" opacity="0.5" />
      ))}

      {/* Q2 cutting: standing cane | harvested soil */}
      <Ground u1={52} v1={4} u2={73} v2={48} fill="#6E9E33" />
      {[8, 14, 20, 26, 32, 38, 44].map((cv) => (
        <Ground key={cv} u1={53} v1={cv - 1.2} u2={72} v2={cv + 1.2} fill="#4F7A2B" opacity="0.45" />
      ))}
      <Ground u1={73} v1={4} u2={96} v2={48} fill="#B08F5A" />
      {[8, 13, 18, 23, 28, 33, 38, 43].map((sv) => (
        <Ground key={sv} u1={74} v1={sv - 0.8} u2={95} v2={sv + 0.8} fill="#8A6A38" opacity="0.45" />
      ))}

      {/* Q3 watering */}
      <Ground u1={4} v1={52} u2={48} v2={96} fill="#6E9E33" />
      {[58, 66, 88].map((cv) => (
        <Ground key={cv} u1={5} v1={cv - 1.2} u2={47} v2={cv + 1.2} fill="#4F7A2B" opacity="0.45" />
      ))}
      <Ground u1={4} v1={72} u2={48} v2={76} fill="#8A6A38" opacity="0.55" />
      <Ground u1={5} v1={73} u2={47} v2={75} fill={WATER} />
      <Ground u1={5} v1={73.6} u2={47} v2={74.2} fill="#D9F0EA" opacity="0.8" />

      {/* Q4 spraying */}
      <Ground u1={52} v1={52} u2={96} v2={96} fill="#6E9E33" />
      {[58, 66, 88].map((cv) => (
        <Ground key={cv} u1={53} v1={cv - 1.2} u2={95} v2={cv + 1.2} fill="#4F7A2B" opacity="0.45" />
      ))}
      <Ground u1={52} v1={70} u2={96} v2={78} fill="#CBB886" opacity="0.85" />

      {items.map((it) => it.node)}
      </ViewCtx.Provider>
    </svg>
  );
}
