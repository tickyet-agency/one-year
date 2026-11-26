import { content } from "../content";

/* Background music: their song if one is set, otherwise a soft built-in music-box tune. */

let audio: HTMLAudioElement | null = null;
let ctx: AudioContext | null = null;
let loop: number | undefined;
let playing = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((fn) => fn());
export const subscribeMusic = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const isMusicPlaying = () => playing;

function musicBox() {
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = ctx || new AC();
  if (ctx.state === "suspended") void ctx.resume();
  const ac = ctx;
  const chords = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]];
  let bar = 0;
  const note = (midi: number, t: number, vol: number) => {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "sine";
    o.frequency.value = 440 * Math.pow(2, (midi - 69) / 12);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    o.connect(g).connect(ac.destination);
    o.start(t);
    o.stop(t + 1.7);
  };
  const playBar = () => {
    const c = chords[bar % chords.length];
    const t0 = ac.currentTime + 0.05;
    [0, 1, 2, 3, 2, 1].forEach((n, k) => note(c[n] + 12, t0 + k * 0.32, 0.07));
    note(c[0] - 12, t0, 0.05);
    bar++;
  };
  playBar();
  loop = window.setInterval(playBar, 1920);
}

/** Start downloading the song (silently) so it can begin the instant she unlocks. */
export function prepareMusic() {
  if (!content.song || audio) return;
  try {
    audio = new Audio();
    audio.preload = "auto";
    audio.src = content.song;
    audio.load();
  } catch { audio = null; }
}

/** Must be called from a tap or click (browsers only allow sound after the viewer interacts). */
export function startMusic() {
  try {
    if (content.song) {
      audio = audio || new Audio(content.song);
      audio.loop = true;
      audio.volume = 0.6;
      void audio.play().catch(() => {});
    } else {
      musicBox();
    }
    playing = true;
  } catch {
    playing = false;
  }
  emit();
}

export function stopMusic() {
  audio?.pause();
  window.clearInterval(loop);
  playing = false;
  emit();
}
