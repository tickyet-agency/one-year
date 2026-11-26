import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { content, HIDDEN_ROSES, runtime } from "../content";
import { burst, petalBurst } from "./effects";

/*
  The rose garden: she earns a rose for each thing she explores. Progress is kept in her
  browser (localStorage) so she can close the app and come back without losing it.
*/

export const GARDEN_ROWS: [label: string, prefix: string, total: number][] = [
  ["Memories turned over", "t", content.timeline.length],
  ["Letters opened", "l", content.letters.length],
  ["Reasons read (1 per 10)", "r", Math.floor(content.reasons.length / 10)],
  ["Stars visited", "p", content.places.length],
  ["Pairs game won", "game", 1],
  ["Coupons scratched", "c", content.coupons.length],
  ["Candles blown out", "candles", 1],
  ["Cake cut", "cake", 1],
  ["Quiz finished", "quiz", 1],
  ["Hidden roses found", "h", HIDDEN_ROSES]
];
export const TOTAL_ROSES = GARDEN_ROWS.reduce((n, r) => n + r[2], 0);

// The editor's preview keeps its own progress so testing never touches the real one.
const storeKey = () => (runtime.preview ? "our-roses-preview" : "our-roses-v1");
const load = (): Set<string> => {
  if (runtime.preview) return new Set();
  try { return new Set(JSON.parse(localStorage.getItem(storeKey()) || "[]") as string[]); } catch { return new Set(); }
};
const save = (s: Set<string>) => { try { localStorage.setItem(storeKey(), JSON.stringify([...s])); } catch { /* private mode: progress just isn't kept */ } };

interface GardenApi {
  earned: Set<string>;
  count: number;
  won: boolean;
  countOf: (prefix: string) => number;
  has: (id: string) => boolean;
  /** Award a rose once. x/y is where the celebration bursts from. */
  earn: (id: string, x?: number, y?: number, msg?: string) => void;
  toast: (msg: string) => void;
  toastMsg: { text: string; key: number } | null;
}

const Ctx = createContext<GardenApi | null>(null);

export function GardenProvider({ children }: { children: ReactNode }) {
  const [earned, setEarned] = useState<Set<string>>(load);
  const ref = useRef(earned);
  const [toastMsg, setToastMsg] = useState<GardenApi["toastMsg"]>(null);
  const timer = useRef<number>();

  const toast = useCallback((text: string) => {
    setToastMsg({ text, key: Date.now() });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToastMsg(null), 3200);
  }, []);

  const countIn = (s: Set<string>, prefix: string) => [...s].filter((id) => id === prefix || id.startsWith(prefix + ":")).length;

  const earn = useCallback((id: string, x?: number, y?: number, msg?: string) => {
    if (ref.current.has(id)) return;
    const next = new Set(ref.current).add(id);
    ref.current = next;
    setEarned(next);
    save(next);
    petalBurst(x ?? innerWidth / 2, y ?? innerHeight / 2, 16);
    toast(`${msg || "+1 rose"} · ${next.size} of ${TOTAL_ROSES}`);
    if (next.size === TOTAL_ROSES) {
      window.setTimeout(() => {
        toast(`All ${TOTAL_ROSES} roses! The grand bouquet is yours`);
        petalBurst(innerWidth / 2, innerHeight / 3, 150);
        burst();
      }, 1400);
    }
  }, [toast]);

  const api = useMemo<GardenApi>(() => ({
    earned,
    count: earned.size,
    won: earned.size >= TOTAL_ROSES,
    countOf: (prefix) => countIn(earned, prefix),
    has: (id) => earned.has(id),
    earn,
    toast,
    toastMsg
  }), [earned, earn, toast, toastMsg]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useGarden() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useGarden must be used inside <GardenProvider>");
  return v;
}
