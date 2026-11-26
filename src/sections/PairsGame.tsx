import { useRef, useState } from "react";
import { content, type Scene as SceneName } from "../content";
import { burst } from "../lib/effects";
import { useGarden } from "../lib/garden";
import { shuffle } from "../lib/random";
import { Divider } from "../components/Decor";
import { Rose } from "../components/Rose";
import { Scene, SCENE_NAMES } from "../components/Scene";

/** A card shows either one of their favourite photos or (with no photos set) a drawn scene. */
interface Card { id: number; face: string }

const DECK_SIZE = 36;

/**
 * With favourite photos: about 36 cards, each photo repeated an even number of times
 * (6 photos → 6 copies each, a 6×6 grid). Any two cards with the same photo are a match.
 * Without photos: the original 8 drawn pairs.
 */
function faces(): string[] {
  const photos = (content.favourites ?? []).filter((p) => p.trim());
  if (!photos.length) return [...SCENE_NAMES, ...SCENE_NAMES];
  const copies = Math.max(2, 2 * Math.floor(DECK_SIZE / 2 / photos.length));
  return photos.flatMap((p) => Array<string>(copies).fill(p));
}
const deal = (): Card[] => shuffle(faces()).map((face, id) => ({ id, face }));
const isPhoto = (face: string) => face.includes("/");

export function PairsGame() {
  const { earn } = useGarden();
  const [cards, setCards] = useState<Card[]>(deal);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const locked = useRef(false);
  const done = matched.size === cards.length;
  const photoMode = cards.some((c) => isPhoto(c.face));
  const six = cards.length > 20;

  const reset = () => { setCards(deal()); setOpen([]); setMatched(new Set()); setMoves(0); locked.current = false; };

  const flip = (card: Card, el: HTMLElement, x: number, y: number) => {
    if (locked.current || open.includes(card.id) || matched.has(card.id)) return;
    const next = [...open, card.id];
    setOpen(next);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const [a, b] = next.map((id) => cards.find((c) => c.id === id)!);
    if (a.face === b.face) {
      const nowMatched = new Set(matched).add(a.id).add(b.id);
      setMatched(nowMatched);
      setOpen([]);
      const r = el.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 8);
      if (nowMatched.size === cards.length) earn("game", x, y, "Favourites game won");
    } else {
      locked.current = true;
      setTimeout(() => { setOpen([]); locked.current = false; }, 850);
    }
  };

  return (
    <section className="chapter" id="game-ch">
      <Divider index={5} />
      {photoMode ? (
        <>
          <div><span className="eyebrow">Play with me</span><h2>Find our <em>favourites</em></h2></div>
          <p className="lede">Our favourite flowers, foods and couples are hiding under these roses. Match them all to win a rose.</p>
        </>
      ) : (
        <>
          <div><span className="eyebrow">Play with me</span><h2>Find our <em>pairs</em></h2></div>
          <p className="lede">Every card hides a little piece of our year. Match all {cards.length / 2} pairs to win a rose.</p>
        </>
      )}
      <div className="mem-head">
        <span id="mem-moves">{moves} {moves === 1 ? "move" : "moves"} · {matched.size / 2} of {cards.length / 2} pairs</span>
        <button className="btn ghost" type="button" onClick={reset}>Shuffle again</button>
      </div>
      <div className={`mem-grid${six ? " six" : ""}${photoMode ? " photos" : ""}`}>
        {cards.map((c, i) => (
          <button key={c.id} type="button" aria-label={`Card ${i + 1}`}
            className={`mcard${open.includes(c.id) ? " open" : ""}${matched.has(c.id) ? " matched" : ""}`}
            onClick={(e) => flip(c, e.currentTarget, e.clientX, e.clientY)}>
            <div className="mi">
              <div className="mf back"><Rose size={60} tone="red" seed={11} /></div>
              <div className="mf front">
                {isPhoto(c.face) ? <img src={c.face} alt="" draggable={false} /> : <Scene name={c.face as SceneName} />}
              </div>
            </div>
          </button>
        ))}
      </div>
      {/* photos load up front so the first flips are instant */}
      <div hidden>{(content.favourites ?? []).map((p) => <img key={p} src={p} alt="" />)}</div>
      <p className="q-react" id="mem-msg" aria-live="polite">{done ? `All matched in ${moves} moves. Just like us.` : ""}</p>
    </section>
  );
}
