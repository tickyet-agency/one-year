import { useRef } from "react";
import { content } from "../content";
import { burst } from "../lib/effects";
import { TOTAL_ROSES, useGarden } from "../lib/garden";
import { daysTogether, meetLine, startDate, together, useNow } from "../lib/time";
import { HiddenRose } from "../components/Decor";

const UNITS: [keyof ReturnType<typeof together>, string][] = [
  ["years", "years"], ["months", "months"], ["days", "days"], ["hours", "hours"], ["minutes", "min"], ["seconds", "sec"]
];

export function Hero() {
  const now = useNow();
  const t = together(now);
  const { toast } = useGarden();
  const ampTaps = useRef(0);

  return (
    <section className="hero chapter" id="hero">
      <div className="hero-roses" aria-hidden="true">
        <img src="/images/rose.webp" alt="" />
        <img src="/images/rose.webp" alt="" />
      </div>
      <span className="eyebrow">Chapter one · complete</span>
      <h1 className="names">
        {content.her}{" "}
        <span className="amp" title="psst… tap me" onClick={(e) => {
          ampTaps.current++;
          if (ampTaps.current === 5) { toast(content.secretMessage); burst(e.clientX, e.clientY, 18); ampTaps.current = 0; }
        }}>&amp;</span>{" "}
        {content.him}
      </h1>
      <p className="sub">{content.tagline}</p>
      <div className="counter">
        {UNITS.map(([k, label]) => <div className="tick" key={k}><b>{t[k]}</b><span>{label}</span></div>)}
      </div>
      <p className="since">
        since {startDate.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })},{" "}
        {startDate.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
      </p>
      <p className="meet">{meetLine(now)}</p>
      <div className="stats">
        {content.stats.map((s) => (
          <div className="stat" key={s.label}>
            <b>{s.n === "LIVE_DAYS" ? daysTogether(now).toLocaleString() : s.n}</b><span>{s.label}</span>
          </div>
        ))}
      </div>
      <p className="invite">There are <b>{TOTAL_ROSES} roses</b> waiting in here for you. Collect them all to unlock a surprise.</p>
      <HiddenRose index={0} style={{ top: 10, right: "2%" }} />
    </section>
  );
}
