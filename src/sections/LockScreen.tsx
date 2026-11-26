import { useRef, useState, type FormEvent } from "react";
import { content } from "../content";

/** "Only you can open this." She answers a private question to get in. */
export function LockScreen({ onUnlock, gone }: { onUnlock: () => void; gone: boolean }) {
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState("");
  const [shake, setShake] = useState(0);
  const wrong = useRef(0);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = value.trim().toLowerCase();
    if (content.answers.some((a) => a.toLowerCase() === v)) {
      setMsg("Welcome home");
      onUnlock();
      return;
    }
    setMsg(content.wrongReplies[wrong.current % content.wrongReplies.length]);
    wrong.current++;
    setShake((n) => n + 1);
  };

  return (
    <div id="lock" className={gone ? "gone" : ""} role="dialog" aria-modal="true" aria-labelledby="lock-title" aria-hidden={gone}>
      <img className="lock-rose a" src="/images/rose.webp" alt="" />
      <img className="lock-rose b" src="/images/rose.webp" alt="" />
      <div key={shake} className={`lock-box${shake ? " shake" : ""}`}>
        <div className="lock-emblem">
          <div className="heartlock" aria-hidden="true">
            <img src="/images/heart3d.webp" alt="" />
            <svg viewBox="0 0 24 24"><circle className="hole" cx="12" cy="10.4" r="1.7" /><path className="hole" d="M11.1 11.4h1.8l.55 3.8h-2.9z" /></svg>
          </div>
        </div>
        <h1 id="lock-title">Only you can open this.</h1>
        <p className="lock-q" id="lock-q">{content.question}</p>
        <form className="lock-form" autoComplete="off" onSubmit={submit}>
          <input id="pw" type="text" aria-labelledby="lock-q" placeholder="Your answer…" autoCapitalize="off" spellCheck={false}
            value={value} onChange={(e) => setValue(e.target.value)} />
          <button className="btn" type="submit">Unlock</button>
        </form>
        <p className="lock-msg" aria-live="polite">{msg}</p>
        {content.showDemoHint && (
          <p className="demo-hint">Preview mode: the answer is “{content.answers[0]}”. Turn off showDemoHint before sending.</p>
        )}
      </div>
    </div>
  );
}
