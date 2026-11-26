import { strToU8, zipSync } from "fflate";
import { defaultContent, type AppContent, type Memory } from "../content";

/*
  The editor's working copy ("draft"). Uploaded photos and the song are kept as Blobs
  inside the draft and saved in IndexedDB, so nothing is lost if the tab closes.
  On export they become files under public/media/ and paths in content.json.
*/

export type DraftMemory = Memory & { photoFile?: Blob | null };
export type DraftContent = Omit<AppContent, "timeline"> & { timeline: DraftMemory[] };
export interface Draft {
  content: DraftContent;
  song?: Blob | null;
  songName?: string;
  updatedAt: number;
}

export const SAMPLE = { her: defaultContent.her, him: defaultContent.him };

export const clone = <T,>(v: T): T => structuredClone(v);

/** Published content (public/content.json) over the defaults. */
export async function loadPublished(): Promise<AppContent> {
  const base = clone(defaultContent) as AppContent;
  try {
    const res = await fetch("/content.json", { cache: "no-cache" });
    if (res.ok) return { ...base, ...(await res.json()) };
  } catch { /* none yet */ }
  return base;
}

export const draftFrom = (c: AppContent): Draft => ({ content: clone(c) as DraftContent, song: null, updatedAt: Date.now() });

/* ---------- IndexedDB (one store, one key) ---------- */
const DB = "one-year-editor", STORE = "draft", KEY = "current";
function db(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
export async function readDraft(): Promise<Draft | null> {
  try {
    const d = await db();
    return await new Promise((resolve) => {
      const req = d.transaction(STORE).objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve((req.result as Draft) ?? null);
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}
export async function writeDraft(draft: Draft): Promise<boolean> {
  try {
    const d = await db();
    return await new Promise((resolve) => {
      const tx = d.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(draft, KEY);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch { return false; }
}
export async function clearDraft() {
  try { const d = await db(); d.transaction(STORE, "readwrite").objectStore(STORE).delete(KEY); } catch { /* ignore */ }
}

/* ---------- passcode ---------- */
export async function hashPasscode(pass: string) {
  const bytes = new TextEncoder().encode("one-year-editor:" + pass);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ---------- media ---------- */
/** Shrinks a photo to at most 1200px and re-encodes it as WebP (about 100–200 KB). */
export async function shrinkImage(file: File, max = 1200): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not read that image"))), "image/webp", 0.85));
}

const urls = new WeakMap<Blob, string>();
export function blobUrl(b: Blob) {
  let u = urls.get(b);
  if (!u) { u = URL.createObjectURL(b); urls.set(b, u); }
  return u;
}

/** The content the app should see: uploaded files swapped for viewable URLs. */
export function previewContent(d: Draft): AppContent {
  const c = { ...d.content, timeline: d.content.timeline.map(({ photoFile, ...m }) => ({ ...m, photo: photoFile ? blobUrl(photoFile) : m.photo })) };
  if (d.song) c.song = blobUrl(d.song);
  return c as AppContent;
}

/* ---------- export ---------- */
export interface Pack { blob: Blob; filename: string; files: string[] }

export async function buildPack(d: Draft): Promise<Pack> {
  const files: Record<string, Uint8Array> = {};
  const timeline: Memory[] = [];
  for (const [i, { photoFile, ...m }] of d.content.timeline.entries()) {
    if (photoFile) {
      const path = `media/memory-${i + 1}.webp`;
      files["public/" + path] = new Uint8Array(await photoFile.arrayBuffer());
      timeline.push({ ...m, photo: "/" + path });
    } else {
      timeline.push(m.photo?.startsWith("blob:") ? { ...m, photo: undefined } : m);
    }
  }
  const out: AppContent = { ...d.content, timeline } as AppContent;
  if (d.song) {
    files["public/media/song.mp3"] = new Uint8Array(await d.song.arrayBuffer());
    out.song = "/media/song.mp3";
  }
  files["public/content.json"] = strToU8(JSON.stringify(out, null, 2) + "\n");
  const zipped = zipSync(files, { level: 6 });
  return {
    blob: new Blob([zipped], { type: "application/zip" }),
    filename: "one-year-content.zip",
    files: Object.keys(files)
  };
}

export function contentJson(d: Draft): Blob {
  const timeline = d.content.timeline.map(({ photoFile: _f, ...m }) => m);
  return new Blob([JSON.stringify({ ...d.content, timeline }, null, 2) + "\n"], { type: "application/json" });
}

export function saveFile(blob: Blob, filename: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}
