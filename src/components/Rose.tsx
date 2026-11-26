import { useMemo } from "react";
import { f1, seeded } from "../lib/random";

/** Drawn roses (seen from above) for the small spots: dividers, game cards, hidden roses, the counter. */

export type Tone = "red" | "pink" | "blush";

const TONES: Record<Tone, string[]> = {
  red: ["#f09aa6", "#dd5468", "#c4344a", "#a52238", "#82142a", "#5a0a1c"],
  pink: ["#fde3e9", "#f9b9c8", "#f190a8", "#e46a89", "#c94b6c", "#9a3050"],
  blush: ["#fff4f0", "#fde2da", "#f8c8bc", "#efab9b", "#dc8775", "#b5604f"]
};

export const petalPath = (r: number, w: number) =>
  `M0 0C${f1(w * r * 0.75)} ${f1(-r * 0.25)} ${f1(w * r * 0.7)} ${f1(-r * 1.05)} 0 ${f1(-r)}` +
  `C${f1(-w * r * 0.7)} ${f1(-r * 1.05)} ${f1(-w * r * 0.75)} ${f1(-r * 0.25)} 0 0Z`;

const LAYERS: [number, number, number][] = [[46, 5, 1.05], [39, 5, 1], [31, 5, 0.95], [24, 4, 0.9], [17, 4, 0.85], [10, 3, 0.8]];

export function RoseGroup({ tone = "red", seed = 1 }: { tone?: Tone; seed?: number }) {
  const petals = useMemo(() => {
    const rnd = seeded(seed * 7919);
    const c = TONES[tone];
    const out: { d: string; rot: string; fill: string; stroke: string }[] = [];
    LAYERS.forEach(([r, n, w], li) => {
      const off = rnd() * 360;
      for (let k = 0; k < n; k++) {
        const a = off + (k * 360) / n + (rnd() * 14 - 7);
        out.push({ d: petalPath(r * (0.92 + rnd() * 0.12), w), rot: `rotate(${f1(a)})`, fill: c[li], stroke: c[Math.min(li + 1, 5)] });
      }
    });
    return out;
  }, [tone, seed]);
  const c = TONES[tone];
  return (
    <>
      {petals.map((p, i) => <path key={i} d={p.d} transform={p.rot} fill={p.fill} stroke={p.stroke} strokeWidth={0.8} />)}
      <circle r={4} fill={c[5]} />
      <path d="M-3 0a3 3 0 0 1 6 0a2 2 0 0 1-4 0" fill="none" stroke={c[3]} strokeWidth={1} />
    </>
  );
}

export function Leaves({ seed = 1, r = 64 }: { seed?: number; r?: number }) {
  const angles = useMemo(() => {
    const rnd = seeded(seed * 104729);
    return [150, 215, 30].map((base) => base + rnd() * 30 - 15);
  }, [seed]);
  return (
    <>
      {angles.map((a, i) => (
        <g key={i} transform={`rotate(${f1(a)})`}>
          <path d={petalPath(r, 0.42)} fill="#3f7a4a" stroke="#2b5634" strokeWidth={1} />
          <path d={`M0 -8V${-r + 8}`} stroke="#2b5634" strokeWidth={1.2} fill="none" />
        </g>
      ))}
    </>
  );
}

export function Rose({ size = 60, tone = "red", seed = 1, leaves = true, className = "" }: {
  size?: number; tone?: Tone; seed?: number; leaves?: boolean; className?: string;
}) {
  return (
    <svg className={`rose ${className}`} viewBox="-70 -70 140 140" width={size} height={size} aria-hidden="true">
      {leaves && <Leaves seed={seed} />}
      <RoseGroup tone={tone} seed={seed} />
    </svg>
  );
}
