import { useEffect, useState } from "react";
import { content } from "../content";
import { burst, petalBurst } from "../lib/effects";
import { TOTAL_ROSES, useGarden } from "../lib/garden";
import { prefersReducedMotion } from "../lib/random";
import { Balloons, Divider } from "../components/Decor";
import { Proposal } from "./Proposal";

/** Sealed until the quiz is done; then the letter types itself out and the bouquet arrives. */
export function Finale({ opened }: { opened: boolean }) {
  const { count, won } = useGarden();
  const [typed, setTyped] = useState("");
  const [showSurprise, setShowSurprise] = useState(false);
  const text = content.finaleLetter;

  useEffect(() => {
    if (!opened) return;
    const finish = () => {
      setTyped(text);
      setShowSurprise(true);
      setTimeout(() => { burst(innerWidth / 2, innerHeight * 0.6, 36); petalBurst(innerWidth / 2, innerHeight * 0.2, 120); }, 200);
    };
    if (prefersReducedMotion()) { finish(); return; }
    let i = 0, timer = 0;
    const step = () => {
      i++;
      setTyped(text.slice(0, i));
      if (i < text.length) timer = window.setTimeout(step, text[i - 1] === "\n" ? 380 : /[.,]/.test(text[i - 1]) ? 220 : 38);
      else timer = window.setTimeout(finish, 600);
    };
    timer = window.setTimeout(step, 700);
    return () => window.clearTimeout(timer);
  }, [opened, text]);

  const typing = opened && !showSurprise;

  return (
    <section className="chapter finale" id="finale">
      <Divider index={9} />
      <span className="eyebrow">The last page</span>
      {!opened ? (
        <div className="sealed">
          <div className="wax">{content.her.charAt(0)}</div>
          <p>This one is sealed until you finish the quiz.</p>
        </div>
      ) : (
        <div id="opened">
          <img className="paper-rose" src="/images/rose.webp" alt="" />
          <div className="letter-paper final-letter">
            <h3>{content.finaleTitle}</h3>
            <p>{typed}{typing && <span className="caret" />}</p>
            <p className="sig" id="final-sig">{content.signature}</p>
          </div>
          {showSurprise && (
            <div id="surprise" className="surprise">
              <h2>{content.surpriseTitle}</h2>
              <p>{content.surpriseLine}</p>
              <Balloons id="fb1" seed={3} className="fin-balloon l" />
              <Balloons id="fb2" seed={4} className="fin-balloon r" />
              <div className="bouquet">
                {won
                  ? <img key="grand" src="/images/grand-bouquet.webp" alt="A grand bouquet of red and white roses" />
                  : <img key="red" src="/images/bouquet.webp" alt="A bouquet of red roses tied with a red satin ribbon" />}
              </div>
              <p className="bouquet-line">
                {won
                  ? `All ${TOTAL_ROSES} roses, so here's the grand bouquet. Every single one is from me.`
                  : `You collected ${count} of ${TOTAL_ROSES} roses. Find the rest to swap this for the grand bouquet.`}
              </p>
            </div>
          )}
          {showSurprise && <Proposal />}
        </div>
      )}
    </section>
  );
}
