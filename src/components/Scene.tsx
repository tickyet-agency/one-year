import type { Scene as SceneName } from "../content";

/* Little drawn illustrations for memories and the pairs game. Static markup we author ourselves. */

const HEART = (x: number, y: number, s: number, cls = "a") =>
  `<path class="${cls}" transform="translate(${x} ${y}) scale(${s})" d="M0 6C-4-1-12 1-10 7c1 4 10 10 10 10s9-6 10-10C12 1 4-1 0 6z"/>`;
const SPARK = (x: number, y: number, r = 2) => `<circle class="g twinkle" cx="${x}" cy="${y}" r="${r}"/>`;

const SCENES: Record<SceneName, string> = {
  chat: `<rect class="i" x="28" y="18" width="44" height="86" rx="7"/><rect class="s" x="31" y="25" width="38" height="70" rx="3"/>
    <rect class="k" x="35" y="32" width="22" height="9" rx="4.5"/><rect class="a" x="43" y="46" width="22" height="9" rx="4.5"/>
    <rect class="k" x="35" y="60" width="14" height="9" rx="4.5"/>${HEART(56, 72, 0.6)}${SPARK(20, 30)}${SPARK(82, 48, 1.6)}${SPARK(18, 92, 1.4)}`,
  call: `<rect class="i" x="34" y="24" width="32" height="64" rx="6"/><rect class="s" x="37" y="30" width="26" height="50" rx="2"/>
    <circle class="k" cx="50" cy="46" r="8"/>${HEART(50, 42, 0.35)}
    <text x="50" y="68" text-anchor="middle" class="a" style="font: 700 5.5px var(--body)">3:12:04</text>
    <path class="ln" d="M24 44c-4 6-4 14 0 20"/><path class="ln" d="M17 40c-6 9-6 19 0 28"/>
    <path class="ln" d="M76 44c4 6 4 14 0 20"/><path class="ln" d="M83 40c6 9 6 19 0 28"/>${SPARK(20, 100, 1.6)}${SPARK(80, 104)}`,
  video: `<rect class="i" x="14" y="36" width="72" height="46" rx="4"/><rect class="s" x="18" y="40" width="31" height="38" rx="2"/><rect class="k" x="51" y="40" width="31" height="38" rx="2"/>
    <circle class="m" cx="33.5" cy="54" r="6"/><rect class="m" x="24" y="63" width="19" height="15" rx="7"/>
    <circle class="a" cx="66.5" cy="54" r="6" opacity=".55"/><rect class="a" x="57" y="63" width="19" height="15" rx="7" opacity=".55"/>
    <path class="i" d="M8 84h84l-6 6H14z"/>${HEART(50, 20, 0.7)}${SPARK(20, 102, 1.6)}${SPARK(82, 106)}`,
  movie: `<rect class="i" x="12" y="24" width="76" height="46" rx="4"/><rect class="k" x="16" y="28" width="68" height="38" rx="2"/>
    <polygon class="a" points="45,38 45,56 59,47"/><rect class="i" x="44" y="70" width="12" height="6"/>
    <path class="s" d="M30 86h16l-3 26H33z"/><path class="a" d="M33 86h3l-.6 26h-2zM40 86h3l.6 26h-2z" opacity=".7"/>
    <circle class="s" cx="33" cy="85" r="3.5"/><circle class="s" cx="39" cy="83" r="4"/><circle class="s" cx="44" cy="85" r="3.5"/>
    ${HEART(66, 92, 0.55)}${HEART(76, 100, 0.4, "g")}`,
  cake: `<rect class="a" x="26" y="70" width="48" height="24" rx="3"/><rect class="s" x="32" y="52" width="36" height="20" rx="3"/>
    <path class="k" d="M32 58c4 4 8 4 12 0s8 4 12 0 8 4 12 0v-3H32z"/><rect class="g" x="48.5" y="38" width="3" height="14" rx="1"/>
    <ellipse class="g twinkle" cx="50" cy="33" rx="2.6" ry="4"/><rect class="m" x="18" y="94" width="64" height="5" rx="2.5"/>
    ${SPARK(22, 30)}${SPARK(80, 26, 1.6)}${SPARK(84, 56, 1.4)}${SPARK(16, 58, 1.4)}`,
  parcel: `<rect class="g" x="26" y="52" width="48" height="40" rx="3"/><rect class="a" x="47" y="52" width="6" height="40"/>
    <rect class="k" x="22" y="44" width="56" height="10" rx="2"/><rect class="a" x="47" y="44" width="6" height="10"/>
    <path class="a" d="M50 44c-10-12-20-4-10 0zM50 44c10-12 20-4 10 0z"/>${HEART(50, 18, 0.6)}${SPARK(18, 40)}${SPARK(84, 34, 1.6)}${SPARK(86, 86, 1.4)}`,
  stars: `${HEART(50, 44, 2.2)}<text x="50" y="70" text-anchor="middle" class="s" style="font: italic 22px var(--display)">1</text>
    ${SPARK(20, 26)}${SPARK(80, 22, 2.4)}${SPARK(86, 70, 1.6)}${SPARK(14, 76, 1.8)}${SPARK(30, 100, 1.4)}${SPARK(70, 104, 2)}`,
  sunrise: `<circle class="g" cx="50" cy="78" r="18"/><polygon class="k" points="-5,125 30,76 55,104 78,72 105,125"/>
    ${HEART(50, 34, 0.7)}${SPARK(22, 40)}${SPARK(80, 44, 1.6)}`
};

export const SCENE_NAMES = Object.keys(SCENES) as SceneName[];

export function Scene({ name }: { name: SceneName }) {
  return <svg className="scene" viewBox="0 0 100 125" aria-hidden="true" dangerouslySetInnerHTML={{ __html: SCENES[name] ?? SCENES.stars }} />;
}
