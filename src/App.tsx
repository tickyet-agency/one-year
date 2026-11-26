import { useCallback, useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";
import { content, runtime } from "./content";
import { burst, petalBurst } from "./lib/effects";
import { startMusic } from "./lib/music";
import { useGarden } from "./lib/garden";
import { chapterStatus, loadSeen, LOOK_MS, saveSeen, type ChapterKey } from "./lib/progress";
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
  const garden = useGarden();
  const [seen, setSeen] = useState<Set<string>>(loadSeen);
  const [bump, setBump] = useState(0); // re-runs the "not yet" shake on the hint

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
  const PAGES: [label: string, key: ChapterKey, node: ReactNode][] = [
    ["Us", "hero", <Hero />],
    ["Memories", "memories", <Timeline />],
    ["Letters", "letters", <Letters />],
    ["Fortunes", "fortunes", <Reasons />],
    ["Star map", "stars", <StarMap />],
    ["Someday", "someday", <Someday />],
    ["Favourites", "favourites", <PairsGame />],
    ["Coupons", "coupons", <Coupons />],
    ["Cake", "cake", <Cake />],
    ["Quiz", "quiz", <Quiz onFinish={openFinale} />],
    ["Last page", "last", <>
      <Finale opened={finaleOpen} />
      <footer id="footer">
        Made with a whole lot of love by {content.him}, for {content.her}.
        <HiddenRose index={6} style={{ top: -10, left: "12%" }} />
      </footer>
    </>]
  ];
  const last = PAGES.length - 1;

  // Each chapter opens only once the one before it is done. (The editor's preview can go anywhere.)
  const status = PAGES.map(([, key]) => chapterStatus(key, garden, seen));
  const firstUndone = status.findIndex((st) => !st.done);
  const reach = runtime.preview || firstUndone < 0 ? last : firstUndone;
  const here = status[page];

  const go = useCallback((to: number) => {
    const t = Math.max(0, Math.min(last, to));
    if (t > reach) {
      garden.toast(`Not yet. ${status[reach].hint}`);
      setBump((b) => b + 1);
      if (page !== reach) setPage(reach);
      return;
    }
    setPage(t);
  }, [last, reach, page, garden, status]);

  // The two read-only chapters count as done once she has looked at them for a moment.
  useEffect(() => {
    const key = PAGES[page][1];
    if (!unlocked || (key !== "hero" && key !== "someday") || seen.has(key)) return;
    const t = window.setTimeout(() => setSeen((s) => { const n = new Set(s).add(key); saveSeen(n); return n; }), LOOK_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, unlocked, seen]);

  // Arriving at the last page after the quiz opens it, however she got there.
  useEffect(() => { if (page === last && garden.has("quiz")) setFinaleOpen(true); }, [page, last, garden]);

  // A little celebration the moment a chapter is finished.
  const prev = useRef({ page, done: here.done });
  useEffect(() => {
    if (prev.current.page === page && !prev.current.done && here.done && page < last && unlocked) {
      window.setTimeout(() => garden.toast(`Chapter done ♥ ${PAGES[page + 1][0]} is open now`), 1300);
    }
    prev.current = { page, done: here.done };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [here.done, page]);

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
        {PAGES.map(([label, , node], i) => (
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
                  <button type="button" className={`dot${i === page ? " on" : ""}${i < visited ? " seen" : ""}${i > reach ? " locked" : ""}`}
                    aria-label={i > reach ? `${label} (locked)` : `Go to ${label}`} aria-current={i === page ? "step" : undefined} onClick={() => go(i)} />
                </li>
              ))}
            </ol>
            <span key={bump} className={`pager-hint${here.done ? " done" : ""}${bump ? " bump" : ""}`} aria-live="polite">
              <span className="pager-label">{page + 1}/{PAGES.length}</span>{" "}
              {here.done
                ? (page < last ? <>Done ♥ Tap <b>›</b> for {PAGES[page + 1][0]}</> : here.hint)
                : here.hint}
            </span>
          </nav>
          <div className="pager-bottom">
            <button type="button" className="pg-btn" onClick={() => go(page - 1)} disabled={page === 0} aria-label="Previous chapter">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button type="button" className={`pg-btn next${here.done && page < last ? " nudge" : ""}${!here.done ? " locked" : ""}`}
              onClick={() => go(page + 1)} disabled={page === last}
              aria-label={page >= last ? "Next chapter" : here.done ? `Next chapter: ${PAGES[page + 1][0]}` : `Next chapter is locked: ${here.hint}`}>
              {page < last && <span className="pg-next-label">{PAGES[page + 1][0]}</span>}
              {here.done || page === last
                ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
                : <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>}
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
