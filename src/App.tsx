import { useCallback, useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";
import { content } from "./content";
import { burst, petalBurst } from "./lib/effects";
import { startMusic } from "./lib/music";
import { HiddenRose } from "./components/Decor";
import { GardenTracker, HeartLayer, MusicButton, PetalCanvas, Toast } from "./components/Overlays";
import { LockScreen } from "./sections/LockScreen";
import { Hero } from "./sections/Hero";
import { Timeline } from "./sections/Timeline";
import { Letters } from "./sections/Letters";
import { Reasons } from "./sections/Reasons";
import { StarMap } from "./sections/StarMap";
import { Someday } from "./sections/Someday";
import { PairsGame } from "./sections/PairsGame";
import { Coupons } from "./sections/Coupons";
import { Cake } from "./sections/Cake";
import { Quiz } from "./sections/Quiz";
import { Finale } from "./sections/Finale";

/** Where a swipe should never turn the page: things she drags or scratches. */
const NO_SWIPE = "canvas, input, textarea, select, .cake-stage, .sky, [data-noswipe]";

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [finaleOpen, setFinaleOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [visited, setVisited] = useState(1);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touch = useRef<{ x: number; y: number; ok: boolean } | null>(null);

  useEffect(() => {
    document.body.classList.toggle("locked", !unlocked);
    document.body.classList.toggle("unlocked", unlocked);
  }, [unlocked]);

  const unlock = () => {
    setUnlocked(true);
    startMusic(); // runs inside the submit tap, so the browser allows sound
    burst();
    petalBurst(innerWidth / 2, innerHeight / 3, 80);
    setPage(0);
  };

  const openFinale = () => {
    setFinaleOpen(true);
    setPage(PAGES.length - 1);
  };

  // One chapter per screen, in story order.
  const PAGES: [label: string, node: ReactNode][] = [
    ["Us", <Hero />],
    ["Memories", <Timeline />],
    ["Letters", <Letters />],
    ["Fortunes", <Reasons />],
    ["Star map", <StarMap />],
    ["Someday", <Someday />],
    ["Pairs", <PairsGame />],
    ["Coupons", <Coupons />],
    ["Cake", <Cake />],
    ["Quiz", <Quiz onFinish={openFinale} />],
    ["Last page", <>
      <Finale opened={finaleOpen} />
      <footer id="footer">
        Made with a whole lot of love by {content.him}, for {content.her}.
        <HiddenRose index={6} style={{ top: -10, left: "12%" }} />
      </footer>
    </>]
  ];
  const last = PAGES.length - 1;

  const go = useCallback((to: number) => setPage(Math.max(0, Math.min(last, to))), [last]);

  // Each chapter opens at its top, and hidden chapters can't be tabbed into.
  useEffect(() => {
    pageRefs.current.forEach((el, i) => { if (el) el.inert = i !== page; });
    const el = pageRefs.current[page];
    if (el) el.scrollTop = 0;
    setVisited((v) => Math.max(v, page + 1));
  }, [page]);

  // Arrow keys and Page Up / Down turn pages (not while typing or reading a letter).
  useEffect(() => {
    if (!unlocked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || document.querySelector("dialog[open]")) return;
      if ((e.target as HTMLElement).closest?.("input, textarea, select, [contenteditable]")) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); go(page + 1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(page - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [unlocked, page, go]);

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    touch.current = e.touches.length === 1 ? { x: t.clientX, y: t.clientY, ok: !(e.target as HTMLElement).closest(NO_SWIPE) } : null;
  };
  const onTouchEnd = (e: TouchEvent) => {
    const s = touch.current;
    touch.current = null;
    if (!s?.ok || document.querySelector("dialog[open]")) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x, dy = t.clientY - s.y;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) go(page + (dx < 0 ? 1 : -1));
  };

  return (
    <>
      <PetalCanvas />
      <HeartLayer />
      <LockScreen onUnlock={unlock} gone={unlocked} />

      <main id="story" aria-hidden={!unlocked} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {PAGES.map(([label, node], i) => (
          <div key={label} ref={(el) => { pageRefs.current[i] = el; }}
            className={`page${i === page ? " on" : i < page ? " before" : " after"}`}
            role="group" aria-roledescription="chapter" aria-label={`${i + 1} of ${PAGES.length}: ${label}`}>
            <div className="page-inner">{node}</div>
          </div>
        ))}
      </main>

      {unlocked && (
        <>
          <nav className="pager-top" aria-label="Chapters">
            <ol>
              {PAGES.map(([label], i) => (
                <li key={label}>
                  <button type="button" className={`dot${i === page ? " on" : ""}${i < visited ? " seen" : ""}`}
                    aria-label={`Go to ${label}`} aria-current={i === page ? "step" : undefined} onClick={() => go(i)} />
                </li>
              ))}
            </ol>
            <span className="pager-label">{page + 1} of {PAGES.length} · {PAGES[page][0]}</span>
          </nav>
          <div className="pager-bottom">
            <button type="button" className="pg-btn" onClick={() => go(page - 1)} disabled={page === 0} aria-label="Previous chapter">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button type="button" className={`pg-btn next${page === 0 && visited === 1 ? " nudge" : ""}`} onClick={() => go(page + 1)}
              disabled={page === last} aria-label={page < last ? `Next chapter: ${PAGES[page + 1][0]}` : "Next chapter"}>
              {page < last && <span className="pg-next-label">{PAGES[page + 1][0]}</span>}
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </>
      )}

      {unlocked && <MusicButton />}
      {unlocked && <GardenTracker />}
      <Toast />
    </>
  );
}
