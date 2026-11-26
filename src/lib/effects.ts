import { prefersReducedMotion } from "./random";

/*
  Celebration effects that sit on top of the whole page: floating hearts and rose-petal bursts.
  They are fire-and-forget DOM animations, so they live outside React state on purpose
  (re-rendering React for every heart would be wasteful).
*/

const HEART_SVG =
  `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21.6s-8.4-5.1-10.6-10.3C-.1 7.4 2.3 3 6.6 3c2.4 0 4.2 1.4 5.4 3.2C13.2 4.4 15 3 17.4 3c4.3 0 6.7 4.4 5.2 8.3C20.4 16.5 12 21.6 12 21.6z" fill="url(#heartGrad)"/>` +
  `<ellipse cx="7.4" cy="7.6" rx="2.2" ry="1.4" fill="#ffffff" opacity=".55" transform="rotate(-30 7.4 7.6)"/></svg>`;

interface HeartOpts { size?: number; dx?: number; dy?: number; d?: number }

export function heart(x: number, y: number, opts: HeartOpts = {}) {
  const h = document.createElement("span");
  h.className = "fheart";
  h.innerHTML = HEART_SVG;
  h.style.left = x + "px";
  h.style.top = y + "px";
  h.style.setProperty("--s", (opts.size ?? 14 + Math.random() * 18) + "px");
  h.style.setProperty("--dx", (opts.dx ?? Math.random() * 80 - 40) + "px");
  h.style.setProperty("--dy", (opts.dy ?? 100 + Math.random() * 80) + "px");
  h.style.setProperty("--r", Math.random() * 60 - 30 + "deg");
  h.style.setProperty("--d", (opts.d ?? 1.2 + Math.random() * 0.8) + "s");
  document.body.appendChild(h);
  h.addEventListener("animationend", () => h.remove());
  setTimeout(() => h.remove(), 4000); // safety net if animations are disabled
}

export function burst(x = innerWidth / 2, y = innerHeight / 2, n = 28) {
  if (prefersReducedMotion()) {
    for (let i = 0; i < 4; i++) heart(x + (Math.random() - 0.5) * 120, y + (Math.random() - 0.5) * 80, { size: 22 + Math.random() * 16 });
    return;
  }
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n;
    const dist = 120 + Math.random() * 140;
    heart(x, y, { dx: Math.cos(a) * dist, dy: -Math.sin(a) * dist, size: 16 + Math.random() * 22, d: 1.4 + Math.random() });
  }
}

/* Petal bursts are drawn by <PetalCanvas>, which registers itself here. */
type PetalBurst = (x: number, y: number, n: number) => void;
let petalBurstImpl: PetalBurst | null = null;
export const registerPetalBurst = (fn: PetalBurst | null) => { petalBurstImpl = fn; };
export const petalBurst = (x: number, y: number, n = 30) => petalBurstImpl?.(x, y, n);

/* A heart wherever she taps, caught before anything else on the page can swallow the tap. */
export function installTapHearts() {
  let last = 0;
  const onTap = (e: PointerEvent | TouchEvent) => {
    const p = "touches" in e ? e.touches[0] : e;
    const target = e.target as Element | null;
    if (!p || target?.closest?.("input, textarea, dialog")) return;
    const now = Date.now();
    if (now - last < 60) return;
    last = now;
    heart(p.clientX, p.clientY, { size: 22 + Math.random() * 16 });
  };
  window.addEventListener("pointerdown", onTap, { capture: true, passive: true });
  window.addEventListener("touchstart", onTap, { capture: true, passive: true });
  return () => {
    window.removeEventListener("pointerdown", onTap, { capture: true });
    window.removeEventListener("touchstart", onTap, { capture: true });
  };
}
