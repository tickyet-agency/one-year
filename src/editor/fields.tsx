import { useId, type ReactNode } from "react";

/* Small, accessible form building blocks for the editor. */

export function Text({ label, value, onChange, hint, placeholder, multiline, rows = 3, maxLength }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string; placeholder?: string;
  multiline?: boolean; rows?: number; maxLength?: number;
}) {
  const id = useId();
  return (
    <div className="ed-field">
      <label htmlFor={id}>{label}</label>
      {multiline
        ? <textarea id={id} rows={rows} value={value} placeholder={placeholder} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
        : <input id={id} type="text" value={value} placeholder={placeholder} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />}
      {hint && <p className="ed-hint">{hint}</p>}
    </div>
  );
}

/** Stored as "YYYY-MM-DDTHH:mm:ss" in local time; "" means not set. */
export function DateTime({ label, value, onChange, hint, optional }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string; optional?: boolean;
}) {
  const id = useId();
  return (
    <div className="ed-field">
      <label htmlFor={id}>{label}</label>
      <div className="ed-row">
        <input id={id} type="datetime-local" value={value ? value.slice(0, 16) : ""} onChange={(e) => onChange(e.target.value ? e.target.value + ":00" : "")} />
        {optional && value && <button type="button" className="ed-btn ghost small" onClick={() => onChange("")}>Clear</button>}
      </div>
      {hint && <p className="ed-hint">{hint}</p>}
    </div>
  );
}

export function NumberField({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  const id = useId();
  return (
    <div className="ed-field narrow">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="number" value={value} min={min} max={max} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  const id = useId();
  return (
    <div className="ed-field">
      <div className="ed-toggle">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <label htmlFor={id}>{label}</label>
      </div>
      {hint && <p className="ed-hint">{hint}</p>}
    </div>
  );
}

export function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  const id = useId();
  return (
    <div className="ed-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

/** A list of cards with add / move / remove controls. */
export function ListEditor<T>({ items, onChange, make, itemTitle, render, addLabel, min = 0, max = 99 }: {
  items: T[]; onChange: (next: T[]) => void; make: () => T; itemTitle: (item: T, i: number) => string;
  render: (item: T, update: (patch: Partial<T>) => void, i: number) => ReactNode; addLabel: string; min?: number; max?: number;
}) {
  const update = (i: number, patch: Partial<T>) => onChange(items.map((it, k) => (k === i ? { ...it, ...patch } : it)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="ed-list">
      {items.map((it, i) => (
        <div className="ed-item" key={i}>
          <div className="ed-item-head">
            <span className="ed-item-num">{i + 1}</span>
            <span className="ed-item-title">{itemTitle(it, i) || "Untitled"}</span>
            <div className="ed-item-tools">
              <button type="button" className="ed-icon" aria-label={`Move ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
              <button type="button" className="ed-icon" aria-label={`Move ${i + 1} down`} disabled={i === items.length - 1} onClick={() => move(i, 1)}>↓</button>
              <button type="button" className="ed-icon danger" aria-label={`Remove ${i + 1}`} disabled={items.length <= min}
                onClick={() => onChange(items.filter((_, k) => k !== i))}>✕</button>
            </div>
          </div>
          <div className="ed-item-body">{render(it, (p) => update(i, p), i)}</div>
        </div>
      ))}
      {items.length < max && <button type="button" className="ed-btn ghost" onClick={() => onChange([...items, make()])}>+ {addLabel}</button>}
    </div>
  );
}

/** Plain list of short strings (answers, wrong replies). */
export function StringList({ label, items, onChange, hint, placeholder, min = 1 }: {
  label: string; items: string[]; onChange: (v: string[]) => void; hint?: string; placeholder?: string; min?: number;
}) {
  return (
    <fieldset className="ed-field ed-strings">
      <legend>{label}</legend>
      {items.map((s, i) => (
        <div className="ed-row" key={i}>
          <input type="text" aria-label={`${label} ${i + 1}`} value={s} placeholder={placeholder}
            onChange={(e) => onChange(items.map((x, k) => (k === i ? e.target.value : x)))} />
          <button type="button" className="ed-icon danger" aria-label={`Remove ${label} ${i + 1}`} disabled={items.length <= min}
            onClick={() => onChange(items.filter((_, k) => k !== i))}>✕</button>
        </div>
      ))}
      <button type="button" className="ed-btn ghost small" onClick={() => onChange([...items, ""])}>+ Add</button>
      {hint && <p className="ed-hint">{hint}</p>}
    </fieldset>
  );
}

/** Section ids get an "ed-" prefix so they never collide with the app's own ids (#lock, #music…). */
export const sectionAnchor = (id: string) => "ed-" + id;

export function Section({ id: rawId, title, intro, children }: { id: string; title: string; intro?: string; children: ReactNode }) {
  const id = sectionAnchor(rawId);
  return (
    <section className="ed-section" id={id} aria-labelledby={id + "-h"}>
      <h2 id={id + "-h"}>{title}</h2>
      {intro && <p className="ed-intro">{intro}</p>}
      <div className="ed-card">{children}</div>
    </section>
  );
}
