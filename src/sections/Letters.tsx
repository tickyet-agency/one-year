import { useEffect, useRef, useState } from "react";
import { content } from "../content";
import { useGarden } from "../lib/garden";
import { Divider, HiddenRose } from "../components/Decor";

export function Letters() {
  const { earn, has } = useGarden();
  const [open, setOpen] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal?.();
    if (open === null && d.open) d.close();
  }, [open]);

  const letter = open !== null ? content.letters[open] : null;

  return (
    <section className="chapter" id="letters-ch">
      <Divider index={1} />
      <img className="blossom" src="/images/blossom.webp" alt="" />
      <div><span className="eyebrow">For later</span><h2>Open when<em>…</em></h2></div>
      <p className="lede">These are for the days I'm not right next to you. Open one whenever you need it, as many times as you want.</p>
      <div className="letters">
        {content.letters.map((l, i) => (
          <button key={l.when} type="button" className={`envelope${has("l:" + i) ? " read" : ""}`}
            onClick={(e) => { setOpen(i); earn("l:" + i, e.clientX, e.clientY); }}>
            <span className="seal">♥</span>
            <span className="label">Open when {l.when}</span>
          </button>
        ))}
      </div>
      <HiddenRose index={2} style={{ bottom: -36, left: "4%" }} />

      <dialog ref={dialog} onClose={() => setOpen(null)} onClick={(e) => { if (e.target === dialog.current) setOpen(null); }}>
        <img className="paper-rose" src="/images/rose.webp" alt="" />
        <div className="letter-paper">
          {letter && (
            <>
              <h3>Open when {letter.when}</h3>
              <p>{letter.body}</p>
              <p className="sig">— {content.him}</p>
            </>
          )}
          <button className="btn ghost" type="button" onClick={() => setOpen(null)}>Fold it back up</button>
        </div>
      </dialog>
    </section>
  );
}
