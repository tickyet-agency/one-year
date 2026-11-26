# 365 Days of Us

A one-year anniversary web app, built with React + TypeScript + Vite.
It works in any browser on desktop and phone, and can be installed on a phone's
home screen like an app (it's a PWA, so it also opens offline once visited).

## Make it yours: the story editor

Open **`/edit`** on the site (for example `https://your-site.vercel.app/edit`, or
`http://localhost:5173/edit` while running locally). It isn't linked from the app.

1. **First visit:** set an editor passcode. Only a scrambled code (SHA-256) is stored, never the passcode itself.
2. **Fill in the form:** names, start date, lock question and answers, memories (with photo
   uploads), letters, the 50 reasons, star map (tap the sky to place stars), meeting day,
   coupons, cake text, quiz, the final letter and the song (mp3, up to 10 MB).
3. **Watch the live preview:** the phone on the right (the Preview button on smaller screens) shows the real app with your changes.
4. **Check the list at the top:** it turns green ("Ready to send") once the sample names are
   gone, the lock-screen hint is off, and so on.
5. **Download the pack:** `one-year-content.zip` contains `public/content.json` plus any
   photos and song under `public/media/`. Unzip it into this project folder, then:

   ```bash
   git add public
   git commit -m "Update the story"
   git push
   ```

   If the site is on Vercel or Netlify, it updates by itself.

Your work is saved in the browser as you type (IndexedDB), so you can close the tab and
come back later on the same computer. "Load a content.json" picks up an earlier export.

The defaults live in `src/content.ts`; `public/content.json` (written by the editor) overrides them.

> The site has no server, so the passcode only keeps the editor out of casual reach.
> Anyone who opens `/content.json` directly can read the story, including the lock-screen
> answer. That's fine for a gift; just don't put anything truly private in it.

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
| `src/content.ts` | Default words and dates (overridden by `public/content.json`) |
| `src/editor/` | The story editor at `/edit`: passcode, form, live preview, pack download |
| `src/App.tsx` | Page order and the lock → story flow |
| `src/sections/` | One component per chapter (lock, timeline, letters, reasons, star map, someday, pairs game, coupons, cake, quiz, finale) |
| `src/components/` | Shared pieces: drawn roses, scenes, balloons, petals, hearts, rose counter, music button |
| `src/lib/` | Rose collecting (saved in her browser), effects, music, time helpers |
| `public/images/` | Rose, bouquets, couple, blossom and 3D heart pictures |
| `public/icons/` | Home-screen icons |
