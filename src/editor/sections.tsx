import { useId, useState } from "react";
import { defaultContent, type QuizQuestion, type Scene } from "../content";
import { SCENE_NAMES, Scene as SceneArt } from "../components/Scene";
import { blobUrl, shrinkImage, type Draft, type DraftContent, type DraftMemory } from "./draft";
import { DateTime, ListEditor, NumberField, Section, Select, StringList, Text, Toggle } from "./fields";

export type SetContent = (fn: (c: DraftContent) => void) => void;
interface Props { draft: Draft; set: SetContent }

export const SECTIONS = [
  ["basics", "The basics"], ["lock", "Lock screen"], ["stats", "Numbers"], ["timeline", "Memories"],
  ["letters", "Open-when letters"], ["reasons", "Love fortunes"], ["places", "Star map"], ["someday", "Meeting day"],
  ["coupons", "Love coupons"], ["cake", "Cake"], ["quiz", "Quiz"], ["finale", "Last page"], ["proposal", "Proposal"], ["music", "Music"]
] as const;

const SCENE_LABELS: Record<Scene, string> = {
  chat: "Chat bubbles", call: "Phone call", video: "Video call", movie: "Movie night",
  cake: "Birthday cake", parcel: "Gift parcel", stars: "Heart and stars", sunrise: "Sunrise"
};

export function Basics({ draft: { content: c }, set }: Props) {
  return (
    <Section id="basics" title="The basics" intro="Who it's for, who it's from, and when it all started.">
      <div className="ed-grid2">
        <Text label="Her name" value={c.her} onChange={(v) => set((d) => { d.her = v; })} />
        <Text label="Your friend's name" value={c.him} onChange={(v) => set((d) => { d.him = v; })} />
      </div>
      <DateTime label="When it started" value={c.startDate} onChange={(v) => set((d) => { d.startDate = v; })}
        hint="The live counter (years, months, days…) counts from this moment." />
      <Text label="Tagline under the names" value={c.tagline} onChange={(v) => set((d) => { d.tagline = v; })} />
    </Section>
  );
}

export function Lock({ draft: { content: c }, set }: Props) {
  return (
    <Section id="lock" title="Lock screen" intro="She has to answer this to get in. Pick something only she knows.">
      <Text label="Question" value={c.question} onChange={(v) => set((d) => { d.question = v; })} />
      <StringList label="Accepted answers" items={c.answers} onChange={(v) => set((d) => { d.answers = v; })}
        hint="Not case-sensitive. Add spelling variations she might type." placeholder="e.g. sunflower" />
      <StringList label="Replies to a wrong answer" items={c.wrongReplies} onChange={(v) => set((d) => { d.wrongReplies = v; })} />
      <Toggle label="Show the answer on the lock screen (preview mode)" checked={c.showDemoHint}
        onChange={(v) => set((d) => { d.showDemoHint = v; })} hint="Turn this off before sending it to her." />
    </Section>
  );
}

export function Stats({ draft: { content: c }, set }: Props) {
  return (
    <Section id="stats" title="Numbers" intro="The row of little stats under the counter. Write LIVE_DAYS as the number to show the live count of days together.">
      <ListEditor items={c.stats} onChange={(v) => set((d) => { d.stats = v; })} make={() => ({ n: "", label: "" })} max={4}
        addLabel="Add a number" itemTitle={(s) => `${s.n} ${s.label}`}
        render={(s, up) => (
          <div className="ed-grid2">
            <Text label="Number" value={s.n} onChange={(n) => up({ n })} placeholder="840" />
            <Text label="Label" value={s.label} onChange={(label) => up({ label })} placeholder="km between us" />
          </div>
        )} />
    </Section>
  );
}

function PhotoPicker({ m, update }: { m: DraftMemory; update: (p: Partial<DraftMemory>) => void }) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const src = m.photoFile ? blobUrl(m.photoFile) : m.photo;
  return (
    <div className="ed-field">
      <span className="ed-label">Picture</span>
      <div className="ed-photo">
        <div className="ed-photo-frame">{src ? <img src={src} alt="" /> : <SceneArt name={m.scene} />}</div>
        <div className="ed-photo-tools">
          <label htmlFor={id} className="ed-btn ghost small">{src ? "Replace photo" : "Upload a photo"}</label>
          <input id={id} type="file" accept="image/*" className="ed-file"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              setBusy(true); setErr("");
              try { update({ photoFile: await shrinkImage(f) }); } catch { setErr("That file couldn't be read as an image."); }
              setBusy(false);
            }} />
          {src && <button type="button" className="ed-btn ghost small" onClick={() => update({ photoFile: null, photo: undefined })}>Use the drawing instead</button>}
          {busy && <span className="ed-hint">Shrinking photo…</span>}
          {err && <span className="ed-error">{err}</span>}
          <p className="ed-hint">Photos are shrunk to 1200px so the app stays fast. Without a photo, the drawing below is shown.</p>
        </div>
      </div>
      <Select label="Drawing" value={m.scene} options={SCENE_NAMES.map((s) => ({ value: s, label: SCENE_LABELS[s] }))} onChange={(scene) => update({ scene })} />
    </div>
  );
}

export function Timeline({ draft: { content: c }, set }: Props) {
  return (
    <Section id="timeline" title="Memories" intro="The cards on the timeline. She taps each one to read the note on the back.">
      <ListEditor<DraftMemory> items={c.timeline} onChange={(v) => set((d) => { d.timeline = v; })} min={1} max={12}
        addLabel="Add a memory" itemTitle={(m) => `${m.date} · ${m.title}`}
        make={() => ({ date: "", title: "", text: "", scene: "stars", caption: "", back: "" })}
        render={(m, up) => (
          <>
            <div className="ed-grid2">
              <Text label="Date" value={m.date} onChange={(date) => up({ date })} placeholder="2 Dec 2025" />
              <Text label="Title" value={m.title} onChange={(title) => up({ title })} placeholder="Our first voice call" />
            </div>
            <Text label="What happened" value={m.text} onChange={(text) => up({ text })} multiline rows={2} />
            <div className="ed-grid2">
              <Text label="Caption on the card" value={m.caption} onChange={(caption) => up({ caption })} />
              <Text label="Note on the back" value={m.back} onChange={(back) => up({ back })} />
            </div>
            <PhotoPicker m={m} update={up} />
          </>
        )} />
    </Section>
  );
}

export function Letters({ draft: { content: c }, set }: Props) {
  return (
    <Section id="letters" title="Open-when letters" intro="Envelopes she can open whenever she needs them.">
      <ListEditor items={c.letters} onChange={(v) => set((d) => { d.letters = v; })} min={1} max={12}
        addLabel="Add a letter" itemTitle={(l) => `Open when ${l.when}`} make={() => ({ when: "", body: "" })}
        render={(l, up) => (
          <>
            <Text label="Open when…" value={l.when} onChange={(when) => up({ when })} placeholder="you miss me" />
            <Text label="Letter" value={l.body} onChange={(body) => up({ body })} multiline rows={4} hint="Each new line shows as a new line in the letter." />
          </>
        )} />
    </Section>
  );
}

export function Reasons({ draft: { content: c }, set }: Props) {
  const id = useId();
  const n = c.reasons.length;
  return (
    <Section id="reasons" title="Love fortunes" intro="One fortune per line. She pulls them from the jar one at a time; every 10 earns a rose.">
      <div className="ed-field">
        <label htmlFor={id}>Fortunes ({n})</label>
        <textarea id={id} rows={14} value={c.reasons.join("\n")}
          onChange={(e) => set((d) => { d.reasons = e.target.value.split("\n"); })}
          onBlur={() => set((d) => { d.reasons = d.reasons.map((r) => r.trim()).filter(Boolean); })} />
        <p className={n < 10 ? "ed-error" : "ed-hint"}>{n < 10 ? "Add at least 10 fortunes." : `${n} fortunes, worth ${Math.floor(n / 10)} roses.`}</p>
      </div>
    </Section>
  );
}

export function Places({ draft: { content: c }, set }: Props) {
  const [active, setActive] = useState(0);
  return (
    <Section id="places" title="Star map" intro="Places you've been together, even on a screen. Pick a star in the list, then tap the sky to move it.">
      <svg className="ed-sky" viewBox="0 0 100 62" role="img" aria-label="Star map: tap to place the selected star"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const x = Math.round(((e.clientX - r.left) / r.width) * 100), y = Math.round(((e.clientY - r.top) / r.height) * 62);
          set((d) => { if (d.places[active]) { d.places[active].x = Math.min(96, Math.max(4, x)); d.places[active].y = Math.min(56, Math.max(6, y)); } });
        }}>
        <polyline points={c.places.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#e9c27d" strokeWidth={0.3} strokeDasharray="1 1" />
        {c.places.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={i === active ? 3 : 2} fill={i === active ? "#ffd98a" : "#e9c27d"} opacity={i === active ? 1 : 0.7} />
            <text x={p.x} y={p.y + 1.2} textAnchor="middle" fontSize={2.6} fill="#2a0e18" fontWeight={700}>{i + 1}</text>
          </g>
        ))}
      </svg>
      <ListEditor items={c.places} onChange={(v) => set((d) => { d.places = v; })} min={2} max={8}
        addLabel="Add a star" itemTitle={(p) => p.name}
        make={() => ({ name: "", date: "", memory: "", x: 50, y: 30 })}
        render={(p, up, i) => (
          <>
            <div className="ed-row">
              <button type="button" className={`ed-btn small ${i === active ? "" : "ghost"}`} onClick={() => setActive(i)}>
                {i === active ? "Selected: tap the sky to move" : "Select to move on the map"}
              </button>
            </div>
            <div className="ed-grid2">
              <Text label="Name" value={p.name} onChange={(name) => up({ name })} placeholder="Movie nights" />
              <Text label="When" value={p.date} onChange={(date) => up({ date })} placeholder="Jan 2026" />
            </div>
            <Text label="Memory" value={p.memory} onChange={(memory) => up({ memory })} />
            <div className="ed-row">
              <NumberField label="Across (0–100)" value={p.x} min={0} max={100} onChange={(x) => up({ x })} />
              <NumberField label="Down (0–62)" value={p.y} min={0} max={62} onChange={(y) => up({ y })} />
            </div>
          </>
        )} />
    </Section>
  );
}

export function Someday({ draft: { content: c }, set }: Props) {
  return (
    <Section id="someday" title="Meeting day" intro="The light chapter with the couple picture.">
      <DateTime label="The day you finally meet" optional value={c.meetDate} onChange={(v) => set((d) => { d.meetDate = v; })}
        hint="Leave empty if it isn't fixed yet; set it to show a live countdown to the first hug." />
      <Text label="Note beside the picture" value={c.someday} onChange={(v) => set((d) => { d.someday = v; })} multiline rows={3} />
    </Section>
  );
}

export function Coupons({ draft: { content: c }, set }: Props) {
  return (
    <Section id="coupons" title="Love coupons" intro="Gold scratch cards. She screenshots one and sends it to redeem it.">
      <ListEditor items={c.coupons} onChange={(v) => set((d) => { d.coupons = v; })} min={1} max={9}
        addLabel="Add a coupon" itemTitle={(k) => k.title} make={() => ({ title: "", note: "" })}
        render={(k, up) => (
          <div className="ed-grid2">
            <Text label="Coupon" value={k.title} onChange={(title) => up({ title })} placeholder="The first hug" />
            <Text label="Small print" value={k.note} onChange={(note) => up({ note })} placeholder="Valid the second we meet." />
          </div>
        )} />
    </Section>
  );
}

export function Cake({ draft: { content: c }, set }: Props) {
  return (
    <Section id="cake" title="Cake" intro="She blows out the candles, makes a wish, then cuts the cake.">
      <Text label="Writing on the cake" value={c.cake.text} maxLength={18} onChange={(v) => set((d) => { d.cake.text = v; })} hint="Short is best: up to 18 characters." />
      <Text label="After the candles go out" value={c.cake.wish} onChange={(v) => set((d) => { d.cake.wish = v; })} multiline rows={2} />
      <Text label="After the cake is cut" value={c.cake.cut} onChange={(v) => set((d) => { d.cake.cut = v; })} multiline rows={2} />
    </Section>
  );
}

const MAX_OPTIONS = 8;
const QUESTION_IDEAS = [
  "Where did we first talk?",
  "What's my nickname for you?",
  "Which song always reminds me of you?",
  "What did we talk about on our first call?",
  "What's my favourite thing about you?",
  "Where is the first place we'll go together?",
  "What do I always say before we hang up?"
];

/** Options editor for one quiz question: any number of answers (2–8), any of them marked right. */
function QuizOptions({ q, up }: { q: QuizQuestion; up: (p: Partial<QuizQuestion>) => void }) {
  const setOption = (k: number, v: string) => up({ options: q.options.map((x, j) => (j === k ? v : x)) });
  const toggleRight = (k: number) => up({ correct: q.correct.includes(k) ? q.correct.filter((x) => x !== k) : [...q.correct, k].sort((a, b) => a - b) });
  const remove = (k: number) => up({
    options: q.options.filter((_, j) => j !== k),
    correct: q.correct.filter((x) => x !== k).map((x) => (x > k ? x - 1 : x))
  });
  const move = (k: number, d: number) => {
    const j = k + d;
    if (j < 0 || j >= q.options.length) return;
    const options = [...q.options];
    [options[k], options[j]] = [options[j], options[k]];
    const swap = (x: number) => (x === k ? j : x === j ? k : x);
    up({ options, correct: q.correct.map(swap).sort((a, b) => a - b) });
  };
  const filled = q.options.filter((o) => o.trim()).length;
  const blankRight = q.correct.some((k) => !q.options[k]?.trim());

  return (
    <fieldset className="ed-field ed-strings">
      <legend>Answer options ({q.options.length} of up to {MAX_OPTIONS})</legend>
      <p className="ed-hint">Write as many options as you like and mark every one that counts as right. She sees them as buttons.</p>
      {q.options.map((o, k) => {
        const right = q.correct.includes(k);
        return (
          <div className={`ed-option${right ? " right" : ""}`} key={k}>
            <input type="text" aria-label={`Answer option ${k + 1}`} value={o} placeholder={`Answer option ${k + 1}`}
              onChange={(e) => setOption(k, e.target.value)} />
            <button type="button" className="ed-pill" aria-pressed={right} onClick={() => toggleRight(k)}>
              {right ? "✓ Right answer" : "Mark as right"}
            </button>
            <div className="ed-option-tools">
              <button type="button" className="ed-icon" aria-label={`Move option ${k + 1} up`} disabled={k === 0} onClick={() => move(k, -1)}>↑</button>
              <button type="button" className="ed-icon" aria-label={`Move option ${k + 1} down`} disabled={k === q.options.length - 1} onClick={() => move(k, 1)}>↓</button>
              <button type="button" className="ed-icon danger" aria-label={`Remove option ${k + 1}`} disabled={q.options.length <= 2} onClick={() => remove(k)}>✕</button>
            </div>
          </div>
        );
      })}
      <div className="ed-row wrap">
        {q.options.length < MAX_OPTIONS && <button type="button" className="ed-btn ghost small" onClick={() => up({ options: [...q.options, ""] })}>+ Add another option</button>}
        <button type="button" className="ed-btn ghost small" onClick={() => up({ correct: q.options.map((_, k) => k) })}>Every option is right</button>
      </div>
      {filled < 2 && <p className="ed-error">Fill in at least two options.</p>}
      {q.correct.length === 0 && <p className="ed-error">Mark at least one option as the right answer.</p>}
      {blankRight && <p className="ed-error">A right answer is empty. Fill it in or unmark it.</p>}
    </fieldset>
  );
}

export function Quiz({ draft: { content: c }, set }: Props) {
  const [idea, setIdea] = useState("");
  const blank = (question = ""): QuizQuestion => ({ q: question, options: ["", ""], correct: [], yay: "", nope: "" });
  return (
    <Section id="quiz" title="Quiz" intro="Write your own questions and answer options. Finishing the quiz opens the last page, and she can't fail it.">
      <ListEditor items={c.quiz} onChange={(v) => set((d) => { d.quiz = v; })} min={1} max={15}
        addLabel="Write your own question" itemTitle={(q) => q.q} make={() => blank()}
        render={(q, up) => (
          <>
            <Text label="Your question" value={q.q} onChange={(v) => up({ q: v })} placeholder="e.g. What's my nickname for you?" />
            <QuizOptions q={q} up={up} />
            <div className="ed-grid2">
              <Text label="Reply when she picks a right answer" value={q.yay} onChange={(yay) => up({ yay })} placeholder="Correct! You know me too well." />
              <Text label="Reply when she picks a wrong one" value={q.nope} onChange={(nope) => up({ nope })} placeholder="Close! It was…" hint="Leave empty if every option is right." />
            </div>
          </>
        )} />
      <div className="ed-idea">
        <label htmlFor="ed-quiz-idea">Need an idea? Start a new question from one of these</label>
        <div className="ed-row wrap">
          <select id="ed-quiz-idea" value={idea} onChange={(e) => setIdea(e.target.value)}>
            <option value="">Pick a question idea…</option>
            {QUESTION_IDEAS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="button" className="ed-btn small" disabled={!idea || c.quiz.length >= 15}
            onClick={() => { set((d) => { d.quiz.push(blank(idea)); }); setIdea(""); }}>Add this question</button>
        </div>
      </div>
    </Section>
  );
}

export function Finale({ draft: { content: c }, set }: Props) {
  return (
    <Section id="finale" title="Last page" intro="The love letter that types itself out, then the surprise.">
      <Text label="Greeting" value={c.finaleTitle} onChange={(v) => set((d) => { d.finaleTitle = v; })} placeholder="My Meera," />
      <Text label="The letter" value={c.finaleLetter} onChange={(v) => set((d) => { d.finaleLetter = v; })} multiline rows={10} />
      <Text label="Signature" value={c.signature} onChange={(v) => set((d) => { d.signature = v; })} />
      <div className="ed-grid2">
        <Text label="Big line after the letter" value={c.surpriseTitle} onChange={(v) => set((d) => { d.surpriseTitle = v; })} />
        <Text label="Surprise line" value={c.surpriseLine} onChange={(v) => set((d) => { d.surpriseLine = v; })}
          hint="Tip: time a real delivery to her door for this moment." />
      </div>
      <Text label="Secret message (tap the & five times)" value={c.secretMessage} onChange={(v) => set((d) => { d.secretMessage = v; })} />
    </Section>
  );
}

type ProposalText = typeof defaultContent.proposal;

export function Proposal({ draft: { content: c }, set }: Props) {
  const p: ProposalText = c.proposal ?? defaultContent.proposal;
  const edit = (fn: (p: ProposalText) => void) => set((d) => {
    if (!d.proposal) d.proposal = JSON.parse(JSON.stringify(defaultContent.proposal));
    fn(d.proposal);
  });
  return (
    <Section id="proposal" title="Proposal" intro="After the bouquet a velvet box opens by itself as she scrolls to it, a platinum ring rises out, and the question appears.">
      <Toggle label="Show the proposal at the end" checked={p.enabled} onChange={(v) => edit((x) => { x.enabled = v; })}
        hint="Turn this off if your friend wants to save the question for another day." />
      {p.enabled && <>
        <Text label="Line above the box" value={p.lead} onChange={(v) => edit((x) => { x.lead = v; })} />
        <Text label="The question" value={p.question} onChange={(v) => edit((x) => { x.question = v; })}
          hint={`Her name (${c.her || "her name"}) is shown just above it.`} placeholder="Will you marry me?" />
        <Text label="A few words under the question" value={p.note} onChange={(v) => edit((x) => { x.note = v; })} multiline rows={3} />
        <div className="ed-grid2">
          <Text label="First answer button" value={p.yes} onChange={(v) => edit((x) => { x.yes = v; })} placeholder="Yes" />
          <Text label="Second answer button" value={p.yes2} onChange={(v) => edit((x) => { x.yes2 = v; })}
            hint="Both buttons mean yes. Leave this empty for a single button." />
        </div>
        <Text label="Big line after she says yes" value={p.saidYesTitle} onChange={(v) => edit((x) => { x.saidYesTitle = v; })} />
        <Text label="Message after she says yes" value={p.saidYesLine} onChange={(v) => edit((x) => { x.saidYesLine = v; })} multiline rows={3} />
      </>}
    </Section>
  );
}

export function Music({ draft, setSong }: { draft: Draft; setSong: (b: Blob | null, name?: string) => void }) {
  const id = useId();
  const [err, setErr] = useState("");
  const published = !draft.song && draft.content.song;
  return (
    <Section id="music" title="Music" intro="Plays softly after she unlocks the app. Without a song, a gentle built-in music-box tune plays.">
      <div className="ed-field">
        <span className="ed-label">Their song</span>
        <div className="ed-row wrap">
          <label htmlFor={id} className="ed-btn ghost small">{draft.song || published ? "Replace song" : "Upload an mp3"}</label>
          <input id={id} type="file" accept="audio/mpeg,audio/mp3,.mp3" className="ed-file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              if (f.size > 10 * 1024 * 1024) { setErr("That file is over 10 MB. Trim it or export at a lower bitrate."); return; }
              setErr("");
              setSong(f, f.name);
            }} />
          {(draft.song || published) && <button type="button" className="ed-btn ghost small" onClick={() => setSong(null)}>Use the music box</button>}
        </div>
        {draft.song && <audio controls src={blobUrl(draft.song)} className="ed-audio" />}
        <p className="ed-hint">{draft.song ? `Selected: ${draft.songName ?? "song.mp3"} (${(draft.song.size / 1048576).toFixed(1)} MB)` : published ? "Using the song already published." : "No song: the music box plays."}</p>
        {err && <p className="ed-error">{err}</p>}
      </div>
    </Section>
  );
}
