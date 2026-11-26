import { useState } from "react";
import { content } from "../content";
import { burst } from "../lib/effects";
import { useGarden } from "../lib/garden";
import { Divider } from "../components/Decor";

/** Five questions she can't fail. Finishing opens the last page. */
export function Quiz({ onFinish }: { onFinish: () => void }) {
  const { earn } = useGarden();
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const total = content.quiz.length;
  const bars = content.quiz.map((_, i) => <i key={i} className={i < qi ? "on" : ""} />);

  if (qi >= total) {
    const msg = score === total ? "Perfect score. Obviously." : score >= total - 1 ? "Nearly perfect. I'll take it." : "Doesn't matter, you're still my favourite.";
    return (
      <section className="chapter" id="quiz-ch">
        <Divider index={8} />
        <div><span className="eyebrow">A tiny test</span><h2>How well do you know <em>us?</em></h2></div>
        <div className="quiz">
          <div className="q-progress">{bars}</div>
          <div className="q-title">{score} out of {total}. {msg}</div>
          <p className="q-react">The last page is open now.</p>
          <div className="q-foot"><button className="btn" type="button" onClick={onFinish}>Read the last page</button></div>
        </div>
      </section>
    );
  }

  const q = content.quiz[qi];
  const answered = pick !== null;
  const ok = answered && q.correct.includes(pick);

  return (
    <section className="chapter" id="quiz-ch">
      <Divider index={8} />
      <div><span className="eyebrow">A tiny test</span><h2>How well do you know <em>us?</em></h2></div>
      <p className="lede">Finish the quiz to unlock the last page. No pressure. There's no way to fail this one.</p>
      <div className="quiz">
        <div className="q-progress">{bars}</div>
        <div className="q-title">{q.q}</div>
        <div className="q-opts">
          {q.options.map((o, i) => !o.trim() ? null : (
            <button key={i} type="button" disabled={answered}
              className={`q-opt${answered && q.correct.includes(i) ? " right" : ""}${answered && i === pick && !q.correct.includes(i) ? " wrong" : ""}`}
              onClick={(e) => {
                setPick(i);
                if (q.correct.includes(i)) {
                  setScore((s) => s + 1);
                  const r = e.currentTarget.getBoundingClientRect();
                  burst(r.left + r.width / 2, r.top + r.height / 2, 12);
                }
              }}>{o}</button>
          ))}
        </div>
        <p className="q-react" aria-live="polite">{answered ? (ok ? q.yay : q.nope) : ""}</p>
        <div className="q-foot">
          <span className="q-count">Question {qi + 1} of {total}</span>
          {answered && (
            <button className="btn" type="button" autoFocus onClick={() => {
              const next = qi + 1;
              setQi(next);
              setPick(null);
              if (next >= total) earn("quiz", innerWidth / 2, innerHeight / 2, "Quiz done");
            }}>{qi === total - 1 ? "See my score" : "Next"}</button>
          )}
        </div>
      </div>
    </section>
  );
}
