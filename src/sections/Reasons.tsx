import { useState } from "react";
import { content } from "../content";
import { useGarden } from "../lib/garden";
import { Divider, HiddenRose } from "../components/Decor";

export function Reasons() {
  const { earn } = useGarden();
  const [shown, setShown] = useState(0); // how many pulled in this round; 0 = none yet
  const [pop, setPop] = useState(0);
  const total = content.reasons.length;

  const pull = (x: number, y: number) => {
    const n = (shown % total) + 1;
    setShown(n);
    setPop((p) => p + 1);
    if (n % 10 === 0) earn("r:" + n / 10, x, y, `${n} reasons read`);
  };

  return (
    <section className="chapter" id="reasons-ch">
      <Divider index={2} />
      <div><span className="eyebrow">A jar full of you</span><h2>Fifty reasons <em>why you</em></h2></div>
      <p className="lede">Tap the jar to pull out a reason. Every tenth one earns you a rose.</p>
      <div className="jar-wrap">
        <button className="jar" type="button" aria-label="Pull a reason out of the jar" onClick={(e) => pull(e.clientX, e.clientY)}>
          <svg viewBox="0 0 200 240" aria-hidden="true">
            <rect className="note1" x="50" y="176" width="44" height="26" rx="3" transform="rotate(-12 72 189)" />
            <rect className="note2" x="100" y="180" width="44" height="26" rx="3" transform="rotate(10 122 193)" />
            <rect className="note3" x="70" y="146" width="44" height="26" rx="3" transform="rotate(6 92 159)" />
            <rect className="note1" x="114" y="140" width="40" height="24" rx="3" transform="rotate(-16 134 152)" />
            <rect className="note2" x="44" y="134" width="40" height="24" rx="3" transform="rotate(18 64 146)" />
            <rect className="note3" x="92" y="110" width="40" height="24" rx="3" transform="rotate(-8 112 122)" />
            <text className="jheart" x="58" y="122">♥</text><text className="jheart" x="140" y="210">♥</text><text className="jheart" x="96" y="214">♥</text>
            <path className="glass" d="M60 44h80v14c22 12 34 34 34 64v76c0 18-12 30-30 30H56c-18 0-30-12-30-30v-76c0-30 12-52 34-64z" />
            <rect className="lid" x="52" y="12" width="96" height="24" rx="6" />
            <rect className="lid" x="46" y="32" width="108" height="12" rx="4" />
            <rect className="tag" x="62" y="64" width="76" height="28" rx="4" />
            <text className="tagtext" x="100" y="84" textAnchor="middle">reasons</text>
          </svg>
        </button>
        <div key={pop} className={`reason-note${pop ? " pop" : ""}`} aria-live="polite">
          {shown === 0 ? (
            <><span className="num">{total} reasons inside</span><p>Tap the jar to pull out the first one.</p></>
          ) : (
            <>
              <span className="num">Reason {shown} of {total}</span>
              <p>{content.reasons[shown - 1]}</p>
              <div className="reason-bar"><i style={{ width: `${(shown / total) * 100}%` }} /></div>
            </>
          )}
        </div>
      </div>
      <HiddenRose index={3} style={{ top: 64, right: "3%" }} />
    </section>
  );
}
