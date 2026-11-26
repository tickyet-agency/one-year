import { useState } from "react";
import { content } from "../content";
import { useGarden } from "../lib/garden";
import { Divider, HiddenRose } from "../components/Decor";
import { Scene } from "../components/Scene";

const TILTS = [-3, 2.5, -1.5, 3, -2.5, 1.5];

/** All the memories in one list. This is the one chapter that scrolls down. */
export function Timeline() {
  const { earn } = useGarden();
  const [flipped, setFlipped] = useState<Set<number>>(new Set());

  return (
    <section className="chapter" id="timeline-ch">
      <Divider index={0} />
      <div><span className="eyebrow">Our year</span><h2>Every page so far, <em>in order</em></h2></div>
      <p className="lede">Scroll down through our year, and tap a card to turn it over. There's a note on the back of each one.</p>
      <div className="timeline">
        {content.timeline.map((m, i) => (
          <article className="t-item" key={m.title}>
            <button
              className={`polaroid${flipped.has(i) ? " flipped" : ""}`}
              type="button"
              style={{ ["--tilt" as string]: `${TILTS[i % TILTS.length]}deg` }}
              aria-label={`Turn over the card: ${m.title}`}
              onClick={(e) => {
                setFlipped((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
                earn("t:" + i, e.clientX, e.clientY);
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
        ))}
      </div>
      <HiddenRose index={1} style={{ top: 56, right: 0 }} />
    </section>
  );
}
