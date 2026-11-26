import { useRef, useState, type TouchEvent } from "react";
import { content } from "../content";
import { useGarden } from "../lib/garden";
import { Divider, HiddenRose } from "../components/Decor";
import { Scene } from "../components/Scene";

const TILTS = [-3, 2.5, -1.5, 3, -2.5, 1.5];

/** One memory at a time, in date order. Tap the card to turn it over; arrows or a swipe for the next one. */
export function Timeline() {
  const { earn } = useGarden();
  const [flipped, setFlipped] = useState<Set<number>>(new Set());
  const [cur, setCur] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const list = content.timeline;
  const n = list.length;
  const m = list[Math.min(cur, n - 1)];
  const go = (i: number) => setCur(Math.max(0, Math.min(n - 1, i)));

  const onTouchStart = (e: TouchEvent) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; };
  const onTouchEnd = (e: TouchEvent) => {
    const s = touch.current; touch.current = null;
    if (!s) return;
    const t = e.changedTouches[0], dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) go(cur + (dx < 0 ? 1 : -1));
  };

  return (
    <section className="chapter" id="timeline-ch">
      <Divider index={0} />
      <div><span className="eyebrow">Our year</span><h2>Every page so far, <em>in order</em></h2></div>
      <p className="lede">Tap the card to turn it over. There's a note on the back of each one.</p>
      {m && (
        <div className="t-carousel" data-noswipe onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <article className="t-item one" key={cur}>
            <button
              className={`polaroid${flipped.has(cur) ? " flipped" : ""}`}
              type="button"
              style={{ ["--tilt" as string]: `${TILTS[cur % TILTS.length]}deg` }}
              aria-label={`Turn over the card: ${m.title}`}
              onClick={(e) => {
                setFlipped((s) => { const x = new Set(s); x.has(cur) ? x.delete(cur) : x.add(cur); return x; });
                earn("t:" + cur, e.clientX, e.clientY);
              }}
            >
              <div className="inner">
                <div className="face front">
                  <div className="photo">{m.photo ? <img src={m.photo} alt={m.title} /> : <Scene name={m.scene} />}</div>
                  <span className="caption">{m.caption}</span>
                  <span className="tap">tap to flip</span>
                </div>
                <div className="face back"><p>{m.back}</p></div>
              </div>
            </button>
            <div className="t-text"><span className="t-date">{m.date}</span><h3>{m.title}</h3>{m.text && <p>{m.text}</p>}</div>
          </article>
          {n > 1 && (
            <div className="t-nav">
              <button type="button" className="t-arrow" onClick={() => go(cur - 1)} disabled={cur === 0} aria-label="Previous memory">‹</button>
              <div className="t-dots">
                {list.map((x, i) => (
                  <button key={x.title + i} type="button" aria-label={`Memory ${i + 1}: ${x.title}`} aria-current={i === cur ? "true" : undefined}
                    className={`t-dot${i === cur ? " on" : ""}`} onClick={() => go(i)} />
                ))}
              </div>
              <button type="button" className="t-arrow" onClick={() => go(cur + 1)} disabled={cur === n - 1} aria-label="Next memory">›</button>
            </div>
          )}
          {/* the other photos load in the background so the next card is instant */}
          <div hidden>{list.map((x, i) => x.photo && i !== cur ? <img key={i} src={x.photo} alt="" /> : null)}</div>
        </div>
      )}
      <HiddenRose index={1} style={{ top: 56, right: 0 }} />
    </section>
  );
}
