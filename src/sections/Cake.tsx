import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { content } from "../content";
import { burst, petalBurst } from "../lib/effects";
import { useGarden } from "../lib/garden";
import { f1, seeded } from "../lib/random";
import { Balloons, Divider, HiddenRose } from "../components/Decor";
import { Leaves, RoseGroup, type Tone } from "../components/Rose";

const CX = 160;

/** Frosting drips hanging off the front edge of a tier. */
function dripPath(cy: number, rx: number, ry: number, seed: number) {
  const rnd = seeded(seed);
  const n = 14, top: [number, number][] = [], bottom: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = Math.PI - (i / n) * Math.PI;
    const x = CX + rx * Math.cos(t), y = cy + ry * Math.sin(t);
    top.push([x, y]);
    bottom.push([x, y + (i % 2 ? 8 + rnd() * 16 : 4 + rnd() * 4)]);
  }
  let d = `M${f1(top[0][0])} ${f1(top[0][1] - 2)}`;
  top.forEach(([x, y]) => { d += ` L${f1(x)} ${f1(y - 2)}`; });
  for (let i = n; i > 0; i--) {
    const [x1, y1] = bottom[i], [x0, y0] = bottom[i - 1];
    d += ` Q${f1(x1)} ${f1(y1 + 4)} ${f1((x1 + x0) / 2)} ${f1((y1 + y0) / 2)}`;
  }
  return d + " Z";
}

function Tier({ cy, h, rx, ry, side, top, drip, seed }: { cy: number; h: number; rx: number; ry: number; side: string; top: string; drip: string; seed: number }) {
  const pearls = Array.from({ length: 15 }, (_, k) => {
    const t = Math.PI - ((k + 1) / 16) * Math.PI;
    return { cx: f1(CX + rx * Math.cos(t)), cy: f1(cy + h + ry * Math.sin(t) - 2) };
  });
  return (
    <>
      <ellipse cx={CX} cy={cy + h} rx={rx} ry={ry} fill={side} />
      <rect x={CX - rx} y={cy} width={rx * 2} height={h} fill={side} />
      <rect x={CX - rx} y={cy} width={rx * 0.35} height={h} fill="#000" opacity={0.05} />
      <path d={dripPath(cy, rx, ry, seed)} fill={drip} />
      <ellipse cx={CX} cy={cy} rx={rx} ry={ry} fill={top} />
      {pearls.map((p, k) => <circle key={k} cx={p.cx} cy={p.cy} r={2.6} fill="#fffaf5" stroke="#e7cdb8" strokeWidth={0.6} />)}
    </>
  );
}

const Deco = ({ x, y, s, tone, seed }: { x: number; y: number; s: number; tone: Tone; seed: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><Leaves seed={seed} r={52} /><RoseGroup tone={tone} seed={seed} /></g>
);

const CANDLES = [{ x: 116, base: 128, h: 34 }, { x: 136, base: 120, h: 42 }, { x: 184, base: 120, h: 42 }, { x: 204, base: 128, h: 34 }];
const FLAME_COUNT = CANDLES.length + 1;

function Flame({ x, y, out, onBlow }: { x: number; y: number; out: boolean; onBlow: () => void }) {
  return (
    <g className={`flame-wrap ${out ? "out" : "lit"}`} onClick={onBlow}>
      <circle className="candle-glow" cx={x} cy={y - 9} r={18} fill="url(#cglow)" />
      <path className="flame" d={`M${x} ${y - 20}C${x + 7} ${y - 9} ${x + 6} ${y} ${x} ${y}C${x - 6} ${y} ${x - 7} ${y - 9} ${x} ${y - 20}Z`} fill="url(#cflame)" />
      <path className="smoke" d={`M${x} ${y - 4}c-5-8 5-12 0-20c-5-8 5-12 0-18`} />
      <circle className="hit" cx={x} cy={y - 10} r={15} fill="transparent" />
    </g>
  );
}

type Phase = "candles" | "wish" | "cut" | "done";
const INTRO = "Blow out the candles first. Tap each flame, or blow into your phone's microphone.";

export function Cake() {
  const { earn } = useGarden();
  const [out, setOut] = useState<boolean[]>(() => Array(FLAME_COUNT).fill(false));
  const [phase, setPhase] = useState<Phase>("candles");
  const [msg, setMsg] = useState("");
  const [lede, setLede] = useState(INTRO);
  const [micShown, setMicShown] = useState(true);
  const [windy, setWindy] = useState(false);
  const [split, setSplit] = useState(false);
  const [knife, setKnife] = useState<{ x: number; y: number } | null>(null);
  const [line, setLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const cutStart = useRef<{ x: number; y: number } | null>(null);
  const mic = useRef<{ stream: MediaStream; ctx: AudioContext } | null>(null);
  const outRef = useRef(out);
  outRef.current = out;

  const body = useMemo(() => (
    <>
      <Tier cy={182} h={76} rx={104} ry={17} side="#f3b3c4" top="#fbd6e0" drip="#fff6ef" seed={11} />
      <text x={CX} y={242} textAnchor="middle" style={{ fontFamily: "var(--script)", fontSize: 30 }} fill="#9a2f4e">{content.cake.text}</text>
      <Deco x={78} y={190} s={0.22} tone="red" seed={21} />
      <Deco x={242} y={190} s={0.22} tone="pink" seed={22} />
      <Tier cy={122} h={60} rx={66} ry={11} side="#fff2ec" top="#ffffff" drip="#e0607f" seed={12} />
      <Deco x={108} y={140} s={0.16} tone="red" seed={23} />
      <Deco x={212} y={140} s={0.16} tone="red" seed={24} />
    </>
  ), []);

  const stopMic = () => {
    setWindy(false);
    mic.current?.stream.getTracks().forEach((t) => t.stop());
    void mic.current?.ctx.close().catch(() => {});
    mic.current = null;
  };
  useEffect(() => stopMic, []);

  const blow = (i: number) => {
    if (outRef.current[i]) return;
    const next = outRef.current.map((v, k) => (k === i ? true : v));
    outRef.current = next;
    setOut(next);
    const left = next.filter((v) => !v).length;
    if (left > 0) { setMsg(`${left} more to go…`); return; }
    setPhase("wish");
    stopMic();
    setMicShown(false);
    setMsg(content.cake.wish);
    setLede("All the candles are out. Take a moment.");
    const r = stage.current!.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height * 0.3, 18);
    earn("candles", r.left + r.width / 2, r.top + r.height * 0.3, "Candles blown out");
  };

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      ctx.createMediaStreamSource(stream).connect(an);
      mic.current = { stream, ctx };
      setMicShown(false);
      setMsg("Blow now!");
      const buf = new Float32Array(an.fftSize);
      let loud = 0, cool = 0;
      const listen = () => {
        if (!mic.current) return;
        an.getFloatTimeDomainData(buf);
        let sum = 0;
        for (const v of buf) sum += v * v;
        loud = Math.sqrt(sum / buf.length) > 0.12 ? loud + 1 : 0;
        setWindy(loud > 1);
        if (cool > 0) cool--;
        else if (loud > 4) {
          const i = outRef.current.findIndex((v) => !v);
          if (i >= 0) blow(i);
          cool = 12;
        }
        requestAnimationFrame(listen);
      };
      listen();
    } catch {
      stopMic();
      setMicShown(false);
      setMsg("The mic isn't available here, so tap each flame to blow it out.");
    }
  };

  const toSvg = (e: { clientX: number; clientY: number }) => {
    const r = svg.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * 320) / r.width, y: ((e.clientY - r.top) * 320) / r.height };
  };
  const moveKnife = (e: RPointerEvent) => {
    const r = stage.current!.getBoundingClientRect();
    setKnife({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const doCut = (x: number, y: number) => {
    setPhase("done");
    setKnife(null);
    setTimeout(() => { setLine(null); setSplit(true); }, 250);
    setLede("Happy anniversary to us.");
    setMsg(content.cake.cut);
    burst(x, y, 30);
    petalBurst(x, y, 50);
    earn("cake", x, y, "Cake cut");
  };

  const again = () => {
    setSplit(false);
    setOut(Array(FLAME_COUNT).fill(false));
    setPhase("candles");
    setMicShown(true);
    setLede(INTRO);
    setMsg("");
  };

  return (
    <section className="chapter" id="cake-ch">
      <Balloons id="cb1" seed={1} className="cake-balloon r" />
      <Balloons id="cb2" seed={2} className="cake-balloon l" />
      <Divider index={7} />
      <div><span className="eyebrow">Let's celebrate</span><h2>Our first <em>anniversary cake</em></h2></div>
      <p className="lede">{lede}</p>
      <div
        ref={stage}
        className={`cake-stage${phase === "cut" ? " cutting" : ""}${windy ? " windy" : ""}${split ? " split" : ""}`}
        onPointerMove={(e) => {
          if (phase !== "cut") return;
          moveKnife(e);
          if (!cutStart.current) return;
          const p = toSvg(e);
          setLine((l) => (l ? { ...l, x2: p.x, y2: p.y } : l));
        }}
        onPointerDown={(e) => {
          if (phase !== "cut") return;
          try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
          moveKnife(e);
          const p = toSvg(e);
          cutStart.current = p;
          setLine({ x1: p.x, y1: p.y, x2: p.x, y2: p.y });
        }}
        onPointerUp={(e) => {
          if (phase !== "cut" || !cutStart.current) return;
          const p = toSvg(e), s = cutStart.current;
          cutStart.current = null;
          if (Math.hypot(p.x - s.x, p.y - s.y) >= 80) doCut(e.clientX, e.clientY);
          else { setLine(null); setMsg("A little longer. Swipe all the way across the cake."); }
        }}
      >
        <svg ref={svg} viewBox="0 0 320 320" role="img" aria-label="Our anniversary cake">
          <defs>
            <radialGradient id="cflame" cx="50%" cy="72%" r="60%"><stop offset="0" stopColor="#fffbe2" /><stop offset=".45" stopColor="#ffd24d" /><stop offset="1" stopColor="#ff7a2f" /></radialGradient>
            <radialGradient id="cglow"><stop offset="0" stopColor="#ffd98a" stopOpacity=".75" /><stop offset="1" stopColor="#ffd98a" stopOpacity="0" /></radialGradient>
            <clipPath id="cake-left"><rect x={-20} y={0} width={CX + 20} height={320} /></clipPath>
            <clipPath id="cake-right"><rect x={CX} y={0} width={CX + 20} height={320} /></clipPath>
          </defs>
          <ellipse cx={CX} cy={268} rx={138} ry={24} className="cake-plate" />
          <g className="half left" clipPath="url(#cake-left)">{body}</g>
          <g className="half right" clipPath="url(#cake-right)">{body}</g>
          <g className="candles">
            {CANDLES.map((c, i) => {
              const top = c.base - c.h;
              const stripes = [];
              for (let k = 6; k < c.h; k += 9) stripes.push(<path key={k} d={`M${c.x - 4} ${top + k + 4}L${c.x + 4} ${top + k}`} stroke="#ffffff" strokeWidth={2.4} />);
              return (
                <g key={i}>
                  <rect x={c.x - 4} y={top} width={8} height={c.h} rx={2} fill={i % 2 ? "#e46a89" : "#f190a8"} />
                  {stripes}
                  <line x1={c.x} y1={top} x2={c.x} y2={top - 6} stroke="#3b1222" strokeWidth={1.4} />
                  <Flame x={c.x} y={top - 5} out={out[i]} onBlow={() => phase === "candles" && blow(i)} />
                </g>
              );
            })}
            <polygon points="146,80 160,64 170,64 170,128 154,128 154,84" fill="#e8c27a" stroke="#a8782c" strokeWidth={1.6} strokeLinejoin="round" />
            <path d="M158 70 L166 70 L166 124" stroke="#fff6dc" strokeWidth={2} fill="none" opacity={0.7} />
            <line x1={162} y1={64} x2={162} y2={57} stroke="#3b1222" strokeWidth={1.4} />
            <Flame x={162} y={56} out={out[4]} onBlow={() => phase === "candles" && blow(4)} />
          </g>
          {line && <line className="cutline" x1={f1(line.x1)} y1={f1(line.y1)} x2={f1(line.x2)} y2={f1(line.y2)} />}
          <g className="slice">
            <ellipse cx={270} cy={304} rx={40} ry={8} className="cake-plate" />
            <rect x={250} y={270} width={40} height={32} fill="#f3b3c4" />
            <rect x={250} y={281} width={40} height={5} fill="#fff6ef" />
            <rect x={250} y={292} width={40} height={4} fill="#fff6ef" />
            <path d="M248 270 h44 v4 q-4 6 -8 0 q-5 8 -10 0 q-5 7 -10 0 q-5 8 -10 0 q-3 5 -6 0z" fill="#e0607f" />
            <Deco x={270} y={266} s={0.12} tone="red" seed={30} />
          </g>
        </svg>
        {knife && (
          <div className="knife" style={{ left: knife.x, top: knife.y }} aria-hidden="true">
            <svg viewBox="0 0 120 30"><path d="M3 15 L70 7 L74 23 L9 20 Z" fill="#e3e7ee" stroke="#9aa3b0" strokeWidth={1.5} /><path d="M12 17 L68 12" stroke="#ffffff" strokeWidth={1.5} opacity={0.8} /><rect x={72} y={8} width={45} height={14} rx={6} fill="#7a4a2a" /><circle cx={84} cy={15} r={1.8} fill="#e8c27a" /><circle cx={104} cy={15} r={1.8} fill="#e8c27a" /></svg>
          </div>
        )}
      </div>
      <div className="cake-actions">
        {phase === "candles" && micShown && <button className="btn" type="button" onClick={startMic}>Blow into the mic</button>}
        {phase === "wish" && (
          <button className="btn" type="button" onClick={() => {
            setPhase("cut");
            const r = stage.current!.getBoundingClientRect();
            setKnife({ x: r.width * 0.72, y: r.height * 0.3 });
            setLede("Pick up the knife and swipe across the cake to cut it.");
            setMsg("Swipe across the cake");
          }}>Wish made, let's cut the cake</button>
        )}
        {phase === "cut" && (
          <button className="btn ghost" type="button" onClick={() => {
            setLine({ x1: CX, y1: 100, x2: CX, y2: 270 });
            const r = stage.current!.getBoundingClientRect();
            doCut(r.left + r.width / 2, r.top + r.height / 2);
          }}>Cut it for me</button>
        )}
        {phase === "done" && <button className="btn ghost" type="button" onClick={again}>Light the candles again</button>}
      </div>
      <p className="q-react" id="cake-msg" aria-live="polite">{msg}</p>
      <HiddenRose index={7} style={{ bottom: 8, left: "6%" }} />
    </section>
  );
}
