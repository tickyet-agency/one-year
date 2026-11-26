import { useMemo, useState } from "react";
import { content } from "../content";
import { useGarden } from "../lib/garden";
import { seeded } from "../lib/random";
import { Divider, HiddenRose } from "../components/Decor";

export function StarMap() {
  const { earn } = useGarden();
  const [active, setActive] = useState(0);
  const places = content.places;

  const bgStars = useMemo(() => {
    const rnd = seeded(7);
    return Array.from({ length: 90 }, () => ({ cx: rnd() * 100, cy: rnd() * 62, r: rnd() * 0.22 + 0.05, o: rnd() * 0.6 + 0.2 }));
  }, []);

  const visit = (i: number, x?: number, y?: number) => { setActive(i); earn("p:" + i, x, y); };
  const p = places[active];

  return (
    <section className="chapter" id="map-ch">
      <Divider index={3} />
      <div><span className="eyebrow">The map of us</span><h2>Our places, even the ones <em>on a screen</em></h2></div>
      <p className="lede">We've never stood in the same place, but we've been plenty of places together. Each star is one of them, joined in the order we found them.</p>
      <div className="sky">
        <svg viewBox="0 0 100 62" role="group" aria-label="Constellation of our places">
          {bgStars.map((s, i) => <circle key={i} className="bgstar" cx={s.cx.toFixed(2)} cy={s.cy.toFixed(2)} r={s.r.toFixed(2)} opacity={s.o.toFixed(2)} />)}
          <polyline className="path" points={places.map((pl) => `${pl.x},${pl.y}`).join(" ")} />
          {places.map((pl, i) => (
            <g key={pl.name} className={`pin${i === active ? " active" : ""}`} tabIndex={0} role="button" aria-label={pl.name}
              onClick={(e) => visit(i, e.clientX, e.clientY)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); visit(i); } }}>
              <circle className="glow" cx={pl.x} cy={pl.y} r={3.2} />
              <circle className="core" cx={pl.x} cy={pl.y} r={1} />
              <text x={pl.x} y={pl.y + 5.6} textAnchor={pl.x > 75 ? "end" : pl.x < 25 ? "start" : "middle"}>{pl.name}</text>
            </g>
          ))}
        </svg>
        <div className="place-card" aria-live="polite">
          <span className="t-date">Star {active + 1} of {places.length} · {p.date}</span>
          <h3>{p.name}</h3>
          <p>{p.memory}</p>
        </div>
        <HiddenRose index={4} style={{ bottom: 12, right: 14 }} />
      </div>
      <div className="chips">
        {places.map((pl, i) => (
          <button key={pl.name} className="chip" type="button" aria-pressed={i === active} onClick={(e) => visit(i, e.clientX, e.clientY)}>{pl.name}</button>
        ))}
      </div>
    </section>
  );
}
