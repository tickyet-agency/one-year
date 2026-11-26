import { useEffect, useRef, useState } from "react";
import { content, runtime } from "../content";
import { burst, petalBurst } from "../lib/effects";
import { prefersReducedMotion } from "../lib/random";

const STORE = "our-yes-v1";

function readYes(): number | null {
  if (runtime.preview) return null;
  try { const v = Number(localStorage.getItem(STORE)); return v > 0 ? v : null; } catch { return null; }
}

/** A velvet box that opens by itself when she scrolls to it, a platinum ring, and one question. */
export function Proposal() {
  const p = content.proposal;
  const saved = readYes();
  const [stage, setStage] = useState<"closed" | "open" | "asked" | "yes">(saved ? "yes" : "closed");
  const [yesAt, setYesAt] = useState<number | null>(saved);
  const boxRef = useRef<HTMLDivElement>(null);
  const askRef = useRef<HTMLDivElement>(null);
  const still = prefersReducedMotion();

  // Stay closed until the box is properly on screen, give her a beat, then open it.
  useEffect(() => {
    const box = boxRef.current;
    if (stage !== "closed" || !box) return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearTimeout(timer);
      if (!e.isIntersecting) return;
      timer = window.setTimeout(() => {
        io.disconnect();
        setStage("open");
        const r = box.getBoundingClientRect();
        window.setTimeout(() => burst(r.left + r.width / 2, r.top + r.height * 0.35, 14), still ? 0 : 900);
      }, still ? 0 : 900);
    }, { threshold: 0.75 });
    io.observe(box);
    return () => { io.disconnect(); window.clearTimeout(timer); };
  }, [stage, still]);

  useEffect(() => {
    if (stage !== "open") return;
    const t = window.setTimeout(() => setStage("asked"), still ? 0 : 1900);
    return () => window.clearTimeout(t);
  }, [stage, still]);

  // Bring the question into view once it appears.
  useEffect(() => {
    if (stage !== "asked") return;
    const t = window.setTimeout(() => askRef.current?.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" }), 250);
    return () => window.clearTimeout(t);
  }, [stage, still]);

  if (!p?.enabled) return null;

  const sayYes = () => {
    const now = Date.now();
    setStage("yes");
    setYesAt(now);
    if (!runtime.preview) { try { localStorage.setItem(STORE, String(now)); } catch { /* private mode */ } }
    burst(innerWidth / 2, innerHeight / 2, 48);
    petalBurst(innerWidth / 2, innerHeight * 0.15, 160);
    if (!still) {
      [350, 800, 1250, 1700, 2200, 2700, 3300, 4000].forEach((ms, i) => window.setTimeout(() =>
        burst(innerWidth * [0.2, 0.8, 0.35, 0.65, 0.5, 0.15, 0.85, 0.5][i], innerHeight * (0.25 + 0.07 * (i % 4)), 26), ms));
      [1200, 2600].forEach((ms) => window.setTimeout(() => petalBurst(innerWidth / 2, innerHeight * 0.1, 110), ms));
    }
  };

  const isOpen = stage !== "closed";
  const day = yesAt ? new Date(yesAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "";

  return (
    <div id="proposal" className={`proposal stage-${stage}`}>
      <span className="eyebrow">One more thing</span>
      {stage !== "yes" && <p className="pr-lead">{p.lead}</p>}

      <div ref={boxRef} role="img" className={`ringbox${isOpen ? " open" : ""}`}
        aria-label={isOpen ? "An open ring box with a platinum diamond ring" : "A little closed velvet box"}>
        <span className="rb-glow" aria-hidden="true" />
        <span className="rb-lid in" aria-hidden="true"><Lid face="in" /></span>
        <span className="rb-ring" aria-hidden="true"><Ring /></span>
        <span className="rb-lid out" aria-hidden="true"><Lid face="out" /></span>
        <span className="rb-base" aria-hidden="true"><Base /></span>
        <span className="rb-sparkles" aria-hidden="true">{[0, 1, 2, 3, 4].map((i) => <i key={i} />)}</span>
      </div>

      {stage === "asked" && (
        <div ref={askRef} className="pr-ask" aria-live="polite">
          <p className="pr-name">{content.her},</p>
          <h2 className="pr-q">{p.question}</h2>
          {p.note && <p className="pr-note">{p.note}</p>}
          <div className="pr-btns">
            <button className="btn" type="button" onClick={sayYes}>{p.yes}</button>
            {p.yes2.trim() && <button className="btn ghost" type="button" onClick={sayYes}>{p.yes2}</button>}
          </div>
        </div>
      )}

      {stage === "yes" && (
        <div className="pr-yes" aria-live="polite">
          <h2>{p.saidYesTitle}</h2>
          <p>{p.saidYesLine}</p>
          {day && <span className="pr-date">Engaged · {day}</span>}
        </div>
      )}
    </div>
  );
}

/* ---------- art ---------- */

function Ring() {
  return (
    <svg viewBox="0 0 120 150" role="presentation">
      <defs>
        <linearGradient id="pt-band" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbfcfd" />
          <stop offset=".28" stopColor="#c3cad2" />
          <stop offset=".5" stopColor="#eef1f4" />
          <stop offset=".74" stopColor="#8e98a3" />
          <stop offset="1" stopColor="#dfe4e9" />
        </linearGradient>
        <linearGradient id="pt-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7d8792" />
          <stop offset="1" stopColor="#b5bdc6" />
        </linearGradient>
        <linearGradient id="dia-crown" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".45" stopColor="#dff1ff" />
          <stop offset="1" stopColor="#a9c9e6" />
        </linearGradient>
        <linearGradient id="dia-pav" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8f5ff" />
          <stop offset="1" stopColor="#7fa4c8" />
        </linearGradient>
      </defs>
      {/* back half of the band, seen through the ring */}
      <ellipse cx="60" cy="104" rx="38" ry="36" fill="none" stroke="url(#pt-back)" strokeWidth="5" />
      {/* front of the band */}
      <path d="M22 104 A38 36 0 0 0 98 104" fill="none" stroke="url(#pt-band)" strokeWidth="9" strokeLinecap="round" />
      <path d="M22 104 A38 36 0 0 1 46 70" fill="none" stroke="url(#pt-band)" strokeWidth="8" strokeLinecap="round" />
      <path d="M98 104 A38 36 0 0 0 74 70" fill="none" stroke="url(#pt-band)" strokeWidth="8" strokeLinecap="round" />
      <path d="M30 120 A34 30 0 0 0 86 124" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1.6" strokeLinecap="round" />
      {/* the head and prongs */}
      <path d="M44 70 L50 56 L70 56 L76 70 Z" fill="url(#pt-band)" />
      <path d="M41 40 L45 58 M79 40 L75 58 M53 39 L55 58 M67 39 L65 58" stroke="#c9d0d7" strokeWidth="2.2" strokeLinecap="round" />
      {/* the diamond */}
      <polygon points="36,38 84,38 60,64" fill="url(#dia-pav)" />
      <polygon points="46,22 74,22 84,38 36,38" fill="url(#dia-crown)" />
      <g stroke="#ffffff" strokeOpacity=".75" strokeWidth=".8" fill="none">
        <path d="M46 22 L52 38 L60 22 L68 38 L74 22" />
        <path d="M36 38 L60 64 L84 38 M52 38 L60 64 L68 38" />
        <path d="M36 38 L46 30 L52 38 M84 38 L74 30 L68 38" />
      </g>
      <polygon points="50,24 60,24 55,32" fill="#fff" opacity=".9" />
      <circle className="dia-glint" cx="72" cy="27" r="2.2" fill="#fff" />
    </svg>
  );
}

function Lid({ face }: { face: "in" | "out" }) {
  return (
    <svg viewBox="0 0 200 72" role="presentation">
      <defs>
        <linearGradient id={`vel-lid-${face}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a1f3d" />
          <stop offset="1" stopColor="#4d0c20" />
        </linearGradient>
        <linearGradient id={`satin-${face}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbf1ec" />
          <stop offset=".6" stopColor="#ecd6d0" />
          <stop offset="1" stopColor="#d9bdb6" />
        </linearGradient>
      </defs>
      {face === "out" ? <g>
        <path d="M14 72 L14 34 Q14 8 100 8 Q186 8 186 34 L186 72 Z" fill={`url(#vel-lid-${face})`} />
        <path d="M24 30 Q30 16 100 15 Q170 16 176 30" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="3" strokeLinecap="round" />
        <rect x="14" y="64" width="172" height="8" fill="#e9c27d" opacity=".85" />
      </g> : <g>
        <path d="M14 72 L14 34 Q14 8 100 8 Q186 8 186 34 L186 72 Z" fill="#4d0c20" />
        <path d="M24 70 L24 36 Q24 18 100 18 Q176 18 176 36 L176 70 Z" fill={`url(#satin-${face})`} />
        <text x="100" y="52" textAnchor="middle" fontFamily="Great Vibes, cursive" fontSize="20" fill="#a8782c">forever</text>
      </g>}
    </svg>
  );
}

function Base() {
  return (
    <svg viewBox="0 0 200 110" role="presentation">
      <defs>
        <linearGradient id="vel-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a1a35" />
          <stop offset="1" stopColor="#3a0816" />
        </linearGradient>
        <radialGradient id="cushion" cx=".5" cy=".4" r=".7">
          <stop offset="0" stopColor="#5e1228" />
          <stop offset="1" stopColor="#2a0610" />
        </radialGradient>
      </defs>
      <path d="M14 6 L186 6 L186 92 Q186 106 170 106 L30 106 Q14 106 14 92 Z" fill="url(#vel-base)" />
      <rect x="14" y="2" width="172" height="8" fill="#e9c27d" opacity=".85" />
      <g className="rb-cushion">
        <path d="M26 12 L174 12 L174 34 Q100 44 26 34 Z" fill="url(#cushion)" />
        <path d="M78 22 Q100 28 122 22" fill="none" stroke="#1a0309" strokeWidth="3" strokeLinecap="round" />
      </g>
      <path d="M28 54 Q100 62 172 54" fill="none" stroke="#fff" strokeOpacity=".08" strokeWidth="6" />
    </svg>
  );
}
