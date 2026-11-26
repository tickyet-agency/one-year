/* =====================================================================
   The story's words, dates and settings.

   The easy way to change them: open /edit on the site (the editor), fill in the
   form, download the pack and commit it. That writes public/content.json, which
   overrides these defaults. You can also edit the defaults below directly.
   ===================================================================== */

export type Scene = "chat" | "call" | "video" | "movie" | "cake" | "parcel" | "stars" | "sunrise";

export interface Memory { date: string; title: string; text: string; scene: Scene; photo?: string; caption: string; back: string }
export interface Letter { when: string; body: string }
export interface Place { name: string; date: string; x: number; y: number; memory: string }
export interface QuizQuestion { q: string; options: string[]; correct: number[]; yay: string; nope: string }
export interface Coupon { title: string; note: string }
export interface Stat { n: string | "LIVE_DAYS"; label: string }

export const defaultContent = {
  her: "Meera",
  him: "Arjun",
  /** The moment it all started (local time). */
  startDate: "2025-11-24T23:40:00",
  tagline: "365 days of us, across every kilometre",

  /** The day you finally meet. "" if not fixed yet, e.g. "2027-02-14T10:00:00" shows a live countdown. */
  meetDate: "",

  /** Lock screen. Any answer in the list works (not case-sensitive). */
  question: "What do I call you when you're sleepy?",
  answers: ["sunflower", "my sunflower"],
  wrongReplies: ["Nope, try again, my love", "So close… (not really)", "Think sleepier…", "Hint: it's yellow and follows the sun"],
  /** Shows the answer on the lock screen. Set to false before sending it to her! */
  showDemoHint: true,

  /** "LIVE_DAYS" shows the live number of days together. */
  stats: [
    { n: "LIVE_DAYS", label: "days together" },
    { n: "840", label: "km between Pune and Bengaluru" },
    { n: "4,500+", label: "voice notes" },
    { n: "0", label: "hugs so far (fixing that soon)" }
  ] as Stat[],

  /** Each memory shows a drawing picked by `scene`. Add `photo: "/images/x.jpg"` to use a picture instead. */
  timeline: [
    { date: "24 Nov 2025", title: "The first message", text: "A comment on a meme. A reply. Then a reply to the reply.", scene: "chat", caption: "where it started", back: "You replied “haha” and I read it about forty times." },
    { date: "2 Dec 2025", title: "Our first voice call", text: "Planned for ten minutes. It lasted three hours and twelve.", scene: "call", caption: "3:12:04", back: "I still have the screenshot of the call timer." },
    { date: "20 Dec 2025", title: "The first video call", text: "Both of us pretending we hadn't spent an hour getting ready.", scene: "video", caption: "hi, finally", back: "You laughed at my terrible camera angle. I fell for the laugh." },
    { date: "31 Jan 2026", title: "Movie night, 840 km apart", text: "We pressed play at the same second and talked through the whole film.", scene: "movie", caption: "3… 2… 1… play", back: "I don't remember the movie. I remember you." },
    { date: "18 Apr 2026", title: "Your birthday", text: "I stayed up to be the first to wish you, and a cake turned up at your door.", scene: "cake", caption: "surprise!", back: "Watching you open it on camera was the best part of my year." },
    { date: "24 Nov 2026", title: "Today", text: "One year, and we still haven't said hi in person.", scene: "stars", caption: "chapter two loading…", back: "The first hug is going to be ridiculous. Be ready." }
  ] as Memory[],

  letters: [
    { when: "you miss me", body: "Close your eyes and think of the last time I made you laugh.\nThat's me, right there. I'm only ever one call away.\nCall me. I'll pick up, even at 3am." },
    { when: "you're sad", body: "Whatever it is, you don't have to carry it alone.\nYou're the bravest person I know, even on the days you don't feel it.\nI'm proud of you. Always." },
    { when: "you can't sleep", body: "Count the things you love about yourself.\nIf you run out (you won't), start on the things I love about you.\nOr just call me. I'm probably awake too." },
    { when: "we've had a fight", body: "I'm probably sulking on the other end of the phone, and I'm probably wrong.\nDistance makes fights sound louder than they are.\nWe're on the same team. Call me and let's fix it." },
    { when: "the distance feels too much", body: "Every kilometre between us is one I'd happily walk.\nThe distance is temporary.\nYou and me are not." },
    { when: "you doubt yourself", body: "Read this slowly: you are enough.\nYou were enough before me and you'll be enough without anyone's permission.\nI just get the lucky job of reminding you." }
  ] as Letter[],

  /** The reasons jar. Every 10 reasons read earns a rose. */
  reasons: [
    "The way you laugh at your own jokes before you finish them.",
    "You stay on call even when you're half asleep.",
    "You remember the tiny things I mention once.",
    "Your “good morning” texts make my whole day.",
    "You never let me skip dinner.",
    "Your voice notes when you're excited about something.",
    "You're kind to people who can't do anything for you.",
    "You make 840 km feel like nothing.",
    "You send me songs that say what you can't.",
    "You believe in me more than I do.",
    "The way you say my name.",
    "You're honest even when it's hard.",
    "Your terrible puns. Yes, even those.",
    "You're the first person I want to tell everything.",
    "You make bad days shorter.",
    "You get excited about the smallest things.",
    "You never make me feel like a burden.",
    "Your sleepy voice at 2am.",
    "You're brave in ways you don't even notice.",
    "You choose me every day, from far away.",
    "The way you get angry at movie villains.",
    "You listen. Really listen.",
    "You make me want to be better.",
    "Your screenshots of things that remind you of me.",
    "You forgive quickly and love loudly.",
    "You're my favourite notification.",
    "You make plans for “when we meet” like it's tomorrow.",
    "You're beautiful, and you don't even try.",
    "Your patience with my terrible network.",
    "You cheer for me like I've won a trophy.",
    "You turned a random comment into my whole world.",
    "You're silly with me and serious when I need it.",
    "You care about my family like they're yours.",
    "Your smile on a pixelated video call is still the best thing I've seen.",
    "You never hang up angry.",
    "You make the waiting feel worth it.",
    "You know something's wrong from one “hmm”.",
    "You dream big, and I'm always in the dreams.",
    "You're stubborn in the best way.",
    "You make me laugh until I can't breathe.",
    "You're my calm.",
    "Your taste in music. Mostly.",
    "You say “drink water” like it means “I love you”. It does.",
    "You make me feel at home without ever being in my home.",
    "You're proud of me, and you say it out loud.",
    "You trust me with your heart from all the way over there.",
    "You're the reason I look at my phone and smile.",
    "You've made this the best year of my life.",
    "I can't wait to finally hold your hand.",
    "Simply because you're you. That has always been enough."
  ],

  /** Places you've "been" together. x: 0–100 across, y: 0–62 down, in the order they happened. */
  places: [
    { name: "The comment section", date: "Nov 2025", x: 14, y: 40, memory: "Where a random meme turned into us." },
    { name: "Our first call", date: "Dec 2025", x: 30, y: 20, memory: "Three hours, twelve minutes, and neither of us wanted to hang up." },
    { name: "Movie nights", date: "Jan 2026", x: 50, y: 44, memory: "Synced play buttons and a running commentary." },
    { name: "The 3am talks", date: "Mar 2026", x: 66, y: 14, memory: "When the whole world was asleep except us." },
    { name: "Game nights", date: "Jun 2026", x: 84, y: 36, memory: "You still haven't let me win once." }
  ] as Place[],

  someday: "Every star on that map was us through a screen. The next one is going to be us in the same place, holding on and not letting go.",

  /** Scratch-off love coupons. Each one scratched earns a rose. */
  coupons: [
    { title: "One 3-hour call", note: "No hanging up first. You pick the topic." },
    { title: "Movie night, your pick", note: "Zero complaints from me. Even if it's a rom-com." },
    { title: "A real letter", note: "Handwritten and posted to your address." },
    { title: "Surprise delivery", note: "Your favourite food at your door, on any bad day." },
    { title: "One “you were right”", note: "Redeemable in any argument. No questions asked." },
    { title: "The first hug", note: "Unlimited duration. Valid the second we meet." }
  ] as Coupon[],

  cake: {
    text: "Happy 1 Year",
    wish: "Now close your eyes and make a wish. I already know mine. It's you.",
    cut: "The first slice is yours. Consider it fed to you, all the way from 840 km away."
  },

  quiz: [
    { q: "Where did we first talk?", options: ["A meme's comment section", "A dating app", "A group chat", "A wrong number"], correct: [0], yay: "Correct! Best meme ever posted.", nope: "It was a meme's comment section! (I'll forgive you)" },
    { q: "How long was our first call?", options: ["10 minutes", "1 hour", "3 hours 12 minutes", "Technically we're still on it"], correct: [2, 3], yay: "Three hours twelve. I checked.", nope: "3 hours 12 minutes. I have the screenshot." },
    { q: "Which song do I keep sending you?", options: ["Tum Se Hi", "Kesariya", "Raabta", "Perfect"], correct: [1], yay: "Every. Single. Time.", nope: "It's Kesariya. Every single time." },
    { q: "What's my favourite thing about you?", options: ["Your laugh", "Your laugh", "Your laugh", "All of the above"], correct: [0, 1, 2, 3], yay: "Trick question. It's your laugh, every time.", nope: "" },
    { q: "What happens the day we finally meet?", options: ["A very long hug", "I cry a little", "We take 400 photos", "All of the above"], correct: [0, 1, 2, 3], yay: "Yes. All of it. In that order.", nope: "" }
  ] as QuizQuestion[],

  finaleTitle: "My Meera,",
  finaleLetter: "A year ago a random comment turned into a conversation, and that conversation turned into you.\n\nWe've never been in the same room, but you've been with me through everything: every bad day, every good one, every 3am thought.\n\nPeople say distance is hard. It is. It also proved to me that this is real, because it has nothing to lean on except us.\n\nOne day soon the screen goes away. Until then I'm yours, from 840 km away and from right here.\n\nHappy one year, my sunflower.",
  signature: "Forever yours, Arjun",
  surpriseTitle: "Year two starts now.",
  /** Tip: time a flower or cake delivery to her door for when she reaches this line. */
  surpriseLine: "Now go check your door. Something from me just arrived.",
  secretMessage: "Secret unlocked: I still get butterflies when your name pops up.",
  /** The proposal after the bouquet: a ring box that opens when she scrolls to it, a platinum ring, and the question. */
  proposal: {
    enabled: true,
    lead: "I've been keeping something for this exact moment.",
    question: "Will you marry me?",
    note: "A year of loving you through a screen was enough to know. I want every year after this one too.",
    yes: "Yes",
    yes2: "A thousand times yes",
    saidYesTitle: "She said yes.",
    saidYesLine: "Then it's settled. The day we finally meet, this ring goes on your finger for real."
  },
  /** Put an mp3 in /public and set e.g. "/our-song.mp3". Empty = built-in music box tune. */
  song: ""
};

export const HIDDEN_ROSES = 8;

export type AppContent = typeof defaultContent & {
  /** SHA-256 of the editor passcode (set from the editor; never the passcode itself). */
  editorPasscodeHash?: string;
};

/**
 * The live content the app reads. It starts as the defaults and is overwritten by
 * public/content.json (or by the editor's preview) before the app first renders.
 */
export const content: AppContent = JSON.parse(JSON.stringify(defaultContent));

export function applyContent(data: Partial<AppContent> | null | undefined) {
  if (data && typeof data === "object") Object.assign(content, data);
}

/** Set when the app runs inside the editor's preview frame. */
export const runtime = { preview: false };
