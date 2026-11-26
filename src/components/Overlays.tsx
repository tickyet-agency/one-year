import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { registerPetalBurst, installTapHearts } from "../lib/effects";
import { prefersReducedMotion } from "../lib/random";
import { isMusicPlaying, startMusic, stopMusic, subscribeMusic } from "../lib/music";
import { GARDEN_ROWS, TOTAL_ROSES, useGarden } from "../lib/garden";
import { Rose } from "./Rose";

/* Everything that floats above the page: petals, hearts, toast, music button, rose counter. */

const PETAL_COLORS = ["#c4344a", "#dd5468", "#a52238", "#f190a8", "#f9b9c8", "#82142a"];
interface Petal { x: number; y: number; burst: boolean; vx: number; vy: number; s: number; r: number; vr: number; f: number; vf: number; sway: number; c: string }

function makePetal(x: number, y: number, burst: boolean): Petal {
  const a = Math.random() * Math.PI * 2;
  const sp = burst ? 2 + Math.random() * 5 : 0;
  return {
    x, y, burst,
    vx: burst ? Math.cos(a) * sp : (Math.random() - 0.5) * 0.4,
    vy: burst ? Math.sin(a) * sp - 2 : 0.5 + Math.random() * 0.8,
    s: 6 + Math.random() * 7, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.06,
    f: Math.random() * 6.28, vf: 0.03 + Math.random() * 0.05, sway: Math.random() * 6.28,
    c: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0]
  };
}

/** Rose petals drifting down the screen, plus bursts on celebrations. */
export function PetalCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv || prefersReducedMotion()) return;
    const ctx = cv.getContext("2d")!;
    let petals: Petal[] = [];
    let w = 0, h = 0, dpr = 1, raf = 0;
    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    registerPetalBurst((x, y, n) => { for (let i = 0; i < n; i++) petals.push(makePetal(x, y, true)); });
    const draw = () => {
      if (!document.hidden) {
        if (innerWidth !== w || innerHeight !== h || Math.min(window.devicePixelRatio || 1, 2) !== dpr) size();
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.restore();
        const ambient = petals.reduce((n, p) => n + (p.burst ? 0 : 1), 0);
        if (ambient < 16 && Math.random() < 0.05) petals.push(makePetal(Math.random() * w, -20, false));
        for (const p of petals) {
          if (p.burst) { p.vx *= 0.97; p.vy = p.vy * 0.97 + 0.06; }
          p.sway += 0.02;
          p.x += p.vx + (p.burst ? 0 : Math.sin(p.sway) * 0.6);
          p.y += p.vy; p.r += p.vr; p.f += p.vf;
          const s = p.s;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.r);
          ctx.scale(1, Math.max(0.15, Math.abs(Math.cos(p.f))));
          ctx.beginPath();
          ctx.moveTo(0, -s);
          ctx.bezierCurveTo(s * 0.95, -s * 0.55, s * 0.7, s * 0.85, 0, s);
          ctx.bezierCurveTo(-s * 0.7, s * 0.85, -s * 0.95, -s * 0.55, 0, -s);
          ctx.globalAlpha = 0.85;
          ctx.fillStyle = p.c;
          ctx.fill();
          ctx.restore();
        }
        petals = petals.filter((p) => p.y < h + 30 && p.x > -40 && p.x < w + 40);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); registerPetalBurst(null); };
  }, []);
  return <canvas id="petals" ref={ref} aria-hidden="true" />;
}

/** Gradient shared by every floating heart, plus the tap-anywhere listener. */
export function HeartLayer() {
  useEffect(() => installTapHearts(), []);
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <radialGradient id="heartGrad" cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffb8c6" /><stop offset=".35" stopColor="#ff2a4d" /><stop offset="1" stopColor="#8a0018" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function Toast() {
  const { toastMsg } = useGarden();
  return <div id="toast" role="status" className={toastMsg ? "show" : ""}>{toastMsg?.text}</div>;
}

export function MusicButton() {
  const playing = useSyncExternalStore(subscribeMusic, isMusicPlaying);
  return (
    <button id="music" type="button" className={playing ? "playing" : ""} aria-label={playing ? "Pause our song" : "Play our song"}
      onClick={() => (playing ? stopMusic() : startMusic())}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18.5a3 3 0 1 1-2-2.8V5l12-2v12.5a3 3 0 1 1-2-2.8V7.3L9 8.6z" /></svg>
    </button>
  );
}

/** The rose counter in the corner, and its checklist panel. */
export function GardenTracker() {
  const { count, countOf, won } = useGarden();
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (count === 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 800);
    return () => clearTimeout(t);
  }, [count]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !btn.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <>
      <button id="garden-btn" ref={btn} type="button" className={bump ? "bump" : ""} aria-expanded={open} aria-controls="garden-panel" onClick={() => setOpen((o) => !o)}>
        <Rose size={36} tone="red" seed={5} leaves={false} />
        <span>{count} / {TOTAL_ROSES}</span>
      </button>
      {open && (
        <div id="garden-panel" ref={panel}>
          <h3>Your rose garden</h3>
          <p>Collect roses as you explore. Seven of them are hidden around the page, so look closely.</p>
          <div>
            {GARDEN_ROWS.map(([label, prefix, total]) => {
              const n = Math.min(countOf(prefix), total);
              return <div key={prefix} className={`g-row${n >= total ? " full" : ""}`}><span>{label}</span><b>{n} / {total}</b></div>;
            })}
          </div>
          <div className={`g-prize${won ? " won" : ""}`}>
            <img src="/images/grand-bouquet.webp" alt="" />
            <span>{won ? "Grand bouquet unlocked. It's waiting for you on the last page." : `Collect all ${TOTAL_ROSES} roses to unlock the grand bouquet.`}</span>
          </div>
        </div>
      )}
    </>
  );
}
