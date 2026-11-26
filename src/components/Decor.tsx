import { useMemo, type CSSProperties } from "react";
import { useGarden } from "../lib/garden";
import { HIDDEN_ROSES } from "../content";
import { f1, seeded } from "../lib/random";
import { Rose, type Tone } from "./Rose";

/** Line, rose, line: sits at the top of each chapter. */
export function Divider({ index }: { index: number }) {
  return (
    <div className="divider">
      <Rose size={36} tone={index % 2 ? "pink" : "red"} seed={40 + index} leaves={false} />
    </div>
  );
}

/** One of the seven tiny roses hidden around the page. Tapping it earns a rose. */
export function HiddenRose({ index, style }: { index: number; style: CSSProperties }) {
  const { has, earn, countOf } = useGarden();
  const id = "h:" + index;
  if (has(id)) return null;
  const tones: Tone[] = ["red", "pink", "blush"];
  return (
    <button type="button" className="hidden-rose" style={style} aria-label="A hidden rose"
      onClick={(e) => {
        e.stopPropagation();
        e.currentTarget.classList.add("found");
        earn(id, e.clientX, e.clientY, `Hidden rose ${countOf("h") + 1} of ${HIDDEN_ROSES}`);
      }}>
      <Rose size={30} tone={tones[index % 3]} seed={70 + index} leaves={false} />
    </button>
  );
}

/* Drawn balloon bunches (SVG, no image file). */
const TONES: [string, string][] = [
  ["#f9d3dc", "#d98ea2"], ["#ef5b7d", "#9a1f3e"], ["#f3d79c", "#b48437"], ["#fdf6f2", "#d6bfb6"], ["#f58fa9", "#b8456a"]
];
const SPOTS: [number, number, number][] = [[62, 64, 1], [116, 46, 1.12], [158, 96, 0.95], [88, 120, 1.05], [138, 150, 0.9]];
const BALLOON = "M0 -25C14 -25 22 -14 22 -2C22 12 10 24 0 26C-10 24 -22 12 -22 -2C-22 -14 -14 -25 0 -25Z";

export function Balloons({ id, seed, className }: { id: string; seed: number; className: string }) {
  const parts = useMemo(() => {
    const rnd = seeded(seed * 48271);
    const gx = 104, gy = 262;
    return SPOTS.map(([x, y, s], i) => {
      const tone = (i + seed) % TONES.length;
      const knotY = y + 31 * s;
      const wig = rnd() * 30 - 15;
      return {
        string: `M${x} ${f1(knotY + 4)} Q${f1((x + gx) / 2 + wig)} ${f1((knotY + gy) / 2)} ${gx} ${gy}`,
        transform: `translate(${x} ${y}) scale(${s}) rotate(${f1(rnd() * 16 - 8)})`,
        tone
      };
    });
  }, [seed]);
  return (
    <div className={className} aria-hidden="true">
      <svg viewBox="20 10 180 260">
        <defs>
          {TONES.map(([light, dark], k) => (
            <radialGradient key={k} id={`${id}g${k}`} cx="36%" cy="30%" r="75%">
              <stop offset="0" stopColor="#ffffff" stopOpacity=".95" /><stop offset=".22" stopColor={light} /><stop offset="1" stopColor={dark} />
            </radialGradient>
          ))}
        </defs>
        {parts.map((p, i) => <path key={"s" + i} d={p.string} fill="none" stroke="#e9c27d" strokeOpacity={0.7} strokeWidth={1.1} />)}
        {parts.map((p, i) => (
          <g key={"b" + i} transform={p.transform}>
            <path d={BALLOON} fill={`url(#${id}g${p.tone})`} />
            <ellipse cx={-8} cy={-12} rx={4.5} ry={7.5} fill="#ffffff" opacity={0.45} transform="rotate(-28 -8 -12)" />
            <path d="M0 26L-3.5 31.5H3.5Z" fill={TONES[p.tone][1]} />
          </g>
        ))}
        <path d="M98 258q6 -6 12 0q-6 6 -12 0z" fill="#e0466a" />
      </svg>
    </div>
  );
}
