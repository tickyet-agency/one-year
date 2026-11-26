import { content, runtime } from "../content";

/*
  Which chapters she has finished. A chapter is done when she has done its one thing
  (turned every memory card, opened every letter...). Most of it is read from the roses
  she has earned; the two read-only chapters count once she has looked at them for a moment.
*/

export type ChapterKey =
  | "hero" | "memories" | "letters" | "fortunes" | "stars" | "someday"
  | "favourites" | "coupons" | "cake" | "quiz" | "last";

export interface Status { done: boolean; hint: string }

interface Garden { has: (id: string) => boolean; countOf: (prefix: string) => number }

/** How long a read-only chapter must be on screen before it counts as seen. */
export const LOOK_MS = 4000;

const SEEN_KEY = "our-seen-v1";
export function loadSeen(): Set<string> {
  if (runtime.preview) return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]") as string[]); } catch { return new Set(); }
}
export function saveSeen(s: Set<string>) {
  if (runtime.preview) return;
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...s])); } catch { /* private mode */ }
}

const of = (k: number, n: number) => ` · ${Math.min(k, n)} of ${n}`;

export function chapterStatus(key: ChapterKey, g: Garden, seen: Set<string>): Status {
  switch (key) {
    case "hero":
      return { done: seen.has("hero"), hint: "Take a little look around first ♥" };
    case "memories": {
      const n = content.timeline.length, k = g.countOf("t");
      return { done: k >= n, hint: `Scroll down and turn over every card${of(k, n)}` };
    }
    case "letters": {
      const n = content.letters.length, k = g.countOf("l");
      return { done: k >= n, hint: `Open every letter${of(k, n)}` };
    }
    case "fortunes": {
      const need = Math.min(10, content.reasons.length);
      return { done: need === 0 || g.has("r:1"), hint: `Tap the jar and read ${need} fortunes` };
    }
    case "stars": {
      const n = content.places.length, k = g.countOf("p");
      return { done: k >= n, hint: `Tap every star on the map${of(k, n)}` };
    }
    case "someday":
      return { done: seen.has("someday"), hint: "Read this one slowly ♥" };
    case "favourites":
      return { done: g.has("game"), hint: "Match all the favourites" };
    case "coupons": {
      const n = content.coupons.length, k = g.countOf("c");
      return { done: k >= n, hint: `Scratch the gold off every coupon${of(k, n)}` };
    }
    case "cake":
      return {
        done: g.has("cake"),
        hint: g.has("candles") ? "Make a wish, then cut the cake" : "Blow out the candles, then cut the cake"
      };
    case "quiz":
      return { done: g.has("quiz"), hint: "Answer every question" };
    case "last":
      return { done: true, hint: "Scroll down slowly ♥" };
  }
}
