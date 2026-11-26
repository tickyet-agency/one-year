import { useEffect, useRef, useState } from "react";
import { content, type Coupon } from "../content";
import { useGarden } from "../lib/garden";
import { Divider, HiddenRose } from "../components/Decor";

/** One coupon with a gold coating she scratches off with her finger. */
function ScratchCoupon({ coupon, index }: { coupon: Coupon; index: number }) {
  const { earn, has } = useGarden();
  const ref = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(() => has("c:" + index));

  useEffect(() => {
    const cv = ref.current;
    if (!cv || done) return;
    const ctx = cv.getContext("2d", { willReadFrequently: true })!;
    let painted = false, down = false, moves = 0;

    const paint = () => {
      const r = cv.getBoundingClientRect();
      if (!r.width || painted) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = r.width * dpr; cv.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = ctx.createLinearGradient(0, 0, r.width, r.height);
      g.addColorStop(0, "#c99d4f"); g.addColorStop(0.5, "#f4dd9c"); g.addColorStop(1, "#b48437");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, r.width, r.height);
      ctx.fillStyle = "rgba(255,255,255,.35)";
      ctx.font = "13px serif";
      for (let k = 0; k < 16; k++) ctx.fillText("♥", Math.random() * r.width, Math.random() * r.height);
      ctx.fillStyle = "rgba(92,52,12,.8)";
      ctx.font = "600 15px Jost, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("✦  Scratch me  ✦", r.width / 2, r.height / 2 + 5);
      painted = true;
    };
    const ro = new ResizeObserver(paint);
    ro.observe(cv);

    const reveal = (x: number, y: number) => { setDone(true); earn("c:" + index, x, y, "Coupon unlocked"); };
    const check = (x: number, y: number) => {
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let clear = 0, total = 0;
      for (let p = 3; p < d.length; p += 64) { total++; if (d[p] === 0) clear++; }
      if (clear / total > 0.45) reveal(x, y);
    };
    const scratch = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(e.clientX - r.left, e.clientY - r.top, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      if (++moves % 6 === 0) check(e.clientX, e.clientY);
    };
    const onDown = (e: PointerEvent) => { down = true; try { cv.setPointerCapture(e.pointerId); } catch { /* ignore */ } scratch(e); };
    const onMove = (e: PointerEvent) => { if (down) scratch(e); };
    const onUp = () => { down = false; };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      const r = cv.getBoundingClientRect();
      reveal(r.left + r.width / 2, r.top + r.height / 2);
    };
    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp);
    cv.addEventListener("pointercancel", onUp);
    cv.addEventListener("keydown", onKey);
    return () => {
      ro.disconnect();
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", onUp);
      cv.removeEventListener("pointercancel", onUp);
      cv.removeEventListener("keydown", onKey);
    };
  }, [done, earn, index]);

  return (
    <div className="coupon">
      <div className="c-content">
        <span className="no">Coupon {String(index + 1).padStart(2, "0")} · valid forever</span>
        <h3>{coupon.title}</h3>
        <p>{coupon.note}</p>
      </div>
      <canvas ref={ref} className={`scratch${done ? " done" : ""}`} tabIndex={done ? -1 : 0} role="button" aria-label={`Scratch to reveal coupon ${index + 1}`} />
    </div>
  );
}

export function Coupons() {
  return (
    <section className="chapter" id="coupons-ch">
      <Divider index={6} />
      <div><span className="eyebrow">Redeem anytime</span><h2>Love <em>coupons</em></h2></div>
      <p className="lede">Scratch the gold off each one. When you want to use it, screenshot it and send it to me.</p>
      <div className="coupons">
        {content.coupons.map((c, i) => <ScratchCoupon key={c.title} coupon={c} index={i} />)}
      </div>
      <HiddenRose index={5} style={{ top: 56, left: "58%" }} />
    </section>
  );
}
