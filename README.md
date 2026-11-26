# 365 Days of Us

A one-year anniversary web app, built with React + TypeScript + Vite.
It works in any browser on desktop and phone, and can be installed on a phone's
home screen like an app (it's a PWA, so it also opens offline once visited).

## Make it yours

Everything personal lives in **`src/content.ts`**: names, the start date, the lock-screen
question and answer, memories, letters, the 50 reasons, coupons, star-map places, quiz,
cake text and the final letter. Nothing else needs to change.

Before sending it to her:

- set `showDemoHint: false` (otherwise the lock screen shows the answer)
- optional: put your song in `public/` and set `song: "/our-song.mp3"`
- optional: set `meetDate` to show a live countdown to the day you meet
- optional: add photos to `public/images/` and set `photo` on a memory

## Run it

```bash
npm install
npm run dev        # local preview at http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
```

## Put it online

Any static host works. Two easy free options:

- **Netlify**: drag the `dist/` folder onto app.netlify.com/drop
- **Vercel**: import this GitHub repo; it detects Vite automatically

## Install on her phone

Open the link, then:

- **iPhone (Safari)**: Share → Add to Home Screen
- **Android (Chrome)**: menu → Install app / Add to Home screen

## What's inside

| Path | What it is |
| --- | --- |
| `src/content.ts` | All the words and dates |
| `src/App.tsx` | Page order and the lock → story flow |
| `src/sections/` | One component per chapter (lock, timeline, letters, reasons, star map, someday, pairs game, coupons, cake, quiz, finale) |
| `src/components/` | Shared pieces: drawn roses, scenes, balloons, petals, hearts, rose counter, music button |
| `src/lib/` | Rose collecting (saved in her browser), effects, music, time helpers |
| `public/images/` | Rose, bouquets, couple, blossom and 3D heart pictures |
| `public/icons/` | Home-screen icons |
