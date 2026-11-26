import { useRef, useState } from "react";
import type { Scene as SceneName } from "../content";
import { burst } from "../lib/effects";
import { useGarden } from "../lib/garden";
import { shuffle } from "../lib/random";
import { Divider } from "../components/Decor";
import { Rose } from "../components/Rose";
import { Scene, SCENE_NAMES } from "../components/Scene";

interface Card { id: number; scene: SceneName }
const deal = (): Card[] => shuffle([...SCENE_NAMES, ...SCENE_NAMES]).map((scene, id) => ({ id, scene }));

export function PairsGame() {
  const { earn } = useGarden();
  const [cards, setCards] = useState<Card[]>(deal);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const locked = useRef(false);
  const done = matched.size === cards.length;

  const reset = () => { setCards(deal()); setOpen([]); setMatched(new Set()); setMoves(0); locked.current = false; };

  const flip = (card: Card, el: HTMLElement, x: number, y: number) => {
    if (locked.current || open.includes(card.id) || matched.has(card.id)) return;
    const next = [...open, card.id];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next.map((id) => cards.find((c) => c.id === id)!);
    if (a.scene === b.scene) {
      const nowMatched = new Set(matched).add(a.id).add(b.id);
      setMatched(nowMatched);
      setOpen([]);
      const r = el.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 8);
      if (nowMatched.size === cards.length) earn("game", x, y, "Pairs game won");
    } else {
      locked.current = true;
      setTimeout(() => { setOpen([]); locked.current = false; }, 850);
    }
  };

  return (
    <section className="chapter" id="game-ch">
      <Divider index={5} />
      <div><span className="eyebrow">Play with me</span><h2>Find our <em>pairs</em></h2></div>
      <p className="lede">Every card hides a little piece of our year. Match all eight pairs to win a rose.</p>
      <div className="mem-head">
        <span id="mem-moves">{moves} {moves === 1 ? "move" : "moves"}</span>
        <button className="btn ghost" type="button" onClick={reset}>Shuffle again</button>
      </div>
      <div className="mem-grid">
        {cards.map((c, i) => (
          <button key={c.id} type="button" aria-label={`Card ${i + 1}`}
            className={`mcard${open.includes(c.id) ? " open" : ""}${matched.has(c.id) ? " matched" : ""}`}
            onClick={(e) => flip(c, e.currentTarget, e.clientX, e.clientY)}>
            <div className="mi">
              <div className="mf back"><Rose size={60} tone="red" seed={11} /></div>
              <div className="mf front"><Scene name={c.scene} /></div>
            </div>
          </button>
        ))}
      </div>
      <p className="q-react" id="mem-msg" aria-live="polite">{done ? `All pairs in ${moves} moves. We make a good match.` : ""}</p>
    </section>
  );
}
