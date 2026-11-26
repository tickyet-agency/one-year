import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { AppContent } from "../content";
import {
  buildPack, clearDraft, clone, contentJson, draftFrom, hashPasscode, loadPublished, previewContent, readDraft,
  saveFile, SAMPLE, writeDraft, type Draft, type DraftContent
} from "./draft";
import * as S from "./sections";

/* ---------- passcode gate ---------- */
const SESSION_KEY = "one-year-editor-ok";

function Gate({ hash, onPass, onCreate }: { hash?: string; onPass: () => void; onCreate: (hash: string) => void }) {
  const [pass, setPass] = useState("");
  const [again, setAgain] = useState("");
  const [err, setErr] = useState("");
  const creating = !hash;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (creating) {
      if (pass.length < 6) return setErr("Use at least 6 characters.");
      if (pass !== again) return setErr("The two passcodes don't match.");
      onCreate(await hashPasscode(pass));
      return;
    }
    if ((await hashPasscode(pass)) === hash) onPass();
    else setErr("That passcode isn't right.");
  };

  return (
    <div className="ed-gate">
      <form className="ed-gate-card" onSubmit={submit}>
        <span className="ed-eyebrow">365 Days of Us</span>
        <h1>{creating ? "Set an editor passcode" : "Story editor"}</h1>
        <p>{creating
          ? "This page lets you change everything she'll see. Pick a passcode so she can't open it by accident. It's saved with your content as a scrambled code, never as the passcode itself."
          : "Enter the editor passcode to change the story."}</p>
        <label htmlFor="ed-pass">Passcode</label>
        <input id="ed-pass" type="password" autoComplete={creating ? "new-password" : "current-password"} value={pass} onChange={(e) => { setPass(e.target.value); setErr(""); }} />
        {creating && (
          <>
            <label htmlFor="ed-pass2">Type it again</label>
            <input id="ed-pass2" type="password" autoComplete="new-password" value={again} onChange={(e) => { setAgain(e.target.value); setErr(""); }} />
          </>
        )}
        {err && <p className="ed-error" role="alert">{err}</p>}
        <button className="ed-btn" type="submit">{creating ? "Save passcode and continue" : "Open the editor"}</button>
      </form>
    </div>
  );
}

/* ---------- readiness checklist ---------- */
interface Check { ok: boolean; text: string; section: string }
function checks(d: Draft): Check[] {
  const c = d.content;
  const start = new Date(c.startDate);
  return [
    { ok: !c.showDemoHint, text: "Lock screen no longer shows the answer", section: "lock" },
    { ok: c.her !== SAMPLE.her && c.him !== SAMPLE.him && !!c.her.trim() && !!c.him.trim(), text: "Real names instead of the sample ones", section: "basics" },
    { ok: !!c.startDate && !isNaN(start.getTime()), text: "Start date is set", section: "basics" },
    { ok: c.answers.some((a) => a.trim()), text: "At least one lock-screen answer", section: "lock" },
    { ok: c.reasons.filter((r) => r.trim()).length >= 10, text: "At least 10 reasons", section: "reasons" },
    {
      ok: c.quiz.every((q) => q.q.trim() && q.options.filter((o) => o.trim()).length >= 2 && q.correct.length > 0 && q.correct.every((k) => q.options[k]?.trim())),
      text: "Every quiz question has a question, at least two options and a right answer", section: "quiz"
    },
    { ok: !!c.editorPasscodeHash, text: "Editor passcode is set", section: "basics" }
  ];
}

type Status = { kind: "idle" | "saving" | "saved" | "error"; at?: number };

export default function Editor() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [published, setPublished] = useState<AppContent | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [packInfo, setPackInfo] = useState<string[] | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const latest = useRef<Draft | null>(null);
  latest.current = draft;

  /* load: saved draft on this device, else the published content */
  useEffect(() => {
    void (async () => {
      const pub = await loadPublished();
      const saved = await readDraft();
      const d = saved ?? draftFrom(pub);
      setPublished(pub);
      setDraft(d);
      const hash = d.content.editorPasscodeHash;
      if (hash && sessionStorage.getItem(SESSION_KEY) === hash) setUnlocked(true);
    })();
  }, []);

  /* autosave to this device */
  useEffect(() => {
    if (!draft || !unlocked) return;
    setStatus({ kind: "saving" });
    const t = setTimeout(async () => {
      const ok = await writeDraft(draft);
      setStatus(ok ? { kind: "saved", at: Date.now() } : { kind: "error" });
    }, 500);
    return () => clearTimeout(t);
  }, [draft, unlocked]);

  /* live preview: the frame asks for content when it loads; reload it after edits settle */
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== location.origin || e.data?.type !== "preview-ready" || !latest.current) return;
      frame.current?.contentWindow?.postMessage({ type: "preview-content", content: previewContent(latest.current) }, location.origin);
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);
  useEffect(() => {
    if (!draft) return;
    const t = setTimeout(() => setPreviewKey((k) => k + 1), 900);
    return () => clearTimeout(t);
  }, [draft]);

  const set = useCallback<S.SetContent>((fn) => {
    setDraft((d) => {
      if (!d) return d;
      const next = { ...d, content: clone(d.content) as DraftContent, updatedAt: Date.now() };
      fn(next.content);
      return next;
    });
  }, []);

  const setSong = (song: Blob | null, songName?: string) =>
    setDraft((d) => d && { ...d, song, songName, content: song ? d.content : { ...d.content, song: "" }, updatedAt: Date.now() });

  const list = useMemo(() => (draft ? checks(draft) : []), [draft]);
  const ready = list.every((c) => c.ok);

  if (!draft || !published) return <div className="ed-gate"><p className="ed-loading">Opening the editor…</p></div>;

  if (!unlocked) {
    return (
      <Gate hash={draft.content.editorPasscodeHash}
        onPass={() => { sessionStorage.setItem(SESSION_KEY, draft.content.editorPasscodeHash!); setUnlocked(true); }}
        onCreate={(hash) => { set((c) => { c.editorPasscodeHash = hash; }); sessionStorage.setItem(SESSION_KEY, hash); setUnlocked(true); }} />
    );
  }

  const download = async () => {
    setBusy(true);
    try {
      const pack = await buildPack(draft);
      saveFile(pack.blob, pack.filename);
      setPackInfo(pack.files);
    } finally { setBusy(false); }
  };

  const importJson = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as Partial<AppContent>;
      setDraft({ ...draftFrom({ ...published, ...data } as AppContent), updatedAt: Date.now() });
    } catch {
      setStatus({ kind: "error" });
    }
  };

  const statusText =
    status.kind === "saving" ? "Saving…" :
    status.kind === "saved" ? `Saved on this device · ${new Date(status.at!).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` :
    status.kind === "error" ? "Couldn't save on this device" : "";

  return (
    <div className="ed-app">
      <header className="ed-top">
        <div className="ed-brand">
          <span className="ed-eyebrow">365 Days of Us</span>
          <strong>Story editor</strong>
        </div>
        <span className={`ed-status ${status.kind}`} aria-live="polite">{statusText}</span>
        <div className="ed-actions">
          <button type="button" className="ed-btn ghost ed-preview-toggle" onClick={() => setPreviewOpen(true)}>Preview</button>
          <button type="button" className="ed-btn" onClick={download} disabled={busy}>{busy ? "Packing…" : "Download pack"}</button>
        </div>
      </header>

      <div className="ed-body">
        <nav className="ed-nav" aria-label="Editor sections">
          {S.SECTIONS.map(([id, label]) => <a key={id} href={`#ed-${id}`}>{label}</a>)}
        </nav>

        <main className="ed-main">
          <section className={`ed-check ${ready ? "ready" : ""}`} aria-labelledby="ed-check-h">
            <h2 id="ed-check-h">{ready ? "Ready to send" : "Before you send it"}</h2>
            <ul>
              {list.map((c) => (
                <li key={c.text} className={c.ok ? "ok" : ""}>
                  <span aria-hidden="true">{c.ok ? "✓" : "○"}</span>
                  {c.ok ? c.text : <a href={`#ed-${c.section}`}>{c.text}</a>}
                </li>
              ))}
            </ul>
          </section>

          <S.Basics draft={draft} set={set} />
          <S.Lock draft={draft} set={set} />
          <S.Stats draft={draft} set={set} />
          <S.Timeline draft={draft} set={set} />
          <S.Letters draft={draft} set={set} />
          <S.Reasons draft={draft} set={set} />
          <S.Places draft={draft} set={set} />
          <S.Someday draft={draft} set={set} />
          <S.Coupons draft={draft} set={set} />
          <S.Cake draft={draft} set={set} />
          <S.Quiz draft={draft} set={set} />
          <S.Finale draft={draft} set={set} />
          <S.Proposal draft={draft} set={set} />
          <S.Music draft={draft} setSong={setSong} />

          <section className="ed-section" aria-labelledby="ed-files-h">
            <h2 id="ed-files-h">Files</h2>
            <div className="ed-card ed-files">
              <div className="ed-row wrap">
                <button type="button" className="ed-btn" onClick={download} disabled={busy}>Download pack (.zip)</button>
                <button type="button" className="ed-btn ghost" onClick={() => saveFile(contentJson(draft), "content.json")}>Download content.json only</button>
                <label htmlFor="ed-import" className="ed-btn ghost">Load a content.json</label>
                <input id="ed-import" type="file" accept="application/json,.json" className="ed-file"
                  onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void importJson(f); }} />
              </div>
              <p className="ed-hint">The pack holds content.json plus any photos and song you uploaded. Use “content.json only” when you changed just words.</p>
              {!confirmReset
                ? <button type="button" className="ed-btn ghost danger" onClick={() => setConfirmReset(true)}>Discard my changes…</button>
                : (
                  <div className="ed-confirm" role="alert">
                    <p>Throw away everything in this editor and go back to what's published? This can't be undone.</p>
                    <div className="ed-row">
                      <button type="button" className="ed-btn danger" onClick={async () => { await clearDraft(); setDraft(draftFrom(published)); setConfirmReset(false); }}>Yes, discard</button>
                      <button type="button" className="ed-btn ghost" onClick={() => setConfirmReset(false)}>Keep editing</button>
                    </div>
                  </div>
                )}
            </div>
          </section>
        </main>

        <aside className={`ed-preview ${previewOpen ? "open" : ""}`} aria-label="Live preview">
          <div className="ed-preview-head">
            <span>Live preview</span>
            <div className="ed-row">
              <button type="button" className="ed-btn ghost small" onClick={() => setPreviewKey((k) => k + 1)}>Reload</button>
              <button type="button" className="ed-btn ghost small ed-preview-close" onClick={() => setPreviewOpen(false)}>Close</button>
            </div>
          </div>
          <div className="ed-phone">
            <iframe key={previewKey} ref={frame} src="/?preview=1" title="Preview of the app" />
          </div>
          <p className="ed-hint">The preview uses your unsaved changes. Roses you collect here don't count.</p>
        </aside>
      </div>

      {packInfo && (
        <div className="ed-modal" role="dialog" aria-modal="true" aria-labelledby="ed-pack-h">
          <div className="ed-modal-card">
            <h2 id="ed-pack-h">Pack downloaded</h2>
            <p>To put these changes live:</p>
            <ol>
              <li>Unzip <b>one-year-content.zip</b> into the project folder. It contains a <code>public</code> folder; let it replace the old files.</li>
              <li>Commit and push. If the site is on Vercel or Netlify it updates by itself in a minute or two.</li>
            </ol>
            <pre className="ed-code">git add public{"\n"}git commit -m "Update the story"{"\n"}git push</pre>
            <details>
              <summary>What's in the pack ({packInfo.length} files)</summary>
              <ul>{packInfo.map((f) => <li key={f}><code>{f}</code></li>)}</ul>
            </details>
            <button type="button" className="ed-btn" onClick={() => setPackInfo(null)}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
